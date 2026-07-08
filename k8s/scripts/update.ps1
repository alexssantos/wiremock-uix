#!/usr/bin/env pwsh
<#
.SYNOPSIS
  Updates an existing wiremock-uix deployment.

.DESCRIPTION
  Re-applies the manifests under ../wiremock and ../wiremock-uix (picking up
  any manifest edits, e.g. a new image tag committed to deployment.yaml),
  optionally overrides the wiremock-uix image tag on the fly, and waits for
  the rollout to finish.

.PARAMETER Context
  kubectl context to target. Defaults to the current context.

.PARAMETER Namespace
  Namespace to update. Defaults to "wiremock-dashboard".

.PARAMETER ImageTag
  Optional wiremock-uix image tag to roll out immediately (e.g. "1.1.2"),
  without needing to edit deployment.yaml first.

.PARAMETER DryRun
  Render/validate without applying any changes.

.PARAMETER SkipWait
  Don't wait for the rollout to complete after applying.

.EXAMPLE
  ./update.ps1

.EXAMPLE
  ./update.ps1 -Namespace wiremock-staging -ImageTag 1.1.2

.EXAMPLE
  ./update.ps1 -Context my-cluster -DryRun
#>
[CmdletBinding()]
param(
  [string]$Context = "",
  [string]$Namespace = "wiremock-dashboard",
  [string]$ImageTag = "",
  [switch]$DryRun,
  [switch]$SkipWait
)

$ErrorActionPreference = "Stop"

$DefaultImageRepo = "alexssantos/wiremock-uix"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$K8sDir = Resolve-Path (Join-Path $ScriptDir "..")

if (-not (Get-Command kubectl -ErrorAction SilentlyContinue)) {
  Write-Error "kubectl not found on PATH"
  exit 1
}

function Invoke-Kubectl {
  param([string[]]$KubectlArgs)
  $allArgs = @()
  if ($Context) { $allArgs += @("--context", $Context) }
  $allArgs += $KubectlArgs
  & kubectl @allArgs
  if ($LASTEXITCODE -ne 0) {
    throw "kubectl $($KubectlArgs -join ' ') failed with exit code $LASTEXITCODE"
  }
}

$currentContext = if ($Context) { $Context } else { (kubectl config current-context 2>$null) }
Write-Host "==> Target cluster: $currentContext"
Write-Host "==> Target namespace: $Namespace"
if ($DryRun) { Write-Host "==> Mode: dry-run (no changes will be applied)" }

# 1. Re-apply the current manifests (same overlay approach as deploy.ps1) so
#    any committed changes — resource limits, env vars, replica counts, a new
#    pinned image tag in deployment.yaml, etc. — are picked up.
$tmpOverlay = Join-Path ([System.IO.Path]::GetTempPath()) ("wiremock-uix-k8s-" + [System.Guid]::NewGuid())
New-Item -ItemType Directory -Path $tmpOverlay | Out-Null

try {
  $kustomizationContent = @"
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
namespace: $Namespace
resources:
  - $($K8sDir.Path -replace '\\', '/')/wiremock
  - $($K8sDir.Path -replace '\\', '/')/wiremock-uix
"@
  Set-Content -Path (Join-Path $tmpOverlay "kustomization.yaml") -Value $kustomizationContent -Encoding utf8

  $applyArgs = @("apply", "-k", $tmpOverlay)
  if ($DryRun) { $applyArgs += "--dry-run=client" }

  Write-Host "==> Applying manifests"
  Invoke-Kubectl -KubectlArgs $applyArgs

  # 2. Optionally override the wiremock-uix image tag without having to edit
  #    deployment.yaml first (handy for quickly rolling out a freshly
  #    published Docker Hub tag — see docs/13-deployment-operations.md §5.4).
  if ($ImageTag) {
    Write-Host "==> Setting wiremock-uix image to ${DefaultImageRepo}:${ImageTag}"
    $setImageArgs = @("-n", $Namespace, "set", "image", "deployment/wiremock-uix", "wiremock-uix=${DefaultImageRepo}:${ImageTag}")
    if ($DryRun) { $setImageArgs += "--dry-run=client" }
    Invoke-Kubectl -KubectlArgs $setImageArgs
  }

  if ($DryRun -or $SkipWait) {
    Write-Host "==> Skipping rollout wait"
    return
  }

  Write-Host "==> Waiting for rollout to complete"
  Invoke-Kubectl -KubectlArgs @("-n", $Namespace, "rollout", "status", "deployment/wiremock-uix", "--timeout=180s")
  Invoke-Kubectl -KubectlArgs @("-n", $Namespace, "rollout", "status", "statefulset/wiremock", "--timeout=180s")

  Write-Host "==> Done. Current resources:"
  Invoke-Kubectl -KubectlArgs @("-n", $Namespace, "get", "pods,svc,ingress")
}
finally {
  Remove-Item -Recurse -Force $tmpOverlay -ErrorAction SilentlyContinue
}

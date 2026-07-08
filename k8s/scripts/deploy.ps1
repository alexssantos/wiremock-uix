#!/usr/bin/env pwsh
<#
.SYNOPSIS
  Deploys wiremock-uix (+ the bundled WireMock StatefulSet) to a Kubernetes
  cluster/namespace using the manifests under ../wiremock and ../wiremock-uix.

.DESCRIPTION
  Safe to re-run: `kubectl apply` is idempotent, so this script also works
  for "first deploy" and "re-apply after editing a manifest" use cases alike.

.PARAMETER Context
  kubectl context to target. Defaults to the current context.

.PARAMETER Namespace
  Namespace to deploy into. Defaults to "wiremock-dashboard".

.PARAMETER DryRun
  Render/validate without applying any changes.

.PARAMETER SkipWait
  Don't wait for the rollout to complete after applying.

.EXAMPLE
  ./deploy.ps1

.EXAMPLE
  ./deploy.ps1 -Context my-cluster -Namespace wiremock-staging

.EXAMPLE
  ./deploy.ps1 -DryRun
#>
[CmdletBinding()]
param(
  [string]$Context = "",
  [string]$Namespace = "wiremock-dashboard",
  [switch]$DryRun,
  [switch]$SkipWait
)

$ErrorActionPreference = "Stop"

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
Write-Host "==> Manifests: $K8sDir"
if ($DryRun) { Write-Host "==> Mode: dry-run (no changes will be applied)" }

# 1. Ensure the namespace exists (created separately from the component
#    kustomizations so we never depend on Kustomize's "rename Namespace
#    resource to match target namespace" behavior — see k8s/README.md).
Write-Host "==> Ensuring namespace '$Namespace' exists"
$nsYaml = & kubectl create namespace $Namespace --dry-run=client -o yaml
if ($LASTEXITCODE -ne 0) { throw "Failed to render namespace manifest for '$Namespace'" }
$nsYaml | & kubectl @(if ($Context) { @("--context", $Context) }) apply -f -
if ($LASTEXITCODE -ne 0) { throw "Failed to ensure namespace '$Namespace' exists" }

# 2. Build a throwaway Kustomize overlay that points at the wiremock and
#    wiremock-uix components with the requested namespace applied on top,
#    overriding whatever namespace their own kustomization.yaml declares.
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

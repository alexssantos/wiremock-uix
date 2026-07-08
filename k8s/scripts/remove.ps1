#!/usr/bin/env pwsh
<#
.SYNOPSIS
  Removes the wiremock-uix and wiremock resources from a cluster/namespace.

.DESCRIPTION
  By default the namespace itself (and any PersistentVolumeClaim created by
  the wiremock StatefulSet) is left in place — pass -DeleteNamespace to also
  delete it and everything in it, including stub mapping data on disk.

.PARAMETER Context
  kubectl context to target. Defaults to the current context.

.PARAMETER Namespace
  Namespace to remove resources from. Defaults to "wiremock-dashboard".

.PARAMETER DeleteNamespace
  Also delete the namespace itself (and any PVCs left in it) once the
  application resources have been removed.

.PARAMETER Yes
  Skip the interactive confirmation prompt.

.PARAMETER DryRun
  Render/validate without applying any changes.

.EXAMPLE
  ./remove.ps1 -Namespace wiremock-staging

.EXAMPLE
  ./remove.ps1 -DeleteNamespace -Yes
#>
[CmdletBinding()]
param(
  [string]$Context = "",
  [string]$Namespace = "wiremock-dashboard",
  [switch]$DeleteNamespace,
  [switch]$Yes,
  [switch]$DryRun
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
if ($DryRun) { Write-Host "==> Mode: dry-run (no changes will be applied)" }

if (-not $Yes -and -not $DryRun) {
  $warning = "This will delete wiremock-uix and wiremock resources in namespace '$Namespace'."
  if ($DeleteNamespace) {
    $warning += " The namespace itself and its PersistentVolumeClaim(s) (WireMock stub mappings/__files on disk) will ALSO be permanently deleted."
  }
  $reply = Read-Host "$warning Continue? [y/N]"
  if ($reply -notmatch '^(y|yes)$') {
    Write-Host "Aborted."
    exit 1
  }
}

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

  $deleteArgs = @("delete", "-k", $tmpOverlay, "--ignore-not-found")
  if ($DryRun) { $deleteArgs += "--dry-run=client" }

  Write-Host "==> Deleting wiremock-uix and wiremock resources"
  Invoke-Kubectl -KubectlArgs $deleteArgs

  if ($DeleteNamespace) {
    Write-Host "==> Deleting namespace '$Namespace' (and any remaining PVCs in it)"
    $nsDeleteArgs = @("delete", "namespace", $Namespace, "--ignore-not-found")
    if ($DryRun) { $nsDeleteArgs += "--dry-run=client" }
    Invoke-Kubectl -KubectlArgs $nsDeleteArgs
  }
  else {
    Write-Host "==> Namespace '$Namespace' left in place (pass -DeleteNamespace to remove it too)"
  }

  Write-Host "==> Done."
}
finally {
  Remove-Item -Recurse -Force $tmpOverlay -ErrorAction SilentlyContinue
}

Param(
    [string]$Src = 'E:\xwechat_files\wxid_24q8n93a0btk22_0aa9\msg\file\2026-05\miniprogram\miniprogram\images',
    [string]$Dst = '.\static\images'
)

Write-Host "Running copy_and_build.ps1"
Write-Host "Source: $Src"
Write-Host "Destination: $Dst"

if (-not (Test-Path $Src)) {
    Write-Error "Source path not found: $Src`nPlease ensure the path is correct and accessible from this machine."
    exit 2
}

try {
    # Ensure destination exists
    New-Item -ItemType Directory -Force -Path $Dst | Out-Null

    # Copy files
    Copy-Item -Path (Join-Path $Src '*') -Destination $Dst -Recurse -Force -ErrorAction Stop
    Write-Host "Files copied to $Dst:" -ForegroundColor Green
    Get-ChildItem -Path $Dst | ForEach-Object { Write-Host " - $($_.Name)" }

    # Clean dev build
    if (Test-Path '.\unpackage\dist\dev') {
        Write-Host "Removing existing unpackage/dist/dev..."
        Remove-Item -Recurse -Force '.\unpackage\dist\dev'
    }

    # Run build
    Write-Host "Starting npm run build:mp-weixin..."
    $proc = Start-Process -FilePath 'npm' -ArgumentList 'run','build:mp-weixin' -NoNewWindow -Wait -PassThru
    Write-Host "Build exited with code $($proc.ExitCode)"
    if ($proc.ExitCode -ne 0) { exit $proc.ExitCode }

    Write-Host "Done"
} catch {
    Write-Error "Error during copy/build: $_"
    exit 3
}

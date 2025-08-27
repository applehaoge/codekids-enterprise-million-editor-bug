[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# ===== Config =====
$remotes = @{
    "main" = "mainrepo"
    "bug"  = "bugrepo"
}

# Get token
$GITHUB_TOKEN = $env:GITHUB_TOKEN
if (-not $GITHUB_TOKEN) {
    Write-Host "[ERROR] GITHUB_TOKEN not set. Run:"
    Write-Host 'setx GITHUB_TOKEN "ghp_xxxxxxxxxxxxx"'
    Read-Host "Press Enter to exit"
    exit 1
}
$basic  = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("applehaoge:${GITHUB_TOKEN}"))
$header = "Authorization: Basic $basic"

# Choose target
Write-Host "`nChoose push target:"
Write-Host "1. bugrepo (for debugging)"
Write-Host "2. mainrepo (production)"
$choice = Read-Host "Enter number (default=1)"
if ($choice -eq "2") {
    $target = "main"
} else {
    $target = "bug"
}
$remote = $remotes[$target]

Write-Host "`n[INFO] Selected remote: $remote"

# Commit if needed
$changes = git status --porcelain
if ($changes) {
    Write-Host "[COMMIT] Committing changes..."
    git add .
    git commit -m "auto: push all changes"
} else {
    Write-Host "[COMMIT] No changes."
}

# Push
Write-Host "[PUSH] Pushing to $remote..."
git -c "http.extraHeader=$header" push -u $remote main
if ($LASTEXITCODE -ne 0) {
    Write-Host "[WARN] Push failed. Try pull --rebase..."
    git -c "http.extraHeader=$header" pull $remote main --rebase
    if ($LASTEXITCODE -eq 0) {
        git -c "http.extraHeader=$header" push -u $remote main
    } else {
        Write-Host "[WARN] Still failed. Force push? (Y/N)"
        $ans = Read-Host
        if ($ans -match '^[Yy]$') {
            Write-Host "[FORCE] Forcing push..."
            git -c "http.extraHeader=$header" push -u $remote main --force
        } else {
            Write-Host "[CANCEL] Cancelled force push."
        }
    }
}

Write-Host "`n[DONE] Finished."
Read-Host "Press Enter to exit"

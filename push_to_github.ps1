[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# ===== Config =====
$GITHUB_USER = "applehaoge"
$REPO        = "codekids-enterprise-million-editor-bug"

# Get token from environment variable
$GITHUB_TOKEN = $env:GITHUB_TOKEN
if (-not $GITHUB_TOKEN) {
    Write-Host "[ERROR] Environment variable GITHUB_TOKEN not found. Please run:"
    Write-Host 'setx GITHUB_TOKEN "ghp_xxxxxxxxxxxxx"'
    Read-Host "Press Enter to exit"
    exit 1
}

# Build one-time auth header
$basic  = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("${GITHUB_USER}:${GITHUB_TOKEN}"))
$header = "Authorization: Basic $basic"

Write-Host "[INFO] Current directory: $(Get-Location)"

# Init repo if not exists
if (-not (Test-Path ".git")) {
    Write-Host "[INIT] Initializing git repository..."
    git init
    git branch -M main
    git remote add origin "https://github.com/$GITHUB_USER/$REPO.git"
}

# Commit changes if any
$changes = git status --porcelain
if ($changes) {
    Write-Host "[COMMIT] Found changes, committing..."
    git add .
    git commit -m "auto: push all changes"
} else {
    Write-Host "[COMMIT] No changes detected."
}

# Push
Write-Host "[PUSH] Pushing to GitHub..."
git -c "http.extraHeader=$header" push -u origin main
if ($LASTEXITCODE -ne 0) {
    Write-Host "[WARN] Push failed, trying pull --rebase..."
    git -c "http.extraHeader=$header" pull origin main --rebase
    if ($LASTEXITCODE -eq 0) {
        git -c "http.extraHeader=$header" push -u origin main
    }
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[WARN] Still failed. Force push? (Y/N)"
        $choice = Read-Host
        if ($choice -match '^[Yy]$') {
            Write-Host "[FORCE] Force pushing..."
            git -c "http.extraHeader=$header" push -u origin main --force
        } else {
            Write-Host "[CANCEL] Force push cancelled."
        }
    }
}

Write-Host "`n[DONE] Script finished."
Read-Host "Press Enter to exit"

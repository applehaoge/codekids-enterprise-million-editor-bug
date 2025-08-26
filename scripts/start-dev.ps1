Param(
  [int]$Port = 5173,
  [string]$DevHost = "127.0.0.1"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Info($msg){ Write-Host "[INFO] $msg" -ForegroundColor Cyan }
function Ok($msg){ Write-Host "[ OK ] $msg" -ForegroundColor Green }
function Skip($msg){ Write-Host "[SKIP] $msg" -ForegroundColor Yellow }
function Fail($msg){ Write-Host "[FAIL] $msg" -ForegroundColor Red }

# Paths
$ScriptDir  = Split-Path -Parent $MyInvocation.MyCommand.Path
$Root       = Resolve-Path (Join-Path $ScriptDir '..')
$FrontendDir= Join-Path $Root 'frontend'
$PkgJson    = Join-Path $FrontendDir 'package.json'
$LockFile   = Join-Path $FrontendDir 'pnpm-lock.yaml'
$Stamp      = Join-Path $FrontendDir '.last_install.hash'

Push-Location $Root

# ---- Tools check
function Assert-Command($name){
  if (-not (Get-Command $name -ErrorAction SilentlyContinue)) {
    throw "Command not found: $name"
  }
}
try {
  Assert-Command docker
  Assert-Command pnpm
} catch {
  Fail $_.Exception.Message
  Pop-Location
  exit 1
}

# ---- Start only-not-running compose services
function Ensure-Compose-Service($name){
  $cid = (docker compose ps -q $name 2>$null)
  $running = $false
  if ($cid) {
    # Use --format (not -f) in PowerShell; single quotes avoid interpolation
    $state = (docker inspect --format '{{.State.Running}}' $cid 2>$null)
    $running = ($state -eq 'true')
  }
  if ($running) {
    Skip "Container $name already running"
  } else {
    Info "Starting container $name ..."
    docker compose up -d $name | Out-Null
    Ok "Container $name started"
  }
}

Info "Checking backend containers..."
$services = @('mysql','redis','rabbitmq','mongodb','minio','java-backend','python-backend','ai-service','nginx')
foreach($svc in $services){ Ensure-Compose-Service $svc }
Ok "Backend ready"

# ---- Frontend deps: install only when package/lock changed
function Get-ShortHash($paths){
  $all = ""
  foreach($p in $paths){
    if (Test-Path $p) {
      $all += (Get-FileHash $p -Algorithm SHA256).Hash
    } else {
      $all += "MISSING"
    }
  }
  return $all.Substring(0,12)
}

Info "Checking frontend dependencies..."
$needInstall = $true
$curHash = Get-ShortHash @($PkgJson, $LockFile)

if (Test-Path (Join-Path $FrontendDir 'node_modules')) {
  if (Test-Path $Stamp) {
    $oldHash = Get-Content $Stamp -ErrorAction SilentlyContinue
    if ($oldHash -eq $curHash) {
      $needInstall = $false
      Skip "Dependencies unchanged ($curHash), skip install"
    }
  }
}

if ($needInstall) {
  Info "Running pnpm install..."
  try {
    pnpm --prefix $FrontendDir install --frozen-lockfile | Out-Null
  } catch {
    Info "Retry without --frozen-lockfile..."
    pnpm --prefix $FrontendDir install | Out-Null
  }
  $curHash | Out-File -FilePath $Stamp -Encoding ascii -Force
  Ok "Dependencies installed ($curHash)"
}

# ---- Frontend dev: do not start if port already listening
function Is-Port-Open($Port){
  try {
    $conn = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
    return $null -ne $conn
  } catch {
    return (Test-NetConnection -ComputerName $DevHost -Port $Port -InformationLevel Quiet)
  }
}

Info "Checking frontend port $Port..."
if (Is-Port-Open $Port) {
  Skip "Port $Port already in use, skip dev start"
} else {
  Info "Starting frontend dev server..."
  # If your script is 'dev:client', replace "dev" with "dev:client" below:
  pnpm --prefix $FrontendDir dev -- --host $DevHost --port $Port
}

Pop-Location

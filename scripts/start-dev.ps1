Param()
Set-StrictMode -Version Latest
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$Root = Resolve-Path (Join-Path $ScriptDir '..')
Push-Location $Root
# 启动后端容器
docker compose up -d mysql redis rabbitmq mongodb minio java-backend python-backend ai-service nginx
# 安装并启动前端本地开发服务器
pnpm --prefix frontend install --frozen-lockfile -ErrorAction SilentlyContinue
if ($LASTEXITCODE -ne 0) { pnpm --prefix frontend install }
pnpm --prefix frontend dev
Pop-Location

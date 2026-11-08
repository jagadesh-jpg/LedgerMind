<#
.SYNOPSIS
    Starts LedgerMind FastAPI backend and Vite frontend together.
.DESCRIPTION
    Runs uvicorn backend on port 8000 and vite dev server on port 5173.
#>

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   Starting LedgerMind AP Intelligence    " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Check if Python dependencies are installed
$pythonCheck = python -c "import fastapi, uvicorn" 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
    pip install -r backend\requirements.txt
}

# Seed database if not present
if (-not (Test-Path ".\ledgermind.db")) {
    Write-Host "Seeding database with synthetic Indian AP data..." -ForegroundColor Yellow
    python -m backend.data.seed
}

Write-Host "Launching FastAPI backend on http://127.0.0.1:8000 ..." -ForegroundColor Green
$backendProcess = Start-Process python -ArgumentList "-m uvicorn backend.app.api:app --host 127.0.0.1 --port 8000 --reload" -PassThru

Write-Host "Launching Vite React frontend on http://127.0.0.1:5173 ..." -ForegroundColor Green
npm run dev -- --host 127.0.0.1 --port 5173


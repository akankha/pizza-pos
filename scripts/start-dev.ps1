# Start both server and client for development
# Save this as: start-dev.ps1

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "   Pizza POS Development Mode    " -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Error: Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org" -ForegroundColor Yellow
    exit 1
}

# Navigate to project root
$projectRoot = Split-Path -Parent $PSScriptRoot

# Start server in background
Write-Host ""
Write-Host "Starting backend server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectRoot\server'; npm run dev" -WindowStyle Normal

# Wait a moment for server to start
Start-Sleep -Seconds 3

# Start client
Write-Host "Starting frontend client..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectRoot\client'; npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "==================================" -ForegroundColor Green
Write-Host "   Development servers started!  " -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green
Write-Host ""
Write-Host "Client: http://localhost:5173" -ForegroundColor Cyan
Write-Host "Server: http://localhost:3001" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C in each window to stop" -ForegroundColor Yellow

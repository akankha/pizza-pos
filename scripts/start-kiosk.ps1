# Pizza Shop POS - Windows Kiosk Auto-Start Script
# Save this as: start-kiosk.ps1

$chromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$kioskUrl = "http://localhost:5173"

# Check if Chrome exists
if (-Not (Test-Path $chromePath)) {
    Write-Host "Chrome not found at $chromePath"
    Write-Host "Please install Google Chrome or update the path in this script"
    exit 1
}

Write-Host "Starting Pizza POS in Kiosk Mode..."
Write-Host "URL: $kioskUrl"

# Launch Chrome in kiosk mode with touch-optimized settings
Start-Process $chromePath -ArgumentList `
    "--kiosk $kioskUrl", `
    "--no-first-run", `
    "--disable-infobars", `
    "--disable-session-crashed-bubble", `
    "--disable-restore-session-state", `
    "--disable-pinch", `
    "--overscroll-history-navigation=0", `
    "--disable-features=TranslateUI", `
    "--noerrdialogs", `
    "--disable-component-extensions-with-background-pages", `
    "--disable-breakpad", `
    "--disable-background-networking", `
    "--touch-events=enabled"

Write-Host "Kiosk mode started successfully!"

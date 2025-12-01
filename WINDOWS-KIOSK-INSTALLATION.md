# 🪟 Windows Kiosk Installation Guide - Pizza POS

Complete guide to install and configure Pizza POS as a kiosk on Windows 10/11.

---

## 📋 Table of Contents
1. [System Requirements](#system-requirements)
2. [Installation Steps](#installation-steps)
3. [Kiosk Configuration](#kiosk-configuration)
4. [Auto-Start Setup](#auto-start-setup)
5. [Security & Lockdown](#security--lockdown)
6. [Troubleshooting](#troubleshooting)

---

## 🖥️ System Requirements

### Minimum Hardware
- **CPU**: Intel Core i3 or AMD Ryzen 3 (or equivalent)
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 10GB free space
- **Display**: 1024x768 minimum, 1920x1080 recommended
- **Touchscreen**: 10-point multi-touch (optional but recommended)

### Software Requirements
- **OS**: Windows 10 Pro/Enterprise or Windows 11 Pro/Enterprise
- **Node.js**: Version 18.x or 20.x LTS
- **Database**: SQLite (included)
- **Browser**: Chrome/Edge (for browser mode) or Electron (standalone)

---

## 📦 Installation Steps

### Step 1: Install Node.js

1. Download Node.js LTS from: https://nodejs.org
2. Run the installer (choose "Automatically install necessary tools")
3. Verify installation:
```powershell
node --version
npm --version
```

### Step 2: Download Pizza POS

**Option A: Download ZIP**
1. Download the project ZIP file
2. Extract to `C:\PizzaPOS`

**Option B: Using Git**
```powershell
cd C:\
git clone <repository-url> PizzaPOS
cd PizzaPOS
```

### Step 3: Install Dependencies

Open PowerShell as Administrator:

```powershell
# Navigate to project
cd C:\PizzaPOS

# Install root dependencies
npm install

# Install client dependencies
cd client
npm install

# Install server dependencies
cd ..\server
npm install

# Return to root
cd ..
```

### Step 4: Build the Application

```powershell
# Build client for production
cd C:\PizzaPOS\client
npm run build

# Build server
cd ..\server
npm run build
```

### Step 5: Test the Installation

```powershell
# Start both servers
cd C:\PizzaPOS
npm run dev
```

Open browser to `http://localhost:5173` - you should see the POS interface.

---

## 🖼️ Kiosk Configuration

### Option 1: Electron Kiosk Mode (Recommended)

**Step 1: Build Electron App**
```powershell
cd C:\PizzaPOS
npm run electron:build
```

**Step 2: Install the Built App**
- Find the installer in `dist/` folder
- Run `Pizza-POS-Setup-X.X.X.exe`
- Install to `C:\Program Files\PizzaPOS`

**Step 3: Configure Kiosk Launch**
Create shortcut with kiosk parameters (see Auto-Start section below).

### Option 2: Chrome Kiosk Mode

**Step 1: Create Kiosk Shortcut**

Right-click Desktop > New > Shortcut:

```
"C:\Program Files\Google\Chrome\Application\chrome.exe" --kiosk --app=http://localhost:5173 --disable-pinch --overscroll-history-navigation=0 --disable-features=TranslateUI --no-first-run
```

**Step 2: Name it** `Pizza POS Kiosk`

---

## 🚀 Auto-Start Setup

### Step 1: Create Startup Script

Create `C:\PizzaPOS\start-kiosk.bat`:

```batch
@echo off
echo Starting Pizza POS Servers...

REM Start the server in background
start /B cmd /c "cd C:\PizzaPOS\server && npm start > server.log 2>&1"

REM Wait for server to start
timeout /t 5 /nobreak

REM Start the client in background
start /B cmd /c "cd C:\PizzaPOS\client && npm run preview > client.log 2>&1"

REM Wait for client to start
timeout /t 3 /nobreak

REM Launch kiosk mode (Chrome)
start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --kiosk --app=http://localhost:4173 --disable-pinch --overscroll-history-navigation=0 --disable-features=TranslateUI --no-first-run --disable-session-crashed-bubble --disable-infobars

REM Or launch Electron kiosk
REM start "" "C:\Program Files\PizzaPOS\Pizza POS.exe" --kiosk

exit
```

### Step 2: Add to Windows Startup

**Option A: User Startup Folder** (Recommended)
1. Press `Win + R`
2. Type: `shell:startup`
3. Create shortcut to `start-kiosk.bat`

**Option B: Task Scheduler** (More Reliable)
1. Open Task Scheduler
2. Create Basic Task
3. **Name**: Pizza POS Kiosk
4. **Trigger**: At log on
5. **Action**: Start a program
6. **Program**: `C:\PizzaPOS\start-kiosk.bat`
7. **Settings**:
   - ✅ Run whether user is logged on or not
   - ✅ Run with highest privileges
   - ✅ If task fails, restart every 1 minute

---

## 🔒 Security & Lockdown

### Step 1: Create Kiosk User Account

```powershell
# Run as Administrator
net user KioskUser P@ssw0rd123! /add
net localgroup Users KioskUser /add
```

### Step 2: Configure Auto-Login

```powershell
# Open User Accounts
netplwiz
```

1. Uncheck "Users must enter a username and password"
2. Click OK
3. Enter KioskUser credentials
4. Click OK

### Step 3: Disable Windows Key Shortcuts

**Using Group Policy** (Windows Pro/Enterprise):

1. Press `Win + R` > `gpedit.msc`
2. Navigate to:
   - `User Configuration` > `Administrative Templates` > `Windows Components` > `File Explorer`
3. Enable: **"Turn off Windows Key hotkeys"**

**Using Registry** (Windows Home):

```powershell
# Disable Windows key
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Policies\Explorer" /v NoWinKeys /t REG_DWORD /d 1 /f

# Disable Task Manager
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Policies\System" /v DisableTaskMgr /t REG_DWORD /d 1 /f
```

### Step 4: Disable Alt+F4, Alt+Tab, Ctrl+Alt+Del

**Group Policy Method:**
1. `gpedit.msc`
2. `User Configuration` > `Administrative Templates` > `System` > `Ctrl+Alt+Del Options`
3. Enable: **"Remove Task Manager"**
4. Enable: **"Remove Lock Computer"**
5. Enable: **"Remove Change Password"**

### Step 5: Power & Display Settings

```powershell
# Never sleep, never turn off display
powercfg -change -standby-timeout-ac 0
powercfg -change -monitor-timeout-ac 0
powercfg -change -hibernate-timeout-ac 0
powercfg -change -disk-timeout-ac 0

# Disable screen saver
reg add "HKCU\Control Panel\Desktop" /v ScreenSaveActive /t REG_SZ /d 0 /f

# Restart on power failure
powercfg -h off
```

### Step 6: Touch Keyboard Settings

```powershell
# Enable touch keyboard auto-invoke
reg add "HKCU\Software\Microsoft\TabletTip\1.7" /v EnableDesktopModeAutoInvoke /t REG_DWORD /d 1 /f
```

### Step 7: Windows Update Settings

**Option A: Group Policy**
1. `gpedit.msc`
2. `Computer Configuration` > `Administrative Templates` > `Windows Components` > `Windows Update`
3. Enable: **"Configure Automatic Updates"**
4. Set to: **4 - Auto download and schedule install**
5. Schedule for: **3:00 AM daily** (off-hours)

**Option B: Settings**
1. Settings > Update & Security > Windows Update
2. Advanced options
3. Set Active hours: **8 AM to 11 PM**
4. Pause updates: **Up to 35 days** (refresh periodically)

### Step 8: Assigned Access (Windows 11 Pro)

1. Settings > Accounts > Family & other users
2. Click **Set up assigned access**
3. Choose KioskUser account
4. Select app: Chrome or Pizza POS
5. Configure breakout key (for admin access)

---

## 🔧 Advanced Configuration

### Automatic Restart on Crash

Create `C:\PizzaPOS\watchdog.bat`:

```batch
@echo off
:loop
echo Checking Pizza POS...
tasklist /FI "IMAGENAME eq chrome.exe" 2>NUL | find /I /N "chrome.exe">NUL
if "%ERRORLEVEL%"=="1" (
    echo Chrome crashed! Restarting...
    call C:\PizzaPOS\start-kiosk.bat
)
timeout /t 10 /nobreak
goto loop
```

Add to Task Scheduler to run at startup.

### Network Connectivity Check

Create `C:\PizzaPOS\check-network.ps1`:

```powershell
while ($true) {
    $ping = Test-Connection -ComputerName 8.8.8.8 -Count 1 -Quiet
    if (-not $ping) {
        Write-Host "Network down! Attempting restart..."
        Restart-Computer -Force
    }
    Start-Sleep -Seconds 60
}
```

### Enable Remote Access (for maintenance)

```powershell
# Enable Remote Desktop
Set-ItemProperty -Path 'HKLM:\System\CurrentControlSet\Control\Terminal Server' -name "fDenyTSConnections" -value 0
Enable-NetFirewallRule -DisplayGroup "Remote Desktop"
```

---

## 🛠️ Troubleshooting

### Issue: Application doesn't start

**Solution:**
```powershell
# Check if Node.js is installed
node --version

# Check if servers are running
netstat -ano | findstr :3000
netstat -ano | findstr :4173

# Restart servers
cd C:\PizzaPOS
npm run dev
```

### Issue: Touch not working

**Solution:**
1. Windows Settings > Devices > Touch
2. Ensure touch is enabled
3. Calibrate touchscreen
4. Update touch drivers from Device Manager

### Issue: Chrome keeps showing crashed message

**Solution:**
Add to Chrome shortcut:
```
--disable-session-crashed-bubble --disable-infobars
```

### Issue: Can't exit kiosk mode

**Solution:**
1. Press `Ctrl+Alt+Del` (if not disabled)
2. Log in as Administrator account
3. End Chrome/Electron task
4. Or restart computer from login screen

### Issue: Database locked error

**Solution:**
```powershell
# Stop all Node processes
taskkill /F /IM node.exe

# Delete database lock file
del C:\PizzaPOS\server\pizza_shop.db-shm
del C:\PizzaPOS\server\pizza_shop.db-wal

# Restart application
```

### Issue: High memory usage

**Solution:**
```powershell
# Restart Chrome with memory limits
chrome.exe --kiosk --app=http://localhost:4173 --max-old-space-size=512
```

---

## 📊 Monitoring & Maintenance

### Log Files Location

- **Server logs**: `C:\PizzaPOS\server\server.log`
- **Client logs**: `C:\PizzaPOS\client\client.log`
- **Windows Event Viewer**: Check Application logs

### Daily Maintenance Script

Create `C:\PizzaPOS\daily-maintenance.bat`:

```batch
@echo off
echo Running daily maintenance...

REM Clear old logs
forfiles /p "C:\PizzaPOS\server" /m "*.log" /d -7 /c "cmd /c del @path"

REM Vacuum SQLite database
cd C:\PizzaPOS\server
sqlite3 pizza_shop.db "VACUUM;"

REM Clear browser cache
rd /s /q "%LOCALAPPDATA%\Google\Chrome\User Data\Default\Cache"

echo Maintenance complete!
```

Schedule in Task Scheduler for 3 AM daily.

---

## 🎯 Quick Start Checklist

- [ ] Install Node.js
- [ ] Download/clone Pizza POS to `C:\PizzaPOS`
- [ ] Run `npm install` in root, client, and server folders
- [ ] Build client and server
- [ ] Test application runs
- [ ] Create kiosk user account
- [ ] Configure auto-login
- [ ] Create startup script
- [ ] Add to Windows startup
- [ ] Disable Windows key shortcuts
- [ ] Configure power settings
- [ ] Disable screen saver
- [ ] Set Windows Update schedule
- [ ] Test kiosk mode
- [ ] Configure emergency access

---

## 📞 Support

For issues or questions:
1. Check logs in `C:\PizzaPOS\server\` and `C:\PizzaPOS\client\`
2. Review Windows Event Viewer
3. Check Task Manager for stuck processes
4. Verify network connectivity
5. Ensure database file is not corrupted

---

**Installation Complete! Your Pizza POS kiosk is ready to use.** 🍕

# Windows Auto-Start Configuration

## Option 1: Startup Folder (Easiest)

1. Press `Win + R`
2. Type: `shell:startup`
3. Press Enter
4. Copy the shortcut to `start-kiosk.ps1` into this folder

## Option 2: Task Scheduler (Most Reliable)

1. Open Task Scheduler (`taskschd.msc`)
2. Click "Create Task"
3. **General Tab**:
   - Name: "Pizza POS Kiosk"
   - Select "Run whether user is logged on or not"
   - Check "Run with highest privileges"

4. **Triggers Tab**:
   - New > At log on
   - Specific user: (your kiosk user)

5. **Actions Tab**:
   - New > Start a program
   - Program: `powershell.exe`
   - Arguments: `-ExecutionPolicy Bypass -File "C:\path\to\pizza-pos\scripts\start-kiosk.ps1"`

6. **Conditions Tab**:
   - Uncheck "Start only if on AC power"

7. **Settings Tab**:
   - Check "If task fails, restart every: 1 minute"
   - Attempt to restart up to: 3 times

## Option 3: Registry (Advanced)

1. Open Registry Editor (`regedit`)
2. Navigate to: `HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Run`
3. New > String Value
4. Name: `PizzaPOS`
5. Value: `powershell.exe -ExecutionPolicy Bypass -File "C:\path\to\pizza-pos\scripts\start-kiosk.ps1"`

## Testing Auto-Start

1. Restart the computer
2. Login with kiosk user
3. App should start automatically in kiosk mode

## Disable Auto-Start

- **Startup Folder**: Delete the shortcut
- **Task Scheduler**: Disable or delete the task
- **Registry**: Delete the registry key

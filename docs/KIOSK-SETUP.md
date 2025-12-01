# Kiosk Mode Configuration Guide

## Windows 10/11 Kiosk Setup

### 1. Create Dedicated Kiosk User

```powershell
# Create new local user
net user KioskUser YourPassword123! /add
net localgroup Users KioskUser /add
```

### 2. Configure Assigned Access (Windows 11 Pro)

1. Open **Settings** > **Accounts** > **Other users**
2. Click **Set up a kiosk**
3. Create a kiosk account
4. Choose the app (Chrome or Electron app)

### 3. Configure Group Policy

Open Group Policy Editor (`gpedit.msc`):

**Disable Windows Key:**
- User Configuration > Administrative Templates > Windows Components > File Explorer
- Enable: "Turn off Windows Key hotkeys"

**Disable Task Manager:**
- User Configuration > Administrative Templates > System > Ctrl+Alt+Del Options
- Enable: "Remove Task Manager"

**Disable Alt+Tab:**
- User Configuration > Administrative Templates > Windows Components > File Explorer
- Enable: "Disable Alt+Tab"

### 4. Auto-Login Configuration

```powershell
# Run as Administrator
netplwiz
```

- Uncheck "Users must enter a username and password to use this computer"
- Click OK
- Enter credentials for KioskUser

### 5. Power Settings

```powershell
# Prevent sleep/hibernate
powercfg -change -standby-timeout-ac 0
powercfg -change -monitor-timeout-ac 0
powercfg -change -hibernate-timeout-ac 0
powercfg -change -disk-timeout-ac 0

# Disable screen saver
reg add "HKCU\Control Panel\Desktop" /v ScreenSaveActive /t REG_SZ /d 0 /f
```

### 6. Disable Windows Update During Business Hours

1. **Settings** > **Update & Security** > **Windows Update**
2. **Advanced options**
3. Set "Active hours" to cover business hours

### 7. Touch Keyboard Settings

```powershell
# Enable touch keyboard
reg add "HKCU\Software\Microsoft\TabletTip\1.7" /v EnableDesktopModeAutoInvoke /t REG_DWORD /d 1 /f
```

### 8. Browser Kiosk Mode Settings

**Chrome Flags for Touch:**
```
chrome://flags/#touch-events - Enable
chrome://flags/#enable-pinch - Disable
```

## Testing Kiosk Mode

1. Log out and log in as KioskUser
2. Verify auto-start works
3. Test that Windows key is disabled
4. Try to access Task Manager (should be blocked)
5. Test touch interactions

## Emergency Exit

If you need to exit kiosk mode:

1. **For Chrome**: Press `Alt+F4` (if not disabled)
2. **For Electron**: Configure a secret key combination in the app
3. **System**: Use another admin account to access settings

## Monitoring & Maintenance

### Remote Desktop Access

Enable RDP for remote management:
```powershell
Set-ItemProperty -Path 'HKLM:\System\CurrentControlSet\Control\Terminal Server' -Name "fDenyTSConnections" -Value 0
Enable-NetFirewallRule -DisplayGroup "Remote Desktop"
```

### Event Logging

Monitor kiosk events:
```powershell
# View event logs
Get-EventLog -LogName Application -Source "Pizza POS" -Newest 50
```

## Security Best Practices

1. **Use a dedicated user account** - Don't use admin account
2. **Disable unnecessary services** - Only run what's needed
3. **Regular updates** - Schedule maintenance windows
4. **Physical security** - Lock the computer case
5. **Network isolation** - Use separate VLAN if possible
6. **Backup regularly** - Database and configuration files

## Troubleshooting

### Kiosk won't start
- Check auto-start configuration
- Verify user permissions
- Check Windows Event Viewer

### Touch not working
- Update touchscreen drivers
- Check Windows touch settings
- Calibrate touchscreen

### App crashes
- Check electron/server logs
- Verify all dependencies installed
- Check disk space

### Can't exit kiosk mode
- Use admin account from another device
- Safe mode boot
- Physical reboot button

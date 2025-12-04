# Release Guide

This document explains how to create a new release of the Pizza POS system.

## Version Numbering

We use [Semantic Versioning](https://semver.org/):

- **MAJOR** version (X.0.0) - Incompatible API changes
- **MINOR** version (1.X.0) - New features, backwards compatible
- **PATCH** version (1.0.X) - Bug fixes, backwards compatible

Current Version: **2.0.0**

## Making a New Release

### 1. Update Version Number

Edit `package.json` in the root directory and update the version:

```json
{
  "version": "2.1.0"
}
```

### 2. Sync Version Across All Files

Run the sync script to update version numbers in all files:

```bash
npm run sync-version
```

This will automatically update:

- `shared/version.ts` - Shared version constants
- `client/package.json` - Client app version
- `server/package.json` - Server app version
- `electron/main.js` - Electron app version

### 3. Test Everything

```bash
# Test web app
npm run dev

# Test Electron app
npm run electron:dev

# Build everything
npm run build
```

### 4. Commit Changes

```bash
git add -A
git commit -m "chore: Release v2.1.0"
```

### 5. Create Git Tag

```bash
git tag v2.1.0
git push origin master
git push origin v2.1.0
```

### 6. Build Electron Installer

```bash
npm run electron:build:full
```

The installer will be created in `dist/` folder:

- `Pizza POS Setup 2.1.0.exe` - Windows installer

### 7. Deploy Web App

#### Deploy Client to Hostinger

1. Build the client:

   ```bash
   cd client
   npm run build
   ```

2. Upload `client/dist/*` to Hostinger via FTP/File Manager

#### Deploy Server to Vercel

Server deploys automatically when you push to master:

```bash
git push origin master
```

Vercel will automatically detect changes and redeploy.

### 8. Create GitHub Release (Optional)

1. Go to GitHub repository
2. Click "Releases" → "Draft a new release"
3. Select the tag: `v2.1.0`
4. Title: `Pizza POS v2.1.0`
5. Description: List changes and features
6. Attach the Windows installer from `dist/` folder
7. Click "Publish release"

## Quick Release Command

For a full release (sync version, build, and create installer):

```bash
npm run release
```

## Version History

- **v2.0.0** (2025-01-04)

  - Unified authentication system
  - Fixed CORS issues
  - Added version tracking
  - Added developer info

- **v1.0.0** (2024-12-01)
  - Initial release
  - Basic POS functionality
  - Electron desktop app
  - Web-based ordering

## Developer Information

- **Developer**: Akankha
- **Email**: info@akankha.com
- **Website**: https://akankha.com
- **License**: MIT

## Support

For issues or questions:

1. Check documentation in `/docs` folder
2. Email: info@akankha.com
3. Visit: https://akankha.com

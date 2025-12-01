# ☁️ Cloud Deployment Guide - Pizza POS

Deploy Pizza POS to the cloud for remote access from anywhere. Kiosks connect to your hosted application, and admins can manage from any device.

---

## 🎯 Deployment Architecture

```
┌─────────────────────────────────────────────────┐
│         Cloud Server (VPS/Cloud Platform)       │
│  ┌──────────────────────────────────────────┐  │
│  │  Node.js Server (Port 3000)              │  │
│  │  - API Routes                            │  │
│  │  - Socket.io (Real-time)                 │  │
│  │  - SQLite Database                       │  │
│  └──────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────┐  │
│  │  Static Files (Nginx/Apache)             │  │
│  │  - React Frontend (Port 80/443)          │  │
│  │  - HTTPS/SSL                             │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
         ▲                           ▲
         │                           │
    ┌────┴────┐                 ┌───┴────┐
    │ Kiosk   │                 │ Admin  │
    │ Windows │                 │ Mobile │
    │ Tablet  │                 │ Laptop │
    └─────────┘                 └────────┘
```

---

## 🚀 Deployment Options

### Option 1: DigitalOcean (Recommended for Beginners)
- **Cost**: $6-12/month
- **Easy**: One-click Node.js droplet
- **Pros**: Simple, reliable, good docs
- **Cons**: Not free

### Option 2: AWS EC2 (Enterprise)
- **Cost**: $5-20/month (varies)
- **Scalable**: Auto-scaling, load balancing
- **Pros**: Professional, feature-rich
- **Cons**: Complex setup, pricing can increase

### Option 3: Railway.app (Easiest)
- **Cost**: $5/month (free tier available)
- **Easiest**: Git push to deploy
- **Pros**: Zero config, free SSL, GitHub integration
- **Cons**: Limited free tier

### Option 4: Render.com (Modern)
- **Cost**: Free tier, $7/month for production
- **Modern**: Auto deploys from Git
- **Pros**: Free SSL, easy setup, good free tier
- **Cons**: Free tier sleeps after inactivity

### Option 5: Your Own VPS (Linode, Vultr, Hetzner)
- **Cost**: $5-10/month
- **Control**: Full server access
- **Pros**: Cheapest, full control
- **Cons**: Manual setup required

---

## 📋 Quick Deployment - Railway.app (Fastest)

### Step 1: Prepare Your Code

Create `Dockerfile` in project root:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/
COPY shared/package*.json ./shared/

# Install dependencies
RUN npm install
RUN cd client && npm install
RUN cd server && npm install

# Copy source code
COPY . .

# Build client
RUN cd client && npm run build

# Build server
RUN cd server && npm run build

# Expose ports
EXPOSE 3000

# Start server (serves both API and static files)
CMD ["npm", "run", "start:production"]
```

### Step 2: Add Production Start Script

Update `package.json`:

```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev --prefix server\" \"npm run dev --prefix client\"",
    "start:production": "node server/dist/index.js"
  }
}
```

### Step 3: Update Server to Serve Static Files

Update `server/src/index.ts` (add after routes):

```typescript
import path from 'path';
import express from 'express';

// ... existing code ...

// Serve static files from client build
const clientBuildPath = path.join(__dirname, '../../client/dist');
app.use(express.static(clientBuildPath));

// Handle client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

// ... rest of code ...
```

### Step 4: Deploy to Railway

1. **Sign up**: https://railway.app
2. **New Project** > **Deploy from GitHub repo**
3. **Connect your repo** (or upload manually)
4. **Add environment variables**:
   - `NODE_ENV=production`
   - `PORT=3000`
5. **Deploy** - Railway will auto-build and deploy
6. **Get your URL**: `your-app.railway.app`

**Done! Your app is live!** 🎉

---

## 🔧 Detailed Deployment - DigitalOcean VPS

### Step 1: Create Droplet

1. Sign up at https://digitalocean.com
2. Create Droplet:
   - **Image**: Ubuntu 22.04 LTS
   - **Plan**: Basic $6/month (1GB RAM)
   - **Datacenter**: Closest to your location
   - **Authentication**: SSH keys (recommended)
3. Note your droplet IP: `123.456.789.101`

### Step 2: Initial Server Setup

SSH into your server:

```bash
ssh root@123.456.789.101
```

Update system:

```bash
apt update && apt upgrade -y
```

Install Node.js:

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs
node --version  # Should show v18.x
```

Install additional tools:

```bash
apt install -y git nginx certbot python3-certbot-nginx
```

### Step 3: Setup Application

Create app user:

```bash
adduser pizzapos
usermod -aG sudo pizzapos
su - pizzapos
```

Clone your repository:

```bash
cd ~
git clone <your-repo-url> pizza-pos
cd pizza-pos
```

Install dependencies:

```bash
npm install
cd client && npm install && npm run build
cd ../server && npm install && npm run build
cd ~
```

### Step 4: Setup PM2 Process Manager

Install PM2:

```bash
sudo npm install -g pm2
```

Create PM2 ecosystem file `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'pizza-pos',
    cwd: '/home/pizzapos/pizza-pos/server',
    script: 'dist/index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
```

Start the app:

```bash
cd ~/pizza-pos
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # Follow the instructions shown
```

### Step 5: Setup Nginx Reverse Proxy

Create Nginx config:

```bash
sudo nano /etc/nginx/sites-available/pizza-pos
```

Add configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;  # Replace with your domain or IP

    # Client static files
    location / {
        root /home/pizzapos/pizza-pos/client/dist;
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Socket.io proxy
    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/pizza-pos /etc/nginx/sites-enabled/
sudo nginx -t  # Test configuration
sudo systemctl restart nginx
```

### Step 6: Setup SSL (HTTPS)

Point your domain to server IP (in domain registrar DNS settings):
- **A Record**: `@` → `123.456.789.101`
- **A Record**: `www` → `123.456.789.101`

Get free SSL certificate:

```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

Follow prompts, choose redirect option (2).

**Your app is now live at** `https://your-domain.com` 🎉

### Step 7: Setup Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

---

## 🖥️ Configure Windows Kiosk to Use Cloud URL

### Update Kiosk Startup Script

Edit `C:\PizzaPOS\start-kiosk.bat`:

```batch
@echo off
echo Starting Pizza POS Kiosk...

REM Wait for network
timeout /t 3 /nobreak

REM Launch kiosk pointing to cloud URL
start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" ^
  --kiosk ^
  --app=https://your-domain.com ^
  --disable-pinch ^
  --overscroll-history-navigation=0 ^
  --disable-features=TranslateUI ^
  --no-first-run ^
  --disable-session-crashed-bubble ^
  --disable-infobars

exit
```

**That's it!** Kiosk now connects to cloud server. No local servers needed.

---

## 📱 Admin Access from Anywhere

### Mobile Access

Just visit `https://your-domain.com/admin/login` from:
- iPhone/iPad Safari
- Android Chrome
- Any mobile browser

**Bookmark it** for easy access!

### Desktop Access

Visit from any computer:
- Windows
- Mac
- Linux
- Chromebook

**Recommended**: Add to home screen on mobile for app-like experience.

---

## 🔐 Security Best Practices

### 1. Change Default Admin Password

First time login:
1. Go to `https://your-domain.com/admin/login`
2. Login with default credentials
3. Go to Settings > Change Password
4. Use strong password (12+ chars, mix of letters/numbers/symbols)

### 2. Setup Firewall Rules

Only allow necessary ports:

```bash
# On server
sudo ufw status
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw deny 3000/tcp  # Block direct Node.js access
```

### 3. Regular Backups

Create backup script `/home/pizzapos/backup.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/home/pizzapos/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
cp /home/pizzapos/pizza-pos/server/pizza_shop.db $BACKUP_DIR/db_$DATE.db

# Keep only last 7 days
find $BACKUP_DIR -name "db_*.db" -mtime +7 -delete

echo "Backup completed: db_$DATE.db"
```

Schedule daily backups:

```bash
chmod +x /home/pizzapos/backup.sh
crontab -e
# Add: 0 3 * * * /home/pizzapos/backup.sh
```

### 4. Setup Fail2Ban (Prevent brute force)

```bash
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 5. Enable Auto-Updates

```bash
sudo apt install unattended-upgrades -y
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

---

## 📊 Monitoring & Maintenance

### Check Application Status

```bash
pm2 status
pm2 logs pizza-pos
pm2 monit  # Real-time monitoring
```

### Check Server Resources

```bash
htop          # CPU/Memory usage
df -h         # Disk space
free -h       # RAM usage
```

### Update Application

```bash
cd ~/pizza-pos
git pull origin main
cd client && npm install && npm run build
cd ../server && npm install && npm run build
pm2 restart pizza-pos
```

### View Logs

```bash
# Application logs
pm2 logs pizza-pos

# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

---

## 🌍 Custom Domain Setup

### Option 1: Namecheap/GoDaddy

1. **Buy domain**: `pizzapos.com`
2. **DNS Settings**:
   - A Record: `@` → `123.456.789.101`
   - A Record: `www` → `123.456.789.101`
3. **Wait**: 5-60 minutes for propagation
4. **SSL**: Run certbot (Step 6 above)

### Option 2: Cloudflare (Free CDN + DDoS Protection)

1. **Sign up**: https://cloudflare.com
2. **Add site**: Enter your domain
3. **Update nameservers**: At your registrar
4. **DNS Settings**:
   - A Record: `@` → `123.456.789.101` (Orange cloud ON)
   - A Record: `www` → `123.456.789.101` (Orange cloud ON)
5. **SSL/TLS**: Set to "Full (strict)"
6. **Benefits**: Free CDN, DDoS protection, analytics

---

## 💰 Cost Breakdown

### Monthly Costs

**Minimal Setup** ($10-15/month):
- DigitalOcean Droplet: $6/month
- Domain name: $1/month (if .com, ~$12/year)
- SSL: Free (Let's Encrypt)
- **Total**: ~$7/month

**Railway.app** ($5/month):
- Hosting: $5/month
- Custom domain: Free
- SSL: Free
- **Total**: $5/month

**Production Setup** ($20-30/month):
- Better VPS (2GB RAM): $12/month
- Domain: $1/month
- Cloudflare Pro (optional): $20/month
- Backup storage: $5/month
- **Total**: ~$18-38/month

---

## 🆘 Troubleshooting

### Issue: Can't access from kiosk

**Check:**
```bash
# On server
pm2 status
sudo systemctl status nginx

# On kiosk (PowerShell)
Test-NetConnection your-domain.com -Port 443
```

### Issue: "502 Bad Gateway"

**Solution:**
```bash
pm2 restart pizza-pos
sudo systemctl restart nginx
```

### Issue: Database locked

**Solution:**
```bash
pm2 stop pizza-pos
cd ~/pizza-pos/server
rm pizza_shop.db-shm pizza_shop.db-wal
pm2 start pizza-pos
```

### Issue: High memory usage

**Solution:**
```bash
pm2 restart pizza-pos
# Or increase memory limit in ecosystem.config.js
```

### Issue: SSL certificate expired

**Solution:**
```bash
sudo certbot renew
sudo systemctl reload nginx
```

---

## 📞 Support Checklist

Before reaching out for help:

- [ ] Check PM2 status: `pm2 status`
- [ ] Check PM2 logs: `pm2 logs pizza-pos`
- [ ] Check Nginx status: `sudo systemctl status nginx`
- [ ] Check Nginx error logs: `sudo tail -f /var/log/nginx/error.log`
- [ ] Verify domain DNS: `nslookup your-domain.com`
- [ ] Test network: `curl -I https://your-domain.com`
- [ ] Check disk space: `df -h`
- [ ] Check memory: `free -h`

---

## 🎯 Quick Start Summary

**For Railway.app (Easiest):**
1. Create Dockerfile
2. Push to GitHub
3. Connect Railway to repo
4. Deploy
5. Point kiosk to Railway URL

**For DigitalOcean VPS:**
1. Create droplet
2. Install Node.js, Nginx, PM2
3. Clone repo and build
4. Configure Nginx reverse proxy
5. Setup SSL with Certbot
6. Point kiosk to domain

**Result:**
- ✅ Kiosks connect to cloud URL
- ✅ Admin access from anywhere
- ✅ One central database
- ✅ Real-time sync across all kiosks
- ✅ Secure HTTPS connection

---

**Your Pizza POS is now cloud-ready!** ☁️🍕

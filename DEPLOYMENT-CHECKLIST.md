# 📋 Deployment Checklist

Use this checklist before deploying to production.

## ✅ Pre-Deployment

- [ ] Run `npm run deploy:build` successfully
- [ ] All tests pass (if applicable)
- [ ] No console errors in browser
- [ ] Environment variables configured (`.env`)
- [ ] Changed default admin password
- [ ] Database initialized with seed data
- [ ] Reviewed security settings

## 🔐 Security

- [ ] Strong admin password set
- [ ] JWT secret changed from default
- [ ] HTTPS/SSL certificate installed
- [ ] Firewall configured
- [ ] Unnecessary ports closed
- [ ] Database file permissions set correctly
- [ ] Environment variables not committed to Git

## 🌐 Hosting Setup

- [ ] Domain name configured (if applicable)
- [ ] DNS A records pointing to server IP
- [ ] SSL certificate installed and auto-renewing
- [ ] Nginx/Apache configured correctly
- [ ] PM2/systemd service running
- [ ] Application accessible via domain
- [ ] All routes working (/, /admin, /kitchen, etc.)

## 📱 Kiosk Configuration

- [ ] Kiosk startup script created
- [ ] Points to production URL (not localhost)
- [ ] Auto-start on boot configured
- [ ] Touch keyboard enabled (if touchscreen)
- [ ] Windows key disabled
- [ ] Alt+F4 disabled
- [ ] Screen saver disabled
- [ ] Power settings configured (never sleep)

## 🔄 Testing

- [ ] Can place orders from kiosk
- [ ] Orders appear in kitchen display
- [ ] Admin panel accessible remotely
- [ ] Real-time updates working
- [ ] Receipt generation working
- [ ] Payment methods working
- [ ] Mobile admin access working

## 💾 Backup & Recovery

- [ ] Automatic backups configured
- [ ] Backup location accessible
- [ ] Tested database restore
- [ ] PM2 auto-restart configured
- [ ] Server monitoring setup

## 📊 Performance

- [ ] Page load time < 3 seconds
- [ ] No memory leaks after 24 hours
- [ ] CPU usage acceptable
- [ ] Database queries optimized
- [ ] Static files cached properly

## 🆘 Emergency Access

- [ ] Admin email/phone documented
- [ ] SSH access credentials secure
- [ ] Emergency shutdown procedure documented
- [ ] Support contact information available

## 📝 Documentation

- [ ] Installation guide updated
- [ ] Admin credentials documented (securely)
- [ ] Troubleshooting guide available
- [ ] Deployment notes recorded

---

## Post-Deployment

- [ ] Monitor logs for 24 hours
- [ ] Check error rates
- [ ] Verify backup ran successfully
- [ ] Test emergency access procedures
- [ ] Schedule first maintenance window

---

**Date deployed:** _______________

**Deployed by:** _______________

**Server IP:** _______________

**Domain:** _______________

**Notes:**

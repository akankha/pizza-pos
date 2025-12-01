# 🌐 Hostinger Shared Hosting Deployment Guide

Deploy your Pizza POS system to Hostinger shared hosting with MySQL database.

---

## ⚠️ Important Limitations

Hostinger **shared hosting** has limitations for Node.js applications:
- ❌ Cannot run persistent Node.js server (Express backend)
- ❌ No WebSocket support for real-time updates
- ✅ Can host static React frontend
- ✅ Can use MySQL database
- ✅ Can use PHP backend (alternative)

**Recommended Solution**: Use Hostinger VPS or convert backend to PHP.

---

## 🎯 Deployment Options

### Option 1: Static Frontend + External Backend (Recommended)
Deploy React frontend on Hostinger, backend on free service (Railway/Render)

### Option 2: Convert to PHP Backend (Full Hostinger)
Rewrite Express backend in PHP for full shared hosting support

### Option 3: Upgrade to Hostinger VPS ($4-8/month)
Get full Node.js + MySQL support with root access

---

## 📋 Option 1: Static Frontend on Hostinger

### Step 1: Build Production Files

```bash
# Navigate to project
cd /Users/akankha/Documents/Code/pizza-pos

# Build client
npm run build

# Files will be in: client/dist/
```

### Step 2: Configure Backend URL

Create production environment file:

```bash
# client/.env.production
VITE_API_URL=https://your-backend.railway.app
VITE_SOCKET_URL=https://your-backend.railway.app
```

Rebuild with production config:

```bash
cd client
VITE_API_URL=https://your-backend.railway.app npm run build
```

### Step 3: Upload to Hostinger

1. **Login to Hostinger hPanel**
   - Go to https://hpanel.hostinger.com
   - Login with your credentials

2. **Open File Manager**
   - Navigate to: Hosting → Manage → File Manager
   - Go to `public_html` folder (or your domain folder)

3. **Upload Files**
   - Delete existing files in `public_html` (except `.htaccess` if exists)
   - Upload ALL files from `client/dist/` folder
   - Maintain folder structure:
     ```
     public_html/
     ├── index.html
     ├── assets/
     │   ├── index-*.css
     │   └── index-*.js
     └── (other files)
     ```

4. **Create .htaccess for React Router**

Create `.htaccess` file in `public_html`:

```apache
# Enable Rewrite Engine
RewriteEngine On
RewriteBase /

# Redirect to HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# React Router - redirect all to index.html
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# Caching for static assets
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
</IfModule>

# Compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript
</IfModule>
```

### Step 4: Deploy Backend to Railway (Free)

1. **Create Railway Account**
   - Go to https://railway.app
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your GitHub account
   - Select your pizza-pos repository

3. **Configure Environment Variables**

In Railway dashboard, add these variables:

```env
NODE_ENV=production
PORT=3001
DB_HOST=your-hostinger-mysql-host
DB_USER=your-mysql-username
DB_PASSWORD=your-mysql-password
DB_NAME=pizza_pos
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
SESSION_SECRET=your-super-secret-session-key-change-this-too
```

4. **Get Railway URL**
   - Copy the deployment URL (e.g., `https://pizza-pos-backend.railway.app`)
   - Update your frontend `.env.production` with this URL
   - Rebuild and re-upload frontend

---

## 📋 Option 2: Full PHP Backend (Advanced)

### Step 1: Setup MySQL Database on Hostinger

1. **Create Database**
   - Go to: Hosting → Manage → MySQL Databases
   - Click "Create New Database"
   - Database name: `u123456_pizza_pos` (auto-prefixed)
   - Create database user
   - Note credentials

2. **Import Database Schema**

Create `setup.sql` file:

```sql
-- Create tables
CREATE TABLE IF NOT EXISTS sizes (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(20) NOT NULL,
  display_name VARCHAR(50) NOT NULL,
  base_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS crusts (
  id VARCHAR(50) PRIMARY KEY,
  type VARCHAR(20) NOT NULL,
  display_name VARCHAR(50) NOT NULL,
  price_modifier DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS toppings (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  category ENUM('meat', 'veggie', 'cheese', 'sauce') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS menu_items (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category ENUM('side', 'drink') NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  description TEXT,
  active BOOLEAN DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS specialty_pizzas (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  toppings TEXT,
  price_small DECIMAL(10,2) NOT NULL,
  price_medium DECIMAL(10,2) NOT NULL,
  price_large DECIMAL(10,2) NOT NULL,
  price_xlarge DECIMAL(10,2) NOT NULL,
  category VARCHAR(50) DEFAULT 'specialty',
  active BOOLEAN DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS combo_deals (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  items TEXT NOT NULL,
  category VARCHAR(50),
  active BOOLEAN DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(36) PRIMARY KEY,
  order_number INT AUTO_INCREMENT UNIQUE,
  customer_name VARCHAR(100),
  customer_phone VARCHAR(20),
  subtotal DECIMAL(10,2) NOT NULL,
  tax_gst DECIMAL(10,2) DEFAULT 0,
  tax_pst DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  status ENUM('pending', 'preparing', 'ready', 'completed', 'cancelled') DEFAULT 'pending',
  payment_method ENUM('cash', 'card', 'debit', 'credit'),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
);

CREATE TABLE IF NOT EXISTS order_items (
  id VARCHAR(36) PRIMARY KEY,
  order_id VARCHAR(36) NOT NULL,
  type ENUM('custom_pizza', 'specialty_pizza', 'combo_deal', 'side', 'drink') NOT NULL,
  name VARCHAR(200) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  size VARCHAR(20),
  specialty_pizza_id VARCHAR(50),
  combo_id VARCHAR(50),
  menu_item_id VARCHAR(50),
  item_data JSON,
  notes TEXT,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  INDEX idx_order_id (order_id),
  INDEX idx_type (type)
);

CREATE TABLE IF NOT EXISTS admin_users (
  id VARCHAR(36) PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100),
  role ENUM('super_admin', 'restaurant_admin', 'reception', 'kitchen') NOT NULL,
  created_by VARCHAR(36),
  active BOOLEAN DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP NULL,
  INDEX idx_username (username),
  INDEX idx_role (role)
);

CREATE TABLE IF NOT EXISTS restaurant_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

Upload via phpMyAdmin or File Manager → Import

3. **Run Menu Import Script**

You'll need to create a PHP version of the menu import or manually insert data via phpMyAdmin.

### Step 2: Create PHP API (Simplified Example)

Create `api/` folder in `public_html`:

```
public_html/
├── api/
│   ├── config.php
│   ├── menu.php
│   ├── orders.php
│   └── auth.php
├── index.html
└── assets/
```

**config.php:**
```php
<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Database connection
$host = 'localhost';
$dbname = 'u123456_pizza_pos';
$username = 'u123456_pizza';
$password = 'your-password';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Database connection failed']);
    exit();
}
?>
```

**menu.php:**
```php
<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        // Get all menu data
        $sizes = $pdo->query("SELECT * FROM sizes ORDER BY base_price")->fetchAll(PDO::FETCH_ASSOC);
        $crusts = $pdo->query("SELECT * FROM crusts")->fetchAll(PDO::FETCH_ASSOC);
        $toppings = $pdo->query("SELECT * FROM toppings ORDER BY category, name")->fetchAll(PDO::FETCH_ASSOC);
        $sides = $pdo->query("SELECT * FROM menu_items WHERE category = 'side' ORDER BY price")->fetchAll(PDO::FETCH_ASSOC);
        $drinks = $pdo->query("SELECT * FROM menu_items WHERE category = 'drink' ORDER BY price")->fetchAll(PDO::FETCH_ASSOC);
        $specialtyPizzas = $pdo->query("SELECT * FROM specialty_pizzas WHERE active = 1 ORDER BY name")->fetchAll(PDO::FETCH_ASSOC);
        $combos = $pdo->query("SELECT * FROM combo_deals WHERE active = 1 ORDER BY category, price")->fetchAll(PDO::FETCH_ASSOC);

        // Format specialty pizzas
        $formattedSpecialty = array_map(function($sp) {
            return [
                'id' => $sp['id'],
                'name' => $sp['name'],
                'description' => $sp['description'] ?? '',
                'toppings' => $sp['toppings'],
                'prices' => [
                    'small' => (float)$sp['price_small'],
                    'medium' => (float)$sp['price_medium'],
                    'large' => (float)$sp['price_large'],
                    'xlarge' => (float)$sp['price_xlarge']
                ],
                'category' => $sp['category'] ?? 'specialty'
            ];
        }, $specialtyPizzas);

        echo json_encode([
            'success' => true,
            'data' => [
                'sizes' => $sizes,
                'crusts' => $crusts,
                'toppings' => $toppings,
                'sides' => $sides,
                'drinks' => $drinks,
                'specialtyPizzas' => $formattedSpecialty,
                'combos' => $combos
            ]
        ]);
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
}
?>
```

**Update Frontend API URL:**
```env
# client/.env.production
VITE_API_URL=https://yourdomain.com/api
```

---

## 📋 Option 3: Hostinger VPS (Best Solution)

### Why VPS?
- ✅ Full Node.js support
- ✅ WebSocket for real-time updates
- ✅ MySQL database included
- ✅ Root access
- ✅ Better performance
- 💰 Cost: $4-8/month

### Setup Steps

1. **Order VPS from Hostinger**
   - Go to Hostinger → VPS Hosting
   - Choose plan (KVM 1 or KVM 2)
   - Select Ubuntu 22.04 OS

2. **Connect via SSH**
```bash
ssh root@your-vps-ip
```

3. **Install Node.js & MySQL**
```bash
# Update system
apt update && apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install MySQL
apt install -y mysql-server

# Install PM2 (process manager)
npm install -g pm2

# Install Nginx
apt install -y nginx

# Install certbot for SSL
apt install -y certbot python3-certbot-nginx
```

4. **Setup MySQL**
```bash
# Secure MySQL
mysql_secure_installation

# Create database
mysql -u root -p
```

```sql
CREATE DATABASE pizza_pos;
CREATE USER 'pizza_admin'@'localhost' IDENTIFIED BY 'secure_password_here';
GRANT ALL PRIVILEGES ON pizza_pos.* TO 'pizza_admin'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

5. **Upload Application**
```bash
# On your local machine
cd /Users/akankha/Documents/Code/pizza-pos
npm run build

# Create deployment package
tar -czf pizza-pos.tar.gz client/dist server package.json

# Upload to VPS
scp pizza-pos.tar.gz root@your-vps-ip:/var/www/
```

6. **On VPS - Extract and Setup**
```bash
cd /var/www
tar -xzf pizza-pos.tar.gz
mv pizza-pos app
cd app

# Install dependencies
npm install --production

# Setup environment
nano .env
```

**.env file:**
```env
NODE_ENV=production
PORT=3001
DB_HOST=localhost
DB_USER=pizza_admin
DB_PASSWORD=secure_password_here
DB_NAME=pizza_pos
JWT_SECRET=your-super-secret-jwt-key-change-this
SESSION_SECRET=your-super-secret-session-key-change-this
```

7. **Import Database Schema**
```bash
# Upload your database SQL file
scp /path/to/setup.sql root@your-vps-ip:/tmp/

# Import
mysql -u pizza_admin -p pizza_pos < /tmp/setup.sql
```

8. **Start Application with PM2**
```bash
cd /var/www/app

# Start server
pm2 start server/src/index.js --name pizza-pos-server

# Save PM2 config
pm2 save
pm2 startup
```

9. **Configure Nginx**
```bash
nano /etc/nginx/sites-available/pizza-pos
```

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Frontend - React app
    location / {
        root /var/www/app/client/dist;
        try_files $uri $uri/ /index.html;
        
        # Caching
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # WebSocket for real-time updates
    location /socket.io {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Enable site:
```bash
ln -s /etc/nginx/sites-available/pizza-pos /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

10. **Setup SSL Certificate**
```bash
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

11. **Configure Firewall**
```bash
ufw allow 'Nginx Full'
ufw allow OpenSSH
ufw enable
```

---

## 🔄 Updating Your Application

### For Static Frontend (Option 1 & 2):
```bash
# Build new version
cd /Users/akankha/Documents/Code/pizza-pos
npm run build

# Upload via FTP or File Manager
# Replace files in public_html
```

### For VPS (Option 3):
```bash
# On local machine - build
npm run build
tar -czf pizza-pos-update.tar.gz client/dist server

# Upload
scp pizza-pos-update.tar.gz root@your-vps-ip:/tmp/

# On VPS
cd /var/www/app
tar -xzf /tmp/pizza-pos-update.tar.gz
pm2 restart pizza-pos-server
```

---

## 🎯 Recommended Approach

**For Production Restaurant:** Option 3 (VPS) - $4-8/month
- Full features (real-time updates, WebSocket)
- Better performance
- Scalable

**For Testing/Demo:** Option 1 (Static + Railway)
- Free backend on Railway
- Static frontend on Hostinger
- Good for showcasing

---

## 📞 Support

If you encounter issues:
1. Check Hostinger documentation
2. Review error logs (in hPanel or `/var/log/nginx/`)
3. Test API endpoints manually
4. Verify database connections

---

**Need help with deployment? Share your Hostinger plan type and I'll provide specific instructions!**

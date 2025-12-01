# 👥 Role-Based Access Control (RBAC) System

## Overview

Your Pizza POS now includes a comprehensive **Role-Based Access Control** system with four distinct user roles, each with specific permissions and capabilities.

---

## 🎭 User Roles

### 1. 🛡️ Super Admin

**Full system access with no restrictions**

**Permissions:**
- ✅ Manage restaurant settings (name, address, taxes, printer)
- ✅ Create/edit/delete ALL user roles (including other super admins)
- ✅ View all reports and analytics
- ✅ Manage menu items and prices
- ✅ View and manage all orders
- ✅ Access kitchen display
- ✅ Configure printer settings
- ✅ Full system control

**Can Create:**
- Super Admin
- Restaurant Admin
- Reception
- Kitchen

**Default User:**
- Username: `admin`
- Password: `admin123` (⚠️ CHANGE IN PRODUCTION!)
- Created automatically on first setup

---

### 2. 🍕 Restaurant Admin

**Manage day-to-day operations: menu, staff, orders**

**Permissions:**
- ✅ Manage menu items and prices
- ✅ Create reception and kitchen users
- ✅ View reports and analytics
- ✅ View and manage orders
- ✅ Access kitchen display
- ✅ Take orders (has reception access)
- ✅ Configure printer
- ❌ Cannot modify restaurant settings
- ❌ Cannot create other admins

**Can Create:**
- Reception
- Kitchen

**Use Case:**
- Restaurant owner
- Store manager
- Operations manager

---

### 3. 📝 Reception

**Front desk: take orders and handle customers**

**Permissions:**
- ✅ Take customer orders
- ✅ View active orders
- ✅ Process payments
- ✅ Print receipts
- ✅ View menu prices
- ❌ Cannot modify menu
- ❌ Cannot create users
- ❌ Cannot access reports
- ❌ Cannot access settings

**Can Create:**
- None (cannot create users)

**Use Case:**
- Cashier
- Front desk staff
- Order taker

---

### 4. 👨‍🍳 Kitchen

**Kitchen display: prepare orders**

**Permissions:**
- ✅ View kitchen display
- ✅ Update order status (preparing/ready/completed)
- ✅ Mark orders as preparing/ready/completed
- ✅ View order details
- ❌ Cannot take new orders
- ❌ Cannot modify menu
- ❌ Cannot create users
- ❌ Cannot access reports

**Can Create:**
- None (cannot create users)

**Use Case:**
- Chef
- Kitchen staff
- Food preparation team

---

## 📊 Permission Matrix

| Feature | Super Admin | Restaurant Admin | Reception | Kitchen |
|---------|-------------|-----------------|-----------|---------|
| **Restaurant Settings** | ✅ | ❌ | ❌ | ❌ |
| **Create Super Admin** | ✅ | ❌ | ❌ | ❌ |
| **Create Restaurant Admin** | ✅ | ❌ | ❌ | ❌ |
| **Create Reception** | ✅ | ✅ | ❌ | ❌ |
| **Create Kitchen** | ✅ | ✅ | ❌ | ❌ |
| **Delete Users** | ✅ | ❌ | ❌ | ❌ |
| **Manage Menu** | ✅ | ✅ | ❌ | ❌ |
| **Take Orders** | ✅ | ✅ | ✅ | ❌ |
| **View Active Orders** | ✅ | ✅ | ✅ | ❌ |
| **Kitchen Display** | ✅ | ✅ | ❌ | ✅ |
| **Update Order Status** | ✅ | ✅ | ❌ | ✅ |
| **View Reports** | ✅ | ✅ | ❌ | ❌ |
| **Printer Settings** | ✅ | ✅ | ❌ | ❌ |
| **Print Receipts** | ✅ | ✅ | ✅ | ❌ |

---

## 🚀 Getting Started

### Initial Setup

1. **Start the server** - Default super admin is created automatically
   ```bash
   cd server
   npm run dev
   ```

2. **Login as Super Admin**
   - Navigate to: `http://localhost:3000/admin/login`
   - Username: `admin`
   - Password: `admin123`

3. **Change Default Password**
   - Go to User Management
   - Click on your profile
   - Reset password to something secure

4. **Create First Users**
   - Navigate to Admin Dashboard → User Management
   - Click "Add User"
   - Create restaurant admins, reception, and kitchen staff

---

## 👥 User Management

### Creating Users

**As Super Admin:**
1. Login to Admin Panel
2. Go to **User Management**
3. Click **"Add User"**
4. Fill in details:
   - Username (required, unique)
   - Full Name (optional)
   - Password (required, min 6 characters)
   - Role (required)
5. Click **"Create User"**

**As Restaurant Admin:**
- Same process, but can only create **Reception** and **Kitchen** users

### Managing Users

**Deactivate User:**
- Click "Deactivate" on user card
- User cannot login but data is preserved
- Can be reactivated later

**Reset Password:**
- Click key icon 🔑
- Enter new password
- User must use new password on next login

**Delete User (Super Admin only):**
- Click trash icon 🗑️
- Confirm deletion
- ⚠️ Action cannot be undone

### User Card Information

Each user card shows:
- **Full Name** and **Username**
- **Role Badge** (color-coded)
- **Created Date**
- **Last Login** timestamp
- **Status** (Active/Deactivated)
- **Action Buttons** (if you have permission)

---

## 🔐 Authentication & Security

### Login Process

1. **Navigate** to `/admin/login`
2. **Enter** username and password
3. **System validates** credentials
4. **JWT token** issued (stored in cookies)
5. **Redirected** to Admin Dashboard

### Session Management

- **Token Expiration:** 7 days (configurable)
- **Auto-logout:** If token expires
- **Secure Cookies:** HttpOnly, SameSite
- **Password Hashing:** bcrypt with 10 rounds

### Security Features

✅ **Rate Limiting**
- 5 login attempts per 15 minutes
- Prevents brute force attacks

✅ **Password Requirements**
- Minimum 6 characters
- Can be increased in production

✅ **Token Verification**
- Every API request validates JWT
- Expired tokens rejected automatically

✅ **Role Verification**
- Each endpoint checks user role
- Unauthorized access blocked

---

## 📱 Role-Specific Workflows

### Super Admin Workflow

```
1. Login → Admin Dashboard
2. View overall stats and reports
3. Manage Users:
   - Create restaurant admins
   - Create reception/kitchen staff
   - Deactivate users
   - Delete users
4. Configure Settings:
   - Restaurant info
   - Tax rates
   - Printer settings
5. Manage Menu:
   - Add/edit/delete items
   - Update prices
6. View Reports:
   - Daily/weekly/monthly sales
   - Top items
   - Order analytics
```

### Restaurant Admin Workflow

```
1. Login → Admin Dashboard
2. Manage Daily Operations:
   - Create reception/kitchen users
   - Update menu items
   - View sales reports
3. Monitor Orders:
   - View active orders
   - Check kitchen display
   - Print receipts
4. Staff Management:
   - Add new staff (reception/kitchen)
   - Deactivate users
   - Reset passwords
```

### Reception Workflow

```
1. Login → Redirected to Order Entry
2. Take Customer Orders:
   - Select pizzas, sides, drinks
   - Customize orders
   - Process payment
3. View Active Orders:
   - Check order status
   - Print receipts
4. No access to:
   - Menu editing
   - Reports
   - User management
```

### Kitchen Workflow

```
1. Login → Redirected to Kitchen Display
2. View Incoming Orders:
   - See pending orders
   - View order details
3. Update Order Status:
   - Mark as "Preparing"
   - Mark as "Ready"
   - Mark as "Completed"
4. Auto-print receipts (if configured)
5. No access to:
   - Order entry
   - Menu editing
   - Reports
```

---

## 🔧 API Endpoints

### User Management Endpoints

**Get All Users**
```
GET /api/users
Auth: Restaurant Admin+
Response: Array of user objects
```

**Get Current User**
```
GET /api/users/me
Auth: Any authenticated user
Response: Current user object
```

**Create User**
```
POST /api/users
Auth: Restaurant Admin+
Body: { username, password, full_name?, role }
```

**Update User**
```
PUT /api/users/:id
Auth: Creator or Super Admin
Body: { full_name?, active?, password? }
```

**Delete User**
```
DELETE /api/users/:id
Auth: Super Admin only
```

**Get Role Permissions**
```
GET /api/users/roles/permissions
Auth: Any authenticated user
Response: Permission details for all roles
```

---

## 🗄️ Database Schema

### admin_users Table

```sql
CREATE TABLE admin_users (
  id VARCHAR(255) PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100),
  role ENUM('super_admin', 'restaurant_admin', 'reception', 'kitchen') 
    NOT NULL DEFAULT 'reception',
  created_by VARCHAR(255),  -- FK to admin_users.id
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME,
  INDEX idx_username (username),
  INDEX idx_role (role),
  INDEX idx_active (active),
  FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE SET NULL
);
```

---

## 🔄 Migration Guide

### Updating Existing Installation

If you have an existing Pizza POS with the old `admin` role:

1. **Backup Database**
   ```bash
   mysqldump -u root -p pizza_pos > backup.sql
   ```

2. **Update Schema**
   ```sql
   ALTER TABLE admin_users 
   MODIFY COLUMN role ENUM('super_admin', 'restaurant_admin', 'reception', 'kitchen') 
   NOT NULL DEFAULT 'reception';
   
   ALTER TABLE admin_users 
   ADD COLUMN full_name VARCHAR(100) AFTER password_hash;
   
   ALTER TABLE admin_users 
   ADD COLUMN created_by VARCHAR(255) AFTER role;
   
   ALTER TABLE admin_users
   ADD INDEX idx_role (role);
   
   ALTER TABLE admin_users
   ADD FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE SET NULL;
   ```

3. **Upgrade Existing Admin to Super Admin**
   ```sql
   UPDATE admin_users 
   SET role = 'super_admin', 
       full_name = 'Super Administrator'
   WHERE username = 'admin';
   ```

4. **Restart Server**
   ```bash
   npm run dev
   ```

---

## 💡 Best Practices

### 1. Password Management

- ✅ **Change default password** immediately
- ✅ Use **strong passwords** (12+ characters)
- ✅ **Different passwords** for each user
- ✅ **Reset passwords** regularly
- ❌ Don't share passwords

### 2. User Creation

- ✅ Create users with **appropriate roles**
- ✅ Use **full names** for easy identification
- ✅ **Deactivate** users when they leave (don't delete)
- ✅ **Review user list** regularly

### 3. Role Assignment

- ✅ **Minimum privilege** principle (give only needed access)
- ✅ **Reception** for front desk only
- ✅ **Kitchen** for kitchen staff only
- ✅ **Restaurant Admin** for managers
- ✅ **Super Admin** only for owners/IT

### 4. Security

- ✅ **HTTPS** in production
- ✅ **Change JWT_SECRET** in production
- ✅ **Regular backups**
- ✅ **Monitor failed login attempts**
- ✅ **Audit user activity**

---

## 🐛 Troubleshooting

### "Access denied" Errors

**Problem:** User cannot access certain features

**Solution:**
1. Check user role in User Management
2. Verify role has required permissions
3. Check if user is active
4. Try logging out and back in

### Cannot Create Users

**Problem:** "Access denied" when creating users

**Solution:**
1. **Reception/Kitchen** cannot create users at all
2. **Restaurant Admin** can only create reception/kitchen
3. **Super Admin** can create any role
4. Check your own role first

### User Deactivated by Accident

**Problem:** User cannot login (deactivated)

**Solution:**
1. Login as admin who created the user
2. Go to User Management
3. Click "Activate" on user card
4. User can now login again

### Forgot Super Admin Password

**Problem:** Locked out of system

**Solution:**
1. **Access database** directly
2. **Reset password** manually:
   ```sql
   -- Generate new hash for "newpassword123"
   UPDATE admin_users 
   SET password_hash = '$2b$10$YourNewHashHere' 
   WHERE username = 'admin';
   ```
3. Or **create new super admin**:
   ```sql
   INSERT INTO admin_users 
   (id, username, password_hash, role, full_name, active) 
   VALUES 
   (UUID(), 'newadmin', '$2b$10$...', 'super_admin', 'Emergency Admin', 1);
   ```

---

## 📊 Monitoring & Auditing

### Track User Activity

**Last Login Timestamps:**
- Visible on user cards
- Updated on each successful login
- Use to monitor inactive accounts

**Created By Tracking:**
- Each user shows who created them
- Restaurant Admins can only manage their created users
- Super Admin can manage all users

### Audit Checklist

Monthly review:
- [ ] Check for inactive users (no recent login)
- [ ] Verify all users still need access
- [ ] Review role assignments
- [ ] Check for unauthorized access attempts
- [ ] Ensure passwords are secure

---

## 🎯 Use Cases

### Small Pizza Shop (1-2 locations)

**Setup:**
- 1 Super Admin (owner)
- 1 Reception (cashier)
- 1 Kitchen (chef)

**Workflow:**
- Owner manages menu and settings
- Cashier takes orders
- Chef views kitchen display

---

### Medium Restaurant (3-5 locations)

**Setup:**
- 1 Super Admin (owner)
- 2 Restaurant Admins (managers)
- 4 Reception (cashiers)
- 6 Kitchen (chefs)

**Workflow:**
- Owner has full control
- Managers handle day-to-day operations
- Each location has dedicated reception/kitchen staff

---

### Large Chain (10+ locations)

**Setup:**
- 2 Super Admins (owner + IT admin)
- 10 Restaurant Admins (1 per location)
- 30 Reception (3 per location)
- 40 Kitchen (4 per location)

**Workflow:**
- Super Admins manage system-wide settings
- Each location manager (restaurant admin) manages their staff
- Centralized reporting and analytics

---

## ✅ Success Checklist

After implementing RBAC:

- [ ] Default super admin password changed
- [ ] Restaurant admin users created
- [ ] Reception users created for cashiers
- [ ] Kitchen users created for kitchen staff
- [ ] All users tested login
- [ ] Role permissions verified
- [ ] User management UI accessible
- [ ] Documentation reviewed by team
- [ ] Security best practices followed
- [ ] Backup procedures in place

---

## 🆘 Support

For issues or questions about the RBAC system:

1. **Check this documentation** first
2. **Review error messages** in browser console (F12)
3. **Check server logs** for authentication errors
4. **Verify database** schema is updated correctly
5. **Test with default admin** account first

---

**🎉 Your Pizza POS now has enterprise-grade role-based access control!**

Protect your business with proper user management and granular permissions.

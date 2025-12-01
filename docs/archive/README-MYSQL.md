# MySQL Setup Guide

The application has been migrated from SQLite to MySQL.

## Prerequisites

1. **Install MySQL** (if not already installed):
   ```bash
   brew install mysql
   ```

2. **Start MySQL**:
   ```bash
   brew services start mysql
   ```

3. **Secure MySQL Installation** (optional but recommended):
   ```bash
   mysql_secure_installation
   ```

## Configuration

1. The database configuration is in `server/.env`:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=pizza_pos
   ```

2. Update the `.env` file with your MySQL credentials if needed.

## Database Setup

The application will automatically:
- Create the `pizza_pos` database if it doesn't exist
- Create all required tables
- Seed initial data (sizes, crusts, toppings, menu items)

No manual database setup is required!

## Running the Application

```bash
npm run dev
```

This will start:
- **Server**: http://localhost:3001
- **Client**: http://localhost:5173

## Troubleshooting

### MySQL Connection Error

If you get a connection error:

1. Check if MySQL is running:
   ```bash
   brew services list
   ```

2. Test MySQL connection:
   ```bash
   mysql -u root -p
   ```

3. Create the database manually if needed:
   ```bash
   mysql -u root -p
   CREATE DATABASE pizza_pos;
   ```

### Access Denied Error

If you get an "Access denied" error, update the `DB_USER` and `DB_PASSWORD` in `server/.env` with your MySQL credentials.

## Migration from SQLite

The application has been fully migrated from SQLite (better-sqlite3) to MySQL (mysql2):
- All database queries are now async/await
- DECIMAL types used for prices instead of REAL
- VARCHAR types used instead of TEXT for IDs and names
- AUTO_INCREMENT timestamp handling

# PostgreSQL Database Setup Guide

## 🗄️ **Step 1: Install PostgreSQL**

### **For Windows:**
1. Download PostgreSQL from: https://www.postgresql.org/download/windows/
2. Run the installer
3. Choose installation directory (default: C:\Program Files\PostgreSQL\15)
4. Set password for 'postgres' user (remember this!)
5. Keep default port: 5432
6. Complete installation

### **For macOS:**
```bash
# Using Homebrew
brew install postgresql
brew services start postgresql

# Or download from: https://www.postgresql.org/download/macosx/
```

### **For Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

## 🗄️ **Step 2: Create Database**

1. **Open PostgreSQL Command Line:**
   - Windows: Start → PostgreSQL → SQL Shell (psql)
   - Or use pgAdmin (GUI tool)

2. **Connect to PostgreSQL:**
   ```sql
   -- Default connection (press Enter for defaults)
   Server [localhost]: 
   Database [postgres]: 
   Port [5432]: 
   Username [postgres]: 
   Password for user postgres: [your_password]
   ```

3. **Create Database:**
   ```sql
   CREATE DATABASE voice_ingredient_lists;
   \c voice_ingredient_lists;
   ```

## 🗄️ **Step 3: Run Database Setup Script**

1. **Copy the database_setup.sql file**
2. **Run the script:**
   ```sql
   \i C:\Users\Alok Yadav\Desktop\Voice-list\database_setup.sql
   ```

## 🗄️ **Step 4: Verify Installation**

```sql
-- Check if tables were created
\dt

-- Check if functions were created
\df

-- Test the functions
SELECT * FROM get_all_lists();
```

## 🗄️ **Step 5: Database Connection Details**

Save these details for your React app:
- **Host:** localhost
- **Port:** 5432
- **Database:** voice_ingredient_lists
- **Username:** postgres
- **Password:** [your_password]

## ✅ **Installation Complete!**

Your PostgreSQL database is now ready to use with your React app. 
# 🗄️ Database Setup for Voice Ingredient List Manager

## 📋 **Prerequisites**

1. **PostgreSQL Database** installed on your system
2. **Node.js** and **npm** installed
3. **React App** running

## 🚀 **Quick Setup Guide**

### **Step 1: Install PostgreSQL**

#### **Windows:**
1. Download from: https://www.postgresql.org/download/windows/
2. Run installer with default settings
3. Remember the password you set for 'postgres' user

#### **macOS:**
```bash
brew install postgresql
brew services start postgresql
```

#### **Linux:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### **Step 2: Create Database**

1. **Open PostgreSQL Command Line:**
   - Windows: Start → PostgreSQL → SQL Shell (psql)
   - Or use pgAdmin GUI tool

2. **Connect and Create Database:**
   ```sql
   -- Connect to PostgreSQL (press Enter for defaults)
   Server [localhost]: 
   Database [postgres]: 
   Port [5432]: 
   Username [postgres]: 
   Password for user postgres: [your_password]
   
   -- Create database
   CREATE DATABASE voice_ingredient_lists;
   \c voice_ingredient_lists;
   ```

### **Step 3: Run Database Setup Script**

```sql
-- Run the setup script
\i C:\Users\Alok Yadav\Desktop\Voice-list\database_setup.sql
```

### **Step 4: Configure React App**

1. **Update Database Password:**
   - Open `src/config/database.ts`
   - Replace `'your_password_here'` with your actual PostgreSQL password

2. **Install Dependencies:**
   ```bash
   npm install pg @types/pg
   ```

### **Step 5: Test Connection**

1. **Start your React app:**
   ```bash
   npm run dev
   ```

2. **Check Database Status:**
   - Look for green dot in top-right corner = "DB Connected"
   - Red dot = "Local Storage" (database not connected)

## 🗄️ **Database Features**

### **Tables Created:**
- `ingredient_lists` - Main lists with metadata
- `ingredients` - Individual ingredients with quantities

### **CRUD Functions:**
- `create_ingredient_list()` - Create new list
- `get_all_lists()` - Get all lists with counts
- `get_list_by_id()` - Get specific list with ingredients
- `update_ingredient_list()` - Update list details
- `delete_ingredient_list()` - Delete list and ingredients
- `add_ingredient()` - Add ingredient to list
- `update_ingredient()` - Update ingredient details
- `delete_ingredient()` - Delete ingredient
- `search_lists()` - Search lists by name
- `get_database_stats()` - Get usage statistics

## 🔧 **Usage**

### **Automatic Features:**
- ✅ **Auto-save** to database when connected
- ✅ **Local storage backup** when database unavailable
- ✅ **Real-time sync** between database and app
- ✅ **Error handling** with fallback to localStorage

### **Manual Features:**
- 🔄 **Sync DB** button to manually sync data
- 📊 **Database status** indicator in app header
- 🗑️ **Clear All** and **Reset App** functions
- 🔍 **Search** functionality for lists

## 🛠️ **Troubleshooting**

### **Database Connection Issues:**
1. **Check PostgreSQL is running:**
   ```bash
   # Windows
   services.msc → PostgreSQL
   
   # macOS
   brew services list
   
   # Linux
   sudo systemctl status postgresql
   ```

2. **Verify connection details:**
   - Host: localhost
   - Port: 5432
   - Database: voice_ingredient_lists
   - Username: postgres
   - Password: [your_password]

3. **Test connection manually:**
   ```sql
   psql -h localhost -U postgres -d voice_ingredient_lists
   ```

### **Common Errors:**
- **"password authentication failed"** → Check password in config
- **"connection refused"** → PostgreSQL not running
- **"database does not exist"** → Run setup script again

## 📊 **Database Statistics**

View database usage:
```sql
SELECT * FROM get_database_stats();
```

## 🔒 **Security Notes**

- Change default PostgreSQL password
- Use environment variables for production
- Restrict database access as needed
- Regular backups recommended

## ✅ **Success Indicators**

- Green dot in app header = "DB Connected"
- Success messages in console
- Data persists after app restart
- Sync button available when connected

## 🎯 **Next Steps**

1. **Test CRUD operations** with your lists
2. **Verify data persistence** after app restart
3. **Test search functionality**
4. **Check database statistics**

Your ingredient lists are now safely stored in PostgreSQL! 🎉 
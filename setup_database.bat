@echo off
echo ========================================
echo   Voice Ingredient List Manager
echo   Database Setup Script
echo ========================================
echo.

echo Step 1: Checking if PostgreSQL is installed...
where psql >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: PostgreSQL is not installed or not in PATH
    echo Please install PostgreSQL from: https://www.postgresql.org/download/windows/
    echo.
    pause
    exit /b 1
)

echo PostgreSQL found! ✓
echo.

echo Step 2: Please enter your PostgreSQL password:
set /p DB_PASSWORD=Password: 

echo.
echo Step 3: Creating database...
psql -U postgres -c "CREATE DATABASE voice_ingredient_lists;" 2>nul
if %errorlevel% neq 0 (
    echo Database might already exist, continuing...
)

echo Step 4: Running database setup script...
psql -U postgres -d voice_ingredient_lists -f database_setup.sql
if %errorlevel% neq 0 (
    echo ERROR: Failed to run database setup script
    pause
    exit /b 1
)

echo.
echo Step 5: Updating configuration file...
powershell -Command "(Get-Content 'src/config/database.ts') -replace 'your_password_here', '%DB_PASSWORD%' | Set-Content 'src/config/database.ts'"

echo.
echo ========================================
echo   Setup Complete! ✓
echo ========================================
echo.
echo Your database is now ready to use!
echo.
echo To test the connection:
echo 1. Run: npm run dev
echo 2. Look for green dot in app header
echo 3. Create a test list to verify
echo.
pause 
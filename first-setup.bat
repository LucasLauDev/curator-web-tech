@echo off
SETLOCAL ENABLEEXTENSIONS
cd /d "%~dp0"

where node >nul 2>&1
if errorlevel 1 (
  echo ERROR: Node.js must be installed and on PATH. Visit https://nodejs.org/
  exit /b 1
)

if not exist "node_modules\" (
  echo Installing npm dependencies...
  call npm install
  if errorlevel 1 (
    echo ERROR: npm install did not finish successfully.
    exit /b 1
  )
)

echo.
echo First-time setup:
echo   - You may be prompted for DATABASE_URL if it is not already in .env
echo   - PORTAL_SESSION_SECRET is generated and saved automatically
echo   - SQL migrations run, then demo data: users, bookstore, courses
echo.

node scripts\setup-new-database.js --first-setup
if errorlevel 1 (
  echo.
  echo ERROR: Setup failed. Fix the messages above, then run first-setup.bat again.
  exit /b 1
)

echo.
echo OK: Setup completed successfully.
npm start
exit /b 0

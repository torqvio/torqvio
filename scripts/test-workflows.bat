@echo off
REM Windows batch script for testing GitHub Actions workflows locally
REM Run this before pushing to GitHub!

echo 🧪 Testing GitHub Actions workflows locally...
echo.

REM Check if act is installed
where act >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ 'act' is not installed. Install it first:
    echo    Windows: choco install act-cli
    echo    Or download from: https://github.com/nektos/act/releases
    echo.
    pause
    exit /b 1
)

echo ✅ act is installed
echo.

REM Test CI workflow (dry run)
echo 🔍 Testing CI workflow (dry run)...
act -j test-backend --dry-run --platform ubuntu-latest=ghcr.io/catthehacker/ubuntu:act-latest
if %ERRORLEVEL% NEQ 0 (
    echo ❌ CI workflow dry-run failed!
    pause
    exit /b 1
)

act -j test-frontend --dry-run --platform ubuntu-latest=ghcr.io/catthehacker/ubuntu:act-latest
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Frontend CI dry-run failed!
    pause
    exit /b 1
)

echo ✅ CI dry-run passed
echo.

REM Test deployment workflow (dry run only for safety)
echo 🔍 Testing deployment workflow (dry run)...
act -j safety-check --dry-run --platform ubuntu-latest=ghcr.io/catthehacker/ubuntu:act-latest
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Safety check dry-run failed!
    pause
    exit /b 1
)

act -j deploy --dry-run --platform ubuntu-latest=ghcr.io/catthehacker/ubuntu:act-latest
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Deploy dry-run failed!
    pause
    exit /b 1
)

echo ✅ Deployment dry-run passed
echo.

REM Ask user if they want to run actual tests
set /p choice="Run actual CI tests (not dry-run)? (y/N): "
if /i "%choice%"=="y" (
    echo.
    echo 🚀 Running actual CI tests...
    act -j test-backend --platform ubuntu-latest=ghcr.io/catthehacker/ubuntu:act-latest
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ Backend tests failed!
        pause
        exit /b 1
    )
    
    act -j test-frontend --platform ubuntu-latest=ghcr.io/catthehacker/ubuntu:act-latest
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ Frontend tests failed!
        pause
        exit /b 1
    )
    
    echo ✅ All tests passed!
)

echo.
echo ✅ Local testing completed!
echo.
echo 📋 Next steps:
echo 1. Fix any issues found in dry-run
echo 2. Run actual tests to verify functionality  
echo 3. Once everything passes, push to GitHub
echo.
echo 🔒 Safety reminder: Never push workflows that haven't passed local testing!
echo.
pause

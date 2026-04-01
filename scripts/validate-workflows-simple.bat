@echo off
echo 🧪 Validating GitHub Actions workflows...
echo.

rem Check all workflow files
for %%f in (.github\workflows\*.yml .github\workflows\*.yaml) do (
    echo 📁 Checking %%~nxf...
    
    rem Check for basic structure
    findstr /C:"name:" "%%f" >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✅ Has name field
    ) else (
        echo ⚠️ Missing name field
    )
    
    findstr /C:"on:" "%%f" >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✅ Has trigger section
    ) else (
        echo ❌ Missing on trigger
    )
    
    findstr /C:"jobs:" "%%f" >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✅ Has jobs section
    ) else (
        echo ❌ Missing jobs section
    )
    
    rem Check for common issues
    findstr /C:"|| true" "%%f" >nul 2>&1
    if %errorlevel% equ 0 (
        echo ⚠️ Found '|| true' - this hides failures!
    )
    
    findstr /C:"sshpass" "%%f" >nul 2>&1
    if %errorlevel% equ 0 (
        echo ⚠️ Found 'sshpass' - use SSH keys instead!
    )
    
    findstr /C:"secrets." "%%f" >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✅ Using secrets properly
    )
    
    echo.
)

echo ==================================================
echo 🎉 Workflow validation completed!
echo.
echo 📝 Next steps:
echo 1. Fix any issues found above
echo 2. Install act for full testing: choco install act-cli
echo 3. Run: act --dry-run to test workflows
echo 4. Push to GitHub when everything passes
echo.
pause

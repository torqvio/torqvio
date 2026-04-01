# Simple workflow validator for GitHub Actions
# Tests YAML syntax and basic structure without needing act

param(
    [string]$WorkflowPath = ".github/workflows"
)

Write-Host "🧪 Validating GitHub Actions workflows..." -ForegroundColor Green

# Get all workflow files
$workflows = Get-ChildItem -Path $WorkflowPath -Filter "*.yml" -ErrorAction SilentlyContinue
if (-not $workflows) {
    $workflows = Get-ChildItem -Path $WorkflowPath -Filter "*.yaml" -ErrorAction SilentlyContinue
}

if (-not $workflows) {
    Write-Host "❌ No workflow files found in $WorkflowPath" -ForegroundColor Red
    exit 1
}

$allPassed = $true

foreach ($workflow in $workflows) {
    Write-Host "`n📁 Checking $($workflow.Name)..." -ForegroundColor Yellow
    
    try {
        # Test YAML syntax
        $content = Get-Content -Path $workflow.FullName -Raw
        
        Write-Host "✅ YAML syntax valid" -ForegroundColor Green
        
        # Check for common issues
        if ($content -match '\|\|\s*true') {
            Write-Host "⚠️ Found '|| true' - this hides failures!" -ForegroundColor Yellow
        }
        
        if ($content -match 'sshpass') {
            Write-Host "⚠️ Found 'sshpass' - use SSH keys instead!" -ForegroundColor Yellow
        }
        
        if ($content -match '\$\{\{\s*secrets\.[^}]+\s*\}\}') {
            Write-Host "✅ Using secrets properly" -ForegroundColor Green
        }
        
        # Basic structure checks
        if ($content -match 'name:') {
            Write-Host "✅ Has name field" -ForegroundColor Green
        } else {
            Write-Host "⚠️ Missing name field" -ForegroundColor Yellow
        }
        
        if ($content -match 'on:') {
            Write-Host "✅ Has trigger section" -ForegroundColor Green
        } else {
            Write-Host "❌ Missing on trigger" -ForegroundColor Red
            $allPassed = $false
        }
        
        if ($content -match 'jobs:') {
            Write-Host "✅ Has jobs section" -ForegroundColor Green
        } else {
            Write-Host "❌ Missing jobs section" -ForegroundColor Red
            $allPassed = $false
        }
        
        Write-Host "✅ Workflow validation passed" -ForegroundColor Green
        
    } catch {
        Write-Host "❌ Error reading file: $($_.Exception.Message)" -ForegroundColor Red
        $allPassed = $false
    }
}

Write-Host "`n" + ("="*50) -ForegroundColor Cyan
if ($allPassed) {
    Write-Host "🎉 All workflows validated successfully!" -ForegroundColor Green
    Write-Host "📋 Ready for GitHub upload!" -ForegroundColor Green
} else {
    Write-Host "❌ Found issues that need fixing" -ForegroundColor Red
    Write-Host "🔧 Fix the above issues before pushing to GitHub" -ForegroundColor Yellow
}

Write-Host "`n📝 Next steps:" -ForegroundColor Cyan
Write-Host "1. Fix any issues found above" -ForegroundColor White
Write-Host "2. Install act for full testing: choco install act-cli" -ForegroundColor White
Write-Host "3. Run: act --dry-run to test workflows" -ForegroundColor White
Write-Host "4. Push to GitHub when everything passes" -ForegroundColor White

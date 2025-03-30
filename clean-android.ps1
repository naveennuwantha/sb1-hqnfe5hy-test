# Script to clean Android directory safely
$androidDir = Join-Path $PWD "android"

Write-Host "Removing files from Android directory..." -ForegroundColor Yellow

# Unlock the attributes if they were set
attrib -r -s -h $androidDir

# Clean the .gradle directory first
$gradleDir = Join-Path $androidDir ".gradle"
if (Test-Path $gradleDir) {
    try {
        Get-ChildItem -Path $gradleDir -Recurse -Force | 
        ForEach-Object {
            try {
                Remove-Item -Path $_.FullName -Force -Recurse -ErrorAction SilentlyContinue
            } catch {
                Write-Host "Could not remove $($_.FullName): $_" -ForegroundColor Red
            }
        }
        Write-Host "Removed content from .gradle directory" -ForegroundColor Green
    } catch {
        Write-Host "Error cleaning .gradle directory: $_" -ForegroundColor Red
    }
}

# Try to remove the parent android directory
try {
    Remove-Item -Path $androidDir -Force -Recurse -ErrorAction SilentlyContinue
    Write-Host "Successfully removed Android directory" -ForegroundColor Green
} catch {
    Write-Host "Could not completely remove Android directory: $_" -ForegroundColor Red
    
    # Create a .gitignore to ignore the Android directory
    $gitignorePath = Join-Path $PWD ".gitignore"
    if (Test-Path $gitignorePath) {
        $content = Get-Content $gitignorePath
        if (!($content -contains "android/")) {
            Add-Content $gitignorePath "`n# Ignore Android directory`nandroid/"
            Write-Host "Added android/ to .gitignore" -ForegroundColor Green
        }
    } else {
        Set-Content $gitignorePath "# Ignore Android directory`nandroid/"
        Write-Host "Created .gitignore with android/ entry" -ForegroundColor Green
    }
}

Write-Host "Cleanup complete" -ForegroundColor Green 
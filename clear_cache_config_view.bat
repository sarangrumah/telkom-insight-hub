@echo off
REM Clear Cache, Config, View and other temporary files
REM Usage: clear_cache_config_view.bat

echo 🧹 Clearing cache, config, view and other temporary files...

REM Colors for output (Windows CMD doesn't support colors easily, so using simple text)

echo.
echo 📁 Clearing cache directories...

REM Laravel cache directories
if exist "bootstrap\cache" (
    rmdir /s /q "bootstrap\cache"
    echo ✓ Removed: bootstrap\cache
) else (
    echo ⚠ Not found: bootstrap\cache
)

if exist "storage\framework\cache" (
    rmdir /s /q "storage\framework\cache"
    echo ✓ Removed: storage\framework\cache
) else (
    echo ⚠ Not found: storage\framework\cache
)

if exist "storage\framework\sessions" (
    rmdir /s /q "storage\framework\sessions"
    echo ✓ Removed: storage\framework\sessions
) else (
    echo ⚠ Not found: storage\framework\sessions
)

if exist "storage\framework\views" (
    rmdir /s /q "storage\framework\views"
    echo ✓ Removed: storage\framework\views
) else (
    echo ⚠ Not found: storage\framework\views
)

if exist "storage\framework\testing" (
    rmdir /s /q "storage\framework\testing"
    echo ✓ Removed: storage\framework\testing
) else (
    echo ⚠ Not found: storage\framework\testing
)

echo.
echo ⚙️  Clearing config cache...

REM Laravel config cache
if exist "bootstrap\cache\config.php" (
    del "bootstrap\cache\config.php"
    echo ✓ Removed: bootstrap\cache\config.php
) else (
    echo ⚠ Not found: bootstrap\cache\config.php
)

echo.
echo 👁️  Clearing view cache...

REM Laravel view cache
if exist "storage\framework\views" (
    del "storage\framework\views\*" /q
    echo ✓ Cleared contents: storage\framework\views
) else (
    echo ⚠ Directory not found: storage\framework\views
)

echo.
echo 📦 Clearing Composer cache...

REM Composer cache
where composer >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    composer clear-cache
    echo ✓ Composer cache cleared
) else (
    echo ⚠ Composer not found, skipping Composer cache clear
)

echo.
echo 🌐 Clearing npm cache...

REM npm cache
where npm >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    npm cache clean --force
    echo ✓ npm cache cleared
) else (
    echo ⚠ npm not found, skipping npm cache clear
)

echo.
echo 🗂️  Clearing build directories...

REM Vite build directory
if exist "dist" (
    rmdir /s /q "dist"
    echo ✓ Removed: dist
) else (
    echo ⚠ Not found: dist
)

REM Webpack build directory
if exist "build" (
    rmdir /s /q "build"
    echo ✓ Removed: build
) else (
    echo ⚠ Not found: build
)

REM Next.js build directory
if exist ".next" (
    rmdir /s /q ".next"
    echo ✓ Removed: .next
) else (
    echo ⚠ Not found: .next
)

REM Nuxt.js build directory
if exist ".nuxt" (
    rmdir /s /q ".nuxt"
    echo ✓ Removed: .nuxt
) else (
    echo ⚠ Not found: .nuxt
)

REM Vue CLI cache
if exist "node_modules\.cache" (
    rmdir /s /q "node_modules\.cache"
    echo ✓ Removed: node_modules\.cache
) else (
    echo ⚠ Not found: node_modules\.cache
)

echo.
echo 🧹 Clearing temporary files...

REM Application-specific temporary files
if exist "storage\logs\laravel.log" (
    del "storage\logs\laravel.log"
    echo ✓ Removed: storage\logs\laravel.log
) else (
    echo ⚠ Not found: storage\logs\laravel.log
)

if exist "storage\debugbar" (
    rmdir /s /q "storage\debugbar"
    echo ✓ Removed: storage\debugbar
) else (
    echo ⚠ Not found: storage\debugbar
)

echo.
echo 🧹 Clearing browser cache directories (if they exist)...

REM Chrome cache (Windows)
if exist "%LOCALAPPDATA%\Google\Chrome\User Data\Default\Application Cache" (
    rmdir /s /q "%LOCALAPPDATA%\Google\Chrome\User Data\Default\Application Cache"
    echo ✓ Removed Chrome Application Cache
)

if exist "%LOCALAPPDATA%\Google\Chrome\User Data\Default\Cache" (
    rmdir /s /q "%LOCALAPPDATA%\Google\Chrome\User Data\Default\Cache"
    echo ✓ Removed Chrome Cache
)

REM Firefox cache (Windows)
if exist "%LOCALAPPDATA%\Mozilla\Firefox\Profiles" (
    for /d %%i in ("%LOCALAPPDATA%\Mozilla\Firefox\Profiles\*") do (
        if exist "%%i\Cache2" (
            rmdir /s /q "%%i\Cache2"
            echo ✓ Removed Firefox Cache from %%i
        )
    )
)

echo.
echo 🔧 Clearing development server cache...

REM Vite cache
if exist "node_modules\.vite" (
    rmdir /s /q "node_modules\.vite"
    echo ✓ Removed: node_modules\.vite
) else (
    echo ⚠ Not found: node_modules\.vite
)

REM Webpack cache
if exist "node_modules\.cache\webpack" (
    rmdir /s /q "node_modules\.cache\webpack"
    echo ✓ Removed: node_modules\.cache\webpack
) else (
    echo ⚠ Not found: node_modules\.cache\webpack
)

REM TypeScript cache
if exist "node_modules\.cache\typescript" (
    rmdir /s /q "node_modules\.cache\typescript"
    echo ✓ Removed: node_modules\.cache\typescript
) else (
    echo ⚠ Not found: node_modules\.cache\typescript
)

echo.
echo 🎯 Additional cleanup for Laravel applications...

REM Laravel specific cleanup
if exist "artisan" (
    where php >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo Running Laravel cache commands...
        php artisan cache:clear
        php artisan config:clear
        php artisan view:clear
        php artisan route:clear
        php artisan clear-compiled
        php artisan optimize:clear
        echo ✓ Laravel cache commands completed
    ) else (
        echo ⚠ PHP CLI not found, skipping Laravel cache commands
    )
) else (
    echo ⚠ Laravel artisan not found, skipping Laravel-specific cleanup
)

echo.
echo 🔍 Clearing log files...

REM Clear log files (keep last 100 lines if file is large)
for %%f in (storage\logs\*.log) do (
    if %%~zf gtr 10240 (
        echo Trimming large log file: %%f
        powershell -Command "Get-Content '%%f' | Select-Object -Last 100 | Set-Content '%%f.tmp'; Move-Item '%%f.tmp' '%%f' -Force"
        echo ✓ Trimmed: %%f
    )
)

echo.
echo ✅ Cache, config, view and temporary files cleanup completed!
echo.
echo 💡 Tips:
echo    - Restart your development server after clearing cache
echo    - Run 'composer install' if you cleared vendor cache
echo    - Run 'npm install' if you cleared node_modules cache
echo    - Clear your browser cache for web applications
echo.
echo 🚀 Your application should now be running with fresh cache!
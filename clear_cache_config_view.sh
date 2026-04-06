#!/bin/bash

# Clear Cache, Config, View and other temporary files
# Usage: ./clear_cache_config_view.sh

echo "🧹 Clearing cache, config, view and other temporary files..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Function to safely remove directory
safe_rm_dir() {
    if [ -d "$1" ]; then
        rm -rf "$1"
        print_status "Removed: $1"
    else
        print_warning "Not found: $1"
    fi
}

# Function to safely remove file
safe_rm_file() {
    if [ -f "$1" ]; then
        rm -f "$1"
        print_status "Removed: $1"
    else
        print_warning "Not found: $1"
    fi
}

# Function to clear directory contents
clear_dir_contents() {
    if [ -d "$1" ]; then
        rm -rf "$1"/*
        print_status "Cleared contents: $1"
    else
        print_warning "Directory not found: $1"
    fi
}

echo ""
echo "📁 Clearing cache directories..."

# Laravel cache directories
safe_rm_dir "bootstrap/cache"
safe_rm_dir "storage/framework/cache"
safe_rm_dir "storage/framework/sessions"
safe_rm_dir "storage/framework/views"
safe_rm_dir "storage/framework/testing"

# Laravel compiled services and providers
safe_rm_file "bootstrap/cache/services.php"
safe_rm_file "bootstrap/cache/packages.php"

echo ""
echo "⚙️  Clearing config cache..."

# Laravel config cache
safe_rm_file "bootstrap/cache/config.php"

echo ""
echo "👁️  Clearing view cache..."

# Laravel view cache
clear_dir_contents "storage/framework/views"

echo ""
echo "📦 Clearing Composer cache..."

# Composer cache
if command -v composer &> /dev/null; then
    composer clear-cache
    print_status "Composer cache cleared"
else
    print_warning "Composer not found, skipping Composer cache clear"
fi

echo ""
echo "🌐 Clearing npm/yarn cache..."

# npm cache
if command -v npm &> /dev/null; then
    npm cache clean --force
    print_status "npm cache cleared"
else
    print_warning "npm not found, skipping npm cache clear"
fi

# yarn cache
if command -v yarn &> /dev/null; then
    yarn cache clean
    print_status "yarn cache cleared"
else
    print_warning "yarn not found, skipping yarn cache clear"
fi

echo ""
echo "🗂️  Clearing build directories..."

# Vite build directory
safe_rm_dir "dist"

# Webpack build directory
safe_rm_dir "build"

# Next.js build directory
safe_rm_dir ".next"

# Nuxt.js build directory
safe_rm_dir ".nuxt"

# Vue CLI build directory
safe_rm_dir "node_modules/.cache"

echo ""
echo "🧹 Clearing temporary files..."

# System temporary files (if accessible)
if [ -d "/tmp" ]; then
    find /tmp -name "*telekom*" -type f -delete 2>/dev/null
    find /tmp -name "*bps*" -type f -delete 2>/dev/null
    print_status "Cleared temporary files matching patterns"
fi

# Application-specific temporary files
safe_rm_dir "storage/logs/laravel.log"
safe_rm_dir "storage/logs/*.log"
safe_rm_dir "storage/debugbar"
safe_rm_dir "storage/debugbar/*"

echo ""
echo "🧹 Clearing browser cache directories (if they exist)..."

# Chrome cache (Linux/Mac)
if [ -d "$HOME/.cache/google-chrome" ]; then
    safe_rm_dir "$HOME/.cache/google-chrome/Default/Application Cache"
    safe_rm_dir "$HOME/.cache/google-chrome/Default/Cache"
fi

# Firefox cache (Linux/Mac)
if [ -d "$HOME/.cache/mozilla/firefox" ]; then
    find "$HOME/.cache/mozilla/firefox" -name "Cache*" -type d -exec rm -rf {} + 2>/dev/null
fi

echo ""
echo "🔧 Clearing development server cache..."

# Vite cache
safe_rm_dir "node_modules/.vite"

# Webpack cache
safe_rm_dir "node_modules/.cache/webpack"

# TypeScript cache
safe_rm_dir "node_modules/.cache/typescript"

echo ""
echo "📊 Clearing database cache (if using Redis)..."

# Redis cache (if redis-cli is available)
if command -v redis-cli &> /dev/null; then
    echo "FLUSHALL" | redis-cli 2>/dev/null
    if [ $? -eq 0 ]; then
        print_status "Redis cache cleared"
    else
        print_warning "Could not clear Redis cache (Redis may not be running)"
    fi
else
    print_warning "Redis CLI not found, skipping Redis cache clear"
fi

echo ""
echo "🧹 Clearing PHP OPcache (if accessible)..."

# PHP OPcache clear (requires PHP CLI)
if command -v php &> /dev/null; then
    php -r "if (function_exists('opcache_reset')) { opcache_reset(); echo 'OPcache cleared\n'; } else { echo 'OPcache not available\n'; }"
else
    print_warning "PHP CLI not found, skipping OPcache clear"
fi

echo ""
echo "🎯 Additional cleanup for Laravel applications..."

# Laravel specific cleanup
if [ -f "artisan" ]; then
    if command -v php &> /dev/null; then
        echo "Running Laravel cache commands..."
        php artisan cache:clear
        php artisan config:clear
        php artisan view:clear
        php artisan route:clear
        php artisan clear-compiled
        php artisan optimize:clear
        print_status "Laravel cache commands completed"
    else
        print_warning "PHP CLI not found, skipping Laravel cache commands"
    fi
else
    print_warning "Laravel artisan not found, skipping Laravel-specific cleanup"
fi

echo ""
echo "🔍 Clearing log files..."

# Clear log files (keep last 100 lines if file is large)
for log_file in storage/logs/*.log; do
    if [ -f "$log_file" ] && [ $(wc -l < "$log_file") -gt 100 ]; then
        tail -100 "$log_file" > "$log_file.tmp" && mv "$log_file.tmp" "$log_file"
        print_status "Trimmed: $log_file"
    fi
done

echo ""
echo "✅ Cache, config, view and temporary files cleanup completed!"
echo ""
echo "💡 Tips:"
echo "   - Restart your development server after clearing cache"
echo "   - Run 'composer install' if you cleared vendor cache"
echo "   - Run 'npm install' if you cleared node_modules cache"
echo "   - Clear your browser cache for web applications"
echo ""
echo "🚀 Your application should now be running with fresh cache!"
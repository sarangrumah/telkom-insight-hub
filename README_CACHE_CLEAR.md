# Cache, Config, View Clear Script

This script provides a comprehensive solution to clear cache, config, view, and other temporary files from your application.

## Quick Start

### For Linux/macOS:
```bash
# Make the script executable
chmod +x clear_cache_config_view.sh

# Run the script
./clear_cache_config_view.sh
```

### For Windows:
```cmd
# Run the batch file
clear_cache_config_view.bat
```

## What Gets Cleared

### 🗂️ **Cache Directories**
- Laravel cache (`bootstrap/cache`, `storage/framework/cache`)
- Session cache (`storage/framework/sessions`)
- View cache (`storage/framework/views`)
- Testing cache (`storage/framework/testing`)

### ⚙️ **Configuration Cache**
- Laravel config cache (`bootstrap/cache/config.php`)
- Compiled services and providers

### 👁️ **View Cache**
- Compiled Blade templates
- Cached view files

### 📦 **Package Manager Cache**
- Composer cache
- npm cache
- yarn cache

### 🌐 **Build Directories**
- Vite build (`dist`)
- Webpack build (`build`)
- Next.js build (`.next`)
- Nuxt.js build (`.nuxt`)
- Vue CLI cache (`node_modules/.cache`)

### 🧹 **Temporary Files**
- Application logs
- Debug files
- Browser cache (Chrome, Firefox)
- Development server cache
- PHP OPcache

### 🎯 **Framework-Specific**
- Laravel cache commands (`php artisan cache:clear`, etc.)
- Redis cache (if available)
- TypeScript cache

## Features

### ✅ **Cross-Platform Support**
- Linux/macOS: Bash script with full feature support
- Windows: Batch file with comprehensive cleanup

### 🔍 **Smart Detection**
- Checks if directories/files exist before attempting to delete
- Skips missing tools (Composer, npm, PHP, etc.)
- Preserves important files while clearing cache

### 📊 **Detailed Logging**
- Shows what's being cleared
- Warns about missing files/directories
- Provides completion status

### 🛡️ **Safe Operations**
- Only removes cache and temporary files
- Preserves source code and configuration
- Uses safe removal methods

## Usage Examples

### Basic Usage
```bash
# Linux/macOS
./clear_cache_config_view.sh

# Windows
clear_cache_config_view.bat
```

### With Verbosity
```bash
# Linux/macOS - show all operations
bash -x clear_cache_config_view.sh

# Windows - show all commands
cmd /v:on /c clear_cache_config_view.bat
```

### Custom Cleanup
You can modify the script to add/remove specific cleanup operations based on your project needs.

## Project-Specific Cleanup

### Laravel Applications
The script automatically detects Laravel projects (presence of `artisan` file) and runs:
```bash
php artisan cache:clear
php artisan config:clear
php artisan view:clear
php artisan route:clear
php artisan clear-compiled
php artisan optimize:clear
```

### Node.js Applications
Automatically clears:
- npm/yarn cache
- Build directories
- Development server cache
- TypeScript cache

### PHP Applications
Cleans:
- OPcache (if available)
- Composer cache
- Framework-specific cache

## Tips

### After Running the Script
1. **Restart your development server**
2. **Run package installation** if needed:
   ```bash
   composer install  # For PHP projects
   npm install       # For Node.js projects
   ```
3. **Clear browser cache** for web applications
4. **Rebuild assets** if using build tools:
   ```bash
   npm run dev       # For development
   npm run build     # For production
   ```

### Troubleshooting
- **Permission errors**: Run with appropriate permissions (sudo on Linux/macOS)
- **Missing tools**: Script will warn but continue if tools like Composer/npm aren't found
- **Large log files**: Script automatically trims log files larger than 10KB

### Customization
You can easily modify the script to:
- Add project-specific cache directories
- Include additional cleanup operations
- Adjust logging levels
- Add custom commands

## Security Notes

- Script only removes cache and temporary files
- Does not modify source code or configuration files
- Uses safe removal methods that check file existence first
- Can be reviewed before execution for security

## Contributing

To add support for additional frameworks or cache types:

1. **Add detection logic** for the framework
2. **Implement cleanup functions** for cache directories
3. **Add logging** for the operations
4. **Test on multiple platforms**

## Support

If you encounter issues:

1. Check the script output for error messages
2. Verify you have appropriate permissions
3. Ensure required tools (PHP, npm, etc.) are installed
4. Review the script for any customizations that might cause issues

## License

This script is provided as-is for development use. Modify as needed for your specific requirements.
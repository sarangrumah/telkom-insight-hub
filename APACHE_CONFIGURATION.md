# Apache Configuration for API Proxy

The error `SyntaxError: Unexpected token '<'` indicates that your API requests are returning HTML (the React app's `index.html`) instead of JSON. This happens because the web server (Apache) is not forwarding `/panel/api` requests to the backend server running on port 4000.

To fix this, you need to configure a Reverse Proxy in your Apache configuration (VirtualHost).

## 1. Enable Proxy Modules
Ensure these modules are enabled:
```bash
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo systemctl restart apache2
```

## 2. Update VirtualHost Configuration
Edit your site's configuration file (e.g., `/etc/apache2/sites-available/your-site.conf`).
Add the `ProxyPass` directives **before** the frontend directory configuration.

```apache
<VirtualHost *:443>
    ServerName dev-etelekomunikasi.komdigi.go.id
    
    # ... SSL configuration ...

    # Proxy API requests to the backend (Node.js on port 4000)
    # Using 127.0.0.1 is often more reliable than localhost to avoid IPv4/IPv6 confusion
    ProxyPreserveHost On
    ProxyPass /panel/api http://127.0.0.1:4000/panel/api
    ProxyPassReverse /panel/api http://127.0.0.1:4000/panel/api

    # Proxy Uploads (if needed)
    ProxyPass /panel/uploads http://127.0.0.1:4000/uploads
    ProxyPassReverse /panel/uploads http://127.0.0.1:4000/uploads

    # Frontend Configuration (React App)
    DocumentRoot /var/www/html/panel/dist
    <Directory /var/www/html/panel/dist>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
        
        # SPA Fallback (Rewrite rules)
        RewriteEngine On
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule ^ index.html [QSA,L]
    </Directory>
</VirtualHost>
```

## 3. Restart Apache
```bash
sudo systemctl restart apache2
```

## Alternative (If you cannot configure Proxy)
If you cannot modify Apache, you must expose the backend on a public port (e.g., 4000) and ensure it supports HTTPS. Then, update `.env`:

```properties
VITE_API_BASE_URL=https://dev-etelekomunikasi.komdigi.go.id:4000/panel
```
(Then rebuild the frontend).

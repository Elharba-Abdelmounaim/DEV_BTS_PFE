#!/bin/bash

# Create .env from Railway variables
cat > /var/www/html/.env << EOF
APP_NAME=Laravel
APP_ENV=production
APP_KEY=${APP_KEY}
APP_DEBUG=false
APP_URL=${APP_URL:-https://devbtspfe-production.up.railway.app}
DB_CONNECTION=pgsql
DB_HOST=${DB_HOST:-thomas.proxy.rlwy.net}
DB_PORT=${DB_PORT:-44695}
DB_DATABASE=${DB_DATABASE:-railway}
DB_USERNAME=${DB_USERNAME:-postgres}
DB_PASSWORD=${DB_PASSWORD:-xnQmKNgGkhQRySZsbDfYwtomfcpTCQOT}
CACHE_DRIVER=database
SESSION_DRIVER=database
QUEUE_CONNECTION=database
EOF

# Clear cache
php artisan config:clear
php artisan cache:clear

# Run migrations
php artisan migrate --force

# Start server
php artisan serve --host=0.0.0.0 --port=${PORT:-8000}
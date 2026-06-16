#!/bin/bash

# حيد المتغيرات المشكوك فيها
unset DATABASE_URL
unset RAILWAY_STATIC_URL
unset RAILWAY_SERVICE_DEV_BTS_PFE_URL


cat > /var/www/html/.env << 'ENV'
APP_NAME=Laravel
APP_ENV=production
APP_KEY=${APP_KEY}
APP_DEBUG=false
APP_URL=${APP_URL:-https://devbtspfe-production.up.railway.app}
APP_CONFIG_CACHE=false
APP_SERVICES_CACHE=false
APP_PACKAGES_CACHE=false
APP_ROUTES_CACHE=false
APP_EVENTS_CACHE=false

LOG_CHANNEL=stderr
LOG_LEVEL=error

DB_CONNECTION=pgsql
DB_HOST=${DB_HOST:-thomas.proxy.rlwy.net}
DB_PORT=${DB_PORT:-44695}
DB_DATABASE=${DB_DATABASE:-railway}
DB_USERNAME=${DB_USERNAME:-postgres}
DB_PASSWORD=${DB_PASSWORD}

CACHE_DRIVER=database
SESSION_DRIVER=database
SESSION_DOMAIN=.railway.app
QUEUE_CONNECTION=database

FRONTEND_URL=${FRONTEND_URL:-https://dev-bts-pfe.vercel.app}
SANCTUM_STATEFUL_DOMAINS=${SANCTUM_STATEFUL_DOMAINS:-dev-bts-pfe.vercel.app}

REDIS_HOST=${REDIS_HOST:-127.0.0.1}
REDIS_PORT=${REDIS_PORT:-6379}
ENV

# Clear and cache
php artisan optimize:clear
php artisan migrate --force
php artisan config:cache
php artisan route:cache

# Start server on Railway PORT
php artisan serve --host=0.0.0.0 --port=${PORT:-8000}
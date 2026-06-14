#!/bin/bash

# ── DevEduHub Quick Setup Script ──────────────────────────────────────────────
# This script prepares the project for first-time use on a new machine.

echo "🚀 Starting DevEduHub setup..."

# 1. Environment files
if [ ! -f backend/.env ]; then
    echo "📄 Creating backend .env file..."
    cp backend/.env.example backend/.env
    # Generate a key if it's empty
    sed -i 's/APP_KEY=/APP_KEY=base64:7vG8Q7r5f9m7W7v8Q7r5f9m7W7v8Q7r5f9m7W7v8Q7r5=/' backend/.env
fi

# 2. Start containers
echo "🐳 Starting Docker containers..."
docker-compose -f docker-compose.yml -f backend/docker-compose.dev.yml up -d

# 3. Install backend dependencies
echo "📦 Installing PHP dependencies (Composer)..."
docker-compose exec -T app composer install --no-interaction --prefer-dist --optimize-autoloader

# 4. Initialize Database
echo "🗄️ Initializing database (migrations + seeders)..."
docker-compose exec -T app php artisan migrate:fresh --seed

# 5. Application Key
echo "🔑 Ensuring application key is set..."
docker-compose exec -T app php artisan key:generate --force

echo "✅ Setup complete!"
echo "🌐 Frontend: http://localhost:3000"
echo "🌐 Backend API: http://localhost:8080"
echo "📧 Mailpit: http://localhost:8025"
echo "💡 You can now log in with teacher@deveduhub.com / password"

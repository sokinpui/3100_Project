#!/bin/bash

# --- Configuration ---
# !! MODIFY THESE VARIABLES !!
REPO_URL="https://github.com/sokinpui/3100_project.git"
BRANCH="host-on-web"
SERVER_NAME="xrayxrtas.space" # !!! IMPORTANT: Change to your actual domain !!!
ADMIN_EMAIL="sosokinpui@gmail.com" # Required for Let's Encrypt

# Paths and User
PROJECT_BASE_DIR="/opt/seta-app"
PROJECT_DIR_NAME="3100_project"
PROJECT_ROOT="$PROJECT_BASE_DIR/$PROJECT_DIR_NAME"
APP_USER="setauser" # Dedicated user to run the app

# Backend Config
BACKEND_HOST="127.0.0.1" # Listen locally only
BACKEND_PORT="8000"
# Calculate number of Gunicorn workers (adjust as needed based on server cores)
WORKERS=$(($(nproc --all) * 2 + 1))
# Name of the ASGI app variable in your main Python file (e.g., app = FastAPI() in main.py)
ASGI_APP_INSTANCE="app.main:app"

# Environment file (contains secrets, DB URL etc.) - MUST BE CREATED MANUALLY
# Place this file OUTSIDE the git repo, e.g., in $PROJECT_BASE_DIR/.env
ENV_FILE_PATH="$PROJECT_BASE_DIR/.env"
# --- End Configuration ---

# Exit on error, treat unset variables as error, propagate exit status through pipes
set -euo pipefail

# --- Helper Functions ---
function run_as_app_user() {
    sudo -u "$APP_USER" "$@"
}

# --- Script Start ---
echo ">>> Starting PRODUCTION deployment process for $SERVER_NAME..."

# --- Validate Configuration ---
if [[ "$SERVER_NAME" == "your_domain.com" ]] || [[ "$ADMIN_EMAIL" == "your_email@example.com" ]]; then
    echo "!!! ERROR: Please edit the SERVER_NAME and ADMIN_EMAIL variables in the script!"
    exit 1
fi
if [[ ! -f "$ENV_FILE_PATH" ]]; then
    echo "!!! ERROR: Environment file not found at $ENV_FILE_PATH"
    echo "Please create this file with necessary environment variables like:"
    echo "DATABASE_URL=postgresql://user:password@host:port/dbname"
    echo "SECRET_KEY=your_very_secret_key"
    echo "# Add other required variables for your app..."
    echo "Ensure the file is readable by the '$APP_USER' user (e.g., sudo chown $APP_USER:$APP_USER $ENV_FILE_PATH && sudo chmod 600 $ENV_FILE_PATH)"
    exit 1
fi

# --- Ensure App User Exists ---
if ! id "$APP_USER" &>/dev/null; then
    echo ">>> Creating system user '$APP_USER'..."
    sudo adduser --system --no-create-home --group "$APP_USER"
    # Create a home directory if needed, e.g., for SSH keys or other config
    # sudo usermod --home "/home/$APP_USER" --move-home "$APP_USER"
fi

# --- Prepare Project Directory ---
echo ">>> Preparing project directory: $PROJECT_BASE_DIR"
sudo mkdir -p "$PROJECT_BASE_DIR"
sudo chown "$APP_USER":"$APP_USER" "$PROJECT_BASE_DIR"
# Ensure .env file has correct permissions
sudo chown "$APP_USER":"$APP_USER" "$ENV_FILE_PATH"
sudo chmod 600 "$ENV_FILE_PATH" # Only owner can read/write

cd "$PROJECT_BASE_DIR"

# --- Fetch Source Code ---
if [ -d "$PROJECT_DIR_NAME" ]; then
    echo ">>> Updating existing repository in $PROJECT_ROOT..."
    cd "$PROJECT_ROOT"
    run_as_app_user git fetch origin "$BRANCH" --prune
    run_as_app_user git checkout "$BRANCH"
    run_as_app_user git reset --hard "origin/$BRANCH"
    cd "$PROJECT_BASE_DIR" # Go back to base dir
else
    echo ">>> Cloning repository $REPO_URL (branch $BRANCH)..."
    run_as_app_user git clone --branch "$BRANCH" "$REPO_URL" "$PROJECT_DIR_NAME"
fi

# Ensure correct ownership of the entire project directory
sudo chown -R "$APP_USER":"$APP_USER" "$PROJECT_ROOT"

# --- Setup Backend (seta-api) ---
echo ">>> Setting up backend in $PROJECT_ROOT/seta-api..."
cd "$PROJECT_ROOT/seta-api"

echo ">>> Creating/updating Python virtual environment..."
run_as_app_user python3 -m venv venv

echo ">>> Installing/updating Python dependencies (including gunicorn)..."
# Ensure gunicorn is in requirements.txt!
run_as_app_user ./venv/bin/pip install --upgrade pip
run_as_app_user ./venv/bin/pip install -r requirements.txt

echo ">>> Running database migrations (Alembic)..."
echo ">>> IMPORTANT: Ensure alembic reads DATABASE_URL from the environment (modify env.py if needed)!"
# Run alembic using the environment file for database credentials
run_as_app_user bash -c "set -a && source $ENV_FILE_PATH && set +a && ./venv/bin/alembic upgrade head"

# --- Setup Frontend (seta-ui) ---
echo ">>> Setting up frontend in $PROJECT_ROOT/seta-ui..."
cd "$PROJECT_ROOT/seta-ui"

echo ">>> Installing Node dependencies using npm ci (requires package-lock.json)..."
# npm ci is generally safer and faster for CI/CD and production
# It might require write access to user's home dir for cache, hence --unsafe-perm often needed when run via sudo
# Try running as app user first, fallback to root + chown if permissions fail
if run_as_app_user npm ci --unsafe-perm; then
    echo "npm ci succeeded as $APP_USER"
else
    echo "npm ci as $APP_USER failed, trying as root and fixing permissions..."
    sudo npm ci --unsafe-perm
    sudo chown -R "$APP_USER":"$APP_USER" "$PROJECT_ROOT/seta-ui/node_modules" || true
fi


echo ">>> Building React app for production..."
if run_as_app_user npm run build; then
     echo "npm run build succeeded as $APP_USER"
else
    echo "npm run build as $APP_USER failed, trying as root and fixing permissions..."
    sudo npm run build
    sudo chown -R "$APP_USER":"$APP_USER" "$PROJECT_ROOT/seta-ui/build"
fi

# --- Configure Systemd Service for Backend ---
echo ">>> Configuring systemd service for seta-api..."
SYSTEMD_SERVICE_FILE="/etc/systemd/system/seta-api.service"

sudo bash -c "cat > $SYSTEMD_SERVICE_FILE" <<EOF
[Unit]
Description=SETA API Service (Gunicorn managing Uvicorn)
After=network.target
Requires=network.target # Explicit dependency

[Service]
User=$APP_USER
Group=$APP_USER
WorkingDirectory=$PROJECT_ROOT/seta-api

# Load environment variables from .env file
EnvironmentFile=$ENV_FILE_PATH

# Path to the gunicorn executable in the virtual environment
ExecStart=$PROJECT_ROOT/seta-api/venv/bin/gunicorn \\
    --workers $WORKERS \\
    --worker-class uvicorn.workers.UvicornWorker \\
    --bind $BACKEND_HOST:$BACKEND_PORT \\
    $ASGI_APP_INSTANCE

# Restart policy
Restart=on-failure
RestartSec=5s

# Logging: Redirect stdout/stderr to journald
StandardOutput=journal
StandardError=journal

# Security settings
PrivateTmp=true
ProtectSystem=full
# NoNewPrivileges=true # Consider enabling this for extra security if app doesn't need privilege escalation

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd, enable and (re)start the service
echo ">>> Enabling and restarting seta-api service..."
sudo systemctl daemon-reload
sudo systemctl enable seta-api.service
sudo systemctl restart seta-api.service

# --- Configure Nginx ---
echo ">>> Configuring Nginx for $SERVER_NAME..."
NGINX_CONF_FILE="/etc/nginx/sites-available/$SERVER_NAME"
NGINX_SYMLINK="/etc/nginx/sites-enabled/$SERVER_NAME"

# Remove default site if it exists and links here
sudo rm -f /etc/nginx/sites-enabled/default

sudo bash -c "cat > $NGINX_CONF_FILE" <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name $SERVER_NAME www.$SERVER_NAME; # Handle www subdomain too

    # Redirect all HTTP traffic to HTTPS
    location / {
        return 301 https://\$host\$request_uri;
    }

    # For Let's Encrypt ACME challenge
    location /.well-known/acme-challenge/ {
        root /var/www/html; # Or a dedicated directory for challenges
        allow all;
    }
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name $SERVER_NAME www.$SERVER_NAME;

    # SSL Configuration - Placeholders for Certbot
    # Certbot will typically manage these lines automatically after first run
    ssl_certificate /etc/letsencrypt/live/$SERVER_NAME/fullchain.pem; # Managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/$SERVER_NAME/privkey.pem; # Managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # Managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # Managed by Certbot

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    # add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self';" always; # Adjust CSP as needed

    # Access and Error Logs
    access_log /var/log/nginx/$SERVER_NAME.access.log;
    error_log /var/log/nginx/$SERVER_NAME.error.log warn;

    # Root directory for frontend static files
    root $PROJECT_ROOT/seta-ui/build;
    index index.html index.htm;

    # Serve frontend SPA
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Proxy API requests to the backend Gunicorn/Uvicorn service
    location /api/ {
        proxy_pass http://$BACKEND_HOST:$BACKEND_PORT/; # Forward to backend
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme; # Important for backend to know it's HTTPS
        proxy_redirect off;
        proxy_buffering off; # Good for streaming responses if any
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade"; # For potential WebSockets
    }

    # Optional: Deny access to hidden files
    location ~ /\. {
        deny all;
    }
}
EOF

# Enable the site by creating a symlink
if [ ! -L "$NGINX_SYMLINK" ]; then
    sudo ln -s "$NGINX_CONF_FILE" "$NGINX_SYMLINK"
    echo ">>> Nginx site enabled."
else
    echo ">>> Nginx site already enabled."
fi

# Test Nginx configuration
sudo nginx -t

# Reload Nginx to apply changes (initial HTTP setup)
echo ">>> Reloading Nginx..."
sudo systemctl reload nginx

# --- Obtain SSL Certificate (Certbot) ---
# This part requires Nginx to be running and DNS to be set up.
# Run this manually the first time, or uncomment if confident.
echo ">>> Attempting to obtain SSL certificate via Certbot..."
echo ">>> Ensure DNS for $SERVER_NAME points to this server and port 80 is open."

# Create challenge directory if it doesn't exist (used by HTTP-01 challenge)
sudo mkdir -p /var/www/html/.well-known/acme-challenge
sudo chown www-data:www-data /var/www/html -R # Ensure Nginx can write here if needed by certbot

# Obtain cert, Certbot will modify Nginx config automatically
if sudo certbot --nginx -d "$SERVER_NAME" -d "www.$SERVER_NAME" --non-interactive --agree-tos -m "$ADMIN_EMAIL" --redirect; then
    echo ">>> Certbot successfully obtained and installed certificate."
    # Certbot should have reloaded Nginx, but we do it again just in case
    sudo systemctl reload nginx
else
    echo "!!! WARNING: Certbot failed. Nginx might only be serving HTTP."
    echo "!!! Check Nginx logs (/var/log/nginx/error.log) and Certbot logs (/var/log/letsencrypt/letsencrypt.log)."
    echo "!!! You may need to run certbot manually: sudo certbot --nginx -d $SERVER_NAME -d www.$SERVER_NAME -m $ADMIN_EMAIL"
fi

# --- Final Checks ---
echo ">>> Checking service statuses..."
sudo systemctl status nginx --no-pager || echo ">>> Nginx status check failed."
sudo systemctl status seta-api.service --no-pager || echo ">>> seta-api service status check failed."

echo ""
echo ">>> PRODUCTION Deployment finished!"
echo ">>> Application should be accessible at https://$SERVER_NAME"
echo ">>> Backend API proxied under https://$SERVER_NAME/api/"
echo ""
echo ">>> IMPORTANT NEXT STEPS:"
echo "    1. Verify the application works correctly via HTTPS."
echo "    2. Check backend logs: sudo journalctl -u seta-api.service -f"
echo "    3. Check Nginx logs: /var/log/nginx/$SERVER_NAME.access.log and $SERVER_NAME.error.log"
echo "    4. Ensure the .env file ($ENV_FILE_PATH) is secure and backed up."
echo "    5. Set up automated database backups."
echo "    6. Monitor server resources (CPU, RAM, Disk)."
echo "    7. Certbot renewal should be handled automatically via systemd timer (check with 'sudo systemctl list-timers | grep certbot')."

#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

echo ">>> Updating package list and upgrading existing packages..."
sudo apt-get update
sudo apt-get upgrade -y

echo ">>> Installing essential packages (git, python, pip, venv, nginx, nodejs, npm, curl)..."
sudo apt-get install -y \
    git \
    python3 \
    python3-pip \
    python3-venv \
    nginx \
    nodejs \
    npm \
    curl \
    build-essential \
    python3-dev # Often needed for python packages with C extensions

# Consider using NVM (Node Version Manager) for more flexible Node version management
# curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
# # ... then source ~/.bashrc and use nvm install <version>

echo ">>> Installing Certbot for Let's Encrypt SSL certificates..."
sudo apt-get install -y certbot python3-certbot-nginx

echo ">>> Checking installed versions..."
git --version
python3 --version
pip3 --version
node --version
npm --version
nginx -v
certbot --version

echo ">>> Enabling and starting Nginx..."
sudo systemctl enable nginx
sudo systemctl start nginx

echo ">>> Basic environment setup complete!"
echo ">>> Please ensure your firewall allows traffic on ports 80 (HTTP) and 443 (HTTPS)."
echo ">>> Example using ufw (if installed):"
echo "    sudo ufw allow 'Nginx Full'"
echo "    sudo ufw enable"
echo ">>> Make sure your domain's DNS records point to this server's IP address."

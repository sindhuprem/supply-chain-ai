#!/bin/bash
set -e

echo "=== Oracle Cloud Ubuntu 22.04 VM Initial Setup ==="

sudo apt update && sudo apt upgrade -y
sudo apt install -y docker.io docker-compose nginx certbot python3-certbot-nginx git curl

sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker ubuntu

echo "=== Cloning Repository & Setting Up Environment ==="
if [ ! -d "supply-chain-agents" ]; then
  git clone https://github.com/your-org/supply-chain-agents.git
fi

cd supply-chain-agents || cd supply-chain-ai
if [ ! -f ".env" ]; then
  cp .env.example .env
fi

echo "=== Oracle Cloud iptables Firewall Configuration ==="
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 8000 -j ACCEPT
sudo netfilter-persistent save || true

echo "Setup Complete! Please edit .env with your credentials then run: docker-compose up -d"

# 🌐 Production Deployment Guide

This guide covers deploying the AI for Health platform to production environments with high availability, security, and performance.

## 🏗️ Infrastructure Requirements

### Minimum Server Specifications

#### Application Server
- **CPU**: 2 vCPUs (4 vCPUs recommended)
- **RAM**: 4GB (8GB recommended)
- **Storage**: 50GB SSD
- **Network**: 1Gbps connection

#### Database Server
- **CPU**: 2 vCPUs (4 vCPUs recommended)
- **RAM**: 8GB (16GB recommended)
- **Storage**: 100GB SSD with backup
- **Network**: 1Gbps connection

### Recommended Architecture

```
Internet
    ↓
Load Balancer (Nginx/CloudFlare)
    ↓
Application Servers (2+ instances)
    ↓
Database Cluster (MongoDB Atlas/Self-hosted)
    ↓
File Storage (AWS S3/MinIO)
```

## 🚀 Deployment Steps

### 1. Server Preparation

#### Update System
```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y

# CentOS/RHEL
sudo yum update -y
```

#### Install Node.js
```bash
# Using NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

#### Install PM2 (Process Manager)
```bash
sudo npm install -g pm2
```

#### Install Nginx (Reverse Proxy)
```bash
sudo apt install nginx -y
sudo systemctl enable nginx
sudo systemctl start nginx
```

### 2. Application Deployment

#### Clone Repository
```bash
cd /opt
sudo git clone https://github.com/Fikre-M/AIforHealth.git
sudo chown -R $USER:$USER AIforHealth
cd AIforHealth
```

#### Backend Setup
```bash
cd backend

# Install dependencies
npm ci --only=production

# Build application
npm run build

# Create production environment file
sudo nano .env
```

**Production Environment Configuration:**
```env
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/aiforhealth?retryWrites=true&w=majority

# JWT Secrets (generate strong secrets)
JWT_SECRET=your-super-secure-jwt-secret-min-32-characters-long
JWT_REFRESH_SECRET=your-super-secure-refresh-secret-min-32-characters-long

# Security
BCRYPT_SALT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com

# Logging
LOG_LEVEL=warn

# Error Monitoring
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
SENTRY_ENVIRONMENT=production

# Email Service
SENDGRID_API_KEY=your-sendgrid-api-key
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=AI for Health

# AI Services
OPENAI_API_KEY=your-openai-api-key

# File Storage
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=aiforhealth-uploads

# Payment Processing
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
```

#### Frontend Setup
```bash
cd ../frontend

# Install dependencies
npm ci

# Create production environment file
nano .env
```

**Frontend Production Environment:**
```env
VITE_API_BASE_URL=https://api.yourdomain.com/api/v1
VITE_APP_NAME=AI for Health
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_ENABLE_AI_CHAT=true
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_SYMPTOM_CHECKER=true
VITE_ENABLE_APPOINTMENT_BOOKING=true
VITE_ENABLE_DARK_MODE=true

# Third-party Services
VITE_SENTRY_DSN=https://your-frontend-sentry-dsn@sentry.io/project-id
VITE_GA_ID=your-google-analytics-id
```

```bash
# Build for production
npm run build
```

### 3. Process Management with PM2

#### Create PM2 Ecosystem File
```bash
# Create ecosystem.config.js in project root
nano ecosystem.config.js
```

```javascript
module.exports = {
  apps: [
    {
      name: 'aiforhealth-backend',
      cwd: './backend',
      script: 'dist/server.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
      max_memory_restart: '1G',
      node_args: '--max-old-space-size=1024'
    }
  ]
};
```

#### Start Application with PM2
```bash
# Start application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME
```

### 4. Nginx Configuration

#### Create Nginx Configuration
```bash
sudo nano /etc/nginx/sites-available/aiforhealth
```

```nginx
# Backend API server
server {
    listen 80;
    server_name api.yourdomain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";
    
    # Proxy to Node.js backend
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req zone=api burst=20 nodelay;
}

# Frontend application
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";
    
    # Document root
    root /opt/AIforHealth/frontend/dist;
    index index.html;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # Static files with caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Health check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

#### Enable Site and Restart Nginx
```bash
sudo ln -s /etc/nginx/sites-available/aiforhealth /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 5. SSL Certificate Setup

#### Install Certbot
```bash
sudo apt install certbot python3-certbot-nginx -y
```

#### Obtain SSL Certificates
```bash
# For API domain
sudo certbot --nginx -d api.yourdomain.com

# For frontend domain
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

#### Setup Auto-renewal
```bash
sudo crontab -e
# Add this line:
0 12 * * * /usr/bin/certbot renew --quiet
```

### 6. Database Setup (MongoDB Atlas)

#### Create MongoDB Atlas Cluster
1. Sign up at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Configure network access (whitelist your server IP)
4. Create database user
5. Get connection string

#### Database Security
- Use strong passwords
- Enable authentication
- Configure network access rules
- Enable audit logging
- Set up automated backups

### 7. Monitoring Setup

#### System Monitoring with PM2
```bash
# Install PM2 monitoring
pm2 install pm2-server-monit

# View monitoring dashboard
pm2 monit
```

#### Log Management
```bash
# Setup log rotation
sudo nano /etc/logrotate.d/aiforhealth
```

```
/opt/AIforHealth/backend/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    notifempty
    create 644 ubuntu ubuntu
    postrotate
        pm2 reloadLogs
    endscript
}
```

### 8. Backup Strategy

#### Database Backups
```bash
# Create backup script
nano /opt/scripts/backup-db.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/backups"
DB_NAME="aiforhealth"

# Create backup directory
mkdir -p $BACKUP_DIR

# MongoDB Atlas backup (using mongodump)
mongodump --uri="$MONGODB_URI" --out="$BACKUP_DIR/mongodb_$DATE"

# Compress backup
tar -czf "$BACKUP_DIR/mongodb_$DATE.tar.gz" -C "$BACKUP_DIR" "mongodb_$DATE"
rm -rf "$BACKUP_DIR/mongodb_$DATE"

# Upload to S3 (optional)
aws s3 cp "$BACKUP_DIR/mongodb_$DATE.tar.gz" s3://your-backup-bucket/

# Clean old backups (keep 30 days)
find $BACKUP_DIR -name "mongodb_*.tar.gz" -mtime +30 -delete
```

```bash
# Make executable and schedule
chmod +x /opt/scripts/backup-db.sh
crontab -e
# Add: 0 2 * * * /opt/scripts/backup-db.sh
```

#### Application Backups
```bash
# Create application backup script
nano /opt/scripts/backup-app.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/backups"
APP_DIR="/opt/AIforHealth"

# Create backup
tar -czf "$BACKUP_DIR/app_$DATE.tar.gz" -C "/opt" "AIforHealth" --exclude="node_modules" --exclude="logs" --exclude=".git"

# Upload to S3
aws s3 cp "$BACKUP_DIR/app_$DATE.tar.gz" s3://your-backup-bucket/

# Clean old backups
find $BACKUP_DIR -name "app_*.tar.gz" -mtime +7 -delete
```

## 🔒 Security Hardening

### Firewall Configuration
```bash
# Install UFW
sudo apt install ufw -y

# Default policies
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow SSH
sudo ufw allow ssh

# Allow HTTP and HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Enable firewall
sudo ufw enable
```

### Fail2Ban Setup
```bash
# Install Fail2Ban
sudo apt install fail2ban -y

# Configure Fail2Ban
sudo nano /etc/fail2ban/jail.local
```

```ini
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true

[nginx-http-auth]
enabled = true

[nginx-limit-req]
enabled = true
filter = nginx-limit-req
action = iptables-multiport[name=ReqLimit, port="http,https", protocol=tcp]
logpath = /var/log/nginx/error.log
maxretry = 10
findtime = 600
bantime = 7200
```

### System Updates
```bash
# Enable automatic security updates
sudo apt install unattended-upgrades -y
sudo dpkg-reconfigure -plow unattended-upgrades
```

## 📊 Performance Optimization

### Node.js Optimization
- Use cluster mode with PM2
- Enable gzip compression
- Implement caching strategies
- Optimize database queries
- Use CDN for static assets

### Database Optimization
- Create appropriate indexes
- Use connection pooling
- Monitor query performance
- Implement read replicas for scaling

### Nginx Optimization
- Enable gzip compression
- Set appropriate cache headers
- Use HTTP/2
- Implement rate limiting

## 🚨 Health Checks

### Application Health Check
The application provides health check endpoints:
- Backend: `GET /api/v1/health`
- Frontend: `GET /health`

### Monitoring Script
```bash
nano /opt/scripts/health-check.sh
```

```bash
#!/bin/bash
API_URL="https://api.yourdomain.com/api/v1/health"
FRONTEND_URL="https://yourdomain.com/health"

# Check API health
if curl -f -s $API_URL > /dev/null; then
    echo "API is healthy"
else
    echo "API is down - restarting..."
    pm2 restart aiforhealth-backend
fi

# Check frontend health
if curl -f -s $FRONTEND_URL > /dev/null; then
    echo "Frontend is healthy"
else
    echo "Frontend is down - checking nginx..."
    sudo systemctl restart nginx
fi
```

## 📋 Deployment Checklist

Before going live:

- [ ] SSL certificates installed and configured
- [ ] Environment variables set correctly
- [ ] Database connection tested
- [ ] All third-party services configured
- [ ] Monitoring and alerting set up
- [ ] Backup strategy implemented
- [ ] Security hardening completed
- [ ] Performance testing done
- [ ] Health checks working
- [ ] DNS records configured
- [ ] CDN configured (if applicable)
- [ ] Error monitoring (Sentry) configured
- [ ] Log aggregation set up

## 🔄 Deployment Updates

### Zero-Downtime Deployment
```bash
# Pull latest changes
git pull origin main

# Backend update
cd backend
npm ci --only=production
npm run build
pm2 reload aiforhealth-backend

# Frontend update
cd ../frontend
npm ci
npm run build
# Files are automatically served by nginx
```

### Rollback Strategy
```bash
# Keep previous version
cp -r /opt/AIforHealth /opt/AIforHealth.backup

# Rollback if needed
pm2 stop aiforhealth-backend
rm -rf /opt/AIforHealth
mv /opt/AIforHealth.backup /opt/AIforHealth
pm2 start aiforhealth-backend
```

## 📚 Additional Resources

- [Configuration Guide](../configuration/README.md)
- [Monitoring Guide](../cicd/monitoring.md)
- [Troubleshooting Guide](../troubleshooting/README.md)
- [Security Best Practices](../configuration/security.md)
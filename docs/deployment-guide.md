# Deployment Guide for BeeKeeper's Hub

This guide covers multiple deployment options for moving your local application to a remote web host.

## Prerequisites

Before deployment, ensure you have:
- [ ] Production database credentials
- [ ] Domain name (optional but recommended)
- [ ] SSL certificate (or use Let's Encrypt)
- [ ] Environment variables configured

## Option 1: VPS Deployment (DigitalOcean, Linode, AWS EC2)

### 1. Server Setup

```bash
# SSH into your server
ssh root@your-server-ip

# Update system
apt update && apt upgrade -y

# Install required software
apt install -y nodejs npm nginx mysql-server git

# Install PM2 for process management
npm install -g pm2

# Install Docker and Docker Compose (optional)
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
apt install docker-compose
```

### 2. Clone and Setup Application

```bash
# Create app directory
mkdir -p /var/www
cd /var/www

# Clone your repository
git clone https://github.com/yourusername/beekeeping-hub.git
cd beekeeping-hub

# Setup Backend
cd backend
npm install
cp .env.example .env
# Edit .env with production values
nano .env

# Setup Frontend
cd ../frontend
npm install
npm run build
```

### 3. Configure Environment Variables

Create `/var/www/beekeeping-hub/backend/.env`:
```env
NODE_ENV=production
PORT=8080

# Database
DB_HOST=localhost
DB_USER=beekeeping_user
DB_PASSWORD=your_secure_password
DB_NAME=beekeeping_hub
DB_PORT=3306

# JWT
JWT_SECRET=your_very_secure_jwt_secret_key

# Email (for password reset)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Frontend URL
SITE_URL=https://yourdomain.com
CORS_ORIGIN=https://yourdomain.com
```

Create `/var/www/beekeeping-hub/frontend/.env`:
```env
REACT_APP_API_URL=https://yourdomain.com/api
REACT_APP_BASE_URL=https://yourdomain.com
```

### 4. Setup MySQL Database

```bash
# Secure MySQL installation
mysql_secure_installation

# Create database and user
mysql -u root -p

CREATE DATABASE beekeeping_hub;
CREATE USER 'beekeeping_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON beekeeping_hub.* TO 'beekeeping_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Run migrations
cd /var/www/beekeeping-hub/backend
npm run migrate
npm run seed  # Optional: seed with sample data
```

### 5. Configure Nginx

Create `/etc/nginx/sites-available/beekeeping-hub`:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Frontend
    root /var/www/beekeeping-hub/frontend/build;
    index index.html;

    # API Proxy
    location /api {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Frontend routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable the site:
```bash
ln -s /etc/nginx/sites-available/beekeeping-hub /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### 6. Setup PM2 Process Manager

Create `/var/www/beekeeping-hub/ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'beekeeping-api',
    script: './backend/src/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 8080
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```

Start the application:
```bash
cd /var/www/beekeeping-hub
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 7. Setup SSL with Let's Encrypt

```bash
apt install certbot python3-certbot-nginx
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## Option 2: Docker Deployment

### 1. Update Docker Compose for Production

Create `docker-compose.prod.yml`:
```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: ${MYSQL_DATABASE}
      MYSQL_USER: ${MYSQL_USER}
      MYSQL_PASSWORD: ${MYSQL_PASSWORD}
    volumes:
      - mysql_data:/var/lib/mysql
    networks:
      - app-network

  backend:
    build: ./backend
    restart: always
    depends_on:
      - mysql
    environment:
      NODE_ENV: production
      DB_HOST: mysql
      DB_USER: ${MYSQL_USER}
      DB_PASSWORD: ${MYSQL_PASSWORD}
      DB_NAME: ${MYSQL_DATABASE}
      JWT_SECRET: ${JWT_SECRET}
      CORS_ORIGIN: ${FRONTEND_URL}
    networks:
      - app-network

  frontend:
    build: 
      context: ./frontend
      args:
        REACT_APP_API_URL: ${API_URL}
    restart: always
    depends_on:
      - backend
    networks:
      - app-network

  nginx:
    image: nginx:alpine
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.prod.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - backend
    networks:
      - app-network

volumes:
  mysql_data:

networks:
  app-network:
    driver: bridge
```

### 2. Deploy with Docker

```bash
# On your server
git clone https://github.com/yourusername/beekeeping-hub.git
cd beekeeping-hub

# Create .env file with production values
cp .env.example .env
nano .env

# Build and run
docker-compose -f docker-compose.prod.yml up -d

# Run migrations
docker-compose -f docker-compose.prod.yml exec backend npm run migrate
```

## Option 3: Platform-as-a-Service (Heroku, Railway, Render)

### Heroku Deployment

1. **Install Heroku CLI**
```bash
# macOS
brew tap heroku/brew && brew install heroku

# Ubuntu/Debian
curl https://cli-assets.heroku.com/install.sh | sh
```

2. **Prepare for Heroku**

Create `backend/Procfile`:
```
web: node src/index.js
release: npx sequelize-cli db:migrate
```

Update `backend/package.json`:
```json
{
  "scripts": {
    "start": "node src/index.js",
    "heroku-postbuild": "NPM_CONFIG_PRODUCTION=false npm install"
  },
  "engines": {
    "node": "18.x",
    "npm": "9.x"
  }
}
```

3. **Deploy Backend**
```bash
cd backend
heroku create beekeeping-hub-api
heroku addons:create cleardb:ignite
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your_jwt_secret
heroku config:set CORS_ORIGIN=https://beekeeping-hub.netlify.app
git push heroku main
```

4. **Deploy Frontend to Netlify**
```bash
cd frontend
npm run build

# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=build
```

## Option 4: Shared Hosting (cPanel)

### 1. Backend Deployment

1. **Create a subdomain** for API (e.g., api.yourdomain.com)

2. **Upload backend files** via FTP/File Manager (exclude node_modules)

3. **Setup Node.js** in cPanel's Node.js selector:
   - Application root: /home/username/api.yourdomain.com
   - Application URL: api.yourdomain.com
   - Application startup file: backend/src/index.js

4. **Install dependencies** via SSH:
```bash
cd ~/api.yourdomain.com/backend
npm install
```

5. **Setup database** in cPanel MySQL:
   - Create database
   - Create user
   - Grant privileges
   - Import schema

### 2. Frontend Deployment

1. **Build frontend locally**:
```bash
cd frontend
npm run build
```

2. **Upload build folder** contents to public_html

3. **Create .htaccess** for React Router:
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /index.html [L]
</IfModule>
```

## Post-Deployment Checklist

- [ ] Test all API endpoints
- [ ] Verify database connections
- [ ] Check email functionality
- [ ] Test file uploads
- [ ] Verify CORS settings
- [ ] Enable HTTPS/SSL
- [ ] Setup monitoring (UptimeRobot, Pingdom)
- [ ] Configure backups
- [ ] Setup error logging (Sentry, LogRocket)
- [ ] Test on multiple devices/browsers
- [ ] Submit sitemap to search engines

## Security Considerations

1. **Environment Variables**
   - Never commit .env files
   - Use strong, unique passwords
   - Rotate JWT secrets regularly

2. **Database**
   - Use prepared statements (Sequelize handles this)
   - Regular backups
   - Restrict database user permissions

3. **Server**
   - Keep software updated
   - Configure firewall (ufw, iptables)
   - Disable root SSH login
   - Use SSH keys instead of passwords

4. **Application**
   - Enable rate limiting
   - Implement CSRF protection
   - Use HTTPS everywhere
   - Set secure headers

## Monitoring and Maintenance

### Setup Monitoring
```bash
# Install monitoring tools
npm install -g pm2-logrotate
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
```

### Backup Script
Create `/home/backup-beekeeping.sh`:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/backups"

# Backup database
mysqldump -u beekeeping_user -p'password' beekeeping_hub > $BACKUP_DIR/db_$DATE.sql

# Backup uploaded files
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz /var/www/beekeeping-hub/backend/uploads

# Keep only last 30 days of backups
find $BACKUP_DIR -type f -mtime +30 -delete
```

### Cron Jobs
```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /home/backup-beekeeping.sh

# Add Let's Encrypt renewal
0 0 * * * certbot renew --quiet
```

## Troubleshooting

### Common Issues

1. **502 Bad Gateway**
   - Check if backend is running: `pm2 status`
   - Check logs: `pm2 logs`
   - Verify port configuration

2. **Database Connection Errors**
   - Verify credentials in .env
   - Check MySQL service: `systemctl status mysql`
   - Test connection: `mysql -u user -p`

3. **CORS Errors**
   - Verify CORS_ORIGIN in backend .env
   - Check Nginx proxy headers
   - Ensure frontend uses correct API_URL

4. **File Upload Issues**
   - Check directory permissions: `chmod 755 uploads`
   - Verify Nginx client_max_body_size
   - Check disk space: `df -h`

## Support Resources

- Node.js Deployment: https://nodejs.org/en/docs/guides/
- Nginx Documentation: https://nginx.org/en/docs/
- PM2 Documentation: https://pm2.keymetrics.io/
- Docker Documentation: https://docs.docker.com/
- Let's Encrypt: https://letsencrypt.org/docs/
# This is meant to setup the server/VM to run the application
# Tested with Goolge Compute Engine
# e2-medium (2 vCPUs, 4 GB memory)
# ubuntu-1604-xenial-v20210429

apt-get update
apt-get install -yq build-essential
apt-get install -yq nginx sqlite3 libsqlite3-dev supervisor

curl -fsSL https://deb.nodesource.com/setup_14.x | sudo -E bash -
apt-get install -yq nodejs

# install python3
add-apt-repository -y ppa:deadsnakes/ppa
apt-get update
apt-get install -yq python3.6


# Create folders for application 

mkdir /opt/show-of-hands
mkdir /opt/show-of-hands/app
mkdir /opt/show-of-hands/logs

cd /opt/show-of-hands
git clone https://github.com/MrFlick/show-of-hands.git app
cd app
cp config.default.js config.js

# Create new user for app

useradd -m -d /home/sohweb sohweb
chown -R sohweb:sohweb /opt/show-of-hands

# npm install is very finicky when installing sqlite3 from source
# This might work?
sudo -usohweb npm install
sudo -usohweb npm run redb

# Configure NGINX server as a proxy for nodejs app

cat >/etc/nginx/sites-available/show-of-hands << EOF
server {
    root /opt/show-of-hands/app;
    index index.html index.htm;
    server_name classroom.matthewflickinger.com; 
    client_max_body_size 10m;
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF
ln -s /etc/nginx/sites-available/show-of-hands /etc/nginx/sites-enabled/
service nginx start


# Configure Supervisor to keep app running if you stop/restart
# the VM

cat >/etc/supervisor/conf.d/soh-app.conf << EOF
[program:sohweb]
directory=/opt/show-of-hands/app
command=node server.js
autostart=true
autorestart=true
user=mrflick
environment=HOME="/home/sohweb",USER="sohweb",NODE_ENV="production",PORT="3000"
stderr_logfile=/opt/show-of-hands/logs/sup.err.log
stdout_logfile=/opt/show-of-hands/logs/sup.out.log
EOF

supervisorctl reread
supervisorctl update


# For SSL Certificiates

snap install core
snap refresh core
snap install --classic certbot
certbot --nginx -d classroom.matthhewflickinger.com
ln -s /snap/bin/certbot /usr/bin/certbot
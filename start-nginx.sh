#!/bin/sh

# Set default port if PORT environment variable is not set
export PORT=${PORT:-80}

# Replace $PORT in nginx config with actual port value
envsubst '$PORT' < /etc/nginx/conf.d/nginx-railway.conf > /etc/nginx/conf.d/default.conf

# Remove the template file
rm /etc/nginx/conf.d/nginx-railway.conf

# Start nginx
nginx -g "daemon off;"
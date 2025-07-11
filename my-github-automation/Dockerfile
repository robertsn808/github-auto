# Use NGINX to serve static files
FROM nginx:alpine

# Remove default NGINX site config (optional but clean)
RUN rm -rf /usr/share/nginx/html/*

# Copy your build/ output into NGINX's served folder
COPY ./build /usr/share/nginx/html

# Expose port 80 (used by NGINX)
EXPOSE 80

# NGINX runs automatically via the base image


FROM nginx:alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy config as a template (PORT will be substituted at runtime)
COPY nginx.conf /etc/nginx/templates/chatia.conf.template

# Copy only static files to nginx web root
COPY index.html styles.css /usr/share/nginx/html/

EXPOSE 80

# Substitute ${PORT} from Railway's env var, then start nginx
CMD ["/bin/sh", "-c", "envsubst '${PORT}' < /etc/nginx/templates/chatia.conf.template > /etc/nginx/conf.d/chatia.conf && nginx -g 'daemon off;'"]

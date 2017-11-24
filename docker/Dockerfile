FROM nginx

RUN mkdir -p /usr/share/nginx/hit
ADD build /usr/share/nginx/hit/

COPY nginx.qa.conf /etc/nginx/nginx.conf
COPY .htpasswd /etc/nginx/.htpasswd

FROM php:8.2-apache

# Extensiones que usas (mysqli)
RUN docker-php-ext-install mysqli

# Opcional (por si luego usas rewrite)
RUN a2enmod rewrite

# DocumentRoot -> /public
COPY docker/000-default.conf /etc/apache2/sites-available/000-default.conf

WORKDIR /var/www/html
COPY . .

RUN chown -R www-data:www-data /var/www/html
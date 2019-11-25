FROM debian:9-slim

MAINTAINER Michael Pavlista <pavlista@rtsoft.cz>

# Nastavení ENV proměnných image.
ENV DEBIAN_FRONTEND=noninteractive \
    \
    APACHE_RUN_USER=www-data \
    APACHE_RUN_GROUP=www-data \
    APACHE_LOG_DIR=/var/log/apache2 \
    APACHE_LOCK_DIR=/var/lock/apache2 \
    APACHE_PID_FILE=/var/run/apache2.pid \
    \
    COMPOSER_ALLOW_SUPERUSER=1

# Instalace a konfigurace služeb image.
RUN \
    # Ošetření chyby: invoke-rc.d: policy-rc.d denied execution of start.
    sed -i "s/^exit 101$/exit 0/" /usr/sbin/policy-rc.d && \
    \
    \
    # Vytvoření složky pro logy
    mkdir /var/log/docker/ && chmod 777 /var/log/docker/ && \
    \
    \
    # Aktualizace definice balíčků a instalace základních balíčků.
    apt-get update && \
    apt-get install -y --no-install-recommends dialog apt-utils git mc htop nmap wget curl unzip \
    apt-transport-https ca-certificates gnupg2 lsb-release openssh-client && \
    \
    \
    # Přidání repozitářů třetích stran (PHP, Yarn, ...).
    wget -O /etc/apt/trusted.gpg.d/php.gpg https://packages.sury.org/php/apt.gpg && \
    sh -c 'echo "deb https://packages.sury.org/php/ $(lsb_release -sc) main" > /etc/apt/sources.list.d/php.list' && \
    \
    curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - && \
    echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list && \
    \
    apt-get update && \
    \
    \
    # Instalace a nastavení Apache.
    apt-get install -y --no-install-recommends apache2 && \
    a2enmod include && \
    a2enmod rewrite && \
    a2enmod proxy_fcgi && \
    a2enmod expires && \
    a2enmod filter && \
    a2enmod headers && \
    a2enmod proxy && \
    a2enmod proxy_balancer && \
    a2enmod proxy_http && \
    a2enmod ssl && \
    \
    rm /etc/apache2/sites-enabled/000-default.conf && \
    \
    mkdir -p /var/www/semestrio.local/www/ && \
    \
    \
    # Instalace PHP 7.1.
    # Používáme PHP balíčky z repozitáře: https://deb.sury.org.
    apt-get install -y --no-install-recommends php7.1 php7.1-cli libapache2-mod-php7.1 \
    php7.1-curl \
    php7.1-intl \
    php7.1-gd \
    php7.1-mbstring \
    php7.1-pdo \
    php7.1-mysql \
    php7.1-json \
    php7.1-zip \
    php7.1-xml \
    php7.1-imagick \
    php7.1-redis \
    php7.1-bcmath \
    php7.1-imap \
    php7.1-xdebug && \
    \
    \
    # Instalace Composeru.
    curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer --version=1.9.1 && \
    \
    \
    # Instalace Presstissima které zajišťuje pararelní stahování balíčku přes composer (něco jako Yarn).
    composer global require "hirak/prestissimo:^0.3" && \
    composer clear-cache && \
    \
    \
    # Instalace Node.js, NPM a Yarnu.
    curl -sL https://deb.nodesource.com/setup_8.x | bash - && \
    apt-get install -y nodejs=8.* yarn && \
    \
    \
    # Pročištění docker image.
    apt-get clean -y && apt-get autoclean -y && apt-get autoremove -y && \
    rm -rf /var/lib/apt/lists/* /var/lib/log/* /tmp/* /var/tmp/* && \
    \
    \
    # Odstranění služeb, které startují při zapnutí containeru.
    rm /etc/init.d/apache2

# Zkopírování konfigurace Apache2.
COPY ./conf.d/apache/apache2.conf /etc/apache2/

# Zkopírování konfigurace PHP.
COPY ./conf.d/php/php.ini /etc/php/7.1/apache2/
COPY ./conf.d/php/xdebug.ini /etc/php/7.1/apache2/conf.d/

# Zkopírování scriptu, zajišťující start služeb v containeru.
COPY ./conf.d/bash/container.start.sh /usr/local/bin/

# Provedení akcí které vyžadují zkopírované soubory v image.
RUN \
    # Zkopírování konfigurace PHP (z Apache do CLI).
    cp /etc/php/7.1/apache2/php.ini /etc/php/7.1/cli/php.ini && \
    cp /etc/php/7.1/apache2/conf.d/xdebug.ini /etc/php/7.1/cli/conf.d/xdebug.ini && \
    \
    \
    # Normalizace zaváděcího scriptu containeru.
    sed -i 's/\r$//' /usr/local/bin/container.start.sh && \
    chmod +x /usr/local/bin/container.start.sh && \
    \
    \
    # Pročištění temp souborů.
    rm -rf /var/lib/apt/lists/* /var/lib/log/* /tmp/* /var/tmp/*

# Definice příkazu,který se spustí při startu containeru.
CMD /usr/local/bin/container.start.sh

# https://docs.docker.com/engine/reference/builder/#workdir
WORKDIR /var/www/semestrio.local

#!/usr/bin/env bash
# Soubor příkazů, které se provedou v docker konteineru ihned po spuštění nebo sestavení image

# Zapnutí nebo vypnutí XDEBUGU
if [ -z ${XDEBUG_ENABLED+x} ] || [ "$XDEBUG_ENABLED" -ne "1" ];
    then
        echo 'Deaktivuji xdebug';
        phpdismod xdebug;

    else
        echo 'Aktivuji xdebug';
        phpenmod xdebug;

        # Nastavování konfigurace PHP Xdebugu dle ENV proměnných
        if [ -z ${XDEBUG_HOST+x} ];
            then
                echo 'Nebyla zadána hodnota IP pro xdebug.remote_host!';
            else
                echo "Nastavuji IP adresu pro xdebug.remote_host na: $XDEBUG_HOST";
                sed -i "s/xdebug\.remote_host\=.*/xdebug\.remote_host\=$XDEBUG_HOST/g" /etc/php/7.1/apache2/conf.d/xdebug.ini;
                sed -i "s/xdebug\.remote_host\=.*/xdebug\.remote_host\=$XDEBUG_HOST/g" /etc/php/7.1/cli/conf.d/xdebug.ini;

                echo "Apache2 xdebug.ini:";
                cat /etc/php/7.1/apache2/conf.d/xdebug.ini | xargs echo -e

                echo "CLI xdebug.ini:";
                cat /etc/php/7.1/cli/conf.d/xdebug.ini | xargs echo -e

                echo "Dokončeno nastavování IP pro xdebug.remote_host"
        fi
fi

# Zapnutí SSH agenta
eval `ssh-agent -s`

# Po spuštění containeru automaticky spustíme composer install
echo "Spouštím instalaci Composeru"
(cd /var/www/semestrio.local && composer install)

# Po spuštění containeru automaticky spustíme yarn install
echo "Spouštím instalaci Yarnu"
(cd /var/www/semestrio.local/www && yarn install)

# Spuštění Apache
echo "Spouštím Apache do popředí..."
apache2ctl -D FOREGROUND

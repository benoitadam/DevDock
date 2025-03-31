# install

docker network create web

chmod +x ./generator.sh
chmod +x ./update.sh
./generator.sh
./update.sh


# n8n add docker

add env :
- /var/run/docker.sock:/var/run/docker.sock


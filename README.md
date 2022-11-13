# Minecraft Server Watcher

## Development

```sh
# Mac
docker run --rm -it -v "$PWD":/home/node/app -w /home/node/app node:16-alpine sh

# WSL
docker run --rm -it -v "$PWD":/home/node/app -w /home/node/app -u 1000:1000 node:16-alpine sh
```

## Update on EC2

```sh
cd ~/pinger
pm2 stop pinger
git pull
npm run build
pm2 start pinger
```

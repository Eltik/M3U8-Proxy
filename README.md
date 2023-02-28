# M3U8-Proxy
Proxy m3u8 files through pure JavaScript.

## Prerequisites
This proxy requires a [CORS proxy](https://github.com/Rob--W/cors-anywhere). You can input it into the `.env` file or in the `API` constructor. NodeJS version 16+ is also required to run.

## Installation
1. Clone the repository.
```bash
git clone https://github.com/Eltik/M3U8-Proxy.git
```
2. Run `npm i`.
3. Run `npm run build`.
4. Run `npm start` or `npm start:pm2` if you want to use [pm2](https://npmjs.com/package/pm2).

You can configure how the proxy works via a `.env` file; it's relatively self-explanatory.
```
CORS_PROXY="https://cors.consumet.stream"
WEB_SERVER_URL="http://localhost:3060"
WEB_SERVER_PORT="3060"
```

## Credit
Inspired by [this](https://github.com/chaycee/M3U8Proxy) repository. I received some help from [chaycee](https://github.com/chaycee) as well.
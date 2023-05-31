# M3U8-Proxy
Proxies m3u8 files through pure JavaScript.

## About
Some m3u8 files require special headers as well as CORS. This project achieves both by integrating Rob Wu's [CORS proxdy](https://github.com/Rob--W/cors-anywhere) and adding a route to proxy m3u8 files.

## Installation
1. Clone the repository.
```bash
git clone https://github.com/Eltik/M3U8-Proxy.git
```
2. Run `npm i`.
3. Run `npm run build`.
4. Run `npm start`.

You can configure how the proxy works via a `.env` file; it's relatively self-explanatory.
```
HOST="localhost"
PORT="3030"
```

## Usage
To proxy m3u8 files, use the `/m3u8-proxy` route. All you have to do is input the URL and headers. For example:
```
http://localhost:3030/m3u8-proxy?url=https%3A%2F%2Fojkx.vizcloud.co%2Fsimple%2FEqPFJvsQWADtjDlGha7rC8UurFwHuLiwTk17rqk%2BwYMnU94US2El_Po4w12gXe6GptOSQtc%2Fbr%2Flist.m3u8%23.mp4&headers=%7B%22referer%22%3A%22https%3A%2F%2F9anime.pl%22%7D
```
The URL in this case is `https://ojkx.vizcloud.co/simple/EqPFJvsQWADtjDlGha7rC8UurFwHuLiwTk17rqk+wYMnU94US2El_Po4w12gXe6GptOSQtc/br/list.m3u8#.mp4` and the headers are `{"Referer": "https://9anime.pl"}`. This will then send a request to the m3u8 using the headers, modify the content to use the ts proxy, then proxy each ts file using a CORS proxy. If you need help, please join my [Discord](https://discord.gg/F87wYBtnkC).

## Credit
Inspired by [this](https://github.com/chaycee/M3U8Proxy) repository. I received some help from [chaycee](https://github.com/chaycee) as well. This project also uses code from [this CORS proxy](https://github.com/Rob--W/cors-anywhere).
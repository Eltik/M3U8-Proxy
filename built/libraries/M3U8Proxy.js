"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const API_1 = __importDefault(require("../API"));
const http_1 = __importDefault(require("http"));
class M3U8Proxy extends API_1.default {
    constructor(url) {
        super();
        this.url = "";
        this.corsProxy = this.config.cors_proxy;
        this.url = url;
    }
    /**
     * @description Proxies m3u8 files and replaces the content to point to the proxy.
     * @param headers JSON headers
     * @param res Server response object
     */
    async proxy(headers, res) {
        const req = await this.fetch(this.url, {
            headers: headers,
        });
        const m3u8 = req.text();
        if (m3u8.includes("RESOLUTION=")) {
            // Deals with the master m3u8 and replaces all sub-m3u8 files (quality m3u8 files basically) to use the m3u8 proxy.
            // So if there is 360p, 480p, etc. Instead, the URL's of those m3u8 files will be replaced with the proxy URL.
            const lines = m3u8.split("\n");
            const newLines = [];
            for (const line of lines) {
                if (line.startsWith("#")) {
                    newLines.push(line);
                }
                else {
                    const url = new URL(line, this.url);
                    newLines.push(`${this.config.web_server.url + "/m3u8_proxy?url=" + encodeURIComponent(url.href) + "&headers=" + encodeURIComponent(JSON.stringify(headers))}`);
                }
            }
            // You need these headers so that the client recognizes the response as an m3u8.
            res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.setHeader("Access-Control-Allow-Headers", "*");
            res.setHeader("Access-Control-Allow-Methods", "*");
            res.end(newLines.join("\n"));
            return;
        }
        else {
            // Deals with each individual quality. Replaces the TS files with the proxy URL.
            const lines = m3u8.split("\n");
            const newLines = [];
            for (const line of lines) {
                if (line.startsWith("#")) {
                    newLines.push(line);
                }
                else {
                    const url = new URL(line, this.url);
                    // CORS is needed since the TS files are not on the same domain as the client.
                    // This replaces each TS file to use a TS proxy with the headers attached.
                    // So each TS request will use the headers inputted to the proxy
                    newLines.push(`${this.corsProxy}/${this.config.web_server.url + "/ts_proxy?url=" + encodeURIComponent(url.href) + "&headers=" + encodeURIComponent(JSON.stringify(headers))}`);
                }
            }
            // You need these headers so that the client recognizes the response as an m3u8.
            res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.setHeader("Access-Control-Allow-Headers", "*");
            res.setHeader("Access-Control-Allow-Methods", "*");
            res.end(newLines.join("\n"));
            return;
        }
    }
    /**
     * @description Proxies TS files. Sometimes TS files require headers to be sent with the request.
     * @param headers JSON headers
     * @param req Client request object
     * @param res Server response object
     */
    async proxyTs(headers, req, res) {
        // I love how NodeJS HTTP request client only takes http URLs :D It's so fun!
        // I'll probably refactor this later.
        const httpURL = this.url.replace("https://", "http://");
        const uri = new URL(httpURL);
        // Options
        // It might be worth adding ...req.headers to the headers object, but once I did that
        // the code broke and I receive errors such as "Cannot access direct IP" or whatever.
        const options = {
            hostname: uri.hostname,
            port: uri.port,
            path: uri.pathname + uri.search,
            method: req.method,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36",
                ...headers,
            }
        };
        // Proxy request and pipe to client
        const proxy = http_1.default.request(options, (r) => {
            res.writeHead(r.statusCode, r.headers);
            r.pipe(res, {
                end: true
            });
        });
        req.pipe(proxy, {
            end: true
        });
    }
}
exports.default = M3U8Proxy;
//# sourceMappingURL=M3U8Proxy.js.map
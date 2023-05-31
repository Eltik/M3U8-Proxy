"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.proxyTs = exports.proxy = exports.web_server_url = void 0;
const http_1 = __importDefault(require("http"));
const axios_1 = __importDefault(require("axios"));
exports.web_server_url = process.env.WEB_SERVER_URL || "http://localhost:8080";
/**
 * @description Proxies m3u8 files and replaces the content to point to the proxy.
 * @param headers JSON headers
 * @param res Server response object
 */
async function proxy(url, headers, res) {
    const req = await (0, axios_1.default)(url, {
        headers: headers,
    }).catch((err) => {
        res.writeHead(500);
        res.end(err.message);
        return null;
    });
    if (!req) {
        return;
    }
    const m3u8 = req.data;
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
                const uri = new URL(line, url);
                newLines.push(`${exports.web_server_url + "/m3u8_proxy?url=" + encodeURIComponent(uri.href) + "&headers=" + encodeURIComponent(JSON.stringify(headers))}`);
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
                const uri = new URL(line, url);
                // CORS is needed since the TS files are not on the same domain as the client.
                // This replaces each TS file to use a TS proxy with the headers attached.
                // So each TS request will use the headers inputted to the proxy
                newLines.push(`${exports.web_server_url}/${"/ts_proxy?url=" + encodeURIComponent(uri.href) + "&headers=" + encodeURIComponent(JSON.stringify(headers))}`);
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
exports.proxy = proxy;
/**
 * @description Proxies TS files. Sometimes TS files require headers to be sent with the request.
 * @param headers JSON headers
 * @param req Client request object
 * @param res Server response object
 */
async function proxyTs(url, headers, req, res) {
    // I love how NodeJS HTTP request client only takes http URLs :D It's so fun!
    // I'll probably refactor this later.
    const httpURL = url.replace("https://", "http://");
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
    try {
        const proxy = http_1.default.request(options, (r) => {
            res.writeHead(r.statusCode ?? 200, r.headers);
            r.pipe(res, {
                end: true
            });
        });
        req.pipe(proxy, {
            end: true
        });
    }
    catch (e) {
        res.writeHead(500);
        res.end(e.message);
        return null;
    }
}
exports.proxyTs = proxyTs;

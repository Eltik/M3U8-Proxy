"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const API_1 = __importDefault(require("../API"));
class M3U8Proxy extends API_1.default {
    constructor(url) {
        super();
        this.url = "";
        this.corsProxy = this.config.cors_proxy;
        this.url = url;
    }
    async proxy(headers, reply) {
        const res = await this.fetch(this.url, {
            headers: headers,
        });
        const m3u8 = res.text();
        if (m3u8.includes("RESOLUTION=")) {
            // Master m3u8
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
            reply.header('Content-Type', 'application/vnd.apple.mpegurl');
            reply.header('Access-Control-Allow-Origin', '*');
            reply.header('Access-Control-Allow-Headers', '*');
            reply.header('Access-Control-Allow-Methods', '*');
            reply.send(newLines.join("\n"));
            return;
        }
        else {
            // Individual files
            const lines = m3u8.split("\n");
            const newLines = [];
            for (const line of lines) {
                if (line.startsWith("#")) {
                    newLines.push(line);
                }
                else {
                    const url = new URL(line, this.url);
                    //newLines.push(`${this.corsProxy + "/" + url.href}`);
                    //newLines.push(`${this.corsProxy}/${this.config.web_server.url + "/ts_proxy?url=" + encodeURIComponent(url.href) + "&headers=" + encodeURIComponent(JSON.stringify(headers))}`)
                    newLines.push(`${this.config.web_server.url + "/ts_proxy?url=" + encodeURIComponent(url.href) + "&headers=" + encodeURIComponent(JSON.stringify(headers))}`);
                }
            }
            reply.header('Content-Type', 'application/vnd.apple.mpegurl');
            reply.header('Access-Control-Allow-Origin', '*');
            reply.header('Access-Control-Allow-Headers', '*');
            reply.header('Access-Control-Allow-Methods', '*');
            reply.send(newLines.join("\n"));
            return;
        }
    }
    async proxyTs(headers, reply) {
        const res = await this.fetch(this.url, {
            headers: headers,
        });
        const data = res.raw();
        reply.header('Content-Type', data.headers['content-type'] ?? 'video/mp2t');
        if (data.headers["content-length"]) {
            reply.header('Content-Length', data.headers["content-length"]);
        }
        if (data.headers["content-range"]) {
            reply.header('Content-Range', data.headers["content-range"]);
        }
        reply.send(data.data);
        return;
    }
}
exports.default = M3U8Proxy;
//# sourceMappingURL=M3U8Proxy.js.map
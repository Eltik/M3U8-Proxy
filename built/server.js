"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const dotenv_1 = __importDefault(require("dotenv"));
const M3U8Proxy_1 = __importDefault(require("./libraries/M3U8Proxy"));
const path_1 = require("path");
const fs_1 = require("fs");
const API_1 = __importDefault(require("./API"));
dotenv_1.default.config();
const api = new API_1.default();
const server = http_1.default.createServer((req, res) => {
    /*
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain");
    res.end("Hello, world!");
    */
});
server.on("request", async (req, res) => {
    const uri = new URL(req.url, "http://localhost:3000");
    if (uri.pathname === "/m3u8_proxy") {
        const headers = JSON.parse(uri.searchParams.get("headers"));
        const url = uri.searchParams.get("url");
        const proxy = new M3U8Proxy_1.default(url);
        await proxy.proxy(headers, res);
    }
    else if (uri.pathname === "/ts_proxy") {
        const headers = JSON.parse(uri.searchParams.get("headers"));
        const url = uri.searchParams.get("url");
        const proxy = new M3U8Proxy_1.default(url);
        await proxy.proxyTs(headers, req, res);
    }
    else if (uri.pathname === "/") {
        res.setHeader("Content-Type", "text/html");
        res.end((0, fs_1.readFileSync)((0, path_1.join)(__dirname, "../index.html")));
    }
});
server.listen(api.config.web_server.port, () => {
    console.log("Server running");
});
//# sourceMappingURL=server.js.map
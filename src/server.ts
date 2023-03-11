import http from "http";
import dotenv from "dotenv";
import M3U8Proxy from "./libraries/M3U8Proxy";
import { join } from "path";
import { readFileSync } from "fs";
import API from "./API";
import colors from "colors";

dotenv.config();

const api = new API();

const server = http.createServer();

server.on("request", async (req, res) => {
    const uri = new URL(req.url, "http://localhost:3000");
    if (uri.pathname === "/m3u8_proxy") {
        const headers = JSON.parse(uri.searchParams.get("headers"));
        const url = uri.searchParams.get("url");
        const proxy = new M3U8Proxy(url);
        await proxy.proxy(headers, res);
    } else if (uri.pathname === "/ts_proxy") {
        const headers = JSON.parse(uri.searchParams.get("headers"));
        const url = uri.searchParams.get("url");
        const proxy = new M3U8Proxy(url);
        await proxy.proxyTs(headers, req, res);
    } else if (uri.pathname === "/") {
        res.setHeader("Content-Type", "text/html");
        res.end(readFileSync(join(__dirname, "../index.html")));
    }
});

server.listen(api.config.web_server.port, () => {
    console.log(colors.green("Server running on ") + colors.blue(`http://localhost:${api.config.web_server.port}`));
});
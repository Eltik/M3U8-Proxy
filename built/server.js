"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const colors_1 = __importDefault(require("colors"));
const M3U8Proxy_1 = __importDefault(require("./libraries/M3U8Proxy"));
const path_1 = require("path");
const fs_1 = require("fs");
const API_1 = __importDefault(require("./API"));
const api = new API_1.default();
const fastify = (0, fastify_1.default)({
    logger: false
});
const fastifyPlugins = [];
const corsPlugin = new Promise((resolve, reject) => {
    fastify.register(cors_1.default, {
        origin: ['*'],
        methods: ['POST', 'GET', 'PATCH', 'DELETE', 'OPTIONS'],
    }).then(() => {
        resolve(true);
    });
});
fastifyPlugins.push(corsPlugin);
fastify.get("/", async (req, res) => {
    res.type("application/json").code(200);
    return `
    Welcome to M3U8-Proxy.\n
    ---------------------\n
    API Documentation:\n
    ---------------------\n
    `;
});
/**
 * @description Proxy for m3u8 files
 * @example /m3u8_proxy?url=https://example.com/file.m3u8&headers={"referer":"https://example.com"}
 */
fastify.get("/m3u8_proxy*", async (req, res) => {
    const url = req.query["url"];
    let headers = decodeURIComponent(req.query["headers"]);
    try {
        headers = JSON.parse(headers);
    }
    catch {
        res.type("application/json").code(400);
        return { error: "Invalid headers." };
    }
    if (!url || url.length === 0) {
        res.type("application/json").code(400);
        return { error: "Invalid URL." };
    }
    const m3u8Proxy = new M3U8Proxy_1.default(url);
    await m3u8Proxy.proxy(headers, res);
});
// temp
fastify.get("/test", (req, res) => {
    const file = (0, fs_1.readFileSync)((0, path_1.join)(__dirname, "../index.html"));
    res.type("text/html").send(file);
});
Promise.all(fastifyPlugins).then(() => {
    fastify.listen({ port: api.config.web_server.port }, (err, address) => {
        if (err)
            throw err;
        console.log(colors_1.default.gray(`Running on `) + colors_1.default.blue(`${address}`));
    });
});
//# sourceMappingURL=server.js.map
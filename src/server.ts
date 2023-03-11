import Fastify from "fastify";
import cors from '@fastify/cors';
import colors from "colors";
import M3U8Proxy from "./libraries/M3U8Proxy";
import { join } from "path";
import { readFileSync } from "fs";
import API from "./API";

const api = new API();

const fastify = Fastify({
    logger: false
});

const fastifyPlugins = [];

const corsPlugin = new Promise((resolve, reject) => {
    fastify.register(cors, {
        origin: ['*'],
        methods: ['POST', 'GET', 'PATCH', 'DELETE', 'OPTIONS'],
    }).then(() => {
        resolve(true);
    })
});

fastifyPlugins.push(corsPlugin);

fastify.get("/", async(req, res) => {
    res.type("application/json").code(200);
    return `
    Welcome to Eltik's M3U8-Proxy.\n
    Please note that spamming this API will result in an IP ban.\n
    ---------------------\n
    API Documentation:\n
    GET /test - Test page.\n
    GET /m3u8_proxy?url={url}&headers={headers} - Proxy for m3u8 files. {url} must be encoded and {headers} must be encoded stringified JSON.\n
    ---------------------\n
    An example of a request to /m3u8_proxy would be:\n
    /m3u8_proxy?url=https%3A%2F%2Fexample.com%2Ffile.m3u8&headers=%7B%22referer%22%3A%22https%3A%2F%2Fexample.com%22%7D\n
    ---------------------\n
    GitHub Repo: https://github.com/Eltik/M3U8-Proxy\n
    `;
})

/**
 * @description Proxy for m3u8 files
 * @example /m3u8_proxy?url=https://example.com/file.m3u8&headers={"referer":"https://example.com"}
 */
fastify.get("/m3u8_proxy*", async(req, res) => {
    const url = req.query["url"]
    let headers = decodeURIComponent(req.query["headers"]);
    try {
        headers = JSON.parse(headers);
    } catch {
        res.type("application/json").code(400);
        return { error: "Invalid headers." };
    }
    if (!url || url.length === 0) {
        res.type("application/json").code(400);
        return { error: "Invalid URL." };
    }
    const m3u8Proxy = new M3U8Proxy(url);
    await m3u8Proxy.proxy(headers, res);
})

// temp
fastify.get("/test", (req, res) => {
    const file = readFileSync(join(__dirname, "../index.html"));
    res.type("text/html").send(file);
})

Promise.all(fastifyPlugins).then(() => {
    fastify.listen({ port: api.config.web_server.port }, (err, address) => {
        if (err) throw err;
        console.log(colors.gray(`Running on `) + colors.blue(`${address}`));
    })
})
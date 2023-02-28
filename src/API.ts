import PromiseRequest, { Options, Response } from "./libraries/promise-request";
import { ReadStream, WriteStream } from "fs";

export default class API {
    public sentRequests:SentRequest[] = [];

    private userAgent:string = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36';
    
    public static config = {
        web_server: {
            url: "http://localhost:3060",
            port: 3060
        },
        cors_proxy: "https://cors.consumet.stream"
    }

    constructor(options?) {
        this.loadConfig(options);
    }

    public loadConfig(options?) {
        if (process.env.WEB_SERVER_URL) {
            this.config.web_server.url = process.env.WEB_SERVER_URL;
        }
        if (process.env.WEB_SERVER_PORT) {
            this.config.web_server.port = Number(process.env.WEB_SERVER_PORT);
        }
        if (process.env.CORS_PROXY) {
            this.config.cors_proxy = process.env.CORS_PROXY;
        }

        if (options) {
            this.config = {
                ...this.config,
                ...options
            }
        }
    }

    public async fetch(url:string, options?:Options): Promise<Response> {
        const request = new PromiseRequest(url, {
            ...options,
            headers: {
                ...options?.headers,
                'User-Agent': this.userAgent
            }
        });

        const possible = this.getCachedRequest(url, options);
        if (!possible) {
            const data = await request.request();

            this.sentRequests.push({
                url: url,
                options: options,
                sent: new Date(Date.now()).getTime(),
                response: data
            })
            return data;
        } else {
            return possible;
        }
    }

    public getCachedRequest(url:string, options?:Options):Response {
        let res:SentRequest = null;
        
        const toRemove = [];
        for (let i = 0; i < this.sentRequests.length; i++) {
            const req = this.sentRequests[i];
            if (req.url === url) {
                let isCached = false;
                if (options && req.options) {
                    if (options.body) {
                        if (options.body === req.options.body) {
                            isCached = true;
                        }
                    } else {
                        isCached = true;
                    }
                } else {
                    isCached = true;
                }
                if (isCached) {
                    const now = new Date(Date.now());
                    if (now.getTime() - req.sent > 3600000) { // 1 hour
                        toRemove.push(i);
                    } else {
                        res = req;
                    }
                }
            }
        }

        for (let i = 0; i < toRemove.length; i++) {
            this.sentRequests.splice(toRemove[i], 1);
        }

        if (res != null && res.response.status === 200) {
            return res.response;
        }
    }

    public async stream(url:string, stream:ReadableStream|WritableStream|ReadStream|WriteStream, options?:Options) {
        const request = new PromiseRequest(url, {
            ...options,
            stream: true,
            headers: {
                ...options?.headers,
                'User-Agent': this.userAgent
            }
        });
        const final = await request.stream(stream).catch((err) => {
            console.error(err);
            return null;
        });
        return final;
    }

    public async wait(time:number) {
        return new Promise(resolve => {
            setTimeout(resolve, time);
        });
    }

    public static async wait(time:number) {
        return new Promise(resolve => {
            setTimeout(resolve, time);
        });
    }

    public getRandomInt(max):number {
        return Math.floor(Math.random() * max);
    }

    public makeId(length) {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() *
                charactersLength));
        }
        return result;
    }

    public stringSearch(string:string, pattern:string):number {
        let count = 0;
        string = string.toLowerCase();
        pattern = pattern.toLowerCase();
        string = string.replace(/[^a-zA-Z0-9 -]/g, "");
        pattern = pattern.replace(/[^a-zA-Z0-9 -]/g, "");
        
        for (let i = 0; i < string.length; i++) {
            for (let j = 0; j < pattern.length; j++) {
                if (pattern[j] !== string[i + j]) break;
                if (j === pattern.length - 1) count++;
            }
        }
        return count;
    }
}

interface SentRequest {
    url: string;
    sent: number;
    options: Options;
    response: Response;
}

export type { SentRequest };
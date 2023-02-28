"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const node_stream_1 = require("node:stream");
const node_util_1 = require("node:util");
class PromiseRequest {
    constructor(url, options) {
        this.corsProxy = process.env.CORS_PROXY + "/" || "https://cors.consume.stream/";
        this.url = url;
        this.options = options;
    }
    async request() {
        return new Promise((resolve, reject) => {
            try {
                if (this.options.stream) {
                    throw new Error("Use the stream() function instead.");
                }
                else {
                    let options = {
                        ...this.options,
                    };
                    if (options.body != undefined) {
                        options = {
                            ...options,
                            data: this.options.body
                        };
                    }
                    if (options.responseType != undefined) {
                        options = {
                            ...options,
                            responseType: this.options.responseType
                        };
                    }
                    if (options.useCorsProxy) {
                        this.url = this.corsProxy + this.url;
                    }
                    (0, axios_1.default)(this.url, options).then(async (response) => {
                        const request = {
                            url: this.url,
                            options: this.options
                        };
                        let redirectUrl = this.url;
                        try {
                            redirectUrl = new URL(response.request.responseURL).href;
                        }
                        catch {
                            redirectUrl = this.url;
                        }
                        const text = response.data;
                        let json = response.data;
                        try {
                            json = JSON.parse(response.data);
                        }
                        catch {
                            json = response.data;
                        }
                        const stringified = `Status: ${response.status} ${response.statusText}\nURL: ${this.url}\nHeaders: ${JSON.stringify(response.headers)}\nBody: ${JSON.stringify(text)}`;
                        const res = {
                            request,
                            status: response.status,
                            statusText: response.statusText,
                            url: redirectUrl,
                            error: [],
                            headers: response.headers,
                            toString: () => stringified,
                            raw: () => response,
                            text: () => text,
                            json: () => json
                        };
                        resolve(res);
                    }).catch((err) => {
                        reject(err);
                    });
                }
            }
            catch (e) {
                console.error(e.message);
            }
        });
    }
    async stream(stream) {
        return new Promise((resolve, reject) => {
            try {
                let options = {
                    ...this.options,
                };
                if (options.body != undefined) {
                    options = {
                        ...options,
                        data: this.options.body
                    };
                }
                if (options.useCorsProxy) {
                    this.url = this.corsProxy + this.url;
                }
                (0, axios_1.default)(this.url, {
                    ...this.options,
                    responseType: "stream"
                }).then((response) => {
                    if (response.statusText != "OK")
                        console.error(`unexpected response ${response.statusText}`);
                    const streamPipeline = (0, node_util_1.promisify)(node_stream_1.pipeline);
                    streamPipeline(response.data, stream).then(() => {
                        resolve(true);
                    }).catch((err) => {
                        reject(err);
                    });
                }).catch((err) => {
                    reject(err);
                });
            }
            catch {
                console.error("Error with streaming.");
            }
        });
    }
}
exports.default = PromiseRequest;
;
;
//# sourceMappingURL=promise-request.js.map
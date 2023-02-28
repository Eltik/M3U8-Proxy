import axios from "axios";
import { AxiosProxyConfig } from "axios";
import { pipeline } from 'node:stream';
import { promisify } from 'node:util';
import API from "../API";

export default class PromiseRequest {
    private url: string;
    private options: Options;
    private corsProxy:string = API.config.cors_proxy + "/";

    constructor(url:string, options:Options) {
        this.url = url;
        this.options = options;
    }

    public async request(): Promise<Response> {
        return new Promise((resolve, reject) => {
            try {
                if (this.options.stream) {
                    throw new Error("Use the stream() function instead.");
                } else {
                    let options:any = {
                        ...this.options,
                    };
                    if (options.body != undefined) {
                        options = {
                            ...options,
                            data: this.options.body
                        }
                    }
                    if (options.responseType != undefined) {
                        options = {
                            ...options,
                            responseType: this.options.responseType
                        }
                    }

                    
                    if (options.useCorsProxy) {
                        this.url = this.corsProxy + this.url;
                    }
                    axios(this.url, options).then(async(response) => {
                        const request:Request = {
                            url: this.url,
                            options: this.options
                        };

                        let redirectUrl = this.url;
                        try {
                            redirectUrl = new URL(response.request.responseURL).href;
                        } catch {
                            redirectUrl = this.url;
                        }

                        const text = response.data;
                        let json = response.data;
                        try {
                            json = JSON.parse(response.data);
                        } catch {
                            json = response.data;
                        }

                        const stringified = `Status: ${response.status} ${response.statusText}\nURL: ${this.url}\nHeaders: ${JSON.stringify(response.headers)}\nBody: ${JSON.stringify(text)}`;
        
                        const res:Response = {
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
            } catch (e) {
                console.error(e.message);
            }
        });
    }

    public async stream(stream) {
        return new Promise((resolve, reject) => {
            try {
                let options:any = {
                    ...this.options,
                };
                if (options.body != undefined) {
                    options = {
                        ...options,
                        data: this.options.body
                    }
                }
                
                if (options.useCorsProxy) {
                    this.url = this.corsProxy + this.url;
                }
                axios(this.url, {
                    ...this.options,
                    responseType: "stream"
                }).then((response) => {
                    if (response.statusText != "OK") console.error(`unexpected response ${response.statusText}`);
                    const streamPipeline = promisify(pipeline);
                    streamPipeline(response.data, stream).then(() => {
                        resolve(true);
                    }).catch((err) => {
                        reject(err);
                    });
                }).catch((err) => {
                    reject(err);
                });
            } catch {
                console.error("Error with streaming.");
            }
        })
    }
}

type Options = {
    method?: string;
    headers?: { [key: string]: string };
    body?: string|URLSearchParams|FormData|any;
    maxRedirects?: number;
    stream?: boolean;
    responseType?: string;
    proxy?: AxiosProxyConfig | false;
    httpsAgent?: any;
    useCloudFlare?: boolean;
    useCorsProxy?: boolean;
};

interface Response {
    request: Request;
    status: number;
    statusText: string;
    url: string;
    error: string[];
    headers: { [key: string]: string }|Headers;
    toString: ()=>string;
    raw: ()=>any;
    text: ()=>string;
    json: ()=>any;
};

interface Request {
    url: string;
    options: Options;
};

export type { Options, Response, Request };
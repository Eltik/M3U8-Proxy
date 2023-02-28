/// <reference types="node" />
import { Options, Response } from "./libraries/promise-request";
import { ReadStream, WriteStream } from "fs";
export default class API {
    sentRequests: SentRequest[];
    private userAgent;
    static config: {
        web_server: {
            url: string;
            port: number;
        };
        cors_proxy: string;
    };
    config: {
        web_server: {
            url: string;
            port: number;
        };
        cors_proxy: string;
    };
    constructor(options?: any);
    loadConfig(options?: any): void;
    fetch(url: string, options?: Options): Promise<Response>;
    getCachedRequest(url: string, options?: Options): Response;
    stream(url: string, stream: ReadableStream | WritableStream | ReadStream | WriteStream, options?: Options): Promise<unknown>;
    wait(time: number): Promise<unknown>;
    static wait(time: number): Promise<unknown>;
    getRandomInt(max: any): number;
    makeId(length: any): string;
    stringSearch(string: string, pattern: string): number;
}
interface SentRequest {
    url: string;
    sent: number;
    options: Options;
    response: Response;
}
export type { SentRequest };

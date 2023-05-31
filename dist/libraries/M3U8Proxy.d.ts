/// <reference types="node" />
import http from "http";
export declare const web_server_url: string;
/**
 * @description Proxies m3u8 files and replaces the content to point to the proxy.
 * @param headers JSON headers
 * @param res Server response object
 */
export declare function proxy(url: string, headers: any, res: http.ServerResponse): Promise<void>;
/**
 * @description Proxies TS files. Sometimes TS files require headers to be sent with the request.
 * @param headers JSON headers
 * @param req Client request object
 * @param res Server response object
 */
export declare function proxyTs(url: string, headers: any, req: any, res: http.ServerResponse): Promise<null | undefined>;

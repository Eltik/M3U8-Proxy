/**
 * @author Eltik. Credit to CORS proxy by Rob Wu.
 * @description Proxies m3u8 files.
 * @license MIT
 */
/// <reference types="node" />
import http from "node:http";
export default function server(): void;
/**
 * @description Proxies m3u8 files and replaces the content to point to the proxy.
 * @param headers JSON headers
 * @param res Server response object
 */
export declare function proxyM3U8(url: string, headers: any, res: http.ServerResponse): Promise<void>;
/**
 * @description Proxies TS files. Sometimes TS files require headers to be sent with the request.
 * @param headers JSON headers
 * @param req Client request object
 * @param res Server response object
 */
export declare function proxyTs(url: string, headers: any, req: any, res: http.ServerResponse): Promise<null | undefined>;

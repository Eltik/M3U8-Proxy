/// <reference types="node" />
import API from "../API";
import http from "http";
export default class M3U8Proxy extends API {
    private url;
    private corsProxy;
    constructor(url: string);
    /**
     * @description Proxies m3u8 files and replaces the content to point to the proxy.
     * @param headers JSON headers
     * @param res Server response object
     */
    proxy(headers: any, res: http.ServerResponse): Promise<void>;
    /**
     * @description Proxies TS files. Sometimes TS files require headers to be sent with the request.
     * @param headers JSON headers
     * @param req Client request object
     * @param res Server response object
     */
    proxyTs(headers: any, req: any, res: http.ServerResponse): Promise<any>;
}

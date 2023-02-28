import API from "../API";
export default class M3U8Proxy extends API {
    private url;
    private corsProxy;
    constructor(url: string);
    proxy(headers: any, reply: any): Promise<void>;
}

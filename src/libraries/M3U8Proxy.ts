import API from "../API";

export default class M3U8Proxy extends API {
    private url:string = "";
    private corsProxy:string = this.config.cors_proxy;

    constructor(url:string) {
        super();
        this.url = url;
    }

    public async proxy(headers:any, reply:any) {
        const res = await this.fetch(this.url, {
            headers: headers,
        });
        const m3u8 = res.text();
        if (m3u8.includes("RESOLUTION=")) {
            // Master m3u8
            const lines = m3u8.split("\n");
            const newLines = [];
            for (const line of lines) {
                if (line.startsWith("#")) {
                    newLines.push(line);
                } else {
                    const url = new URL(line, this.url);
                    newLines.push(`${this.config.web_server.url + "/m3u8_proxy?url=" + encodeURIComponent(url.href) + "&headers=" + JSON.stringify(encodeURIComponent(headers))}`);
                }
            }
            reply.header('Content-Type', 'application/vnd.apple.mpegurl');
            reply.header('Access-Control-Allow-Origin', '*');
            reply.header('Access-Control-Allow-Headers', '*');
            reply.header('Access-Control-Allow-Methods', '*');
            reply.send(newLines.join("\n"));
            return;
        } else {
            // Individual files
            const lines = m3u8.split("\n");
            const newLines = [];
            for (const line of lines) {
                if (line.startsWith("#")) {
                    newLines.push(line);
                } else {
                    const url = new URL(line, this.url);
                    newLines.push(`${this.corsProxy + "/" + url.href}`);
                }
            }
            reply.header('Content-Type', 'application/vnd.apple.mpegurl');
            reply.header('Access-Control-Allow-Origin', '*');
            reply.header('Access-Control-Allow-Headers', '*');
            reply.header('Access-Control-Allow-Methods', '*');
            reply.send(newLines.join("\n"));
            return;
        }
    }
}
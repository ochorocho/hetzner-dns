import * as fs from "https://deno.land/std@0.185.0/fs/mod.ts";
import * as path from "https://deno.land/std@0.185.0/path/mod.ts";
// NPM specifiers not supported yet! See https://github.com/denoland/deno/issues/15960
import prompts from "https://esm.sh/prompts@2.4.2";

export default class Config {
    path: string

    constructor() {
        this.path = Deno.env.get("HOME") + "/.hetzner/config.json";
    }

    read() {
        const decoder = new TextDecoder("utf-8");
        const data = Deno.readFileSync(this.path);
        return JSON.parse(decoder.decode(data))
    }

    write(config: Record<string, unknown>) {
        try {
            fs.ensureDir(path.dirname(this.path))
            Deno.create(this.path).then(() => {
                Deno.writeTextFile(this.path, JSON.stringify(config, null, 2))
            })
        } catch(e) {
            console.log(e);
        }
    }

    isConfigured() {
        if(fs.existsSync(this.path)) {
            return true
        }

        console.log(`%cℹ️  No config file found at "${this.path}". Please run 'hetzner config'`, "color:red")
        return false
    }

    ask() {
        (async () => {
            const config = await prompts([
                {
                    type: "text",
                    name: "api",
                    message: "API url?",
                    initial: "https://dns.hetzner.com/api/v1/"
                }, {
                      type: "password",
                      name: "token",
                      message: "API token?"
                }, {
                    type: 'list',
                    name: 'domains',
                    message: 'List of domains to update (comma seperated)',
                    initial: '',
                    separator: ','
                }, {
                    type: "text",
                    name: "log",
                    message: "Logile path?",
                    initial: "/var/log/hetzner.log"
                }
            ]);

            this.write(config)
          })();
    }
}

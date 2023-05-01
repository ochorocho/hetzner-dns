import * as fs from "https://deno.land/std@0.185.0/fs/mod.ts";
import * as path from "https://deno.land/std@0.185.0/path/mod.ts";
import * as log from "https://deno.land/std@0.185.0/log/mod.ts";
import Logger from "./logger.ts";
// NPM specifiers not supported yet! See https://github.com/denoland/deno/issues/15960
import prompts from "https://esm.sh/prompts@2.4.2";
import Ajv, { ErrorObject } from "https://esm.sh/ajv@8.6.1";

interface ConfigType {
  api: URL;
  token: string;
  domains: Array<string>;
}

export default class Config {
  path: string;
  logger = log

  constructor() {
    this.path = Deno.env.get("HOME") + "/.hetzner/config.json";
    this.logger = new Logger("DEBUG").get();
  }

  read() {
    const decoder = new TextDecoder("utf-8");
    const data = Deno.readFileSync(this.path);
    return <ConfigType> JSON.parse(decoder.decode(data));
  }

  schema() {
    const decoder = new TextDecoder("utf-8");
    const data = Deno.readFileSync("./schema/config.json");
    return <ConfigType> JSON.parse(decoder.decode(data));
  }

  write(config: Record<string, unknown>) {
    try {
      fs.ensureDir(path.dirname(this.path));
      Deno.create(this.path).then(() => {
        Deno.writeTextFile(this.path, JSON.stringify(config, null, 2));
      });
    } catch (e) {
      this.logger.error(e)
    }
  }

  isConfigured() {
    const ajv = new Ajv({ allErrors: true });
    const validate = ajv.compile(this.schema());

    if (!fs.existsSync(this.path)) {
      this.logger.info(`ℹ️  No config file found at "${this.path}". Please run 'hetzner config'`,);

      return false;
    }

    const valid = validate(this.read());
    if (!valid) {
      this.logger.warning("Config validation failed:");
      validate.errors?.forEach((error: ErrorObject) => {
        let path = "";
        if (error.instancePath !== "") {
          path = error.instancePath.replace(/^\/|\/$/g, "") + " - ";
        }

        this.logger.warning("* " + path + error.message);
      });

      return false;
    }

    return true;
  }

  ask() {
    (async () => {
      const config = await prompts([
        {
          type: "text",
          name: "api",
          message: "API url?",
          initial: "https://dns.hetzner.com/api/v1/",
        },
        {
          type: "password",
          name: "token",
          message: "API token?",
        },
        {
          type: "list",
          name: "domains",
          message: "List of domains to update (comma seperated)",
          initial: "",
          separator: ",",
        },
      ]);

      this.write(config);
    })();
  }
}

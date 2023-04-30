import * as log from "https://deno.land/std@0.185.0/log/mod.ts";
import { LevelName } from "https://deno.land/std@0.185.0/log/mod.ts";

export default class Logger {
  path: string;
  logger = log;
  level: LevelName;

  constructor(level: LevelName = "DEBUG") {
    this.path = Deno.env.get("HOME") + "/.hetzner/api.log";
    this.level = level;
    this.setup();
  }

  setup() {
    this.logger.setup({
      handlers: {
        console: new log.handlers.ConsoleHandler("DEBUG", {
          formatter: (rec) => `${rec.msg}`,
        }),
        file: new log.handlers.FileHandler("DEBUG", {
          filename: this.path,
          formatter: (rec) =>
            `[${rec.datetime.toISOString()}] ${rec.levelName} - ${rec.msg}`,
        }),
      },

      loggers: {
        default: {
          level: `${this.level}`,
          handlers: ["console", "file"],
        },
      },
    });
  }

  get() {
    return this.logger;
  }
}

import Config from "./config.ts";
import Logger from "./logger.ts";
import Api from "./api.ts";
import Domain from "./domain.ts";
import { Zone, ZoneRecord } from "./types/zone.ts";
import { getIP } from "https://deno.land/x/get_ip/mod.ts";

const config = new Config();
const args = Deno.args;

if (args[0] === "config") {
  await config.ask();
}

if (args[0] === "update") {
  if (!config.isConfigured()) {
    Deno.exit(5);
  }

  const settings = config.read();
  const logger = new Logger("DEBUG").get();
  const api = new Api(settings.api, settings.token, settings.domains);
  const updateZones = await api.zones();

  updateZones.forEach((zone: Zone) => {
    const domain = new Domain(zone.id, zone.domains, api)
    const wanted = domain.all();
    domain.toUpdate(wanted, zone).then((update: Array<ZoneRecord>) => {
        console.log(update)
    })
  })

  //   // If we have more than one item, throw an error.
  //   console.log(url.slice(0,-2))
  //   console.log(await getIP({ipv6: false}))
}

/**
 * Show command details
 */
if (args[0] === undefined || args[0] === "--help") {
  console.log("%cDescription:", "font-weight:bold");
  console.log(
    "Using Hetzner DNS console API to update the IP address of the given domain with your local public IP address\n",
  );
  console.log("%cCommand arguments:\n", "color:green;font-weight:bold");

  const message = [];
  message.push("  * 'config': Run configuration");
  message.push(
    "  * 'update': Update IP of given domains with the current public ip address",
  );

  console.log(message.join("\n") + "\n");
}

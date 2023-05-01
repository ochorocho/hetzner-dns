import Config from "./config.ts";
import Logger from "./logger.ts";
import Api from "./api.ts";
import Domain from "./domain.ts";
import { ZoneRecord } from "./types/zone.ts";
import { getIP } from "https://deno.land/x/get_ip/mod.ts";

const config = new Config();
const args = Deno.args;

/**
 * Run interactive configuration
 */
if (args[0] === "config") {
  config.ask();
}

/**
 * Update records
 */
if (args[0] === "update") {
  if (!config.isConfigured()) {
    Deno.exit(5);
  }

  const settings = config.read();
  const logger = new Logger("DEBUG").get();
  const api = new Api(settings.api, settings.token);
  const updateZones = await api.zones(settings.domains);

  let updateRecords: Array<ZoneRecord> = [];

  for (const zone of updateZones) {
    const domain = new Domain(zone.id, zone.domains);
    const wanted = domain.all();
    const allRecords = await api.records(zone.id);
    const records = domain.toUpdate(zone.id, wanted, allRecords);
    updateRecords = [...updateRecords, ...records];
  }

  const currentPublicIp: string = await getIP({ ipv6: false });

  updateRecords.forEach((record: ZoneRecord, index) => {
    setTimeout(function(){
      if (record.ip === currentPublicIp) {
        logger.debug(`IP address for '${record.name}' (${record.ip}) did not changed. Not updating`);
      } else if (record.ip === "") {
        api.createRecord(record, currentPublicIp)
      } else {
        api.updateRecord(record, currentPublicIp)
      }
    }, 100 * (index + 1));
  });
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

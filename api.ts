import { join } from "https://deno.land/std/path/mod.ts";
import { Zone, ZoneRecord } from "./types/zone.ts";
import Logger from "./logger.ts";
import * as log from "https://deno.land/std@0.185.0/log/mod.ts";

export default class Api {
  url: URL;
  token: string;
  logger = log

  constructor(url: URL, token: string) {
    this.url = url;
    this.token = token;
    this.logger = new Logger("DEBUG").get();
  }

  async zones(domains: Array<string>) {
    const response: Response = await this.request("zones");
    const zones = await response.json();

    const updateZones: Array<Zone> = [];
    zones.zones.forEach((zone: Zone) => {
      const hasKeyWithSubstring = domains.some((key: string) =>
        key.includes(zone.name)
      );

      if (hasKeyWithSubstring) {
        const result: string[] = domains.filter((item: string) =>
          item.includes(zone.name)
        );
        const zoneItem: Zone = {
          id: zone.id,
          name: zone.name,
          domains: result,
        };

        updateZones.push(zoneItem);
      }
    });

    return updateZones;
  }

  /**
   * Get all A records
   *
   * @todo: Support AAAA Records (IPv6)
   */
  async records(zoneId: string) {
    const response: Response = await this.request(`records?zone_id=${zoneId}`);
    const records = await response.json();

    const aRecords: Array<ZoneRecord> = [];
    records.records.forEach((currentRecord: Record<string, string>) => {
      if (currentRecord.type === "A") {
        const record: ZoneRecord = {
          name: currentRecord.name,
          id: currentRecord.id,
          zoneId: zoneId,
          ip: currentRecord.value,
        };
        aRecords.push(record);
      }
    });

    return aRecords;
  }

  createRecord(record: ZoneRecord, ipAddress: string) {
    const payload = {
      value: ipAddress,
      ttl: 60,
      type: 'A',
      name: record.name,
      zone_id: record.zoneId
    }

    this.request(`records`, "POST", payload).then((response: any) => {
      if(response.status === 200) {
        const json: any = response.json()
        json.then((data: any) => {
          if(!data.error && data.record) {
            this.logger.info(`Create '${record.name}' and set IP address to ${ipAddress}`);
          } else {
            this.logger.error(`Failed to create '${record.name}' (${record.zoneId}) - ${data.error.message}`)
          }
        })
      }
    })
  }

  updateRecord(record: ZoneRecord, ipAddress: string) {
    const payload = {
      value: ipAddress,
      ttl: 60,
      type: 'A',
      name: record.name,
      zone_id: record.zoneId
    }

    this.request(`records/${record.id}`, "PUT", payload).then((response: Response) => {
      if(response.status === 200) {
        const json: any = response.json()
        json.then((data: any) => {
          if(!data.error && data.record) {
            this.logger.info(`Update '${record.name}' and set IP address to ${ipAddress}`);
          } else {
            this.logger.error(`Failed to update '${record.name}' (${record.zoneId}) - ${data.error.message}`)
          }
        })
      }
    })
  }

  private request(type: string, method = "GET", payload = {}) {
    const requestUrl = join(this.url.toString(), type);
    const options: RequestInit = {
      method: method,
      headers: {
        "Auth-API-Token": this.token,
      },
    };

    if (method === "POST" || method === "PUT") {
      options.body = JSON.stringify(payload);
    }

    return fetch(requestUrl, options).then((response: Response) => {
      if(response.status !== 200) {
        this.logger.error(`API request for '${type}' with method '${method}' failed: ${response.status} ${response.statusText}`);
      }

      return response
    });
  }
}

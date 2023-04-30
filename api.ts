import { join } from "https://deno.land/std/path/mod.ts";
import { Zone, ZoneRecord } from "./types/zone.ts";

export default class Api {
    url: URL
    token: string
    domains: Array<string>
    constructor(url: URL, token: string, domains: Array<string>) {
        this.url = url
        this.token = token
        this.domains = domains
    }

    async zones() {
        const zones = await this.request('zones')

        const updateZones: Array<Zone> = [];
        zones.zones.forEach((zone: Zone) => {
            const hasKeyWithSubstring = this.domains.some((key: string) =>
                key.includes(zone.name)
            );

            if (hasKeyWithSubstring) {
            const result: string[] = this.domains.filter((item: string) =>
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

        return updateZones
    }

    /**
     * Get all A records
     * 
     * @todo: Support AAAA Records (IPv6)
     */
    async records(zoneId: string) {
        const records = await this.request(`records?zone_id=${zoneId}`)
        const aRecords: Array<ZoneRecord> = [];
        records.records.forEach((currentRecord: Record<string, string>) => {
            if (currentRecord.type === "A") {
              const record: ZoneRecord = {
                name: currentRecord.name,
                id: currentRecord.id,
                zone_id: zoneId
              };
              aRecords.push(record);
            }
          });
      
          return aRecords
    }

    private async request(type: string, method = "GET", payload = {}) {
        const requestUrl = join(this.url.toString(), type)
        const options: RequestInit = {
            method: method,
            headers: {
                'Auth-API-Token': this.token
            }
        }

        if(method === "POST") {
            options.body = JSON.stringify(payload)
        }

        const jsonResponse = await fetch(requestUrl, options);

        return jsonResponse.json();
    }
}
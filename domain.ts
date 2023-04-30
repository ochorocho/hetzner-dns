import Api from "./api.ts";
import { Zone, ZoneRecord } from "./types/zone.ts";
export default class Domain {
    zoneId: string
    domains: Array<string>
    api: Api

    constructor(zoneId: string, domains: Array<string>, api: Api) {
        this.zoneId = zoneId
        this.domains = domains
        this.api = api
    }

    all() {
        const records: Array<string> = []
        this.domains.forEach((domain) => {
            records.push(this.get(domain))
        })

        return records
    }

    get(url: string) {
        return url.split('.').slice(0,-2).join('.')
    }

    async toUpdate(wanted: Array<string>, zone: Zone) {
        const records: Array<ZoneRecord> = await this.api.records(zone.id)
    
        let updateOrCreate: Array<ZoneRecord> = [];
        wanted.forEach((subdomain) => {
            const found = records.filter((record) =>
                subdomain.includes(record.name)
            );
            if (found.length === 0) {
                const zoneRecord: ZoneRecord = {
                    name: subdomain,
                    id: "",
                    zone_id: zone.id
                };

                updateOrCreate.push(zoneRecord);
            } else {
                updateOrCreate = [...updateOrCreate, ...found];
            }
        });

        return updateOrCreate
    }
}
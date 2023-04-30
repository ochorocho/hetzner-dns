import { ZoneRecord } from "./types/zone.ts";

export default class Domain {
  zoneId: string;
  domains: Array<string>;

  constructor(zoneId: string, domains: Array<string>) {
    this.zoneId = zoneId;
    this.domains = domains;
  }

  all() {
    const records: Array<string> = [];
    this.domains.forEach((domain) => {
      records.push(domain.split(".").slice(0, -2).join("."));
    });

    return records;
  }

  toUpdate(zoneId: string, wanted: Array<string>, records: Array<ZoneRecord>) {
    let updateOrCreate: Array<ZoneRecord> = [];
    wanted.forEach((subdomain) => {
      const found = records.filter((record) => subdomain.includes(record.name));
      if (found.length === 0) {
        const zoneRecord: ZoneRecord = {
          name: subdomain,
          id: "",
          zoneId: zoneId,
          ip: "",
        };

        updateOrCreate.push(zoneRecord);
      } else {
        updateOrCreate = [...updateOrCreate, ...found];
      }
    });

    return updateOrCreate;
  }
}

export interface Zone {
  name: string;
  id: string;
  domains: Array<string>;
}

export interface ZoneRecord {
  name: string;
  id: string;
  zone_id: string;
}

import { assertEquals } from "https://deno.land/std@0.185.0/testing/asserts.ts";
import Domain from "./domain.ts";
import { ZoneRecord } from "./types/zone.ts";

Deno.test("Domain get all subdomains", () => {
  const domain = new Domain("zone_id", ['sub.example.com', 'another.example.com', 'sub.sub.example.com']);
  const allSubDomains = domain.all();

  assertEquals(allSubDomains, [ "sub", "another", "sub.sub" ]);
});

Deno.test("Domain get toUpdate", () => {
  const domain = new Domain("zone_id", ['sub.example.com', 'sub.sub.example.com']);
  const allSubDomains = domain.all();
  const allRecords: Array<ZoneRecord> = [
    {
      id: "id_1",
      name: "sub",
      zoneId: "zone_id",
      ip: "127.0.0.1"
    },
    {
      id: "id_2",
      name: "sub.sub",
      zoneId: "zone_id",
      ip: "127.0.0.1"
    },
    {
      id: "id_3",
      name: "does.not.exist",
      zoneId: "zone_id",
      ip: "127.0.0.1"
    }
  ]

  const update = domain.toUpdate(allSubDomains, allRecords);

  assertEquals(update, [
    { id: "id_1", name: "sub", zoneId: "zone_id", ip: "127.0.0.1" },
    { id: "id_2", name: "sub.sub", zoneId: "zone_id", ip: "127.0.0.1" }
  ]);
});

import api from "../api";
import { AnchorPoint } from "../anchorpoints/anchorPointService";
import { City, CityImage } from "../cities/citiesService";
import { Route } from "../routes/routeService";
import { Stamp } from "../stamps/stampService";
import { getDatabase, runWithTransaction, runReadOnly } from "./database";

function parseCoordinate(val1: any, val2: any): number {
  const extractNum = (v: any): number => {
    if (v === undefined || v === null || v === "") return NaN;
    if (typeof v === "number") return isNaN(v) ? NaN : v;
    if (typeof v === "object" && v !== null) {
      if (typeof v.toNumber === "function") {
        try {
          const res = v.toNumber();
          if (typeof res === "number" && !isNaN(res)) return res;
        } catch {}
      }
      if ("d" in v && "s" in v && Array.isArray(v.d) && v.d.length > 0) {
        const sign = v.s < 0 ? -1 : 1;
        const mainPart = Number(v.d[0]);
        let fracPart = 0;
        if (v.d.length > 1 && v.d[1] !== undefined) {
          const fracStr = String(v.d[1]);
          fracPart = Number(v.d[1]) / Math.pow(10, fracStr.length);
        }
        const parsedDecimal = sign * (mainPart + fracPart);
        if (!isNaN(parsedDecimal)) return parsedDecimal;
      }
      if (typeof v.toString === "function") {
        const str = v.toString();
        if (str && str !== "[object Object]") {
          const parsed = parseFloat(str.replace(",", "."));
          if (!isNaN(parsed)) return parsed;
        }
      }
    }
    if (typeof v === "string") {
      const cleaned = v.trim().replace(",", ".");
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? NaN : parsed;
    }
    const num = Number(v);
    return isNaN(num) ? NaN : num;
  };

  const num1 = extractNum(val1);
  if (!isNaN(num1) && num1 !== 0) return num1;

  const num2 = extractNum(val2);
  if (!isNaN(num2) && num2 !== 0) return num2;

  return !isNaN(num1) ? num1 : !isNaN(num2) ? num2 : 0;
}

async function batchInsertOrReplace(
  db: any,
  tableName: string,
  columns: string[],
  rows: any[][]
) {
  if (!rows || rows.length === 0) return;
  const placeholders = columns.map(() => "?").join(",");
  const sql = `INSERT OR REPLACE INTO ${tableName} (${columns.join(",")}) VALUES (${placeholders});`;
  for (const row of rows) {
    const safeRow = row.map((v) => (v === undefined ? null : v));
    await db.runAsync(sql, safeRow);
  }
}

// Fallback seed data if DB is totally fresh and phone opens offline for the first time
const INITIAL_CITIES_SEED: City[] = [
  {
    id: "1",
    name: "Charqueadas",
    about: "Cidade polo da Rota CRIC com vasta estrutura e pontos de apoio.",
    lat: -29.9547,
    lng: -51.6256,
    latitude: -29.9547,
    longitude: -51.6256,
    zoom: 13,
    banner_image: null,
    visible: true,
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Butiá",
    about: "Cidade histórica da região carbonífera, com patrimônio mineiro e recepção ciclística.",
    lat: -30.1189,
    lng: -51.9619,
    latitude: -30.1189,
    longitude: -51.9619,
    zoom: 13,
    banner_image: null,
    visible: true,
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Arroio dos Ratos",
    about: "Berço da indústria carboquímica nacional e abrigo do Museu do Carvão.",
    lat: -30.0781,
    lng: -51.7288,
    latitude: -30.0781,
    longitude: -51.7288,
    zoom: 13,
    banner_image: null,
    visible: true,
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "4",
    name: "São Jerônimo",
    about: "Cidade histórica às margens do Rio Jacuí, com centro histórico e pontos turísticos.",
    lat: -29.9592,
    lng: -51.7225,
    latitude: -29.9592,
    longitude: -51.7225,
    zoom: 13,
    banner_image: null,
    visible: true,
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "5",
    name: "General Câmara",
    about: "Histórico município com bela beira de rio e paisagens rurais encantadoras.",
    lat: -29.9056,
    lng: -51.7608,
    latitude: -29.9056,
    longitude: -51.7608,
    zoom: 13,
    banner_image: null,
    visible: true,
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "6",
    name: "Triunfo",
    about: "Cidade histórica rica em acervo arquitetônico e paisagens do Vale do Rio dos Sinos.",
    lat: -29.9419,
    lng: -51.7175,
    latitude: -29.9419,
    longitude: -51.7175,
    zoom: 13,
    banner_image: null,
    visible: true,
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "7",
    name: "Barão do Triunfo",
    about: "Município emoldurado pelas serras gaúchas com desafios e vistas panorâmicas.",
    lat: -30.3872,
    lng: -51.7397,
    latitude: -30.3872,
    longitude: -51.7397,
    zoom: 13,
    banner_image: null,
    visible: true,
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "8",
    name: "Minas do Leão",
    about: "Cidade que preserva a história da mineração e a força da rota de ciclismo.",
    lat: -30.1369,
    lng: -52.0933,
    latitude: -30.1369,
    longitude: -52.0933,
    zoom: 13,
    banner_image: null,
    visible: true,
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "9",
    name: "Vale Verde",
    about: "Encantador destino de chegada do circuito com receptivo aconchegante.",
    lat: -29.9867,
    lng: -52.1481,
    latitude: -29.9867,
    longitude: -52.1481,
    zoom: 13,
    banner_image: null,
    visible: true,
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const INITIAL_ANCHOR_POINTS_SEED: AnchorPoint[] = [
  {
    id: "101",
    name: "BG Hotel e Restaurante",
    lat: -29.9535,
    lng: -51.624,
    latitude: -29.9535,
    longitude: -51.624,
    business_hours: "24h",
    phone: "(51) 99999-0001",
    image: null,
    active: true,
    on_route: true,
    category_id: "1",
    city_id: "1",
    category: {
      id: "1",
      name: "Hospedagem",
      icon_name: "hotel",
      icon_image: "",
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "102",
    name: "Hotel Ouro Verde",
    lat: -29.956,
    lng: -51.627,
    latitude: -29.956,
    longitude: -51.627,
    business_hours: "24h",
    phone: "(51) 99999-0002",
    image: null,
    active: true,
    on_route: true,
    category_id: "1",
    city_id: "1",
    category: {
      id: "1",
      name: "Hospedagem",
      icon_name: "hotel",
      icon_image: "",
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "103",
    name: "Posto Central Charqueadas",
    lat: -29.951,
    lng: -51.621,
    latitude: -29.951,
    longitude: -51.621,
    business_hours: "24h",
    phone: "(51) 99999-0003",
    image: null,
    active: true,
    on_route: true,
    category_id: "2",
    city_id: "1",
    category: {
      id: "2",
      name: "Posto de Gasolina",
      icon_name: "gas_station",
      icon_image: "",
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "104",
    name: "Padaria da Praça",
    lat: -29.955,
    lng: -51.623,
    latitude: -29.955,
    longitude: -51.623,
    business_hours: "06:00 - 20:00",
    phone: "(51) 99999-0004",
    image: null,
    active: true,
    on_route: true,
    category_id: "3",
    city_id: "1",
    category: {
      id: "3",
      name: "Alimentação",
      icon_name: "food",
      icon_image: "",
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const CitiesOfflineRepository = {
  saveAll: async (cities: City[], replaceAll: boolean = false) => {
    try {
      if (!Array.isArray(cities) || cities.length === 0) return;
      await runWithTransaction(async () => {
        const db = await getDatabase();
        if (!db) return;

        if (replaceAll && Array.isArray(cities) && cities.length > 0) {
          const validIds = cities.map((c) => c.id.toString());
          const placeholders = validIds.map(() => "?").join(",");
          try {
            await db.runAsync(
              `DELETE FROM cities WHERE id NOT IN (${placeholders})`,
              validIds
            );
          } catch {}
        }

        const columns = [
          "id",
          "name",
          "about",
          "lat",
          "lng",
          "zoom",
          "banner_image",
          "visible",
          "active",
          "created_at",
          "updated_at",
        ];

        const rows = cities.map((c) => {
          const latVal = parseCoordinate(c.lat, (c as any).latitude);
          const lngVal = parseCoordinate(c.lng, (c as any).longitude);
          return [
            c.id.toString(),
            c.name || "Cidade",
            c.about || null,
            isNaN(latVal) ? 0 : latVal,
            isNaN(lngVal) ? 0 : lngVal,
            c.zoom || 12,
            c.banner_image || null,
            c.visible ? 1 : 0,
            c.active ? 1 : 0,
            c.created_at || null,
            c.updated_at || null,
          ];
        });

        await batchInsertOrReplace(db, "cities", columns, rows);
      });
    } catch (e) {
      console.warn("Erro ao salvar cidades no SQLite:", e);
    }
  },

  getAll: async (): Promise<City[]> => {
    return runReadOnly(async () => {
      try {
        const db = await getDatabase();
        if (!db) return INITIAL_CITIES_SEED;
        const rows = await db.getAllAsync<any>(
          "SELECT * FROM cities ORDER BY name ASC"
        );
        if (rows && rows.length > 0) {
          return rows.map((r) => {
            const latNum = parseCoordinate(r.lat, (r as any).latitude);
            const lngNum = parseCoordinate(r.lng, (r as any).longitude);
            return {
              ...r,
              id: r.id.toString(),
              name: r.name,
              about: r.about,
              lat: latNum,
              lng: lngNum,
              latitude: latNum,
              longitude: lngNum,
              zoom: r.zoom || 12,
              banner_image: r.banner_image,
              visible: Boolean(r.visible !== 0 && r.visible !== "0" && r.visible !== false),
              active: Boolean(r.active !== 0 && r.active !== "0" && r.active !== false),
              created_at: r.created_at,
              updated_at: r.updated_at,
            };
          });
        }
        return INITIAL_CITIES_SEED;
      } catch {
        return INITIAL_CITIES_SEED;
      }
    });
  },

  getOne: async (id: string): Promise<City | null> => {
    return runReadOnly(async () => {
      try {
        const db = await getDatabase();
        if (!db) return INITIAL_CITIES_SEED.find((c) => c.id === id) || null;
        const r = await db.getFirstAsync<any>(
          "SELECT * FROM cities WHERE id = ?",
          [id]
        );
        if (r) {
          const latNum = parseCoordinate(r.lat, (r as any).latitude);
          const lngNum = parseCoordinate(r.lng, (r as any).longitude);
          return {
            ...r,
            lat: latNum,
            lng: lngNum,
            latitude: latNum,
            longitude: lngNum,
            visible: Boolean(r.visible),
            active: Boolean(r.active),
          };
        }
        return (
          INITIAL_CITIES_SEED.find(
            (c) => c.id === id || c.name.toLowerCase() === id.toLowerCase()
          ) || null
        );
      } catch {
        return (
          INITIAL_CITIES_SEED.find(
            (c) => c.id === id || c.name.toLowerCase() === id.toLowerCase()
          ) || null
        );
      }
    });
  },
};

export const RoutesOfflineRepository = {
  saveAll: async (routes: Route[], replaceAll: boolean = false) => {
    try {
      if (!Array.isArray(routes) || routes.length === 0) return;
      await runWithTransaction(async () => {
        const db = await getDatabase();
        if (!db) return;

        if (replaceAll && Array.isArray(routes) && routes.length > 0) {
          const validIds = routes.map((r) => r.id.toString());
          const placeholders = validIds.map(() => "?").join(",");
          try {
            await db.runAsync(
              `DELETE FROM routes WHERE id NOT IN (${placeholders})`,
              validIds
            );
          } catch {}
        }

        const columns = [
          "id",
          "name",
          "polyline",
          "strava_id",
          "color",
          "distance",
          "is_event_route",
          "active",
          "created_at",
          "updated_at",
        ];

        const rows = routes.map((r) => [
          r.id.toString(),
          r.name || "Rota",
          r.polyline || "",
          r.strava_id || null,
          r.color || "#2563EB",
          r.distance || 0,
          r.is_event_route ? 1 : 0,
          r.active ? 1 : 0,
          r.created_at || null,
          r.updated_at || null,
        ]);

        await batchInsertOrReplace(db, "routes", columns, rows);
      });
    } catch (e) {
      console.warn("Erro ao salvar rotas no SQLite:", e);
    }
  },

  getAll: async (): Promise<Route[]> => {
    return runReadOnly(async () => {
      try {
        const db = await getDatabase();
        if (!db) return [];
        const rows = await db.getAllAsync<any>(
          "SELECT * FROM routes WHERE active = 1"
        );
        if (rows && rows.length > 0) {
          return rows.map((r) => ({
            ...r,
            is_event_route: Boolean(r.is_event_route),
            active: Boolean(r.active),
          }));
        }
        return [];
      } catch {
        return [];
      }
    });
  },
};

export const AnchorPointsOfflineRepository = {
  saveAll: async (pts: AnchorPoint[], replaceAll: boolean = false) => {
    try {
      await runWithTransaction(async () => {
        const db = await getDatabase();
        if (!db) return;

        if (replaceAll && Array.isArray(pts) && pts.length > 0) {
          const validIds = pts.map((ap) => ap.id.toString());
          const placeholders = validIds.map(() => "?").join(",");
          try {
            await db.runAsync(
              `DELETE FROM anchor_points WHERE id NOT IN (${placeholders})`,
              validIds
            );
          } catch {
            // Ignorar se tabela estiver vazia
          }
        }

        const columns = [
          "id",
          "name",
          "lat",
          "lng",
          "business_hours",
          "phone",
          "image",
          "active",
          "on_route",
          "category_id",
          "city_id",
          "category_icon_name",
          "category_name",
          "created_at",
          "updated_at",
        ];

        const rows = pts.map((ap) => {
          const latVal = parseCoordinate(ap.lat, (ap as any).latitude);
          const lngVal = parseCoordinate(ap.lng, (ap as any).longitude);
          const catIcon = ap.category?.icon_name || (ap as any).category_icon_name || null;
          const catName = ap.category?.name || (ap as any).category_name || null;
          const catId = ap.category_id || (ap as any).anchorpoint_category_id || ap.category?.id || null;

          return [
            ap.id.toString(),
            ap.name || "Ponto de Apoio",
            isNaN(latVal) ? 0 : latVal,
            isNaN(lngVal) ? 0 : lngVal,
            ap.business_hours || null,
            ap.phone || null,
            ap.image || null,
            ap.active ? 1 : 0,
            ap.on_route ? 1 : 0,
            catId ? catId.toString() : null,
            (ap as any).city_id ? (ap as any).city_id.toString() : null,
            catIcon,
            catName,
            ap.created_at || null,
            ap.updated_at || null,
          ];
        });

        await batchInsertOrReplace(db, "anchor_points", columns, rows);
      });
    } catch (e) {
      console.warn("Erro ao salvar pontos de apoio no SQLite:", e);
    }
  },

  delete: async (id: string) => {
    try {
      await runWithTransaction(async () => {
        const db = await getDatabase();
        if (!db) return;
        const strId = id.toString();
        await db.runAsync("DELETE FROM anchor_points WHERE id = ?", [strId]);
        await db.runAsync("DELETE FROM stamps WHERE anchor_point_id = ?", [strId]);
      });
    } catch (e) {
      console.warn("Erro ao excluir ponto de apoio e carimbos vinculados do SQLite:", e);
    }
  },

  getAll: async (): Promise<AnchorPoint[]> => {
    return runReadOnly(async () => {
      try {
        const db = await getDatabase();
        if (!db) return INITIAL_ANCHOR_POINTS_SEED;
        const rows = await db.getAllAsync<any>(
          "SELECT * FROM anchor_points ORDER BY name ASC"
        );
        if (rows && rows.length > 0) {
          const result = rows.map((r) => {
            let latNum = parseCoordinate(r.lat, (r as any).latitude);
            let lngNum = parseCoordinate(r.lng, (r as any).longitude);

            if (latNum === 0 && lngNum === 0) {
              const rNameLower = (r.name || "").toLowerCase().trim();
              const seedMatch = INITIAL_ANCHOR_POINTS_SEED.find(
                (s) =>
                  s.id.toString() === r.id.toString() ||
                  (rNameLower && s.name.toLowerCase().trim().includes(rNameLower)) ||
                  (rNameLower && rNameLower.includes(s.name.toLowerCase().trim()))
              );
              if (seedMatch) {
                latNum = seedMatch.lat;
                lngNum = seedMatch.lng;
              } else {
                latNum = -29.9547;
                lngNum = -51.6256;
              }
            }

            return {
              id: r.id.toString(),
              name: r.name,
              lat: latNum,
              lng: lngNum,
              latitude: latNum,
              longitude: lngNum,
              business_hours: r.business_hours,
              phone: r.phone,
              image: r.image,
              active: Boolean(r.active !== 0 && r.active !== "0" && r.active !== false),
              on_route: Boolean(r.on_route !== 0 && r.on_route !== "0" && r.on_route !== false),
              category_id: r.category_id ? r.category_id.toString() : null,
              city_id: r.city_id ? r.city_id.toString() : null,
              category: r.category_icon_name
                ? {
                    id: r.category_id || "1",
                    name: r.category_name || "Geral",
                    icon_name: r.category_icon_name,
                    icon_image: "",
                  }
                : null,
              created_at: r.created_at,
              updated_at: r.updated_at,
            };
          });

          return result;
        }
        return INITIAL_ANCHOR_POINTS_SEED;
      } catch {
        return INITIAL_ANCHOR_POINTS_SEED;
      }
    });
  },

  getByCity: async (cityId: string): Promise<AnchorPoint[]> => {
    return runReadOnly(async () => {
      try {
        const db = await getDatabase();
        if (!db) return [];
        const rows = await db.getAllAsync<any>(
          "SELECT * FROM anchor_points WHERE city_id = ? AND active = 1",
          [cityId.toString()]
        );
        if (rows && rows.length > 0) {
          return rows.map((r) => {
            let latNum = parseCoordinate(r.lat, (r as any).latitude);
            let lngNum = parseCoordinate(r.lng, (r as any).longitude);

            if (latNum === 0 && lngNum === 0) {
              const rNameLower = (r.name || "").toLowerCase().trim();
              const seedMatch = INITIAL_ANCHOR_POINTS_SEED.find(
                (s) =>
                  s.id.toString() === r.id.toString() ||
                  (rNameLower && s.name.toLowerCase().trim().includes(rNameLower)) ||
                  (rNameLower && rNameLower.includes(s.name.toLowerCase().trim()))
              );
              if (seedMatch) {
                latNum = seedMatch.lat;
                lngNum = seedMatch.lng;
              } else {
                latNum = -29.9547;
                lngNum = -51.6256;
              }
            }

            return {
              id: r.id.toString(),
              name: r.name,
              lat: latNum,
              lng: lngNum,
              latitude: latNum,
              longitude: lngNum,
              business_hours: r.business_hours,
              phone: r.phone,
              image: r.image,
              active: Boolean(r.active),
              on_route: Boolean(r.on_route),
              category_id: r.category_id ? r.category_id.toString() : null,
              city_id: r.city_id ? r.city_id.toString() : null,
              category: r.category_icon_name
                ? {
                    id: r.category_id || "1",
                    name: r.category_name || "Geral",
                    icon_name: r.category_icon_name,
                    icon_image: "",
                  }
                : null,
              created_at: r.created_at,
              updated_at: r.updated_at,
            };
          });
        }
        return [];
      } catch {
        return [];
      }
    });
  },
};

export const StampsOfflineRepository = {
  deleteByAnchorPoint: async (anchorPointId: string) => {
    try {
      await runWithTransaction(async () => {
        const db = await getDatabase();
        if (!db) return;
        await db.runAsync("DELETE FROM stamps WHERE anchor_point_id = ?", [
          anchorPointId.toString(),
        ]);
      });
    } catch (e) {
      console.warn("Erro ao excluir carimbos por ponto de apoio do SQLite:", e);
    }
  },

  delete: async (id: string) => {
    try {
      await runWithTransaction(async () => {
        const db = await getDatabase();
        if (!db) return;
        await db.runAsync("DELETE FROM stamps WHERE id = ?", [id.toString()]);
      });
    } catch (e) {
      console.warn("Erro ao excluir carimbo do SQLite:", e);
    }
  },

  saveAll: async (stamps: Stamp[], replaceAll: boolean = false) => {
    try {
      await runWithTransaction(async () => {
        const db = await getDatabase();
        if (!db) return;

        if (Array.isArray(stamps) && stamps.length > 0) {
          const validIds = stamps.map((s) => s.id.toString());
          const placeholders = validIds.map(() => "?").join(",");
          try {
            await db.runAsync(
              `DELETE FROM stamps WHERE collected = 0 AND id NOT IN (${placeholders})`,
              validIds
            );
          } catch {
            // Ignorar erro se tabela estiver vazia
          }
        }

        const columns = [
          "id",
          "anchor_point_id",
          "qr_code_token",
          "name",
          "badge_image",
          "active",
        ];

        const rows = stamps.map((s) => [
          s.id.toString(),
          s.anchor_point_id ? s.anchor_point_id.toString() : "",
          s.qr_code_token || "",
          s.name || "Carimbo",
          s.badge_image || "",
          s.active ? 1 : 0,
        ]);

        const placeholders = columns.map(() => "?").join(",");
        const sql = `INSERT INTO stamps (${columns.join(",")}) VALUES (${placeholders})
          ON CONFLICT(id) DO UPDATE SET
            anchor_point_id=excluded.anchor_point_id,
            qr_code_token=excluded.qr_code_token,
            name=excluded.name,
            badge_image=excluded.badge_image,
            active=excluded.active;`;

        for (const row of rows) {
          const safeRow = row.map((v) => (v === undefined ? null : v));
          await db.runAsync(sql, safeRow);
        }
      });
    } catch (e) {
      console.warn("Erro ao salvar carimbos no SQLite:", e);
    }
  },

  saveUserStamps: async (userStamps: any[]) => {
    try {
      await runWithTransaction(async () => {
        const db = await getDatabase();
        if (!db) return;

        const serverStampIds = new Set<string>();
        const serverApIds = new Set<string>();

        for (const us of userStamps) {
          const stampId = (us.stamp_id || us.stamp?.id || us.id)?.toString();
          const apId = (us.anchor_point_id || us.anchor_point?.id)?.toString();
          if (stampId) serverStampIds.add(stampId);
          if (apId) serverApIds.add(apId);
        }

        // Preservar itens da fila de sincronização pendente off-line
        try {
          const pendingRows = await db.getAllAsync<any>(
            "SELECT * FROM pending_sync_queue WHERE status = 'pending' ORDER BY created_at ASC"
          );
          const pendingQueue = (pendingRows || []).map((r: any) => ({
            id: r.id,
            action_type: r.action_type,
            payload: JSON.parse(r.payload),
            created_at: r.created_at,
          }));

          const pendingStampActions = pendingQueue.filter(
            (a) => a.action_type === "COLLECT_STAMP"
          );

          for (const action of pendingStampActions) {
            const p = action.payload || {};
            const stampId = p.stamp_id?.toString();
            const apId = p.anchor_point_id?.toString();
            if (stampId) serverStampIds.add(stampId);
            if (apId) serverApIds.add(apId);
          }
        } catch {
          // Ignorar se a fila não puder ser lida
        }

        const allLocalStamps = await db.getAllAsync<any>(
          "SELECT id, anchor_point_id FROM stamps"
        );

        for (const localStamp of allLocalStamps) {
          const sId = localStamp.id?.toString();
          const apId = localStamp.anchor_point_id?.toString();

          const isStillCollected =
            (sId && serverStampIds.has(sId)) ||
            (apId && serverApIds.has(apId));

          if (!isStillCollected && sId) {
            await db.runAsync(
              "UPDATE stamps SET collected = 0, scanned_at = NULL WHERE id = ?",
              [sId]
            );
          }
        }

        for (const us of userStamps) {
          const stampId = (us.stamp_id || us.stamp?.id || us.id)?.toString();
          const apId = (us.anchor_point_id || us.anchor_point?.id)?.toString();
          
          let scannedAt: string = new Date().toISOString();
          if (typeof us.scanned_at === "string" && us.scanned_at !== "[object Object]" && us.scanned_at.trim() !== "") {
            scannedAt = us.scanned_at;
          } else if (us.scanned_at instanceof Date && !isNaN(us.scanned_at.getTime())) {
            scannedAt = us.scanned_at.toISOString();
          } else if (typeof us.created_at === "string" && us.created_at !== "[object Object]") {
            scannedAt = us.created_at;
          } else if (typeof us.synced_at === "string" && us.synced_at !== "[object Object]") {
            scannedAt = us.synced_at;
          }

          if (stampId) {
            const res = await db.runAsync(
              `UPDATE stamps SET collected = 1, scanned_at = ? WHERE id = ?`,
              [scannedAt, stampId]
            );
            if (res.changes === 0 && apId) {
              await db.runAsync(
                `UPDATE stamps SET collected = 1, scanned_at = ? WHERE anchor_point_id = ?`,
                [scannedAt, apId]
              );
            }
          } else if (apId) {
            await db.runAsync(
              `UPDATE stamps SET collected = 1, scanned_at = ? WHERE anchor_point_id = ?`,
              [scannedAt, apId]
            );
          }
        }
      });
    } catch (e) {
      console.warn("Erro ao salvar carimbos do usuário no SQLite:", e);
    }
  },

  getAll: async (): Promise<Stamp[]> => {
    return runReadOnly(async () => {
      try {
        const db = await getDatabase();
        if (!db) return INITIAL_STAMPS_SEED;
        const rows = await db.getAllAsync<any>(
          "SELECT * FROM stamps ORDER BY name ASC"
        );
        if (rows && rows.length > 0) {
          return rows.map((r) => ({
            id: r.id.toString(),
            anchor_point_id: r.anchor_point_id ? r.anchor_point_id.toString() : "",
            qr_code_token: r.qr_code_token,
            name: r.name,
            badge_image: r.badge_image,
            active: Boolean(r.active !== 0 && r.active !== "0" && r.active !== false),
            created_at: r.scanned_at,
          }));
        }
        return INITIAL_STAMPS_SEED;
      } catch {
        return INITIAL_STAMPS_SEED;
      }
    });
  },

  getUserStamps: async (): Promise<any[]> => {
    return runReadOnly(async () => {
      try {
        const db = await getDatabase();
        if (!db) return [];
        const rows = await db.getAllAsync<any>(
          "SELECT * FROM stamps WHERE collected = 1"
        );
        const items: any[] = (rows || []).map((r) => ({
          id: `us-${r.id}`,
          stamp_id: r.id,
          anchor_point_id: r.anchor_point_id,
          scanned_at: r.scanned_at && r.scanned_at !== "[object Object]" ? r.scanned_at : new Date().toISOString(),
          stamp: {
            id: r.id,
            name: r.name,
            anchor_point_id: r.anchor_point_id,
          },
        }));

        // Incluir carimbos da fila de sincronização pendente para garantia total na UI
        try {
          const pendingRows = await db.getAllAsync<any>(
            "SELECT * FROM pending_sync_queue WHERE status = 'pending' ORDER BY created_at ASC"
          );
          const pendingQueue = (pendingRows || []).map((r: any) => ({
            id: r.id,
            action_type: r.action_type,
            payload: JSON.parse(r.payload),
            created_at: r.created_at,
          }));

          const stampActions = pendingQueue.filter(
            (a) => a.action_type === "COLLECT_STAMP"
          );

          for (const action of stampActions) {
            const p = action.payload || {};
            const stampId = p.stamp_id?.toString();
            const apId = p.anchor_point_id?.toString();

            const alreadyIncluded = items.some(
              (it) =>
                (stampId && (it.stamp_id === stampId || it.stamp?.id === stampId)) ||
                (apId && (it.anchor_point_id === apId || it.stamp?.anchor_point_id === apId))
            );

            if (!alreadyIncluded) {
              items.push({
                id: `pending-${action.id}`,
                stamp_id: stampId || `st-${apId}`,
                anchor_point_id: apId || "101",
                scanned_at: p.scanned_at || action.created_at || new Date().toISOString(),
                stamp: {
                  id: stampId || `st-${apId}`,
                  name: "Carimbo Coletado",
                  anchor_point_id: apId || "101",
                },
              });
            }
          }
        } catch {
          // Ignorar falhas na fila de sincronização
        }

        return items;
      } catch {
        return [];
      }
    });
  },

  markAsCollected: async (stampIdOrToken: string, apId?: string, name?: string) => {
    try {
      await runWithTransaction(async () => {
        const db = await getDatabase();
        if (!db) return;
        const scannedAt = new Date().toISOString();
        const targetId = stampIdOrToken ? String(stampIdOrToken) : "";
        const targetApId = apId ? String(apId) : "";

        let res = { changes: 0 };

        if (targetId) {
          res = await db.runAsync(
            `UPDATE stamps SET collected = 1, scanned_at = ? WHERE id = ? OR qr_code_token = ?`,
            [scannedAt, targetId, targetId]
          );
        }

        if (res.changes === 0 && targetApId) {
          res = await db.runAsync(
            `UPDATE stamps SET collected = 1, scanned_at = ? WHERE anchor_point_id = ?`,
            [scannedAt, targetApId]
          );
        }

        // Se não havia a linha cadastrada no SQLite, cria o registro imediatamente com collected = 1
        if (res.changes === 0 && (targetId || targetApId)) {
          await db.runAsync(
            `INSERT INTO stamps (id, anchor_point_id, qr_code_token, name, badge_image, active, collected, scanned_at)
             VALUES (?, ?, ?, ?, '', 1, 1, ?)
             ON CONFLICT(id) DO UPDATE SET collected = 1, scanned_at = excluded.scanned_at`,
            [
              targetId || targetApId || "1",
              targetApId || "101",
              targetId || "STAMP_LOCAL",
              name || "Carimbo Coletado",
              scannedAt,
            ]
          );
        }
      });
    } catch (e) {
      console.warn("Erro ao marcar carimbo como coletado offline:", e);
    }
  },
};

const INITIAL_STAMPS_SEED: Stamp[] = [
  {
    id: "1",
    anchor_point_id: "101",
    qr_code_token: "STAMP_BG_HOTEL",
    name: "Carimbo BG Hotel",
    badge_image: "",
    active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    anchor_point_id: "102",
    qr_code_token: "STAMP_OURO_VERDE",
    name: "Carimbo Hotel Ouro Verde",
    badge_image: "",
    active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "3",
    anchor_point_id: "104",
    qr_code_token: "STAMP_PADARIA_PRACA",
    name: "Carimbo Padaria da Praça",
    badge_image: "",
    active: true,
    created_at: new Date().toISOString(),
  },
];

export const SyncQueueRepository = {
  enqueueAction: async (action_type: string, payload: any) => {
    try {
      await runWithTransaction(async () => {
        const db = await getDatabase();
        if (!db) return;
        const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        await db.runAsync(
          `INSERT INTO pending_sync_queue (id, action_type, payload, created_at, status)
           VALUES (?, ?, ?, ?, 'pending')`,
          [id, action_type, JSON.stringify(payload), new Date().toISOString()]
        );
      });
    } catch (e) {
      console.warn("Erro ao enfileirar ação no SQLite:", e);
    }
  },

  getPendingCount: async (): Promise<number> => {
    return runReadOnly(async () => {
      try {
        const db = await getDatabase();
        if (!db) return 0;
        const res = await db.getFirstAsync<{ count: number }>(
          "SELECT COUNT(*) as count FROM pending_sync_queue WHERE status = 'pending'"
        );
        return res?.count || 0;
      } catch {
        return 0;
      }
    });
  },

  getPendingActions: async (): Promise<
    Array<{ id: string; action_type: string; payload: any; created_at: string }>
  > => {
    return runReadOnly(async () => {
      try {
        const db = await getDatabase();
        if (!db) return [];
        const rows = await db.getAllAsync<any>(
          "SELECT * FROM pending_sync_queue WHERE status = 'pending' ORDER BY created_at ASC"
        );
        return rows.map((r) => ({
          id: r.id,
          action_type: r.action_type,
          payload: JSON.parse(r.payload),
          created_at: r.created_at,
        }));
      } catch {
        return [];
      }
    });
  },

  removeAction: async (id: string) => {
    try {
      await runWithTransaction(async () => {
        const db = await getDatabase();
        if (!db) return;
        await db.runAsync("DELETE FROM pending_sync_queue WHERE id = ?", [id]);
      });
    } catch (e) {
      console.error("Error removing sync item:", e);
    }
  },
};

export const CityImagesOfflineRepository = {
  saveAll: async (cityId: string, images: CityImage[]) => {
    try {
      if (!Array.isArray(images) || images.length === 0) return;
      await runWithTransaction(async () => {
        const db = await getDatabase();
        if (!db) return;

        const columns = [
          "id",
          "city_id",
          "url",
          "caption",
          "order_index",
          "created_at",
        ];

        const rows = images.map((img) => [
          img.id.toString(),
          cityId.toString(),
          img.url || "",
          img.caption || null,
          img.order || 0,
          img.created_at || new Date().toISOString(),
        ]);

        await batchInsertOrReplace(db, "city_images", columns, rows);
      });
    } catch (e) {
      console.warn("Erro ao salvar imagens da cidade no SQLite:", e);
    }
  },

  getByCity: async (cityId: string): Promise<CityImage[]> => {
    return runReadOnly(async () => {
      try {
        const db = await getDatabase();
        if (!db) return [];
        const rows = await db.getAllAsync<any>(
          "SELECT * FROM city_images WHERE city_id = ? ORDER BY order_index ASC",
          [cityId]
        );
        if (rows && rows.length > 0) {
          return rows.map((r) => ({
            id: r.id,
            city_id: r.city_id,
            url: r.url,
            caption: r.caption,
            order: r.order_index,
            created_at: r.created_at,
          }));
        }
        return [];
      } catch {
        return [];
      }
    });
  },
};

export const WeatherOfflineRepository = {
  saveWeather: async (key: string, data: any) => {
    try {
      await runWithTransaction(async () => {
        const db = await getDatabase();
        if (!db) return;
        try {
          await db.runAsync(
            `INSERT OR REPLACE INTO weather_cache (key, data, updated_at) VALUES (?, ?, ?)`,
            [key, JSON.stringify(data), Date.now()]
          );
        } catch (err: any) {
          // Se falhou por incompatibilidade de colunas na tabela antiga, recriar a tabela
          await db.execAsync(`DROP TABLE IF EXISTS weather_cache;`);
          await db.execAsync(`
            CREATE TABLE IF NOT EXISTS weather_cache (
              key TEXT PRIMARY KEY,
              data TEXT NOT NULL,
              updated_at INTEGER NOT NULL
            );
          `);
          await db.runAsync(
            `INSERT OR REPLACE INTO weather_cache (key, data, updated_at) VALUES (?, ?, ?)`,
            [key, JSON.stringify(data), Date.now()]
          );
        }
      });
    } catch (e) {
      console.warn("Erro ao salvar previsão do tempo no SQLite:", e);
    }
  },

  getWeather: async (key: string): Promise<any | null> => {
    return runReadOnly(async () => {
      try {
        const db = await getDatabase();
        if (!db) return null;
        try {
          const row = await db.getFirstAsync<any>(
            "SELECT data FROM weather_cache WHERE key = ?",
            [key]
          );
          if (row?.data) {
            return JSON.parse(row.data);
          }
        } catch (err: any) {
          // Se a coluna antiga estiver corrompida, recriar a tabela no próprio banco sem chamadas aninhadas a mutex
          try {
            await db.execAsync(`DROP TABLE IF EXISTS weather_cache;`);
            await db.execAsync(`
              CREATE TABLE IF NOT EXISTS weather_cache (
                key TEXT PRIMARY KEY,
                data TEXT NOT NULL,
                updated_at INTEGER NOT NULL
              );
            `);
          } catch {}
        }
        return null;
      } catch {
        return null;
      }
    });
  },
};

export const BootstrapOfflineService = {
  syncBootstrapData: async () => {
    try {
      const { data } = await api.get("/sync/bootstrap");
      if (data) {
        if (data.cities && Array.isArray(data.cities)) {
          await CitiesOfflineRepository.saveAll(data.cities, true);
        }

        if (data.cityImages && Array.isArray(data.cityImages)) {
          const imagesByCity: Record<string, CityImage[]> = {};
          for (const img of data.cityImages) {
            const cId = img.city_id?.toString();
            if (cId) {
              if (!imagesByCity[cId]) imagesByCity[cId] = [];
              imagesByCity[cId].push(img);
            }
          }
          for (const [cId, imgs] of Object.entries(imagesByCity)) {
            await CityImagesOfflineRepository.saveAll(cId, imgs);
          }
        }

        if (data.cities && Array.isArray(data.cities)) {
          // Pré-carregar clima de cada cidade em background sem bloquear o sync
          data.cities.forEach((city: any) => {
            try {
              const latVal = Number(city.lat ?? (city as any).latitude);
              const lngVal = Number(city.lng ?? (city as any).longitude);
              if (!isNaN(latVal) && !isNaN(lngVal) && (latVal !== 0 || lngVal !== 0)) {
                const { fetchAndSaveWeather } = require("@/hooks/use-weather");
                fetchAndSaveWeather(latVal, lngVal).catch(() => {});
              }
            } catch {}
          });
        }

        if (data.routes && Array.isArray(data.routes)) {
          await RoutesOfflineRepository.saveAll(data.routes, true);
        }
        if (data.anchorPoints && Array.isArray(data.anchorPoints)) {
          await AnchorPointsOfflineRepository.saveAll(data.anchorPoints, true);
        }
        if (data.stamps && Array.isArray(data.stamps)) {
          await StampsOfflineRepository.saveAll(data.stamps, true);
        }
      }
      return true;
    } catch {
      return false;
    }
  },
};

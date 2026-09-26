import api from "../api";
import { AnchorPoint } from "../anchorpoints/anchorPointService";
import { City, CityImage } from "../cities/citiesService";
import { Route } from "../routes/routeService";
import { Stamp } from "../stamps/stampService";
import { getDatabase, runWithTransaction } from "./database";

// Fallback seed data if DB is totally fresh and phone opens offline for the first time
const INITIAL_CITIES_SEED: City[] = [
  {
    id: "1",
    name: "Criciúma",
    about: "Cidade polo da Rota CRIC com vasta estrutura e pontos de apoio.",
    lat: -28.6775,
    lng: -49.3703,
    latitude: -28.6775,
    longitude: -49.3703,
    zoom: 12,
    banner_image: null,
    visible: true,
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Nova Veneza",
    about: "Encantadora cidade com gastronomia e rota turística de ciclismo.",
    lat: -28.6366,
    lng: -49.4983,
    latitude: -28.6366,
    longitude: -49.4983,
    zoom: 13,
    banner_image: null,
    visible: true,
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Urussanga",
    about: "Tradição em vinhos e vales deslumbrantes para pedalar.",
    lat: -28.5192,
    lng: -49.3217,
    latitude: -28.5192,
    longitude: -49.3217,
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
    name: "Posto Central Criciúma",
    lat: -28.678,
    lng: -49.371,
    latitude: -28.678,
    longitude: -49.371,
    business_hours: "24h",
    phone: "(48) 99999-0001",
    image: null,
    active: true,
    on_route: true,
    category_id: "1",
    category: {
      id: "1",
      name: "Posto de Gasolina",
      icon_name: "gas_station",
      icon_image: "",
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "102",
    name: "Padaria da Praça Veneza",
    lat: -28.637,
    lng: -49.499,
    latitude: -28.637,
    longitude: -49.499,
    business_hours: "06:00 - 20:00",
    phone: "(48) 99999-0002",
    image: null,
    active: true,
    on_route: true,
    category_id: "2",
    category: {
      id: "2",
      name: "Alimentação",
      icon_name: "food",
      icon_image: "",
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "103",
    name: "Oficina do Ciclista Urussanga",
    lat: -28.52,
    lng: -49.3225,
    latitude: -28.52,
    longitude: -49.3225,
    business_hours: "08:00 - 18:00",
    phone: "(48) 99999-0003",
    image: null,
    active: true,
    on_route: true,
    category_id: "3",
    category: {
      id: "3",
      name: "Reparo",
      icon_name: "repair",
      icon_image: "",
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const CitiesOfflineRepository = {
  saveAll: async (cities: City[]) => {
    try {
      await runWithTransaction(async () => {
        const db = await getDatabase();
        if (!db) return;
        for (const c of cities) {
          const latVal = Number(c.lat ?? (c as any).latitude ?? 0);
          const lngVal = Number(c.lng ?? (c as any).longitude ?? 0);

          await db.runAsync(
            `INSERT OR REPLACE INTO cities (id, name, about, lat, lng, zoom, banner_image, visible, active, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
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
            ]
          );
        }
      });
    } catch (e) {
      console.warn("Erro ao salvar cidades no SQLite:", e);
    }
  },

  getAll: async (): Promise<City[]> => {
    try {
      const db = await getDatabase();
      if (!db) return INITIAL_CITIES_SEED;
      const rows = await db.getAllAsync<any>(
        "SELECT * FROM cities WHERE active = 1 ORDER BY name ASC"
      );
      if (rows && rows.length > 0) {
        return rows.map((r) => {
          const latNum = Number(r.lat || 0);
          const lngNum = Number(r.lng || 0);
          return {
            ...r,
            lat: latNum,
            lng: lngNum,
            latitude: latNum,
            longitude: lngNum,
            visible: Boolean(r.visible),
            active: Boolean(r.active),
          };
        });
      }
      await CitiesOfflineRepository.saveAll(INITIAL_CITIES_SEED);
      return INITIAL_CITIES_SEED;
    } catch {
      return INITIAL_CITIES_SEED;
    }
  },

  getOne: async (id: string): Promise<City | null> => {
    try {
      const db = await getDatabase();
      if (!db) return INITIAL_CITIES_SEED.find((c) => c.id === id) || null;
      const r = await db.getFirstAsync<any>(
        "SELECT * FROM cities WHERE id = ?",
        [id]
      );
      if (r) {
        const latNum = Number(r.lat || 0);
        const lngNum = Number(r.lng || 0);
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
      return null;
    } catch {
      return null;
    }
  },
};

export const RoutesOfflineRepository = {
  saveAll: async (routes: Route[]) => {
    try {
      await runWithTransaction(async () => {
        const db = await getDatabase();
        if (!db) return;
        for (const r of routes) {
          await db.runAsync(
            `INSERT OR REPLACE INTO routes (id, name, polyline, strava_id, color, distance, is_event_route, active, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
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
            ]
          );
        }
      });
    } catch (e) {
      console.warn("Erro ao salvar rotas no SQLite:", e);
    }
  },

  getAll: async (): Promise<Route[]> => {
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
            await db.runAsync(
              `DELETE FROM stamps WHERE anchor_point_id IS NOT NULL AND anchor_point_id != '' AND anchor_point_id NOT IN (SELECT id FROM anchor_points)`
            );
          } catch {
            // Ignorar se tabela estiver vazia
          }
        }

        for (const ap of pts) {
          const latVal = Number(ap.lat ?? (ap as any).latitude ?? 0);
          const lngVal = Number(ap.lng ?? (ap as any).longitude ?? 0);
          const catIcon = ap.category?.icon_name || null;
          const catName = ap.category?.name || null;

          await db.runAsync(
            `INSERT OR REPLACE INTO anchor_points (id, name, lat, lng, business_hours, phone, image, active, on_route, category_id, city_id, category_icon_name, category_name, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              ap.id.toString(),
              ap.name || "Ponto de Apoio",
              isNaN(latVal) ? 0 : latVal,
              isNaN(lngVal) ? 0 : lngVal,
              ap.business_hours || null,
              ap.phone || null,
              ap.image || null,
              ap.active ? 1 : 0,
              ap.on_route ? 1 : 0,
              ap.category_id ? ap.category_id.toString() : null,
              (ap as any).city_id ? (ap as any).city_id.toString() : null,
              catIcon,
              catName,
              ap.created_at || null,
              ap.updated_at || null,
            ]
          );
        }
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
    try {
      const db = await getDatabase();
      if (!db) return INITIAL_ANCHOR_POINTS_SEED;
      const rows = await db.getAllAsync<any>(
        "SELECT * FROM anchor_points WHERE active = 1"
      );
      if (rows && rows.length > 0) {
        return rows.map((r) => {
          const latNum = Number(r.lat || 0);
          const lngNum = Number(r.lng || 0);
          return {
            id: r.id,
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
            category_id: r.category_id,
            city_id: r.city_id,
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
      await AnchorPointsOfflineRepository.saveAll(INITIAL_ANCHOR_POINTS_SEED);
      return INITIAL_ANCHOR_POINTS_SEED;
    } catch {
      return INITIAL_ANCHOR_POINTS_SEED;
    }
  },

  getByCity: async (cityId: string): Promise<AnchorPoint[]> => {
    try {
      const db = await getDatabase();
      if (!db) return INITIAL_ANCHOR_POINTS_SEED;
      const rows = await db.getAllAsync<any>(
        "SELECT * FROM anchor_points WHERE city_id = ? AND active = 1",
        [cityId]
      );
      if (rows && rows.length > 0) {
        return rows.map((r) => {
          const latNum = Number(r.lat || 0);
          const lngNum = Number(r.lng || 0);
          return {
            id: r.id,
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
            category_id: r.category_id,
            city_id: r.city_id,
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
      const all = await AnchorPointsOfflineRepository.getAll();
      return all;
    } catch {
      return INITIAL_ANCHOR_POINTS_SEED;
    }
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

  saveAll: async (stamps: Stamp[]) => {
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

        try {
          await db.runAsync(
            `DELETE FROM stamps WHERE anchor_point_id IS NOT NULL AND anchor_point_id != '' AND anchor_point_id NOT IN (SELECT id FROM anchor_points)`
          );
        } catch {
          // Ignorar
        }

        for (const s of stamps) {
          await db.runAsync(
            `INSERT INTO stamps (id, anchor_point_id, qr_code_token, name, badge_image, active)
             VALUES (?, ?, ?, ?, ?, ?)
             ON CONFLICT(id) DO UPDATE SET
               anchor_point_id = excluded.anchor_point_id,
               qr_code_token = excluded.qr_code_token,
               name = excluded.name,
               badge_image = excluded.badge_image,
               active = excluded.active`,
            [
              s.id.toString(),
              s.anchor_point_id ? s.anchor_point_id.toString() : "",
              s.qr_code_token || "",
              s.name || "Carimbo",
              s.badge_image || "",
              s.active ? 1 : 0,
            ]
          );
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
          const pendingQueue = await SyncQueueRepository.getPendingActions();
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
          const scannedAt = us.scanned_at || us.created_at || new Date().toISOString();

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
    try {
      const db = await getDatabase();
      if (!db) return INITIAL_STAMPS_SEED;
      const rows = await db.getAllAsync<any>(
        "SELECT * FROM stamps WHERE active = 1"
      );
      if (rows && rows.length > 0) {
        return rows.map((r) => ({
          id: r.id,
          anchor_point_id: r.anchor_point_id,
          qr_code_token: r.qr_code_token,
          name: r.name,
          badge_image: r.badge_image,
          active: Boolean(r.active),
          created_at: r.scanned_at,
        }));
      }
      await StampsOfflineRepository.saveAll(INITIAL_STAMPS_SEED);
      return INITIAL_STAMPS_SEED;
    } catch {
      return INITIAL_STAMPS_SEED;
    }
  },

  getUserStamps: async (): Promise<any[]> => {
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
        scanned_at: r.scanned_at || new Date().toISOString(),
        stamp: {
          id: r.id,
          name: r.name,
          anchor_point_id: r.anchor_point_id,
        },
      }));

      // Incluir carimbos da fila de sincronização pendente para garantia total na UI
      try {
        const pendingQueue = await SyncQueueRepository.getPendingActions();
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
    qr_code_token: "STAMP_CRICIUMA_01",
    name: "Carimbo Posto Central Criciúma",
    badge_image: "",
    active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    anchor_point_id: "102",
    qr_code_token: "STAMP_VENEZA_01",
    name: "Carimbo Padaria Praça Veneza",
    badge_image: "",
    active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "3",
    anchor_point_id: "103",
    qr_code_token: "STAMP_URUSSANGA_01",
    name: "Carimbo Oficina Ciclista Urussanga",
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
  },

  getPendingActions: async (): Promise<
    Array<{ id: string; action_type: string; payload: any; created_at: string }>
  > => {
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
      await runWithTransaction(async () => {
        const db = await getDatabase();
        if (!db) return;
        for (const img of images) {
          await db.runAsync(
            `INSERT OR REPLACE INTO city_images (id, city_id, url, caption, order_index, created_at)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
              img.id.toString(),
              cityId.toString(),
              img.url,
              img.caption || null,
              img.order || 0,
              img.created_at || new Date().toISOString(),
            ]
          );
        }
      });
    } catch (e) {
      console.warn("Erro ao salvar imagens da cidade no SQLite:", e);
    }
  },

  getByCity: async (cityId: string): Promise<CityImage[]> => {
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
        // Se a coluna antiga estiver corrompida, tratar silenciosamente
        await db.execAsync(`DROP TABLE IF EXISTS weather_cache;`);
        await db.execAsync(`
          CREATE TABLE IF NOT EXISTS weather_cache (
            key TEXT PRIMARY KEY,
            data TEXT NOT NULL,
            updated_at INTEGER NOT NULL
          );
        `);
      }
      return null;
    } catch {
      return null;
    }
  },
};

export const BootstrapOfflineService = {
  syncBootstrapData: async () => {
    try {
      const { data } = await api.get("/sync/bootstrap");
      if (data) {
        if (data.cities && Array.isArray(data.cities)) {
          await CitiesOfflineRepository.saveAll(data.cities);
          // Pré-carregar imagens e clima de cada cidade quando online
          for (const city of data.cities) {
            try {
              const res = await api.get(`/cities/${city.id}/images`);
              if (res.data && Array.isArray(res.data)) {
                await CityImagesOfflineRepository.saveAll(city.id, res.data);
              }
            } catch {
              // Ignorar falhas individuais de imagem
            }

            try {
              const latVal = Number(city.lat ?? (city as any).latitude);
              const lngVal = Number(city.lng ?? (city as any).longitude);
              if (!isNaN(latVal) && !isNaN(lngVal) && (latVal !== 0 || lngVal !== 0)) {
                const { fetchAndSaveWeather } = require("@/hooks/use-weather");
                await fetchAndSaveWeather(latVal, lngVal);
              }
            } catch {
              // Ignorar falhas de pré-carregamento do clima
            }
          }
        }
        if (data.routes && Array.isArray(data.routes)) {
          await RoutesOfflineRepository.saveAll(data.routes);
        }
        if (data.anchorPoints && Array.isArray(data.anchorPoints)) {
          await AnchorPointsOfflineRepository.saveAll(data.anchorPoints);
        }
        if (data.stamps && Array.isArray(data.stamps)) {
          await StampsOfflineRepository.saveAll(data.stamps);
        }
      }
      return true;
    } catch {
      return false;
    }
  },
};

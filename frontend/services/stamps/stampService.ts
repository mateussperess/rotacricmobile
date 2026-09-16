import api from "../api";
import {
  StampsOfflineRepository,
  SyncQueueRepository,
} from "../database/offlineRepositories";

export interface Stamp {
  id: string;
  anchor_point_id: string;
  qr_code_token: string;
  name: string;
  badge_image: string;
  active: boolean;
  anchor_point?: any;
  created_at?: string;
}

export const StampService = {
  createStamp: async (payload: {
    anchor_point_id: number;
    name: string;
    badge_image?: string;
    qr_code_token?: string;
  }): Promise<Stamp> => {
    const { data } = await api.post("/stamps", payload);
    return data;
  },

  findAll: async (): Promise<Stamp[]> => {
    try {
      const { data } = await api.get("/stamps");
      if (data && Array.isArray(data)) {
        await StampsOfflineRepository.saveAll(data);
        return data;
      }
    } catch {
      console.log("Offline mode: Carregando carimbos do SQLite local");
    }
    return StampsOfflineRepository.getAll();
  },

  getUserStamps: async (): Promise<any[]> => {
    // 1. Tentar descarregar a fila de sincronização pendente para o servidor
    await StampService.processSyncQueue();

    // 2. Se online, buscar carimbos mais recentes do servidor e atualizar SQLite
    try {
      const { data } = await api.get("/stamps/my-stamps");
      if (data && Array.isArray(data)) {
        await StampsOfflineRepository.saveUserStamps(data);
      }
    } catch {
      console.log("Offline mode: Carregando meus carimbos do SQLite local");
    }

    // 3. Sempre retornar a fusão incondicional dos carimbos coletados salvos no SQLite
    return StampsOfflineRepository.getUserStamps();
  },

  processSyncQueue: async (): Promise<boolean> => {
    try {
      const pending = await SyncQueueRepository.getPendingActions();
      const stampActions = pending.filter(
        (a) => a.action_type === "COLLECT_STAMP"
      );
      if (stampActions.length === 0) return true;

      const stampsPayload = stampActions.map((a) => {
        const rawStampId = Number(a.payload.stamp_id);
        const rawApId = Number(a.payload.anchor_point_id);
        return {
          stamp_id: isNaN(rawStampId) ? 1 : rawStampId,
          anchor_point_id: isNaN(rawApId) ? 101 : rawApId,
          client_uuid: String(a.payload.client_uuid || a.id),
          scanned_at: String(
            a.payload.scanned_at || a.created_at || new Date().toISOString()
          ),
          latitude: a.payload.latitude ? Number(a.payload.latitude) : null,
          longitude: a.payload.longitude ? Number(a.payload.longitude) : null,
        };
      });

      const { data } = await api.post("/stamps/sync", { stamps: stampsPayload });
      if (data) {
        for (const action of stampActions) {
          await SyncQueueRepository.removeAction(action.id);
        }
      }
      return true;
    } catch (err: any) {
      console.log("Sincronização em segundo plano aguardando sinal...", err?.message || "");
      return false;
    }
  },

  toggleActive: async (id: string): Promise<Stamp> => {
    const { data } = await api.patch(`/stamps/${id}/toggle-active`);
    return data;
  },

  deleteStamp: async (id: string): Promise<any> => {
    const { data } = await api.delete(`/stamps/${id}`);
    return data;
  },
};

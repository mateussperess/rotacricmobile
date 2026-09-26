import api from "../api";
import {
  StampsOfflineRepository,
  SyncQueueRepository,
} from "../database/offlineRepositories";
import { tokenStorage } from "../tokenStorage";

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
      // Retornar silenciosamente os dados offline
    }
    return StampsOfflineRepository.getAll();
  },

  getUserStamps: async (): Promise<any[]> => {
    try {
      const token = await tokenStorage.get();
      if (!token) {
        return StampsOfflineRepository.getUserStamps();
      }
      await StampService.processSyncQueue();
      const { data } = await api.get("/stamps/my-stamps");
      if (data && Array.isArray(data)) {
        await StampsOfflineRepository.saveUserStamps(data);
      }
    } catch {
      // Ignorar erros de rede/autenticação em modo offline
    }

    return StampsOfflineRepository.getUserStamps();
  },

  processSyncQueue: async (): Promise<boolean> => {
    try {
      const token = await tokenStorage.get();
      if (!token) {
        // Se deslogado, limpar quaisquer ações órfãs da fila para interromper loops de sincronização
        const pending = await SyncQueueRepository.getPendingActions();
        for (const action of pending) {
          if (action.action_type === "COLLECT_STAMP") {
            await SyncQueueRepository.removeAction(action.id);
          }
        }
        return true;
      }

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
      if (err?.response?.status === 401) {
        const pending = await SyncQueueRepository.getPendingActions();
        for (const action of pending) {
          if (action.action_type === "COLLECT_STAMP") {
            await SyncQueueRepository.removeAction(action.id);
          }
        }
      }
      return false;
    }
  },

  toggleActive: async (id: string): Promise<Stamp> => {
    const { data } = await api.patch(`/stamps/${id}/toggle-active`);
    return data;
  },

  deleteStamp: async (id: string): Promise<any> => {
    try {
      const { data } = await api.delete(`/stamps/${id}`);
      await StampsOfflineRepository.delete(id);
      return data;
    } catch (e) {
      await StampsOfflineRepository.delete(id);
      throw e;
    }
  },
};

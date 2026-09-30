import * as TaskManager from "expo-task-manager";
import * as Location from "expo-location";
import { notificationService } from "./notificationService";
import { getDatabase, runReadOnly } from "../database/database";

export const GEOFENCE_TASK_NAME = "ROTA_CRIC_GEOFENCE_TASK";

// Cache em memória para cooldown imediato (1 hora = 3600000 ms)
const COOLDOWN_MS = 60 * 60 * 1000;
const lastNotifiedMap: Record<string, number> = {};

TaskManager.defineTask(
  GEOFENCE_TASK_NAME,
  async ({ data, error }: TaskManager.TaskManagerTaskBody<any>) => {
    if (error) {
      console.warn("Erro na tarefa de segundo plano Geofencing:", error.message);
      return;
    }

    if (!data) return;

    const { eventType, region } = data;

    // Dispara apenas quando o usuário ENTRA na região do ponto de apoio (GeofencingEventType.Enter === 1)
    if (
      eventType === Location.GeofencingEventType.Enter ||
      eventType === 1
    ) {
      const anchorPointId = region?.identifier;
      if (!anchorPointId) return;

      const now = Date.now();
      const lastNotified = lastNotifiedMap[anchorPointId] || 0;

      // Se já notificou este ponto nos últimos 60 minutos, ignora para evitar spam
      if (now - lastNotified < COOLDOWN_MS) {
        return;
      }

      try {
        // Busca o nome legível do ponto de apoio no banco de dados SQLite local
        let apName = "Ponto de Apoio";
        try {
          const ap = await runReadOnly(async () => {
            const db = await getDatabase();
            if (!db) return null;
            return await db.getFirstAsync<{ name: string }>(
              `SELECT name FROM anchor_points WHERE id = ?;`,
              [anchorPointId]
            );
          });
          if (ap?.name) {
            apName = ap.name;
          }
        } catch {}

        // Atualiza timestamp do cooldown
        lastNotifiedMap[anchorPointId] = now;

        // Dispara notificação nativa offline/online (funciona com app fechado)
        await notificationService.notify(
          "📍 Ponto de Apoio Próximo!",
          `Você está perto de "${apName}". Venha registrar sua passagem e carimbar seu passaporte!`,
          "stamp",
          {
            screen: "/(tabs)/nativeMap",
            anchor_point_id: anchorPointId,
          }
        );
      } catch (err) {
        console.warn("Erro ao disparar notificação de proximidade:", err);
      }
    }
  }
);

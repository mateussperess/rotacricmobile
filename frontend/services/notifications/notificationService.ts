import * as Notifications from "expo-notifications";
import NetInfo from "@react-native-community/netinfo";
import { Platform } from "react-native";
import { getDatabase, runWithTransaction, runReadOnly } from "../database/database";

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  type: "stamp" | "route" | "system" | "sync" | "info" | "warning";
  data?: Record<string, any>;
  read: boolean;
  created_at: string;
  status: "delivered" | "pending_sync";
}

// Configurar o comportamento das notificações quando o app está em primeiro plano (foreground)
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    }),
  });
} catch (e) {
  console.warn("Não foi possível configurar handler do Notifications:", e);
}

class NotificationService {
  private isInitialized = false;

  /**
   * Inicializa permissões e canais nativos de notificação (Android/iOS)
   */
  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;

    try {
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "Notificações Rota CRIC",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF231F7C",
        });
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      this.isInitialized = true;
      return finalStatus === "granted";
    } catch (error) {
      console.warn("Aviso ao inicializar serviço de notificações nativas:", error);
      return false;
    }
  }

  /**
   * Dispara uma notificação local (funciona 100% offline e online) e salva no SQLite
   */
  async notify(
    title: string,
    body: string,
    type: AppNotification["type"] = "info",
    data: Record<string, any> = {}
  ): Promise<AppNotification> {
    const newNotification: AppNotification = {
      id: "notif_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5),
      title,
      body,
      type,
      data,
      read: false,
      created_at: new Date().toISOString(),
      status: "delivered",
    };

    // 1. Salva no SQLite local para persistência offline
    await this.saveNotificationToDb(newNotification);

    // 2. Dispara notificação nativa no sistema operacional do dispositivo
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: newNotification.title,
          body: newNotification.body,
          data: newNotification.data,
          sound: true,
        },
        trigger: null, // Disparo imediato
      });
    } catch (err) {
      console.warn("Não foi possível agendar notificação nativa no SO:", err);
    }

    return newNotification;
  }

  /**
   * Salva a notificação no banco de dados SQLite local
   */
  private async saveNotificationToDb(notification: AppNotification): Promise<void> {
    try {
      await runWithTransaction(async () => {
        const db = await getDatabase();
        if (!db) return;

        const dataStr = notification.data ? JSON.stringify(notification.data) : null;
        await db.runAsync(
          `INSERT INTO notifications (id, title, body, type, data, read, created_at, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
          [
            notification.id,
            notification.title,
            notification.body,
            notification.type,
            dataStr,
            notification.read ? 1 : 0,
            notification.created_at,
            notification.status,
          ]
        );
      });
    } catch (e) {
      console.error("Erro ao salvar notificação no banco local:", e);
    }
  }

  /**
   * Busca todas as notificações armazenadas localmente no SQLite
   */
  async getNotifications(): Promise<AppNotification[]> {
    try {
      return await runReadOnly(async () => {
        const db = await getDatabase();
        if (!db) return [];

        const rows = await db.getAllAsync<any>(
          `SELECT * FROM notifications ORDER BY created_at DESC LIMIT 100;`
        );

        return rows.map((r) => ({
          id: r.id,
          title: r.title,
          body: r.body,
          type: r.type as AppNotification["type"],
          data: r.data ? JSON.parse(r.data) : {},
          read: Boolean(r.read),
          created_at: r.created_at,
          status: r.status as AppNotification["status"],
        }));
      });
    } catch (e) {
      console.error("Erro ao buscar notificações do banco SQLite:", e);
      return [];
    }
  }

  /**
   * Retorna o número de notificações não lidas
   */
  async getUnreadCount(): Promise<number> {
    try {
      return await runReadOnly(async () => {
        const db = await getDatabase();
        if (!db) return 0;

        const result = await db.getFirstAsync<{ count: number }>(
          `SELECT COUNT(*) as count FROM notifications WHERE read = 0;`
        );
        return result?.count || 0;
      });
    } catch (e) {
      console.error("Erro ao buscar contagem de não lidas:", e);
      return 0;
    }
  }

  /**
   * Marca uma notificação como lida
   */
  async markAsRead(id: string): Promise<void> {
    try {
      await runWithTransaction(async () => {
        const db = await getDatabase();
        if (!db) return;
        await db.runAsync(`UPDATE notifications SET read = 1 WHERE id = ?;`, [id]);
      });
    } catch (e) {
      console.error("Erro ao marcar notificação como lida:", e);
    }
  }

  /**
   * Marca todas as notificações como lidas
   */
  async markAllAsRead(): Promise<void> {
    try {
      await runWithTransaction(async () => {
        const db = await getDatabase();
        if (!db) return;
        await db.runAsync(`UPDATE notifications SET read = 1 WHERE read = 0;`);
      });
    } catch (e) {
      console.error("Erro ao marcar todas as notificações como lidas:", e);
    }
  }

  /**
   * Remove uma notificação do histórico
   */
  async deleteNotification(id: string): Promise<void> {
    try {
      await runWithTransaction(async () => {
        const db = await getDatabase();
        if (!db) return;
        await db.runAsync(`DELETE FROM notifications WHERE id = ?;`, [id]);
      });
    } catch (e) {
      console.error("Erro ao deletar notificação:", e);
    }
  }

  /**
   * Limpa todo o histórico de notificações
   */
  async clearAll(): Promise<void> {
    try {
      await runWithTransaction(async () => {
        const db = await getDatabase();
        if (!db) return;
        await db.runAsync(`DELETE FROM notifications;`);
      });
    } catch (e) {
      console.error("Erro ao limpar histórico de notificações:", e);
    }
  }
}

export const notificationService = new NotificationService();

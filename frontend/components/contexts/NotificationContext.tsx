import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import * as Notifications from "expo-notifications";
import * as SecureStore from "expo-secure-store";
import NetInfo, { NetInfoState } from "@react-native-community/netinfo";
import { useRouter } from "expo-router";
import {
  AppNotification,
  notificationService,
} from "@/services/notifications/notificationService";
import { NotificationToast } from "@/components/ui/NotificationToast";

const NOTIFICATIONS_ENABLED_KEY = "user_notifications_enabled";

interface NotificationContextData {
  notifications: AppNotification[];
  unreadCount: number;
  activeToast: AppNotification | null;
  isOnline: boolean;
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => Promise<void>;
  notify: (
    title: string,
    body: string,
    type?: AppNotification["type"],
    data?: Record<string, any>
  ) => Promise<AppNotification | null>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextData>(
  {} as NotificationContextData
);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [activeToast, setActiveToast] = useState<AppNotification | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [notificationsEnabled, setNotificationsEnabledState] = useState<boolean>(true);
  const router = useRouter();

  // Carregar preferência salva no SecureStore
  useEffect(() => {
    SecureStore.getItemAsync(NOTIFICATIONS_ENABLED_KEY)
      .then((val) => {
        if (val !== null) {
          setNotificationsEnabledState(val === "true");
        }
      })
      .catch(() => {});
  }, []);

  const setNotificationsEnabled = useCallback(async (enabled: boolean) => {
    setNotificationsEnabledState(enabled);
    try {
      await SecureStore.setItemAsync(NOTIFICATIONS_ENABLED_KEY, String(enabled));
    } catch (e) {
      console.warn("Erro ao salvar preferência de notificação:", e);
    }
  }, []);

  // Carrega notificações do SQLite
  const refreshNotifications = useCallback(async () => {
    try {
      const list = await notificationService.getNotifications();
      const count = await notificationService.getUnreadCount();
      setNotifications(list);
      setUnreadCount(count);
    } catch (e) {
      console.warn("Erro ao recarregar notificações no contexto:", e);
    }
  }, []);

  // Dispara uma nova notificação (offline/online) se as notificações estiverem habilitadas
  const notify = useCallback(
    async (
      title: string,
      body: string,
      type: AppNotification["type"] = "info",
      data: Record<string, any> = {}
    ) => {
      if (!notificationsEnabled) {
        return null;
      }
      const created = await notificationService.notify(title, body, type, data);
      setActiveToast(created);
      await refreshNotifications();
      return created;
    },
    [notificationsEnabled, refreshNotifications]
  );

  const markAsRead = useCallback(
    async (id: string) => {
      await notificationService.markAsRead(id);
      await refreshNotifications();
    },
    [refreshNotifications]
  );

  const markAllAsRead = useCallback(async () => {
    await notificationService.markAllAsRead();
    await refreshNotifications();
  }, [refreshNotifications]);

  const deleteNotification = useCallback(
    async (id: string) => {
      await notificationService.deleteNotification(id);
      await refreshNotifications();
    },
    [refreshNotifications]
  );

  const clearAll = useCallback(async () => {
    await notificationService.clearAll();
    await refreshNotifications();
  }, [refreshNotifications]);

  // Handler para quando a notificação é pressionada
  const handleNotificationPress = useCallback(
    (notification: AppNotification) => {
      if (!notification.read) {
        markAsRead(notification.id);
      }
      if (notification.data?.screen) {
        try {
          router.push(notification.data.screen as any);
        } catch (e) {
          console.warn("Não foi possível navegar para a tela da notificação:", e);
        }
      }
    },
    [markAsRead, router]
  );

  useEffect(() => {
    // 1. Inicializa o serviço nativo do Expo Notifications
    notificationService.initialize().catch(() => {});
    refreshNotifications().catch(() => {});

    // 2. Escuta cliques em notificações nativas do sistema (barra do SO)
    let subscription: Notifications.Subscription | null = null;
    try {
      subscription = Notifications.addNotificationResponseReceivedListener(
        (response) => {
          const data = response.notification.request.content.data;
          if (data?.screen) {
            try {
              router.push(data.screen as any);
            } catch (err) {
              console.warn("Erro na navegação por notificação do SO:", err);
            }
          }
        }
      );
    } catch (e) {
      console.warn("Assinatura de resposta de notificação falhou:", e);
    }

    // 3. Monitor de Conectividade (NetInfo) com notificação amigável de status
    let initialCheckDone = false;
    const unsubscribeNetInfo = NetInfo.addEventListener((state: NetInfoState) => {
      const connected = Boolean(state.isConnected && state.isInternetReachable !== false);

      setIsOnline((prevOnline) => {
        if (initialCheckDone && prevOnline !== connected) {
          if (!connected) {
            if (notificationsEnabled) {
              notificationService.notify(
                "Você está Offline",
                "O app continuará salvando seus carimbos e rotas localmente.",
                "warning"
              ).then(() => refreshNotifications());
            }
          } else {
            if (notificationsEnabled) {
              notificationService.notify(
                "Conexão Restabelecida",
                "Seus dados estão sendo sincronizados com a nuvem.",
                "sync"
              ).then(() => refreshNotifications());
            }
          }
        }
        initialCheckDone = true;
        return connected;
      });
    });

    return () => {
      if (subscription) subscription.remove();
      unsubscribeNetInfo();
    };
  }, [notificationsEnabled, refreshNotifications, router]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        activeToast,
        isOnline,
        notificationsEnabled,
        setNotificationsEnabled,
        notify,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
        refreshNotifications,
      }}
    >
      {children}
      {notificationsEnabled && (
        <NotificationToast
          notification={activeToast}
          onDismiss={() => setActiveToast(null)}
          onPress={handleNotificationPress}
        />
      )}
    </NotificationContext.Provider>
  );
};

export const useNotificationsContext = () => useContext(NotificationContext);


import { useNotificationsContext } from "@/components/contexts/NotificationContext";

export function useNotifications() {
  const context = useNotificationsContext();
  if (!context || Object.keys(context).length === 0) {
    throw new Error(
      "useNotifications deve ser utilizado dentro de um NotificationProvider"
    );
  }
  return context;
}

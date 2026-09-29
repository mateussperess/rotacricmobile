import React, { useEffect } from "react";
import { StyleSheet, Text, View, Pressable, Animated } from "react-native";
import { AppNotification } from "@/services/notifications/notificationService";
import { IconSymbol } from "@/components/ui/icon-symbol";

interface NotificationToastProps {
  notification: AppNotification | null;
  onDismiss: () => void;
  onPress?: (notification: AppNotification) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  notification,
  onDismiss,
  onPress,
}) => {
  const translateY = React.useRef(new Animated.Value(-100)).current;
  const opacity = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (notification) {
      // Anima para mostrar
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Timer para auto-ocultar após 4 segundos
      const timer = setTimeout(() => {
        hideToast();
      }, 4000);

      return () => clearTimeout(timer);
    } else {
      translateY.setValue(-100);
      opacity.setValue(0);
    }
  }, [notification]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  if (!notification) return null;

  const getIconName = (): string => {
    switch (notification.type) {
      case "stamp":
        return "checkmark.seal.fill";
      case "route":
        return "map.fill";
      case "sync":
        return "arrow.triangle.2.circlepath";
      case "warning":
        return "exclamationmark.triangle.fill";
      default:
        return "bell.fill";
    }
  };

  const getIconColor = (): string => {
    switch (notification.type) {
      case "stamp":
        return "#10B981"; // verde
      case "route":
        return "#3B82F6"; // azul
      case "sync":
        return "#8B5CF6"; // roxo
      case "warning":
        return "#F59E0B"; // amarelo
      default:
        return "#6366F1";
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <Pressable
        style={styles.toastCard}
        onPress={() => {
          hideToast();
          if (onPress) onPress(notification);
        }}
      >
        <View style={[styles.iconContainer, { backgroundColor: getIconColor() + "20" }]}>
          <IconSymbol name={getIconName() as any} size={22} color={getIconColor()} />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {notification.title}
          </Text>
          <Text style={styles.body} numberOfLines={2}>
            {notification.body}
          </Text>
        </View>

        <Pressable style={styles.closeButton} onPress={hideToast} hitSlop={10}>
          <IconSymbol name="xmark" size={14} color="#9CA3AF" />
        </Pressable>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 50,
    left: 16,
    right: 16,
    zIndex: 9999,
  },
  toastCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1F2937",
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#374151",
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 2,
  },
  body: {
    fontSize: 12,
    color: "#D1D5DB",
    lineHeight: 16,
  },
  closeButton: {
    padding: 4,
    marginLeft: 8,
  },
});

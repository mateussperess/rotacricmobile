import { useAuth } from "@/components/context/AuthContext";
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { styles } from "./styles";

export function ProfileView() {
  const { user, logout } = useAuth();

  const menuItems = [
    {
      icon: "emoji-events",
      label: "Meus carimbos",
      sub: `${user?.stampsCount ?? 0} coletados`,
    },
    {
      icon: "directions-bike",
      label: "Histórico de rotas",
      sub: "2 concluídas",
    },
    { icon: "notifications", label: "Notificações", sub: "Ativadas" },
    { icon: "settings", label: "Configurações", sub: "" },
  ];

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.headerBlue}>
        <View
          style={{ flexDirection: "row", alignItems: "center", width: "100%" }}
        >
          <View style={styles.iconCircle}>
            <Text style={{ color: "white", fontSize: 22, fontWeight: "bold" }}>
              {user?.name?.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={{ marginLeft: 16 }}>
            <Text style={[styles.title, { fontSize: 18 }]}>{user?.name}</Text>
            <Text style={styles.subtitle}>{user?.email}</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.menuCard}>
          {menuItems.map((item) => (
            <TouchableOpacity key={item.label} style={styles.menuItem}>
              <View style={styles.menuIconBox}>
                <MaterialIcons
                  name={item.icon as any}
                  size={20}
                  color="#2563EB"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.menuTextMain}>{item.label}</Text>
                {item.sub ? (
                  <Text style={styles.menuTextSub}>{item.sub}</Text>
                ) : null}
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#D1D5DB" />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.buttonLogout} onPress={logout}>
          <MaterialIcons name="logout" size={20} color="#EF4444" />
          <Text style={{ color: "#EF4444", fontWeight: "bold", marginLeft: 8 }}>
            Sair da conta
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

import { useAuth } from "@/components/contexts/AuthContext";
import { IconSymbol } from "@/components/ui/icon-symbol";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export function ProfileView() {
  const { user, logout } = useAuth();

  const menuItems = [
    {
      icon: "award.fill",
      label: "Meus carimbos",
      sub: `${user?.stampsCount ?? 0} coletados`,
    },
    {
      icon: "bicycle",
      label: "Histórico de rotas",
      sub: "2 concluídas",
    },
    { icon: "bell.fill", label: "Notificações", sub: "Ativadas" },
    { icon: "questionmark.circle.fill", label: "Ajuda e suporte", sub: "" },
  ];

  return (
    <View style={styles.container}>
      {/* Header com Glassmorphism nas stats */}
      <View style={styles.headerBlue}>
        <View style={styles.userInfoRow}>
          <View style={styles.iconCircle}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View>
            <Text style={styles.title}>{user?.name}</Text>
            <Text style={styles.subtitle}>{user?.email}</Text>
            <View style={styles.verifiedBadge}>
              <View style={styles.badgeDot} />
              <Text style={styles.badgeText}>Cicloturista verificado</Text>
            </View>
          </View>
        </View>

        {/* Linha de Estatísticas (Stats) */}
        <View style={styles.statsRow}>
          {[
            { label: "Carimbos", value: user?.stampsCount ?? 0 },
            { label: "Km rodados", value: "127" },
            { label: "Rotas", value: "2" },
          ].map((s) => (
            <View key={s.label} style={styles.statCard}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollPadding}
        showsVerticalScrollIndicator={false}
      >
        {/* Menu agrupado em um único card */}
        <View style={styles.menuCard}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.label}
              style={[
                styles.menuItem,
                index < menuItems.length - 1 && styles.menuBorder,
              ]}
            >
              <View style={styles.menuIconBox}>
                <IconSymbol name={item.icon as any} size={18} color="#2563EB" />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTextMain}>{item.label}</Text>
                {item.sub ? (
                  <Text style={styles.menuTextSub}>{item.sub}</Text>
                ) : null}
              </View>
              <IconSymbol name="chevron.right" size={16} color="#D1D5DB" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Botão de Logout com estilo de borda */}
        <TouchableOpacity style={styles.buttonLogout} onPress={logout}>
          <IconSymbol
            name="rectangle.portrait.and.arrow.right"
            size={18}
            color="#EF4444"
          />
          <Text style={styles.logoutText}>Sair da conta</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>ROTA CRIC Mobile v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  headerBlue: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 25,
  },
  userInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  title: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    textTransform: "capitalize",
  },
  subtitle: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 12,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#93C5FD",
  },
  badgeText: {
    color: "#DBEAFE",
    fontSize: 12,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  statValue: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  statLabel: {
    color: "#DBEAFE",
    fontSize: 10,
  },
  content: {
    flex: 1,
  },
  scrollPadding: {
    padding: 20,
    paddingBottom: 40,
  },
  menuCard: {
    backgroundColor: "white",
    borderRadius: 20,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  menuTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  menuTextMain: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1F2937",
  },
  menuTextSub: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  buttonLogout: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#FECACA",
    gap: 8,
  },
  logoutText: {
    color: "#EF4444",
    fontWeight: "bold",
    fontSize: 14,
  },
  versionText: {
    textAlign: "center",
    color: "#D1D5DB",
    fontSize: 11,
    marginTop: 20,
  },
});

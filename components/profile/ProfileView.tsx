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
import { SafeAreaView } from "react-native-safe-area-context";

const CRIC_BLUE = "#2563EB";

export function ProfileView() {
  const { user, logout } = useAuth();

  const menuItems = [
    { icon: "bell.fill", label: "Notificações", sub: "Ativadas" },
    { icon: "questionmark.circle.fill", label: "Ajuda e suporte", sub: "" },
  ];

  const stats = [
    { label: "Carimbos", value: String(user?.stampsCount ?? 0) },
    { label: "Km rodados", value: "127" },
    { label: "Rotas", value: "2" },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {/* Header — radius na base gera a curva */}

      <View style={styles.container}>
        <View style={styles.headerBlue}>
          <View style={styles.userInfoRow}>
            <View style={styles.iconCircle}>
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.userInfoText}>
              <Text style={styles.brand}>ROTA CRIC</Text>
              <Text style={styles.title}>{user?.name}</Text>
              <Text style={styles.subtitle}>{user?.email}</Text>
              <View style={styles.verifiedBadge}>
                <View style={styles.badgeDot} />
                <Text style={styles.badgeText}>Cicloturista verificado</Text>
              </View>
            </View>
          </View>

          <View style={styles.statsRow}>
            {stats.map((s, i) => (
              <React.Fragment key={s.label}>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{s.value}</Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                </View>
                {i < stats.length - 1 && <View style={styles.statDivider} />}
              </React.Fragment>
            ))}
          </View>
        </View>
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollPadding}
          showsVerticalScrollIndicator={false}
        >
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
                  <IconSymbol
                    name={item.icon as any}
                    size={18}
                    color={CRIC_BLUE}
                  />
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

          <TouchableOpacity style={styles.buttonLogout} onPress={logout}>
            <IconSymbol
              name="rectangle.portrait.and.arrow.right"
              size={18}
              color="white"
            />
            <Text style={styles.logoutText}>Sair da conta</Text>
          </TouchableOpacity>

          <Text style={styles.versionText}>ROTA CRIC Mobile v1.0.0</Text>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: CRIC_BLUE,
  },
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  headerBlue: {
    backgroundColor: CRIC_BLUE,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  userInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 24,
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
    fontWeight: "800",
  },
  userInfoText: {
    flex: 1,
  },
  brand: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2.5,
    color: "rgba(255,255,255,0.45)",
    marginBottom: 2,
  },
  title: {
    color: "white",
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.5,
    textTransform: "capitalize",
  },
  subtitle: {
    color: "rgba(255, 255, 255, 0.65)",
    fontSize: 12,
    marginTop: 1,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 5,
  },
  badgeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#93C5FD",
  },
  badgeText: {
    color: "#DBEAFE",
    fontSize: 11,
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  statBox: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  statValue: {
    color: "white",
    fontSize: 18,
    fontWeight: "800",
  },
  statLabel: {
    fontSize: 10,
    color: "rgba(255,255,255,0.5)",
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
  },
  scrollPadding: {
    padding: 20,
    paddingTop: 24,
    paddingBottom: 48,
  },
  menuCard: {
    backgroundColor: "white",
    borderRadius: 20,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  menuBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  menuIconBox: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  menuTextContainer: {
    flex: 1,
    marginLeft: 13,
  },
  menuTextMain: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  menuTextSub: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 1,
  },
  buttonLogout: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    borderRadius: 16,
    backgroundColor: "#EF4444",
    gap: 8,
    elevation: 2,
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  logoutText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  versionText: {
    textAlign: "center",
    color: "#C0C4CC",
    fontSize: 11,
    marginTop: 24,
  },
});

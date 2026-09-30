import { useAuth } from "@/components/contexts/AuthContext";
import { useNotificationsContext } from "@/components/contexts/NotificationContext";
import { useNetworkStatus } from "@/components/NetworkStatusBanner";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { updateUserProfile } from "@/services/users/userService";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const CRIC_BLUE = "#2563EB";

export function ProfileView() {
  const { user, logout, refreshUser, primaryColor, isAdmin } = useAuth();
  const { notificationsEnabled, setNotificationsEnabled } = useNotificationsContext();
  const { isOffline } = useNetworkStatus();
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2000, 0, 1));

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshUser();
    } catch {
      // Ignorar falha silenciosa no refresh
    } finally {
      setRefreshing(false);
    }
  };

  // Modal Form state
  const [editForm, setEditForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    social_network: "",
    birth_date: "",
    document: "",
    document_type: "RG",
  });

  useEffect(() => {
    if (user) {
      setEditForm({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        social_network: user.social_network || "",
        birth_date: user.birth_date || "",
        document: user.document || "",
        document_type: user.document_type || "RG",
      });

      if (user.birth_date) {
        const parts = user.birth_date.split("-");
        if (parts.length === 3) {
          setSelectedDate(new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])));
        }
      }
    }
  }, [user]);

  const handleOpenEdit = () => {
    if (user) {
      setEditForm({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        social_network: user.social_network || "",
        birth_date: user.birth_date || "",
        document: user.document || "",
        document_type: user.document_type || "RG",
      });

      if (user.birth_date) {
        const parts = user.birth_date.split("-");
        if (parts.length === 3) {
          setSelectedDate(new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])));
        }
      }
    }
    setModalVisible(true);
  };

  const handleDateChange = (event: DateTimePickerEvent, date?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (date) {
      setSelectedDate(date);
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      setEditForm((prev) => ({ ...prev, birth_date: `${yyyy}-${mm}-${dd}` }));
    }
  };

  const handleSaveProfile = async () => {
    if (!user?.id) return;
    setSaving(true);

    try {
      const response = await updateUserProfile(user.id, {
        first_name: editForm.first_name.trim(),
        last_name: editForm.last_name.trim(),
        email: editForm.email.trim(),
        social_network: editForm.social_network.trim(),
        birth_date: editForm.birth_date.trim(),
        document: editForm.document.trim(),
        document_type: editForm.document_type.trim(),
      });

      if (response && response.id) {
        await refreshUser();
        setSaving(false);
        setModalVisible(false);

        Alert.alert(
          "Sucesso!",
          "Informações pessoais salvas com sucesso!",
        );
      } else {
        throw new Error("O servidor não confirmou a atualização dos dados.");
      }
    } catch (err: any) {
      setSaving(false);
      console.error("Erro ao atualizar perfil:", err);
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Não foi possível salvar as alterações no banco de dados.";

      Alert.alert("Erro ao Atualizar", errorMessage);
    }
  };

  const formatDate = (rawDate?: string | null) => {
    if (!rawDate) return "--";
    const parts = rawDate.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return rawDate;
  };

  const stats = [
    { label: "Carimbos", value: String(user?.stampsCount ?? 0), icon: "award" as const },
    { label: "Km rodados", value: "127", icon: "navigation" as const },
    { label: "Rotas", value: "2", icon: "map" as const },
  ];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: primaryColor }]} edges={["top"]}>
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[primaryColor]}
              tintColor="#ffffff"
            />
          }
        >
          {/* Header Hero Dynamic Theme */}
          <View style={[styles.headerBlue, { backgroundColor: primaryColor }]}>
            {/* Tag de Marca Superior */}
            <View style={styles.brandBadge}>
              <MaterialIcons name="directions-bike" size={13} color="#FFFFFF" />
              <Text style={styles.brandBadgeText}>PORTAL DO CICLISTA</Text>
            </View>

            <View style={styles.userInfoRow}>
              <View style={styles.iconCircle}>
                <Text style={styles.avatarText}>
                  {user?.name?.charAt(0).toUpperCase() || "C"}
                </Text>
              </View>
              <View style={styles.userInfoText}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 2 }}>
                  <Text style={styles.brand}>ROTA CRIC</Text>
                  {isAdmin && (
                    <View style={styles.adminBadgeTag}>
                      <Text style={styles.adminBadgeTagText}>ADMIN</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.title} numberOfLines={1}>{user?.name || "Ciclista"}</Text>
                <Text style={styles.subtitle} numberOfLines={1}>{user?.email}</Text>

                <TouchableOpacity
                  style={styles.btnEditHeader}
                  onPress={handleOpenEdit}
                  activeOpacity={0.8}
                >
                  <Feather name="edit-3" size={12} color="#FFFFFF" />
                  <Text style={styles.btnEditHeaderText}>
                    Editar Perfil
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Stats Bar em Vidro Fosco */}
            <View style={styles.statsRow}>
              {stats.map((s, i) => (
                <React.Fragment key={s.label}>
                  <View style={styles.statBox}>
                    <View style={styles.statIconWrapper}>
                      <Feather name={s.icon} size={14} color="#FFFFFF" />
                    </View>
                    <Text style={styles.statValue}>{s.value}</Text>
                    <Text style={styles.statLabel}>{s.label}</Text>
                  </View>
                  {i < stats.length - 1 && <View style={styles.statDivider} />}
                </React.Fragment>
              ))}
            </View>
          </View>

          {/* Content Body */}
          <View style={styles.scrollPadding}>
            {/* Card: Informações Pessoais */}
            <View style={styles.infoCard}>
              <View style={styles.infoCardHeader}>
                <View style={styles.infoCardTitleGroup}>
                  <View style={[styles.cardHeaderIconBox, { backgroundColor: primaryColor + "15" }]}>
                    <MaterialIcons name="badge" size={18} color={primaryColor} />
                  </View>
                  <Text style={styles.infoCardTitle}>Informações Pessoais</Text>
                </View>

                <TouchableOpacity
                  style={[styles.quickEditBtn, { backgroundColor: primaryColor + "12" }]}
                  onPress={handleOpenEdit}
                  activeOpacity={0.8}
                >
                  <Feather name="edit-2" size={12} color={primaryColor} />
                  <Text style={[styles.quickEditText, { color: primaryColor }]}>Editar</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoLabelContainer}>
                  <MaterialIcons name="person-outline" size={16} color="#64748B" />
                  <Text style={styles.infoLabel}>Nome Completo</Text>
                </View>
                <Text style={styles.infoValue}>{user?.name || "--"}</Text>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoLabelContainer}>
                  <MaterialIcons name="mail-outline" size={16} color="#64748B" />
                  <Text style={styles.infoLabel}>E-mail</Text>
                </View>
                <Text style={styles.infoValue}>{user?.email || "--"}</Text>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoLabelContainer}>
                  <Feather name="at-sign" size={15} color="#64748B" />
                  <Text style={styles.infoLabel}>Rede Social</Text>
                </View>
                <Text style={styles.infoValue}>
                  {user?.social_network || "--"}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoLabelContainer}>
                  <MaterialIcons name="cake" size={16} color="#64748B" />
                  <Text style={styles.infoLabel}>Data de Nascimento</Text>
                </View>
                <Text style={styles.infoValue}>
                  {formatDate(user?.birth_date)}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoLabelContainer}>
                  <MaterialIcons name="credit-card" size={16} color="#64748B" />
                  <Text style={styles.infoLabel}>Documento</Text>
                </View>
                <Text style={styles.infoValue}>{user?.document || "--"}</Text>
              </View>

              <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                <View style={styles.infoLabelContainer}>
                  <MaterialIcons name="assignment-ind" size={16} color="#64748B" />
                  <Text style={styles.infoLabel}>Tipo</Text>
                </View>
                <View style={[styles.docTypeTag, { backgroundColor: primaryColor + "15" }]}>
                  <Text style={[styles.docTypeTagText, { color: primaryColor }]}>
                    {user?.document_type || "RG"}
                  </Text>
                </View>
              </View>
            </View>

            {/* Card: Preferências do Aplicativo */}
            <View style={styles.settingsCard}>
              <View style={styles.infoCardHeader}>
                <View style={styles.infoCardTitleGroup}>
                  <View style={[styles.cardHeaderIconBox, { backgroundColor: primaryColor + "15" }]}>
                    <MaterialIcons name="tune" size={18} color={primaryColor} />
                  </View>
                  <Text style={styles.infoCardTitle}>Preferências do Aplicativo</Text>
                </View>
              </View>

              <View style={styles.settingToggleRow}>
                <View style={styles.settingToggleInfo}>
                  <View style={styles.settingToggleTitleRow}>
                    <MaterialIcons name="notifications-active" size={17} color="#334155" />
                    <Text style={styles.settingToggleLabel}>Notificações do Aplicativo</Text>
                  </View>
                  <Text style={styles.settingToggleSubtext}>
                    Receba alertas sobre conquistas, carimbos, sincronizações e avisos da rota.
                  </Text>
                </View>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={(value) => setNotificationsEnabled(value)}
                  trackColor={{ false: "#CBD5E1", true: primaryColor + "80" }}
                  thumbColor={notificationsEnabled ? primaryColor : "#94A3B8"}
                />
              </View>
            </View>

            {/* Card: Painel de Administração (Exclusivo Staff/Admin) */}
            {(user?.is_staff || user?.is_superuser) && (
              <View style={[styles.adminCard, isOffline && styles.adminCardOffline]}>
                <View style={styles.adminCardHeader}>
                  <View style={[styles.cardHeaderIconBox, { backgroundColor: isOffline ? "#E2E8F0" : primaryColor + "15" }]}>
                    <MaterialIcons name="admin-panel-settings" size={20} color={isOffline ? "#94A3B8" : primaryColor} />
                  </View>
                  <Text style={[styles.adminCardTitle, { color: isOffline ? "#64748B" : "#0F172A" }]}>
                    Painel Administrativo {isOffline && "(Off-line)"}
                  </Text>
                </View>
                <Text style={styles.adminCardSubtitle}>
                  {isOffline
                    ? "O gerenciamento de Pontos de Apoio e Carimbos está temporariamente desabilitado pois seu dispositivo está sem conexão."
                    : "Acesso aos recursos de cadastro e gestão de Pontos de Apoio e Carimbos."}
                </Text>
                <TouchableOpacity
                  style={[
                    styles.btnAdminPanel,
                    { backgroundColor: isOffline ? "#94A3B8" : primaryColor },
                  ]}
                  onPress={() => {
                    if (isOffline) {
                      Alert.alert(
                        "Modo Off-line",
                        "O Painel Administrativo está desabilitado no modo off-line para evitar alterações de pontos de apoio sem conexão com a internet.",
                      );
                      return;
                    }
                    router.push("/(tabs)/admin");
                  }}
                  activeOpacity={0.8}
                >
                  <MaterialIcons name={isOffline ? "lock" : "tune"} size={17} color="#FFFFFF" />
                  <Text style={styles.btnAdminPanelText}>
                    {isOffline ? "Indisponível Off-line" : "Gerenciar Pontos & Carimbos"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Botão Sair */}
            <TouchableOpacity style={styles.buttonLogout} onPress={logout} activeOpacity={0.85}>
              <IconSymbol
                name="rectangle.portrait.and.arrow.right"
                size={18}
                color="#EF4444"
              />
              <Text style={styles.logoutText}>Sair da conta</Text>
            </TouchableOpacity>

            <Text style={styles.versionText}>ROTA CRIC Mobile v1.0.0</Text>
          </View>
        </ScrollView>

        {/* Modal de Edição de Informações Pessoais */}
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <MaterialIcons name="edit" size={20} color={primaryColor} />
                  <Text style={styles.modalTitle}>Editar Informações</Text>
                </View>
                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalCloseBtn}>
                  <MaterialIcons name="close" size={20} color="#64748B" />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                style={{ maxHeight: 420 }}
              >
                {/* Nome & Sobrenome */}
                <View style={{ flexDirection: "row", gap: 10 }}>
                  <View style={[styles.inputGroupModal, { flex: 1 }]}>
                    <Text style={styles.labelModal}>Nome</Text>
                    <TextInput
                      value={editForm.first_name}
                      onChangeText={(t) =>
                        setEditForm((prev) => ({ ...prev, first_name: t }))
                      }
                      style={styles.inputModal}
                      placeholder="Nome"
                      placeholderTextColor="#94A3B8"
                    />
                  </View>

                  <View style={[styles.inputGroupModal, { flex: 1 }]}>
                    <Text style={styles.labelModal}>Sobrenome</Text>
                    <TextInput
                      value={editForm.last_name}
                      onChangeText={(t) =>
                        setEditForm((prev) => ({ ...prev, last_name: t }))
                      }
                      style={styles.inputModal}
                      placeholder="Sobrenome"
                      placeholderTextColor="#94A3B8"
                    />
                  </View>
                </View>

                {/* E-mail */}
                <View style={styles.inputGroupModal}>
                  <Text style={styles.labelModal}>E-mail</Text>
                  <TextInput
                    value={editForm.email}
                    onChangeText={(t) =>
                      setEditForm((prev) => ({ ...prev, email: t }))
                    }
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={styles.inputModal}
                    placeholder="email@exemplo.com"
                    placeholderTextColor="#94A3B8"
                  />
                </View>

                {/* Rede Social */}
                <View style={styles.inputGroupModal}>
                  <Text style={styles.labelModal}>Rede Social</Text>
                  <TextInput
                    value={editForm.social_network}
                    onChangeText={(t) =>
                      setEditForm((prev) => ({ ...prev, social_network: t }))
                    }
                    autoCapitalize="none"
                    style={styles.inputModal}
                    placeholder="@seu_instagram"
                    placeholderTextColor="#94A3B8"
                  />
                </View>

                {/* Data de Nascimento com Native DatePicker */}
                <View style={styles.inputGroupModal}>
                  <Text style={styles.labelModal}>Data de Nascimento</Text>
                  <TouchableOpacity
                    style={[
                      styles.inputModal,
                      {
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                      },
                    ]}
                    onPress={() => setShowDatePicker(true)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        color: editForm.birth_date ? "#0F172A" : "#94A3B8",
                      }}
                    >
                      {editForm.birth_date
                        ? formatDate(editForm.birth_date)
                        : "Selecione a data"}
                    </Text>
                    <MaterialIcons
                      name="calendar-today"
                      size={18}
                      color="#64748B"
                    />
                  </TouchableOpacity>

                  {showDatePicker && (
                    <DateTimePicker
                      value={selectedDate}
                      mode="date"
                      display={Platform.OS === "ios" ? "spinner" : "default"}
                      maximumDate={new Date()}
                      onChange={handleDateChange}
                    />
                  )}
                </View>

                {/* Documento / RG */}
                <View style={{ flexDirection: "row", gap: 10 }}>
                  <View style={[styles.inputGroupModal, { flex: 2 }]}>
                    <Text style={styles.labelModal}>RG / Documento</Text>
                    <TextInput
                      value={editForm.document}
                      onChangeText={(t) =>
                        setEditForm((prev) => ({ ...prev, document: t }))
                      }
                      style={styles.inputModal}
                      placeholder="1134711538"
                      placeholderTextColor="#94A3B8"
                    />
                  </View>

                  <View style={[styles.inputGroupModal, { flex: 1 }]}>
                    <Text style={styles.labelModal}>Tipo</Text>
                    <View style={styles.docTypeRow}>
                      {(["RG", "CPF"] as const).map((type) => (
                        <TouchableOpacity
                          key={type}
                          onPress={() =>
                            setEditForm((prev) => ({
                              ...prev,
                              document_type: type,
                            }))
                          }
                          style={[
                            styles.docTypeBtn,
                            editForm.document_type === type && [
                              styles.docTypeBtnActive,
                              { borderColor: primaryColor, backgroundColor: primaryColor + "12" },
                            ],
                          ]}
                        >
                          <Text
                            style={[
                              styles.docTypeText,
                              editForm.document_type === type && [
                                styles.docTypeTextActive,
                                { color: primaryColor },
                              ],
                            ]}
                          >
                            {type}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>
              </ScrollView>

              {/* Modal Action Buttons */}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.btnCancelModal}
                  onPress={() => setModalVisible(false)}
                  disabled={saving}
                >
                  <Text style={styles.btnCancelText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.btnSaveModal,
                    { backgroundColor: primaryColor },
                    saving && { opacity: 0.6 },
                  ]}
                  onPress={handleSaveProfile}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Text style={styles.btnSaveText}>Salvar</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
    backgroundColor: "#F8FAFC",
  },
  headerBlue: {
    backgroundColor: CRIC_BLUE,
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 28,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  brandBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    backgroundColor: "rgba(255, 255, 255, 0.16)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  brandBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.8,
    color: "#FFFFFF",
  },
  userInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 20,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255, 255, 255, 0.22)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.35)",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "800",
  },
  userInfoText: {
    flex: 1,
  },
  brand: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2,
    color: "rgba(255, 255, 255, 0.6)",
  },
  adminBadgeTag: {
    backgroundColor: "rgba(255, 255, 255, 0.22)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  adminBadgeTagText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  subtitle: {
    color: "rgba(255, 255, 255, 0.78)",
    fontSize: 12,
    marginTop: 1,
  },
  btnEditHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginTop: 8,
    gap: 5,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.22)",
  },
  btnEditHeaderText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.18)",
  },
  statBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  statIconWrapper: {
    marginBottom: 2,
    opacity: 0.85,
  },
  statDivider: {
    width: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginVertical: 4,
  },
  statValue: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  statLabel: {
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.7)",
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  content: {
    flex: 1,
  },
  scrollPadding: {
    padding: 16,
    paddingTop: 18,
    paddingBottom: 40,
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    elevation: 3,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  infoCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    paddingBottom: 12,
  },
  infoCardTitleGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardHeaderIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  infoCardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  quickEditBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  quickEditText: {
    fontSize: 12,
    fontWeight: "700",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: "#F8FAFC",
  },
  infoLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoLabel: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 13.5,
    color: "#0F172A",
    fontWeight: "600",
  },
  docTypeTag: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 8,
  },
  docTypeTagText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  settingsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    marginTop: 16,
    elevation: 3,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  settingToggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
    gap: 12,
  },
  settingToggleInfo: {
    flex: 1,
  },
  settingToggleTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  settingToggleLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
  settingToggleSubtext: {
    fontSize: 12,
    color: "#64748B",
    lineHeight: 16,
  },
  adminCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    marginTop: 16,
    elevation: 3,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  adminCardOffline: {
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
  },
  adminCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  adminCardTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  adminCardSubtitle: {
    fontSize: 12.5,
    color: "#64748B",
    marginBottom: 14,
    lineHeight: 18,
  },
  btnAdminPanel: {
    backgroundColor: CRIC_BLUE,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  btnAdminPanelText: {
    color: "#FFFFFF",
    fontSize: 13.5,
    fontWeight: "700",
  },
  buttonLogout: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FEE2E2",
    gap: 8,
  },
  logoutText: {
    color: "#EF4444",
    fontWeight: "700",
    fontSize: 14,
  },
  versionText: {
    textAlign: "center",
    color: "#94A3B8",
    fontSize: 11,
    marginTop: 20,
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    paddingBottom: 12,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
  },
  modalCloseBtn: {
    padding: 4,
    borderRadius: 8,
    backgroundColor: "#F1F5F9",
  },
  inputGroupModal: {
    marginBottom: 14,
  },
  labelModal: {
    fontSize: 12,
    color: "#475569",
    fontWeight: "600",
    marginBottom: 4,
  },
  inputModal: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
    fontSize: 14,
    color: "#0F172A",
  },
  docTypeRow: {
    flexDirection: "row",
    gap: 4,
    height: 46,
  },
  docTypeBtn: {
    flex: 1,
    backgroundColor: "#F1F5F9",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  docTypeBtnActive: {
    backgroundColor: "#EFF6FF",
    borderColor: CRIC_BLUE,
  },
  docTypeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
  },
  docTypeTextActive: {
    color: CRIC_BLUE,
    fontWeight: "700",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 18,
  },
  btnCancelModal: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
  },
  btnCancelText: {
    color: "#475569",
    fontWeight: "600",
    fontSize: 14,
  },
  btnSaveModal: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: CRIC_BLUE,
    alignItems: "center",
    justifyContent: "center",
  },
  btnSaveText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
});

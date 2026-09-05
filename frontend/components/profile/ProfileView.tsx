import { useAuth } from "@/components/contexts/AuthContext";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { updateUserProfile } from "@/services/users/userService";
import { MaterialIcons } from "@expo/vector-icons";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const CRIC_BLUE = "#2563EB";

export function ProfileView() {
  const { user, logout, refreshUser } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2000, 0, 1));

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
    { label: "Carimbos", value: String(user?.stampsCount ?? 0) },
    { label: "Km rodados", value: "127" },
    { label: "Rotas", value: "2" },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        {/* Header Hero Blue */}
        <View style={styles.headerBlue}>
          <View style={styles.userInfoRow}>
            <View style={styles.iconCircle}>
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0).toUpperCase() || "C"}
              </Text>
            </View>
            <View style={styles.userInfoText}>
              <Text style={styles.brand}>ROTA CRIC</Text>
              <Text style={styles.title}>{user?.name || "Ciclista"}</Text>
              <Text style={styles.subtitle}>{user?.email}</Text>

              <TouchableOpacity
                style={styles.btnEditHeader}
                onPress={handleOpenEdit}
                activeOpacity={0.8}
              >
                <MaterialIcons name="edit" size={14} color="#FFFFFF" />
                <Text style={styles.btnEditHeaderText}>
                  Editar Informações Pessoais
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Stats Bar */}
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

        {/* Content Body */}
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollPadding}
          showsVerticalScrollIndicator={false}
        >
          {/* Card: Informações Pessoais (Matching Web Django) */}
          <View style={styles.infoCard}>
            <View style={styles.infoCardHeader}>
              <MaterialIcons name="badge" size={20} color={CRIC_BLUE} />
              <Text style={styles.infoCardTitle}>Informações Pessoais</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Nome Completo</Text>
              <Text style={styles.infoValue}>{user?.name || "--"}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user?.email || "--"}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Rede Social</Text>
              <Text style={styles.infoValue}>
                {user?.social_network || "--"}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Data de Nascimento</Text>
              <Text style={styles.infoValue}>
                {formatDate(user?.birth_date)}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>RG / Documento</Text>
              <Text style={styles.infoValue}>{user?.document || "--"}</Text>
            </View>

            <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.infoLabel}>Identificação</Text>
              <Text style={styles.infoValue}>
                {user?.document_type || "--"}
              </Text>
            </View>
          </View>

          {/* Botão Sair */}
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
                <Text style={styles.modalTitle}>Editar Informações</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <MaterialIcons name="close" size={24} color="#64748B" />
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
                            editForm.document_type === type &&
                              styles.docTypeBtnActive,
                          ]}
                        >
                          <Text
                            style={[
                              styles.docTypeText,
                              editForm.document_type === type &&
                                styles.docTypeTextActive,
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
                  style={[styles.btnSaveModal, saving && { opacity: 0.6 }]}
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
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  userInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 20,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.22)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.35)",
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
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2,
    color: "rgba(255,255,255,0.5)",
    marginBottom: 2,
  },
  title: {
    color: "white",
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  subtitle: {
    color: "rgba(255, 255, 255, 0.75)",
    fontSize: 12,
    marginTop: 1,
  },
  btnEditHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginTop: 8,
    gap: 4,
  },
  btnEditHeaderText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  statBox: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  statValue: {
    color: "white",
    fontSize: 17,
    fontWeight: "800",
  },
  statLabel: {
    fontSize: 10,
    color: "rgba(255,255,255,0.6)",
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
  },
  scrollPadding: {
    padding: 18,
    paddingTop: 20,
    paddingBottom: 40,
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  infoCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    paddingBottom: 12,
  },
  infoCardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F8FAFC",
  },
  infoLabel: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 14,
    color: "#0F172A",
    fontWeight: "600",
  },
  buttonLogout: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
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
    color: "#94A3B8",
    fontSize: 11,
    marginTop: 20,
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
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
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
    borderColor: "#CBD5E1",
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
    borderColor: "#CBD5E1",
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
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center",
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

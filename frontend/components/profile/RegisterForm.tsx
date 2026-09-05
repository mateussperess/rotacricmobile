import { createUser } from "@/services/users/userService";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { CustomInput } from "./CustomInput";
import { styles } from "./styles";

interface Props {
  onSuccess: () => void;
}

export function RegisterForm({ onSuccess }: Props) {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    pass: "",
  });
  const [confirmPass, setConfirmPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (field: keyof typeof form) => (value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    setError("");

    if (!form.first_name.trim() || !form.username.trim() || !form.email.trim() || !form.pass) {
      setError("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    if (form.pass !== confirmPass) {
      setError("As senhas não coincidem");
      return;
    }

    setLoading(true);
    try {
      await createUser({
        ...form,
        username: form.username.trim().toLowerCase(),
        email: form.email.trim().toLowerCase(),
      });
      Alert.alert("Conta criada com sucesso!", "Você já pode acessar sua conta com suas credenciais.");
      onSuccess();
    } catch (e: any) {
      const msg = e.response?.data?.message;
      setError(Array.isArray(msg) ? msg[0] : (msg ?? "Erro ao criar conta"));
    } finally {
      setLoading(false);
    }
  };

  const passwordsMatch = confirmPass.length > 0 && form.pass === confirmPass;
  const passwordsMismatch = confirmPass.length > 0 && form.pass !== confirmPass;

  return (
    <View style={{ flex: 1 }}>
      {/* Banner de Erro */}
      {error ? (
        <View style={styles.errorBanner}>
          <MaterialIcons name="error-outline" size={20} color="#DC2626" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {/* Grid Nome & Sobrenome */}
      <View style={{ flexDirection: "row", gap: 12 }}>
        <View style={{ flex: 1 }}>
          <CustomInput
            label="Nome"
            value={form.first_name}
            onChangeText={set("first_name")}
            placeholder="João"
            autoComplete="name-given"
          />
        </View>

        <View style={{ flex: 1 }}>
          <CustomInput
            label="Sobrenome"
            value={form.last_name}
            onChangeText={set("last_name")}
            placeholder="Silva"
            autoComplete="name-family"
          />
        </View>
      </View>

      {/* Campo Username */}
      <CustomInput
        label="Nome de Usuário (Username)"
        iconName="alternate-email"
        value={form.username}
        onChangeText={set("username")}
        placeholder="joao_silva"
        autoCapitalize="none"
        autoComplete="username"
      />

      {/* Campo E-mail */}
      <CustomInput
        label="E-mail"
        iconName="mail-outline"
        value={form.email}
        onChangeText={set("email")}
        placeholder="seu@email.com"
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
      />

      {/* Campo Senha */}
      <CustomInput
        label="Senha"
        iconName="lock-outline"
        value={form.pass}
        onChangeText={set("pass")}
        secureTextEntry={!showPass}
        placeholder="Mínimo 6 caracteres"
        autoComplete="password-new"
        rightIconName={showPass ? "visibility" : "visibility-off"}
        onRightIconPress={() => setShowPass(!showPass)}
      />

      {/* Campo Confirmar Senha com Indicador */}
      <View style={{ marginBottom: 8 }}>
        <CustomInput
          label="Confirmar Senha"
          iconName="verified-user"
          value={confirmPass}
          onChangeText={setConfirmPass}
          secureTextEntry={!showConfirm}
          placeholder="Repita a senha"
          autoComplete="password-new"
          rightIconName={showConfirm ? "visibility" : "visibility-off"}
          onRightIconPress={() => setShowConfirm(!showConfirm)}
          error={passwordsMismatch}
          success={passwordsMatch}
        />

        {/* Dynamic Match Indicator */}
        {passwordsMatch ? (
          <View style={[styles.passwordMatchBadge, { marginTop: -10, marginBottom: 12 }]}>
            <MaterialIcons name="check-circle" size={14} color="#10B981" />
            <Text style={[styles.passwordMatchText, { color: "#10B981" }]}>
              Senhas coincidem
            </Text>
          </View>
        ) : passwordsMismatch ? (
          <View style={[styles.passwordMatchBadge, { marginTop: -10, marginBottom: 12 }]}>
            <MaterialIcons name="cancel" size={14} color="#EF4444" />
            <Text style={[styles.passwordMatchText, { color: "#EF4444" }]}>
              As senhas não coincidem
            </Text>
          </View>
        ) : null}
      </View>

      {/* Botão Primário Criar Conta */}
      <TouchableOpacity
        style={[
          styles.buttonPrimary,
          loading && styles.buttonPrimaryDisabled,
        ]}
        onPress={handleSubmit}
        disabled={loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <Text style={styles.buttonText}>Criar minha conta</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

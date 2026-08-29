import { useAuth } from "@/components/contexts/AuthContext";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { CustomInput } from "./CustomInput";
import { styles } from "./styles";

interface Props {
  onSuccess: () => void;
  onSwitchToRegister: () => void;
}

export function LoginForm({ onSuccess, onSwitchToRegister }: Props) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!email.trim() || !password) {
      setError("Por favor, preencha todos os campos");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const ok = await login(email.trim(), password);
      setLoading(false);
      if (ok) {
        onSuccess();
      } else {
        setError("E-mail, usuário ou senha incorretos.");
      }
    } catch (err: any) {
      setLoading(false);
      const errorMsg =
        err?.response?.data?.message || "Não foi possível realizar o login";
      setError(Array.isArray(errorMsg) ? errorMsg[0] : errorMsg);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Mensagem de Erro com Ícone */}
      {error ? (
        <View style={styles.errorBanner}>
          <MaterialIcons name="error-outline" size={20} color="#DC2626" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {/* Campo E-mail / Username */}
      <CustomInput
        label="E-mail ou Usuário"
        iconName="person-outline"
        value={email}
        onChangeText={setEmail}
        placeholder="seu_usuario ou email@exemplo.com"
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="username"
      />

      {/* Campo Senha */}
      <CustomInput
        label="Senha"
        iconName="lock-outline"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={!showPass}
        placeholder="Digite sua senha"
        autoComplete="current-password"
        rightIconName={showPass ? "visibility" : "visibility-off"}
        onRightIconPress={() => setShowPass(!showPass)}
      />

      {/* Botão Primário Entrar */}
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
          <Text style={styles.buttonText}>Entrar na Rota</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

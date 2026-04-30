import { useAuth } from "@/components/context/AuthContext";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
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
    setError("");
    setLoading(true);
    const ok = await login(email, password);
    setLoading(false);
    if (ok) onSuccess();
    else setError("Credenciais inválidas");
  };

  return (
    <View style={styles.content}>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>E-mail</Text>
        <View style={styles.inputContainer}>
          <MaterialIcons name="email" size={20} color="#9CA3AF" />
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="seu@email.com"
            style={styles.input}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Senha</Text>
        <View style={styles.inputContainer}>
          <MaterialIcons name="lock" size={20} color="#9CA3AF" />
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPass}
            placeholder="••••••••"
            style={styles.input}
          />
          <TouchableOpacity onPress={() => setShowPass(!showPass)}>
            <MaterialIcons
              name={showPass ? "visibility" : "visibility-off"}
              size={20}
              color="#9CA3AF"
            />
          </TouchableOpacity>
        </View>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TouchableOpacity
        style={styles.buttonPrimary}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>Entrar</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

import { useAuth } from "@/components/context/AuthContext";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { styles } from "./styles";

export function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"login" | "register">("login");

  const handleSubmit = async () => {
    setLoading(true);
    const ok = await login(email, password);
    setLoading(false);
    if (ok) onSuccess();
    else setError("Credenciais inválidas");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView bounces={false}>
        <View style={styles.headerBlue}>
          <View style={styles.iconCircle}>
            <FontAwesome5 name="bicycle" size={30} color="white" />
          </View>
          <Text style={styles.title}>ROTA CRIC</Text>
          <Text style={styles.subtitle}>
            Cicloturismo na Região Carbonífera
          </Text>
        </View>

        <View style={styles.content}>
          <View style={styles.toggleContainer}>
            {["login", "register"].map((m) => (
              <TouchableOpacity
                key={m}
                onPress={() => setMode(m as any)}
                style={[
                  styles.toggleButton,
                  mode === m && styles.toggleButtonActive,
                ]}
              >
                <Text
                  style={
                    mode === m
                      ? styles.toggleTextActive
                      : styles.toggleTextInactive
                  }
                >
                  {m === "login" ? "Entrar" : "Criar conta"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

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
              <Text style={styles.buttonText}>
                {mode === "login" ? "Entrar" : "Criar conta"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

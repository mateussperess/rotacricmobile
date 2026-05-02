import { createUser } from "@/services/users/userService";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
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

    if (form.pass !== confirmPass) {
      setError("As senhas não coincidem");
      return;
    }

    setLoading(true);
    try {
      await createUser(form);
      Alert.alert("Conta criada!", "Você já pode fazer login.");
      onSuccess();
    } catch (e: any) {
      const msg = e.response?.data?.message;
      setError(Array.isArray(msg) ? msg[0] : (msg ?? "Erro ao criar conta"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.content}>
      <View style={{ flexDirection: "row", gap: 12 }}>
        <View style={[styles.inputGroup, { flex: 1 }]}>
          <Text style={styles.label}>Nome</Text>
          <View style={styles.inputContainer}>
            <TextInput
              value={form.first_name}
              onChangeText={set("first_name")}
              placeholder="João"
              style={styles.input}
            />
          </View>
        </View>
        <View style={[styles.inputGroup, { flex: 1 }]}>
          <Text style={styles.label}>Sobrenome</Text>
          <View style={styles.inputContainer}>
            <TextInput
              value={form.last_name}
              onChangeText={set("last_name")}
              placeholder="Silva"
              style={styles.input}
            />
          </View>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Username</Text>
        <View style={styles.inputContainer}>
          <MaterialIcons name="person" size={20} color="#9CA3AF" />
          <TextInput
            value={form.username}
            onChangeText={set("username")}
            placeholder="joao_silva"
            style={styles.input}
            autoCapitalize="none"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>E-mail</Text>
        <View style={styles.inputContainer}>
          <MaterialIcons name="email" size={20} color="#9CA3AF" />
          <TextInput
            value={form.email}
            onChangeText={set("email")}
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
            value={form.pass}
            onChangeText={set("pass")}
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

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Confirmar senha</Text>
        <View style={styles.inputContainer}>
          <MaterialIcons name="lock-outline" size={20} color="#9CA3AF" />
          <TextInput
            value={confirmPass}
            onChangeText={setConfirmPass}
            secureTextEntry={!showConfirm}
            placeholder="••••••••"
            style={styles.input}
          />
          <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
            <MaterialIcons
              name={showConfirm ? "visibility" : "visibility-off"}
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
          <Text style={styles.buttonText}>Criar conta</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

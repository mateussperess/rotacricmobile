import { useAuth } from "@/components/contexts/AuthContext";
import { LoginForm } from "@/components/profile/LoginForm";
import { ProfileView } from "@/components/profile/ProfileView";
import { RegisterForm } from "@/components/profile/RegisterForm";
import { styles } from "@/components/profile/styles";
import { FontAwesome5 } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function ProfileScreen() {
  const { isLoggedIn, loading } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Carregando...</Text>
      </View>
    );
  }

  if (isLoggedIn) {
    return <ProfileView />;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: "#F9FAFB" }}
    >
      <ScrollView bounces={false} contentContainerStyle={{ flexGrow: 1 }}>
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
            {(["login", "register"] as const).map((m) => (
              <TouchableOpacity
                key={m}
                onPress={() => setMode(m)}
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

          {mode === "login" ? (
            <LoginForm
              onSuccess={() => {}}
              onSwitchToRegister={() => setMode("register")}
            />
          ) : (
            <RegisterForm onSuccess={() => setMode("login")} />
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

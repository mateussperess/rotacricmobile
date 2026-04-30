import { useAuth } from "@/components/context/AuthContext";
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
import { LoginForm } from "./LoginForm";
import { ProfileView } from "./ProfileView";
import { RegisterForm } from "./RegisterForm";
import { styles } from "./styles";

export default function ProfileScreen() {
  const { isLoggedIn } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");

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

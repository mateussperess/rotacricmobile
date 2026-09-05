import { useAuth } from "@/components/contexts/AuthContext";
import { LoginForm } from "@/components/profile/LoginForm";
import { ProfileView } from "@/components/profile/ProfileView";
import { RegisterForm } from "@/components/profile/RegisterForm";
import { styles } from "@/components/profile/styles";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const { isLoggedIn, loading } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");

  if (loading) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#F8FAFC",
        }}
      >
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={{ marginTop: 12, color: "#64748B", fontWeight: "500" }}>
          Carregando perfil...
        </Text>
      </SafeAreaView>
    );
  }

  if (isLoggedIn) {
    return <ProfileView />;
  }

  return (
    <SafeAreaProvider>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1, backgroundColor: "#F8FAFC" }}
      >
        <ScrollView
          bounces={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          {/* Header Hero com Gradiente Azul e Branding */}
          <SafeAreaView edges={["top"]} style={{ backgroundColor: "#1D4ED8" }}>
            <View style={styles.headerBlue}>
              <View style={styles.badgeContainer}>
                <MaterialIcons name="directions-bike" size={14} color="#E0E7FF" />
                <Text style={styles.badgeText}>PORTAL DO CICLISTA</Text>
              </View>

              <View style={styles.iconCircle}>
                <FontAwesome5 name="bicycle" size={32} color="#FFFFFF" />
              </View>

              <Text style={styles.title}>ROTA CRIC</Text>
              <Text style={styles.subtitle}>
                Cicloturismo na Região Carbonífera
              </Text>
            </View>
          </SafeAreaView>

          {/* Card Flutuante de Autenticação */}
          <View style={styles.content}>
            {/* Pill Tab Switcher */}
            <View style={styles.toggleContainer}>
              {(["login", "register"] as const).map((m) => (
                <TouchableOpacity
                  key={m}
                  onPress={() => setMode(m)}
                  activeOpacity={0.8}
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
    </SafeAreaProvider>
  );
}

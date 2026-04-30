import { useAuth } from "@/components/context/AuthContext";
import React from "react";
import { View } from "react-native";
import { LoginForm } from "./LoginForm";
import { ProfileView } from "./ProfileView";

export default function ProfileScreen() {
  const { isLoggedIn } = useAuth();

  return (
    <View style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
      {isLoggedIn ? <ProfileView /> : <LoginForm onSuccess={() => {}} />}
    </View>
  );
}

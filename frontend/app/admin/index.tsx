import { Redirect } from "expo-router";

export default function AdminIndexRedirect() {
  return <Redirect href="/(tabs)/admin" />;
}

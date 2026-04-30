import { Platform, StatusBar, StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB", // gray-50
  },
  // Header do Login e Perfil
  headerBlue: {
    backgroundColor: "#2563EB", // blue-600
    paddingHorizontal: 24,
    paddingTop:
      Platform.OS === "ios"
        ? 60
        : StatusBar.currentHeight
          ? StatusBar.currentHeight + 20
          : 40,
    paddingBottom: 40,
    alignItems: "center",
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
  },
  subtitle: {
    color: "#DBEAFE", // blue-100
    fontSize: 12,
    marginTop: 4,
  },
  // Formulário
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6", // gray-100
    borderRadius: 16,
    padding: 4,
    marginBottom: 24,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
  },
  toggleButtonActive: {
    backgroundColor: "#FFFFFF",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  toggleTextActive: {
    color: "#1D4ED8", // blue-700
    fontSize: 14,
    fontWeight: "600",
  },
  toggleTextInactive: {
    color: "#9CA3AF", // gray-400
    fontSize: 14,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    color: "#6B7280", // gray-500
    fontWeight: "500",
    marginBottom: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: "#1F2937",
    marginLeft: 12,
  },
  buttonPrimary: {
    backgroundColor: "#2563EB",
    height: 56,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    elevation: 4,
    shadowColor: "#2563EB",
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  // Menu do Perfil
  menuCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    overflow: "hidden",
    elevation: 1,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  menuIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  menuTextMain: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1F2937",
  },
  menuTextSub: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  buttonLogout: {
    marginTop: 16,
    height: 52,
    borderWidth: 1,
    borderColor: "#FEE2E2",
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 12,
    marginBottom: 10,
  },
});

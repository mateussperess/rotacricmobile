import { Feather } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const CRIC_BLUE = "#2563EB";

export default function EscanearScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [scannedData, setScannedData] = useState<string | null>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // ── Loading de permissão ──
  if (!permission) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.screen}>
          <View style={styles.hero}>
            <Text style={styles.brand}>ROTA CRIC</Text>
            <Text style={styles.heroTitle}>Escanear Código</Text>
          </View>
          <ActivityIndicator
            size="large"
            color={CRIC_BLUE}
            style={{ flex: 1 }}
          />
        </View>
      </SafeAreaView>
    );
  }

  // ── Sem permissão de câmera ──
  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.screen}>
          <View style={styles.hero}>
            <Text style={styles.brand}>ROTA CRIC</Text>
            <Text style={styles.heroTitle}>Escanear Código</Text>
            <Text style={styles.heroSub}>
              Aponte para os QR Codes nas placas físicas dos pontos de apoio
              para coletar seu carimbo.
            </Text>

            {/* Stats — mesmo glassmorphism das outras telas */}
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>QR</Text>
                <Text style={styles.statLabel}>Tecnologia</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={styles.statValue}>9</Text>
                <Text style={styles.statLabel}>Pontos</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={styles.statValue}>1</Text>
                <Text style={styles.statLabel}>Certificado</Text>
              </View>
            </View>
          </View>

          <View style={styles.content}>
            <View style={styles.permissionContainer}>
              <View style={styles.iconCircle}>
                <Feather name="camera-off" size={32} color="#9CA3AF" />
              </View>
              <Text style={styles.permissionTitle}>Câmera desativada</Text>
              <Text style={styles.permissionSub}>
                Precisamos de acesso à câmera para que você possa escanear os QR
                Codes e validar seus carimbos da rota.
              </Text>
              <Pressable
                style={({ pressed }) => [
                  styles.primaryBtn,
                  pressed && styles.btnPressed,
                ]}
                onPress={requestPermission}
              >
                <Text style={styles.primaryBtnText}>Conceder permissão</Text>
                <Feather name="check-circle" size={18} color="#fff" />
              </Pressable>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    setScanned(true);
    setScannedData(data);
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.4,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleResetScan = () => {
    setScanned(false);
    setScannedData(null);
  };

  // ── Com câmera ──
  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.screen}>
        <View style={styles.hero}>
          <Text style={styles.brand}>ROTA CRIC</Text>
          <Text style={styles.heroTitle}>Escanear Código</Text>
          <Text style={styles.heroSub}>
            Aponte para o QR Code nas placas físicas dos pontos de apoio para
            coletar seu carimbo.
          </Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.sectionLabel}>CÂMERA</Text>

          {/* Scanner */}
          <View style={styles.scannerWrapper}>
            <Animated.View
              style={{ flex: 1, opacity: fadeAnim, backgroundColor: "#F3F4F6" }}
            >
              <CameraView
                style={StyleSheet.absoluteFillObject}
                facing="back"
                barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
                onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
              />
              <View style={styles.overlay} pointerEvents="none">
                <View style={styles.unfocusedContainer} />
                <View style={styles.middleRow}>
                  <View style={styles.unfocusedContainer} />
                  <View
                    style={[
                      styles.targetSquare,
                      scanned && styles.targetSquareScanned,
                    ]}
                  />
                  <View style={styles.unfocusedContainer} />
                </View>
                <View style={styles.unfocusedContainer} />
              </View>
            </Animated.View>
          </View>

          {/* Painel de ação */}
          <View style={styles.cardContainer}>
            {!scanned ? (
              <View style={styles.statusCard}>
                <ActivityIndicator size="small" color={CRIC_BLUE} />
                <Text style={styles.statusText}>
                  Buscando QR Code na placa...
                </Text>
              </View>
            ) : (
              <View style={styles.scannedCard}>
                <View style={styles.scannedCardAccent} />
                <View style={styles.scannedCardBody}>
                  <View style={styles.scannedCardHeader}>
                    <Text style={styles.scannedLabel}>CÓDIGO DETECTADO</Text>
                    <View style={styles.successChip}>
                      <Feather name="check" size={12} color="#10B981" />
                      <Text style={styles.successChipText}>Sucesso</Text>
                    </View>
                  </View>

                  <Text style={styles.scannedTitle}>Conteúdo Lido</Text>
                  <Text style={styles.scannedData} numberOfLines={2}>
                    {scannedData}
                  </Text>

                  <View style={styles.scannedFooter}>
                    <Pressable
                      style={({ pressed }) => [
                        styles.resetBtn,
                        pressed && styles.btnPressed,
                      ]}
                      onPress={handleResetScan}
                    >
                      <Text style={styles.resetBtnText}>Escanear de novo</Text>
                    </Pressable>
                    <Pressable style={styles.processBtn}>
                      <Text style={styles.processBtnText}>Processar ›</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: CRIC_BLUE,
  },
  hero: {
    backgroundColor: CRIC_BLUE,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  brand: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2.5,
    color: "rgba(255,255,255,0.45)",
    marginBottom: 6,
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  heroSub: {
    fontSize: 13,
    color: "rgba(255,255,255,0.65)",
    lineHeight: 19,
  },

  statsRow: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    marginTop: 20,
  },
  statBox: { flex: 1, alignItems: "center", gap: 4 },
  statDivider: { width: 1, backgroundColor: "rgba(255,255,255,0.15)" },
  statValue: { fontSize: 18, fontWeight: "800", color: "#fff" },
  statLabel: {
    fontSize: 10,
    color: "rgba(255,255,255,0.5)",
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  screen: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  content: {
    flex: 1,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#9CA3AF",
    letterSpacing: 1.5,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },

  scannerWrapper: {
    height: 260,
    marginHorizontal: 16,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#000",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cameraContainer: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  unfocusedContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  middleRow: {
    flexDirection: "row",
    height: 160,
  },
  targetSquare: {
    width: 160,
    borderWidth: 2,
    borderColor: CRIC_BLUE,
    borderRadius: 16,
    backgroundColor: "transparent",
  },
  targetSquareScanned: {
    borderColor: "#10B981",
  },

  cardContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  statusCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  statusText: {
    fontSize: 14,
    color: "#4B5563",
    fontWeight: "600",
  },

  scannedCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#D1FAE5",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  scannedCardAccent: {
    height: 4,
    backgroundColor: "#10B981",
  },
  scannedCardBody: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  scannedCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  scannedLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    color: "#10B981",
  },
  successChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  successChipText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#10B981",
  },
  scannedTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: -0.3,
  },
  scannedData: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
    marginTop: 4,
    marginBottom: 12,
  },
  scannedFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 0.5,
    borderTopColor: "#F3F4F6",
  },
  resetBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
  resetBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4B5563",
  },
  processBtn: {
    paddingVertical: 4,
  },
  processBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: CRIC_BLUE,
  },

  permissionContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1F2937",
    letterSpacing: -0.3,
  },
  permissionSub: {
    textAlign: "center",
    color: "#6B7280",
    marginTop: 8,
    marginBottom: 28,
    lineHeight: 20,
    fontSize: 13,
  },
  primaryBtn: {
    width: "100%",
    backgroundColor: CRIC_BLUE,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    borderRadius: 16,
    gap: 8,
    shadowColor: CRIC_BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  btnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
});

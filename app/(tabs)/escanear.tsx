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

  if (!permission) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={CRIC_BLUE} style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.hero}>
          <Text style={styles.brand}>ROTACRIC</Text>
          <Text style={styles.heroTitle}>Acesso à Câmera</Text>
          <Text style={styles.heroSub}>
            Precisamos de autorização para usar a câmera do dispositivo para que
            você possa validar os carimbos da rota.
          </Text>
        </View>
        <View style={styles.permissionContent}>
          <View style={styles.warningBox}>
            <Feather name="camera-off" size={32} color="#9CA3AF" />
            <Text style={styles.warningText}>
              A câmera está desativada para este aplicativo.
            </Text>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.primaryBtn,
              pressed && styles.btnPressed,
            ]}
            onPress={requestPermission}
          >
            <Text style={styles.primaryBtnText}>Conceder Permissão</Text>
            <Feather name="check-circle" size={18} color="#fff" />
          </Pressable>
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

  return (
    <SafeAreaView style={styles.container}>
      {/* ── Hero Header (Fiel ao padrão das Cidades) ── */}
      <View style={styles.hero}>
        <Text style={styles.brand}>ROTACRIC</Text>
        <Text style={styles.heroTitle}>Escanear Código</Text>
        <Text style={styles.heroSub}>
          Aponte para o QR Code localizado nas placas físicas dos pontos de
          apoio para coletar seu carimbo.
        </Text>
      </View>

      <Text style={styles.sectionLabel}>CAMERA SCANNER</Text>

      {/* ── Container do Scanner ── */}
      <View style={styles.scannerWrapper}>
        <Animated.View style={[styles.cameraContainer, { opacity: fadeAnim }]}>
          <CameraView
            style={StyleSheet.absoluteFillObject}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
            onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
          />

          {/* Máscara visual flutuante sobre a câmera */}
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

      {/* ── Painel de Ação Dinâmico (Estilo Card) ── */}
      <View style={styles.cardContainer}>
        {!scanned ? (
          <View style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <ActivityIndicator size="small" color={CRIC_BLUE} />
              <Text style={styles.statusText}>
                Buscando QR Code na placa...
              </Text>
            </View>
          </View>
        ) : (
          <View style={[styles.card, styles.scannedCard]}>
            <View style={[styles.cardAccent, { backgroundColor: "#10B981" }]} />
            <View style={styles.cardBody}>
              <View style={styles.cardMeta}>
                <Text style={[styles.kmLabel, { color: "#10B981" }]}>
                  CÓDIGO DETECTADO
                </Text>
                <View style={styles.successChip}>
                  <Feather name="check" size={12} color="#10B981" />
                  <Text style={styles.successChipText}>Sucesso</Text>
                </View>
              </View>

              <View style={styles.cardTitleRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cityName}>Conteúdo Lido</Text>
                  <Text style={styles.cityAbout} numberOfLines={2}>
                    {scannedData}
                  </Text>
                </View>
                <View
                  style={[
                    styles.locationIcon,
                    { backgroundColor: "#10B98118" },
                  ]}
                >
                  <Feather size={18} color="#10B981" />
                </View>
              </View>

              <View style={styles.cardFooter}>
                <Pressable
                  style={({ pressed }) => [
                    styles.resetBtn,
                    pressed && styles.btnPressed,
                  ]}
                  onPress={handleResetScan}
                >
                  <Text style={styles.resetBtnText}>Escanear de novo</Text>
                </Pressable>

                <Pressable style={styles.detailsBtn}>
                  <Text style={[styles.detailsBtnText, { color: CRIC_BLUE }]}>
                    Processar ›
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8FC",
  },

  hero: {
    backgroundColor: CRIC_BLUE,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 28,
  },
  brand: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2.5,
    color: "rgba(255,255,255,0.5)",
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
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#9CA3AF",
    letterSpacing: 1.5,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },

  scannerWrapper: {
    height: 280,
    marginHorizontal: 16,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#000",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cameraContainer: {
    flex: 1,
    position: "relative",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  unfocusedContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  middleRow: {
    flexDirection: "row",
    height: 180,
  },
  targetSquare: {
    width: 180,
    borderWidth: 2,
    borderColor: CRIC_BLUE,
    backgroundColor: "transparent",
    borderRadius: 16,
  },
  targetSquareScanned: {
    borderColor: "#10B981",
  },

  cardContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    flex: 1,
  },
  statusCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  statusText: {
    fontSize: 14,
    color: "#4B5563",
    fontWeight: "600",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  scannedCard: {
    borderColor: "#E5E7EB",
    borderWidth: 0.5,
  },
  cardAccent: {
    height: 4,
  },
  cardBody: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  cardMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  kmLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  successChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#10B98110",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  successChipText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#10B981",
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 10,
  },
  cityName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: -0.3,
  },
  cityAbout: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
    marginTop: 4,
  },
  locationIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 0.5,
    borderTopColor: "#F3F4F6",
    marginTop: 4,
  },
  detailsBtn: {
    paddingVertical: 4,
  },
  detailsBtnText: {
    fontSize: 14,
    fontWeight: "700",
  },

  permissionContent: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    gap: 24,
  },
  warningBox: {
    alignItems: "center",
    gap: 12,
    paddingVertical: 20,
  },
  warningText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
  primaryBtn: {
    backgroundColor: CRIC_BLUE,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
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
});

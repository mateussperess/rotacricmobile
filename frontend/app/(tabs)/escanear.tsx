import { useAuth } from "@/components/contexts/AuthContext";
import { AnchorPoint, AnchorPointsService } from "@/services/anchorpoints/anchorPointService";
import { CitiesService, City } from "@/services/cities/citiesService";
import { Stamp, StampService } from "@/services/stamps/stampService";
import { Feather } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const CRIC_BLUE = "#2563EB";
const RADIUS_LIMIT_METERS = 5; // Raio máximo de 5 metros para permitir a coleta do carimbo

const SHEET_COLLAPSED = 95;
const SHEET_IDLE_EXPANDED = 210; // Altura compacta para exibir apenas o card de instrução sem desperdiçar espaço de câmera
const SHEET_SCANNED_EXPANDED = 480; // Altura completa para exibir detalhes do carimbo, GPS, vizinhos e ações

function haversineMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(meters?: number | null): string {
  if (meters === undefined || meters === null || isNaN(meters)) return "Distância desconhecida";
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} às ${hours}:${minutes}`;
  } catch {
    return dateStr;
  }
}

interface NeighborPoint {
  id: string;
  name: string;
  cityName: string;
  distMeters: number;
  lat: number;
  lng: number;
  phone?: string | null;
}

interface ScannedValidationResult {
  isValid: boolean;
  rawToken: string;
  stamp?: Stamp | null;
  anchorPoint?: AnchorPoint | null;
  cityName?: string;
  routeSegmentName?: string;
  isCollected?: boolean;
  collectedAt?: string | null;
  distMeters?: number | null;
  distText?: string;
  isWithin5m?: boolean;
  totalStampsCount?: number;
  collectedStampsCount?: number;
  neighborPoints?: NeighborPoint[];
}

export default function EscanearScreen() {
  const { primaryColor, isLoggedIn } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();

  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [stamps, setStamps] = useState<Stamp[]>([]);
  const [userStamps, setUserStamps] = useState<any[]>([]);
  const [anchorPoints, setAnchorPoints] = useState<AnchorPoint[]>([]);
  const [citiesMap, setCitiesMap] = useState<Map<string, string>>(new Map());
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);

  const [scanned, setScanned] = useState(false);
  const [scanResult, setScanResult] = useState<ScannedValidationResult | null>(null);
  const [collecting, setCollecting] = useState(false);
  const [collectSuccess, setCollectSuccess] = useState(false);

  // Animações
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  // Bottom Sheet deslizante & Chevron idêntico ao mapa nativo
  const sheetAnim = useRef(new Animated.Value(SHEET_COLLAPSED)).current;
  const chevronAnim = useRef(new Animated.Value(0)).current;
  const sheetOpen = useRef(false);
  const dragStart = useRef(0);

  // Calcular a altura de expansão dinamicamente com base no estado de escaneamento
  const getMaxExpandedHeight = () => (scanned ? SHEET_SCANNED_EXPANDED : SHEET_IDLE_EXPANDED);

  const animateSheet = (open: boolean, forceScannedExpanded?: boolean) => {
    sheetOpen.current = open;
    const targetExpanded = forceScannedExpanded ? SHEET_SCANNED_EXPANDED : getMaxExpandedHeight();
    const targetHeight = open ? targetExpanded : SHEET_COLLAPSED;

    Animated.parallel([
      Animated.spring(sheetAnim, {
        toValue: targetHeight,
        useNativeDriver: false,
        tension: 80,
        friction: 12,
      }),
      Animated.timing(chevronAnim, {
        toValue: open ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const toggleSheet = () => {
    animateSheet(!sheetOpen.current);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        dragStart.current = sheetOpen.current ? getMaxExpandedHeight() : SHEET_COLLAPSED;
      },
      onPanResponderMove: (_, g) => {
        const maxH = getMaxExpandedHeight();
        const next = Math.max(
          SHEET_COLLAPSED,
          Math.min(maxH, dragStart.current - g.dy)
        );
        sheetAnim.setValue(next);
      },
      onPanResponderRelease: (_, g) => {
        const snap = g.dy < -30 || (sheetOpen.current && g.dy < 30);
        animateSheet(snap);
      },
    })
  ).current;

  // Interpolador de rotação do chevron idêntico ao mapa nativo (▲ -> ▼)
  const chevronRotate = chevronAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  // Carregar dados do catálogo e localização GPS
  const loadData = async () => {
    try {
      setLoadingCatalog(true);

      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          const loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.BestForNavigation,
          });
          setUserLocation(loc);
        }
      } catch (e) {
        console.log("GPS não disponível no momento:", e);
      }

      const [stampsData, userStampsData, apData, citiesData] = await Promise.all([
        StampService.findAll().catch(() => []),
        isLoggedIn ? StampService.getUserStamps().catch(() => []) : Promise.resolve([]),
        AnchorPointsService.findAll().catch(() => []),
        CitiesService.findAll().catch(() => []),
      ]);

      setStamps(stampsData || []);
      setUserStamps(userStampsData || []);
      setAnchorPoints(apData || []);

      const cMap = new Map<string, string>();
      (citiesData || []).forEach((c: City) => cMap.set(c.id.toString(), c.name));
      setCitiesMap(cMap);
    } catch (err) {
      console.error("Erro ao carregar dados do scanner:", err);
    } finally {
      setLoadingCatalog(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [isLoggedIn])
  );

  // Laser animado de varredura
  useEffect(() => {
    if (!scanned) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(scanLineAnim, {
            toValue: 220,
            duration: 1800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(scanLineAnim, {
            toValue: 0,
            duration: 1800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      loop.start();
      return () => loop.stop();
    }
  }, [scanned]);

  // Manipular escaneamento de QR Code
  const handleBarcodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);

    const cleanData = (data || "").trim();

    // Buscar no catálogo de carimbos
    const matchedStamp = stamps.find(
      (s) =>
        s.qr_code_token === cleanData ||
        s.id.toString() === cleanData ||
        s.anchor_point_id?.toString() === cleanData ||
        cleanData.toLowerCase().includes(s.qr_code_token.toLowerCase())
    );

    // Efeito visual de foco
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.3,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    if (!matchedStamp) {
      // ❌ QR Code Inválido
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      setScanResult({
        isValid: false,
        rawToken: cleanData,
      });
      animateSheet(true, true);
      return;
    }

    // ✅ QR Code Válido
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

    // Ponto de Apoio vinculado
    const linkedAp = anchorPoints.find(
      (ap) => ap.id.toString() === matchedStamp.anchor_point_id.toString()
    ) || matchedStamp.anchor_point;

    // Cidade do Ponto
    const cityId = linkedAp?.city_id?.toString() || linkedAp?.category_id;
    const cityName = cityId && citiesMap.has(cityId) ? citiesMap.get(cityId) : "Rota CRIC";
    const routeSegmentName = `Trecho Rota CRIC • ${cityName}`;

    // Status de Coleta do Usuário
    const collectedEntry = userStamps.find(
      (us) =>
        us.stamp_id?.toString() === matchedStamp.id.toString() ||
        us.anchor_point_id?.toString() === matchedStamp.anchor_point_id.toString()
    );
    const isCollected = Boolean(collectedEntry);
    const collectedAt = collectedEntry ? formatDate(collectedEntry.scanned_at) : null;

    // Distância GPS até o Ponto de Apoio
    let distMeters: number | null = null;
    const apLat = Number(linkedAp?.lat ?? (linkedAp as any)?.latitude);
    const apLng = Number(linkedAp?.lng ?? (linkedAp as any)?.longitude);

    if (userLocation && !isNaN(apLat) && !isNaN(apLng)) {
      distMeters = haversineMeters(
        userLocation.coords.latitude,
        userLocation.coords.longitude,
        apLat,
        apLng
      );
    }

    // Validação estrita do raio de 5 metros
    const isWithin5m = distMeters !== null && distMeters <= RADIUS_LIMIT_METERS;

    // Calcular Pontos de Apoio Próximos Vizinhos
    let neighborPoints: NeighborPoint[] = [];
    if (!isNaN(apLat) && !isNaN(apLng)) {
      neighborPoints = anchorPoints
        .filter((ap) => ap.id.toString() !== linkedAp?.id?.toString())
        .map((ap) => {
          const nLat = Number(ap.lat ?? (ap as any).latitude);
          const nLng = Number(ap.lng ?? (ap as any).longitude);
          const dM =
            !isNaN(nLat) && !isNaN(nLng)
              ? haversineMeters(apLat, apLng, nLat, nLng)
              : 999999;
          const cId = ap.city_id?.toString() || ap.category_id;
          const cName = cId && citiesMap.has(cId) ? citiesMap.get(cId) : "Rota CRIC";
          return {
            id: ap.id.toString(),
            name: ap.name,
            cityName: cName,
            distMeters: dM,
            lat: nLat,
            lng: nLng,
            phone: ap.phone,
          };
        })
        .sort((a, b) => a.distMeters - b.distMeters)
        .slice(0, 3);
    }

    const totalStampsCount = stamps.length > 0 ? stamps.length : 9;
    const collectedStampsCount = userStamps.length;

    setScanResult({
      isValid: true,
      rawToken: cleanData,
      stamp: matchedStamp,
      anchorPoint: linkedAp,
      cityName,
      routeSegmentName,
      isCollected,
      collectedAt,
      distMeters,
      distText: formatDistance(distMeters),
      isWithin5m,
      totalStampsCount,
      collectedStampsCount,
      neighborPoints,
    });

    // Subir automaticamente para a altura completa de resultado escaneado
    animateSheet(true, true);
  };

  const handleResetScan = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setScanned(false);
    setScanResult(null);
    setCollectSuccess(false);
    animateSheet(false);
  };

  const handleCollectStamp = async () => {
    if (!scanResult || !scanResult.stamp) return;
    setCollecting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});

    try {
      await new Promise((res) => setTimeout(res, 600));

      setCollectSuccess(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      loadData();
    } catch (err) {
      console.error("Erro ao coletar carimbo:", err);
    } finally {
      setCollecting(false);
    }
  };

  // Sem permissão de câmera
  if (!permission || !permission.granted) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: primaryColor }]} edges={["top"]}>
        <View style={styles.screen}>
          <View style={[styles.headerHero, { backgroundColor: primaryColor }]}>
            <Text style={styles.brand}>ROTA CRIC • VALIDADOR</Text>
            <Text style={styles.headerTitle}>Escanear Carimbo</Text>
          </View>
          <View style={styles.permissionContainer}>
            <View style={styles.iconCircle}>
              <Feather name="camera-off" size={36} color="#9CA3AF" />
            </View>
            <Text style={styles.permissionTitle}>Permissão da Câmera</Text>
            <Text style={styles.permissionSub}>
              Precisamos de acesso à câmera para você poder escanear os QR Codes das placas e validar seus carimbos.
            </Text>
            <Pressable
              style={({ pressed }) => [styles.primaryBtn, pressed && styles.btnPressed]}
              onPress={requestPermission}
            >
              <Text style={styles.primaryBtnText}>Conceder Permissão</Text>
              <Feather name="check-circle" size={18} color="#fff" />
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: primaryColor }]} edges={["top"]}>
      <View style={styles.screen}>
        {/* Header Superior Fixo */}
        <View style={[styles.headerHero, { backgroundColor: primaryColor }]}>
          <View style={styles.headerTopRow}>
            <Text style={styles.brand}>ROTA CRIC • SCANNER</Text>
            {loadingCatalog && (
              <View style={styles.syncBadge}>
                <ActivityIndicator size="small" color="#fff" />
              </View>
            )}
          </View>
          <Text style={styles.headerTitle}>Escanear Carimbo</Text>
          <Text style={styles.headerSub}>
            Aponte a câmera para o QR Code da placa física no Ponto de Apoio.
          </Text>
        </View>

        {/* 📷 CÂMERA EM TELA CHEIA */}
        <View style={styles.fullCameraContainer}>
          <Animated.View style={{ flex: 1, opacity: fadeAnim, backgroundColor: "#000" }}>
            <CameraView
              style={StyleSheet.absoluteFillObject}
              facing="back"
              barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
              onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
            />

            {/* Overlay da Câmera com Mira e Laser */}
            <View style={styles.overlay} pointerEvents="none">
              <View style={styles.unfocusedArea} />
              <View style={styles.middleRow}>
                <View style={styles.unfocusedArea} />
                <View
                  style={[
                    styles.targetSquare,
                    scanned && scanResult?.isValid && styles.targetSquareValid,
                    scanned && !scanResult?.isValid && styles.targetSquareInvalid,
                  ]}
                >
                  <View style={[styles.corner, styles.cornerTL]} />
                  <View style={[styles.corner, styles.cornerTR]} />
                  <View style={[styles.corner, styles.cornerBL]} />
                  <View style={[styles.corner, styles.cornerBR]} />

                  {!scanned && (
                    <Animated.View
                      style={[
                        styles.laserLine,
                        { transform: [{ translateY: scanLineAnim }] },
                      ]}
                    />
                  )}
                </View>
                <View style={styles.unfocusedArea} />
              </View>
              <View style={styles.unfocusedArea} />
            </View>
          </Animated.View>
        </View>

        {/* 📑 BOTTOM SHEET DESLIZANTE (MENU COM ALTURA DINÂMICA COMPACTA EM REPOUSO) */}
        <Animated.View style={[styles.sheet, { height: sheetAnim }]}>
          {/* Handle de Dragging */}
          <View {...panResponder.panHandlers} style={styles.handleArea}>
            <View style={styles.handleBar} />
          </View>

          {/* Header Clicável do Menu com Chevron do Mapa (▲ / ▼) */}
          <Pressable onPress={toggleSheet} style={styles.sheetHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.sheetSubTitle}>
                {!scanned
                  ? "INSTRUÇÃO DE USO"
                  : scanResult?.isValid
                  ? scanResult.routeSegmentName
                  : "STATUS DE LEITURA"}
              </Text>
              <Text style={styles.sheetMainTitle} numberOfLines={1}>
                {!scanned
                  ? "Aponte a câmera para o QR Code"
                  : scanResult?.isValid
                  ? scanResult.stamp?.name || scanResult.anchorPoint?.name
                  : "QR Code Não Reconhecido"}
              </Text>
            </View>
            <Animated.Text
              style={[
                styles.sheetChevron,
                { transform: [{ rotate: chevronRotate }] },
              ]}
            >
              ▲
            </Animated.Text>
          </Pressable>

          {/* Conteúdo Expansível em ScrollView */}
          <ScrollView
            style={styles.sheetScroll}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 24 }}
          >
            {!scanned ? (
              /* ESTADO PADRÃO QUANDO NÃO ESCANEADO: EXPANDE NA MEDIDA EXATA DO CONTEÚDO (APROVEITA O ESPAÇO) */
              <View style={styles.idleInstructionCard}>
                <View style={styles.instructionHeaderRow}>
                  <View style={styles.instructionIconWrap}>
                    <Feather name="qr-code" size={18} color={CRIC_BLUE} />
                  </View>
                  <Text style={styles.instructionTitle}>Como escanear seu carimbo</Text>
                </View>

                <Text style={styles.instructionBody}>
                  Centralize o QR Code da placa física na mira. Ao identificar um código válido a menos de 5m do Ponto de Apoio, os dados da rota serão exibidos aqui.
                </Text>
              </View>
            ) : !scanResult?.isValid ? (
              /* ❌ ESTADO DE ERRO - QR CODE INVÁLIDO */
              <View style={styles.invalidContainer}>
                <View style={styles.invalidHeaderRow}>
                  <Feather name="alert-circle" size={24} color="#EF4444" />
                  <Text style={styles.invalidTitle}>QR Code Não Reconhecido</Text>
                </View>
                <Text style={styles.invalidText}>
                  O código lido não pertence a nenhum carimbo oficial da Rota CRIC cadastrado em nosso sistema.
                </Text>
                <Pressable
                  style={({ pressed }) => [styles.resetBtn, pressed && styles.btnPressed]}
                  onPress={handleResetScan}
                >
                  <Feather name="refresh-cw" size={16} color="#374151" />
                  <Text style={styles.resetBtnText}>Escanear Novamente</Text>
                </Pressable>
              </View>
            ) : (
              /* ✅ ESTADO VÁLIDO - CARIMBO & DETALHES DO PONTO */
              <View style={styles.validContainer}>
                {/* 1. BADGE DE RAIO DE DISTÂNCIA GPS (< 5m) */}
                {scanResult.isWithin5m ? (
                  <View style={styles.gpsSuccessBadge}>
                    <Feather name="check-circle" size={16} color="#059669" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.gpsSuccessTitle}>Presença Confirmada (Raio {'<'} 5m)</Text>
                      <Text style={styles.gpsSuccessSub}>
                        Você está a apenas {scanResult.distText} do Ponto de Apoio.
                      </Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.gpsDangerBadge}>
                    <Feather name="alert-circle" size={16} color="#DC2626" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.gpsDangerTitle}>Fora do Raio de Coleta (Raio limite: 5m)</Text>
                      <Text style={styles.gpsDangerSub}>
                        Sua distância atual é de {scanResult.distText}. Aproxime-se a menos de 5m do local para liberar a coleta.
                      </Text>
                    </View>
                  </View>
                )}

                {/* 2. INFORMAÇÕES DO CARIMBO E TRECHO DA ROTA */}
                <View style={styles.infoCard}>
                  <Text style={styles.infoSegmentLabel}>{scanResult.routeSegmentName}</Text>
                  <Text style={styles.infoStampName}>{scanResult.stamp?.name}</Text>
                  <Text style={styles.infoApName}>
                    📍 {scanResult.anchorPoint?.name} • {scanResult.cityName}
                  </Text>

                  {/* Informações adicionais do estabelecimento */}
                  {scanResult.anchorPoint?.business_hours || scanResult.anchorPoint?.phone ? (
                    <View style={styles.detailsBox}>
                      {scanResult.anchorPoint?.business_hours ? (
                        <Text style={styles.detailsText}>
                          🕒 Horário: {scanResult.anchorPoint.business_hours}
                        </Text>
                      ) : null}
                      {scanResult.anchorPoint?.phone ? (
                        <Text style={styles.detailsText}>
                          📞 Telefone/WhatsApp: {scanResult.anchorPoint.phone}
                        </Text>
                      ) : null}
                    </View>
                  ) : null}
                </View>

                {/* 3. PONTOS DE APOIO VIZINHOS MAIS PRÓXIMOS */}
                {scanResult.neighborPoints && scanResult.neighborPoints.length > 0 && (
                  <View style={styles.neighborsSection}>
                    <Text style={styles.sectionHeaderTitle}>PONTOS DE APOIO PRÓXIMOS DESTE LOCAL</Text>
                    {scanResult.neighborPoints.map((np) => (
                      <Pressable
                        key={np.id}
                        style={styles.neighborItemRow}
                        onPress={() => {
                          router.push({
                            pathname: "/(tabs)/nativeMap",
                            params: {
                              apId: np.id,
                              apName: np.name,
                              lat: np.lat.toString(),
                              lng: np.lng.toString(),
                            },
                          });
                        }}
                      >
                        <View style={styles.neighborIconWrap}>
                          <Feather name="map-pin" size={16} color={CRIC_BLUE} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.neighborName} numberOfLines={1}>
                            {np.name}
                          </Text>
                          <Text style={styles.neighborCity}>{np.cityName}</Text>
                        </View>
                        <View style={styles.neighborDistChip}>
                          <Text style={styles.neighborDistText}>{formatDistance(np.distMeters)}</Text>
                        </View>
                      </Pressable>
                    ))}
                  </View>
                )}

                {/* 4. FEEDBACK DE COLETA & BOTÕES */}
                {collectSuccess ? (
                  <View style={styles.successBanner}>
                    <Feather name="award" size={22} color="#059669" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.successBannerTitle}>Carimbo Registrado com Sucesso! 🎉</Text>
                      <Text style={styles.successBannerSub}>
                        Seu avanço foi atualizado no passaporte digital da Rota CRIC.
                      </Text>
                    </View>
                  </View>
                ) : scanResult.isCollected ? (
                  <View style={styles.alreadyBanner}>
                    <Feather name="info" size={16} color="#2563EB" />
                    <Text style={styles.alreadyBannerText}>
                      Você já coletou este carimbo em {scanResult.collectedAt}.
                    </Text>
                  </View>
                ) : null}

                {/* Botões de Ação */}
                <View style={styles.actionsRow}>
                  <Pressable
                    style={({ pressed }) => [styles.resetBtn, pressed && styles.btnPressed]}
                    onPress={handleResetScan}
                  >
                    <Feather name="camera" size={16} color="#374151" />
                    <Text style={styles.resetBtnText}>Novo QR</Text>
                  </Pressable>

                  {!scanResult.isCollected && !collectSuccess ? (
                    <Pressable
                      style={({ pressed }) => [
                        styles.collectBtn,
                        (!scanResult.isWithin5m || collecting) && styles.btnDisabled,
                        pressed && scanResult.isWithin5m && styles.btnPressed,
                      ]}
                      onPress={handleCollectStamp}
                      disabled={!scanResult.isWithin5m || collecting}
                    >
                      {collecting ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <>
                          <Feather name="check" size={18} color="#fff" />
                          <Text style={styles.collectBtnText}>
                            {scanResult.isWithin5m ? "Coletar Carimbo" : "Fora do Raio (< 5m)"}
                          </Text>
                        </>
                      )}
                    </Pressable>
                  ) : (
                    <Pressable
                      style={({ pressed }) => [styles.mapBtn, pressed && styles.btnPressed]}
                      onPress={() => {
                        if (scanResult.anchorPoint) {
                          router.push({
                            pathname: "/(tabs)/nativeMap",
                            params: {
                              apId: scanResult.anchorPoint.id,
                              apName: scanResult.anchorPoint.name,
                              lat: (scanResult.anchorPoint.lat ?? (scanResult.anchorPoint as any).latitude)?.toString(),
                              lng: (scanResult.anchorPoint.lng ?? (scanResult.anchorPoint as any).longitude)?.toString(),
                            },
                          });
                        }
                      }}
                    >
                      <Feather name="map" size={16} color={CRIC_BLUE} />
                      <Text style={styles.mapBtnText}>Ver no Mapa</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            )}
          </ScrollView>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: CRIC_BLUE,
  },
  screen: {
    flex: 1,
    backgroundColor: "#000",
  },
  headerHero: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: CRIC_BLUE,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    zIndex: 10,
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brand: {
    fontSize: 10,
    fontWeight: "800",
    color: "rgba(255,255,255,0.6)",
    letterSpacing: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -0.3,
    marginTop: 2,
  },
  headerSub: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },
  syncBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },

  /* Câmera Full Screen */
  fullCameraContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  unfocusedArea: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  middleRow: {
    flexDirection: "row",
    height: 220,
  },
  targetSquare: {
    width: 220,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.4)",
    borderRadius: 24,
    backgroundColor: "transparent",
    position: "relative",
    overflow: "hidden",
  },
  targetSquareValid: {
    borderColor: "#10B981",
    backgroundColor: "rgba(16, 185, 129, 0.08)",
  },
  targetSquareInvalid: {
    borderColor: "#EF4444",
    backgroundColor: "rgba(239, 68, 68, 0.08)",
  },

  corner: {
    position: "absolute",
    width: 22,
    height: 22,
    borderColor: CRIC_BLUE,
  },
  cornerTL: { top: 8, left: 8, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 6 },
  cornerTR: { top: 8, right: 8, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 6 },
  cornerBL: { bottom: 8, left: 8, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 6 },
  cornerBR: { bottom: 8, right: 8, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 6 },

  laserLine: {
    width: "100%",
    height: 3,
    backgroundColor: CRIC_BLUE,
    shadowColor: CRIC_BLUE,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 3,
  },

  /* Bottom Sheet Deslizante */
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 12,
  },
  handleArea: {
    alignItems: "center",
    paddingVertical: 10,
  },
  handleBar: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#D1D5DB",
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  sheetSubTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: CRIC_BLUE,
    letterSpacing: 0.5,
  },
  sheetMainTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#111827",
  },
  sheetChevron: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "bold",
    paddingLeft: 12,
  },
  sheetScroll: {
    paddingHorizontal: 20,
  },

  /* Estado Idle Limpo (Instrução Compacta sob medida) */
  idleInstructionCard: {
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginTop: 4,
  },
  instructionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  instructionIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  instructionTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1E293B",
  },
  instructionBody: {
    fontSize: 11,
    color: "#64748B",
    lineHeight: 16,
  },

  /* Estado Inválido */
  invalidContainer: {
    paddingTop: 8,
  },
  invalidHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  invalidTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#EF4444",
  },
  invalidText: {
    fontSize: 13,
    color: "#4B5563",
    marginTop: 6,
    marginBottom: 16,
    lineHeight: 18,
  },

  /* Estado Válido & GPS */
  validContainer: {
    paddingTop: 4,
  },
  gpsSuccessBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#ECFDF5",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#A7F3D0",
    marginBottom: 12,
  },
  gpsSuccessTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#065F46",
  },
  gpsSuccessSub: {
    fontSize: 11,
    color: "#047857",
  },

  gpsDangerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FEF2F2",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FCA5A5",
    marginBottom: 12,
  },
  gpsDangerTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#991B1B",
  },
  gpsDangerSub: {
    fontSize: 11,
    color: "#B91C1C",
    lineHeight: 15,
  },

  infoCard: {
    backgroundColor: "#F9FAFB",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 14,
  },
  infoSegmentLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: CRIC_BLUE,
    letterSpacing: 0.5,
  },
  infoStampName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    marginTop: 2,
  },
  infoApName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4B5563",
    marginTop: 2,
  },
  detailsBox: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    gap: 4,
  },
  detailsText: {
    fontSize: 12,
    color: "#4B5563",
  },

  /* Vizinhos */
  neighborsSection: {
    marginBottom: 14,
  },
  sectionHeaderTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#9CA3AF",
    letterSpacing: 1,
    marginBottom: 8,
  },
  neighborItemRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    padding: 10,
    borderRadius: 10,
    marginBottom: 6,
    gap: 10,
  },
  neighborIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  neighborName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1F2937",
  },
  neighborCity: {
    fontSize: 11,
    color: "#6B7280",
  },
  neighborDistChip: {
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  neighborDistText: {
    fontSize: 11,
    fontWeight: "800",
    color: CRIC_BLUE,
  },

  /* Feedback */
  successBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#ECFDF5",
    padding: 12,
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  successBannerTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#065F46",
  },
  successBannerSub: {
    fontSize: 11,
    color: "#047857",
  },

  alreadyBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#EFF6FF",
    padding: 10,
    borderRadius: 10,
    marginBottom: 14,
  },
  alreadyBannerText: {
    fontSize: 12,
    color: CRIC_BLUE,
    fontWeight: "600",
  },

  /* Ações */
  actionsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  resetBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F3F4F6",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  resetBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
  },
  collectBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: CRIC_BLUE,
    paddingVertical: 12,
    borderRadius: 12,
  },
  collectBtnText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#fff",
  },
  mapBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    paddingVertical: 12,
    borderRadius: 12,
  },
  mapBtnText: {
    fontSize: 14,
    fontWeight: "800",
    color: CRIC_BLUE,
  },

  /* Permissão */
  permissionContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
    backgroundColor: "#F3F4F6",
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
  btnDisabled: {
    backgroundColor: "#9CA3AF",
    opacity: 0.7,
  },
});

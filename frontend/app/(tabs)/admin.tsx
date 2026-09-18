import { useAuth } from "@/components/contexts/AuthContext";
import { IconSymbol } from "@/components/ui/icon-symbol";
import {
    AnchorPointCategory,
    AnchorPointCategoryService,
} from "@/services/anchorpoints/anchorPointCategoryService";
import {
    AnchorPoint,
    AnchorPointsService,
} from "@/services/anchorpoints/anchorPointService";
import { CitiesService, City } from "@/services/cities/citiesService";
import { Stamp, StampService } from "@/services/stamps/stampService";
import { Image } from "expo-image";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Função para calcular a distância Haversine em km entre dois pontos
function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // Raio da Terra em km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function AdminScreen() {
  const { user, primaryColor } = useAuth();
  const router = useRouter();
  const isAdmin = Boolean(user?.is_staff || user?.is_superuser);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [anchorPoints, setAnchorPoints] = useState<AnchorPoint[]>([]);
  const [stamps, setStamps] = useState<Stamp[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [categories, setCategories] = useState<AnchorPointCategory[]>([]);

  // State para Busca e Filtros
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");

  // Set de IDs dos Pontos de Apoio que possuem carimbos vinculados ativos
  const apIdsWithStamps = useMemo(() => {
    return new Set(
      stamps
        .filter((s) => s.active !== false && s.anchor_point_id)
        .map((s) => s.anchor_point_id.toString()),
    );
  }, [stamps]);

  // Contadores de pontos ativos e desativados
  const activeCount = useMemo(
    () => anchorPoints.filter((ap) => ap.active).length,
    [anchorPoints],
  );
  const inactiveCount = useMemo(
    () => anchorPoints.filter((ap) => !ap.active).length,
    [anchorPoints],
  );

  // Lista filtrada por busca, status e categoria/carimbo
  const filteredAnchorPoints = useMemo(() => {
    return anchorPoints.filter((ap) => {
      // 1. Filtro por Status, Categoria ou Carimbo Vinculado
      if (selectedCategoryFilter === "active") {
        if (!ap.active) return false;
      } else if (selectedCategoryFilter === "inactive") {
        if (ap.active) return false;
      } else if (selectedCategoryFilter === "with_stamp") {
        if (!apIdsWithStamps.has(ap.id.toString())) {
          return false;
        }
      } else if (selectedCategoryFilter !== "all") {
        const apCatId = ap.category_id
          ? ap.category_id.toString()
          : ap.category?.id?.toString();
        if (apCatId !== selectedCategoryFilter) {
          return false;
        }
      }

      // 2. Filtro por Busca (Palavra-Chave)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = ap.name.toLowerCase().includes(query);
        const matchesPhone = ap.phone
          ? ap.phone.toLowerCase().includes(query)
          : false;
        const matchesHours = ap.business_hours
          ? ap.business_hours.toLowerCase().includes(query)
          : false;
        const matchesCategory = ap.category?.name
          ? ap.category.name.toLowerCase().includes(query)
          : false;

        return matchesName || matchesPhone || matchesHours || matchesCategory;
      }

      return true;
    });
  }, [anchorPoints, apIdsWithStamps, selectedCategoryFilter, searchQuery]);

  // State para modal Ponto de Apoio
  const [modalAPVisible, setModalAPVisible] = useState(false);
  const [apName, setApName] = useState("");
  const [apCityId, setApCityId] = useState("");
  const [apCategoryId, setApCategoryId] = useState("1");
  const [apLat, setApLat] = useState("");
  const [apLng, setApLng] = useState("");
  const [apPhone, setApPhone] = useState("");
  const [apHours, setApHours] = useState("");
  const [savingAP, setSavingAP] = useState(false);
  const [fetchingGPS, setFetchingGPS] = useState(false);
  const [autoCityDetectedName, setAutoCityDetectedName] = useState<
    string | null
  >(null);

  // State para modal Carimbo
  const [modalStampVisible, setModalStampVisible] = useState(false);
  const [selectedAP, setSelectedAP] = useState<AnchorPoint | null>(null);
  const [stampName, setStampName] = useState("");
  const [savingStamp, setSavingStamp] = useState(false);
  const [createdStamp, setCreatedStamp] = useState<Stamp | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [apData, stampsData, citiesData, categoriesData] =
        await Promise.all([
          AnchorPointsService.findAllAdmin().catch(() =>
            AnchorPointsService.findAll(),
          ),
          StampService.findAll().catch(() => []),
          CitiesService.findAll().catch(() => []),
          AnchorPointCategoryService.findAll().catch(() => []),
        ]);
      setAnchorPoints(apData || []);
      setStamps(stampsData || []);
      setCities(citiesData || []);
      setCategories(categoriesData || []);

      if (citiesData && citiesData.length > 0 && !apCityId) {
        setApCityId(citiesData[0].id.toString());
      }
      if (categoriesData && categoriesData.length > 0 && apCategoryId === "1") {
        setApCategoryId(categoriesData[0].id.toString());
      }
    } catch (err) {
      console.error("Erro ao carregar dados admin:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [isAdmin]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // Encontrar cidade mais próxima com base nas coordenadas
  const findClosestCity = (lat: number, lng: number, cityList: City[]) => {
    if (!cityList || cityList.length === 0) return;
    let minDistance = Infinity;
    let closestCity: City | null = null;

    cityList.forEach((city) => {
      const cAny = city as any;
      const rawLat = city.lat ?? cAny.latitude;
      const rawLng = city.lng ?? cAny.longitude;

      const cityLat = typeof rawLat === "number" ? rawLat : parseFloat(rawLat);
      const cityLng = typeof rawLng === "number" ? rawLng : parseFloat(rawLng);

      if (!isNaN(cityLat) && !isNaN(cityLng)) {
        const dist = calculateHaversineDistance(lat, lng, cityLat, cityLng);
        if (dist < minDistance) {
          minDistance = dist;
          closestCity = city;
        }
      }
    });

    if (closestCity) {
      setApCityId((closestCity as City).id.toString());
      setAutoCityDetectedName((closestCity as City).name);
    }
  };

  const handleLatChange = (text: string) => {
    setApLat(text);
    const latNum = parseFloat(text);
    const lngNum = parseFloat(apLng);
    if (!isNaN(latNum) && !isNaN(lngNum)) {
      findClosestCity(latNum, lngNum, cities);
    }
  };

  const handleLngChange = (text: string) => {
    setApLng(text);
    const latNum = parseFloat(apLat);
    const lngNum = parseFloat(text);
    if (!isNaN(latNum) && !isNaN(lngNum)) {
      findClosestCity(latNum, lngNum, cities);
    }
  };

  // Capturar GPS
  const handleGetCurrentLocation = async () => {
    try {
      setFetchingGPS(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permissão Negada",
          "É necessário permitir o acesso à localização para usar este recurso.",
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const lat = location.coords.latitude;
      const lng = location.coords.longitude;

      setApLat(lat.toFixed(6));
      setApLng(lng.toFixed(6));

      findClosestCity(lat, lng, cities);
      Alert.alert("Localização Capturada!", `Coordenadas obtidas via GPS.`);
    } catch (err) {
      console.error("Erro ao obter GPS:", err);
      Alert.alert("Erro GPS", "Não foi possível obter a localização atual.");
    } finally {
      setFetchingGPS(false);
    }
  };

  // Salvar novo Ponto de Apoio
  const handleSaveAnchorPoint = async () => {
    if (!apName.trim() || !apCityId) {
      Alert.alert("Atenção", "Preencha o nome e selecione uma cidade.");
      return;
    }

    try {
      setSavingAP(true);
      await AnchorPointsService.create({
        name: apName.trim(),
        city_id: apCityId,
        category_id: apCategoryId,
        lat: parseFloat(apLat) || -29.95,
        lng: parseFloat(apLng) || -51.62,
        phone: apPhone.trim() || undefined,
        business_hours: apHours.trim() || undefined,
      });

      Alert.alert("Sucesso", "Ponto de Apoio cadastrado com sucesso!");
      setModalAPVisible(false);
      setApName("");
      setApLat("");
      setApLng("");
      setApPhone("");
      setApHours("");
      setAutoCityDetectedName(null);
      loadData();
    } catch (err: any) {
      Alert.alert(
        "Erro",
        err.response?.data?.message || "Falha ao cadastrar Ponto de Apoio.",
      );
    } finally {
      setSavingAP(false);
    }
  };

  // Alternar Status Ativo/Inativo do Ponto de Apoio
  const handleToggleAnchorPointActive = async (ap: AnchorPoint) => {
    try {
      await AnchorPointsService.toggleActive(ap.id.toString());
      Alert.alert(
        "Sucesso",
        `Ponto de Apoio "${ap.name}" ${ap.active ? "desativado" : "ativado"} com sucesso!\n\n${ap.active ? "Ele ficou oculto para os usuários, mas pode ser reativado a qualquer momento no filtro de desativados." : "Ele voltou a ficar visível para todos os usuários."}`,
      );
      loadData();
    } catch (err) {
      Alert.alert(
        "Erro",
        "Não foi possível alterar o status do Ponto de Apoio.",
      );
    }
  };

  // Remover Ponto de Apoio
  const handleDeleteAnchorPoint = (ap: AnchorPoint) => {
    Alert.alert(
      "Excluir Permanentemente",
      `Deseja realmente EXCLUIR o ponto de apoio "${ap.name}"?\n\nEsta ação removerá o ponto definitivamente do banco de dados. Se você deseja apenas ocultá-lo temporariamente, use a opção "Desativar".`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir Permanentemente",
          style: "destructive",
          onPress: async () => {
            try {
              await AnchorPointsService.deleteAnchorPoint(ap.id.toString());
              Alert.alert("Sucesso", "Ponto de Apoio excluído com sucesso!");
              loadData();
            } catch (err) {
              Alert.alert("Erro", "Não foi possível remover o Ponto de Apoio.");
            }
          },
        },
      ],
    );
  };

  // Salvar novo Carimbo
  const handleSaveStamp = async () => {
    if (!selectedAP || !stampName.trim()) {
      Alert.alert(
        "Atenção",
        "Selecione o Ponto de Apoio e informe o nome do carimbo.",
      );
      return;
    }

    try {
      setSavingStamp(true);
      const stamp = await StampService.createStamp({
        anchor_point_id: Number(selectedAP.id),
        name: stampName.trim(),
      });

      setCreatedStamp(stamp);
      setStampName("");
      loadData();
    } catch (err: any) {
      Alert.alert(
        "Erro",
        err.response?.data?.message || "Falha ao vincular carimbo.",
      );
    } finally {
      setSavingStamp(false);
    }
  };

  // Alternar Status Ativo/Inativo do Carimbo
  const handleToggleStampActive = async (stamp: Stamp) => {
    try {
      await StampService.toggleActive(stamp.id.toString());
      Alert.alert(
        "Sucesso",
        `Carimbo ${stamp.active ? "desativado" : "ativado"} com sucesso!`,
      );
      loadData();
    } catch (err: any) {
      Alert.alert("Erro", "Não foi possível alterar o status do carimbo.");
    }
  };

  // Remover Carimbo
  const handleDeleteStamp = (stamp: Stamp) => {
    Alert.alert(
      "Confirmar Remoção",
      `Deseja realmente remover o carimbo "${stamp.name}"? Esta ação não pode ser desfeita.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Remover",
          style: "destructive",
          onPress: async () => {
            try {
              await StampService.deleteStamp(stamp.id.toString());
              Alert.alert("Sucesso", "Carimbo removido com sucesso!");
              setModalStampVisible(false);
              loadData();
            } catch (err) {
              Alert.alert("Erro", "Não foi possível remover o carimbo.");
            }
          },
        },
      ],
    );
  };

  if (!isAdmin) {
    return (
      <SafeAreaView style={styles.restrictedContainer}>
        <View style={styles.restrictedCard}>
          <IconSymbol size={48} name="lock.fill" color="#EF4444" />
          <Text style={styles.restrictedTitle}>Acesso Restrito</Text>
          <Text style={styles.restrictedSubtitle}>
            Esta tela é de acesso exclusivo para administradores credenciados do
            RotaCRIC.
          </Text>
          <Pressable
            style={[styles.btnPrimary, { marginTop: 16 }]}
            onPress={() => router.back()}
          >
            <Text style={styles.btnPrimaryText}>Voltar</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // Map carimbos por anchor_point_id
  const stampMap = new Map<string, Stamp>();
  stamps.forEach((s) => {
    if (s.anchor_point_id) {
      stampMap.set(s.anchor_point_id.toString(), s);
    }
  });

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header com botão Voltar e Badge Admin */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={[styles.backArrow, { color: primaryColor }]}>‹</Text>
          <Text style={[styles.backLabel, { color: primaryColor }]}>Voltar</Text>
        </Pressable>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Text style={styles.headerTitle}>Painel Admin</Text>
            <View style={[styles.adminHeaderBadge, { backgroundColor: primaryColor }]}>
              <Text style={styles.adminHeaderBadgeText}>ADMIN</Text>
            </View>
          </View>
          <Text style={styles.headerSubtitle}>
            Pontos de Apoio & Carimbos Digitais
          </Text>
        </View>
        <Pressable style={styles.refreshButton} onPress={onRefresh}>
          <IconSymbol size={18} name="arrow.clockwise" color={primaryColor} />
        </Pressable>
      </View>

      {/* Cards de Métricas */}
      <View style={styles.metricsContainer}>
        <View style={styles.metricCard}>
          <IconSymbol size={20} name="mappin.circle.fill" color={primaryColor} />
          <Text style={styles.metricNumber}>{anchorPoints.length}</Text>
          <Text style={styles.metricLabel}>Total Pontos</Text>
        </View>

        <Pressable
          style={[
            styles.metricCard,
            selectedCategoryFilter === "active" && styles.metricCardSelected,
          ]}
          onPress={() =>
            setSelectedCategoryFilter((prev) => (prev === "active" ? "all" : "active"))
          }
        >
          <IconSymbol size={20} name="checkmark.circle.fill" color="#166534" />
          <Text style={[styles.metricNumber, { color: "#166534" }]}>{activeCount}</Text>
          <Text style={styles.metricLabel}>Ativos</Text>
        </Pressable>

        <Pressable
          style={[
            styles.metricCard,
            selectedCategoryFilter === "inactive" && styles.metricCardSelectedInactive,
          ]}
          onPress={() =>
            setSelectedCategoryFilter((prev) => (prev === "inactive" ? "all" : "inactive"))
          }
        >
          <IconSymbol size={20} name="slash.circle.fill" color="#EF4444" />
          <Text style={[styles.metricNumber, { color: "#EF4444" }]}>{inactiveCount}</Text>
          <Text style={styles.metricLabel}>Desativados</Text>
        </Pressable>

        <View style={styles.metricCard}>
          <IconSymbol size={20} name="star.fill" color="#F59E0B" />
          <Text style={styles.metricNumber}>{stamps.length}</Text>
          <Text style={styles.metricLabel}>Carimbos</Text>
        </View>
      </View>

      {/* Ações Rápida */}
      <View style={styles.actionsBar}>
        <Pressable
          style={[styles.btnPrimary, { backgroundColor: primaryColor, shadowColor: primaryColor }]}
          onPress={() => setModalAPVisible(true)}
        >
          <IconSymbol size={18} name="plus.circle.fill" color="#FFFFFF" />
          <Text style={styles.btnPrimaryText}>Novo Ponto de Apoio</Text>
        </Pressable>
      </View>

      {/* Barra de Busca por Palavra-Chave & Filtro por Categoria e Status */}
      <View style={styles.searchFilterContainer}>
        {/* Campo de Busca */}
        <View style={styles.searchBar}>
          <IconSymbol size={16} name="magnifyingglass" color="#64748B" />
          <TextInput
            style={styles.searchInput}
            placeholder="Pesquisar ponto por nome, fone, etc..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery("")}>
              <IconSymbol size={16} name="xmark.circle.fill" color="#9CA3AF" />
            </Pressable>
          )}
        </View>

        {/* Scroll Horizontal de Filtro de Categorias e Status */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryFilterScroll}
          contentContainerStyle={{ gap: 6, paddingRight: 10 }}
        >
          <Pressable
            style={[
              styles.filterCategoryChip,
              selectedCategoryFilter === "all" &&
                styles.filterCategoryChipSelected,
            ]}
            onPress={() => setSelectedCategoryFilter("all")}
          >
            <Text
              style={[
                styles.filterCategoryChipText,
                selectedCategoryFilter === "all" &&
                  styles.filterCategoryChipTextSelected,
              ]}
            >
              Todas ({anchorPoints.length})
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.filterCategoryChip,
              selectedCategoryFilter === "active" &&
                styles.filterCategoryChipSelected,
            ]}
            onPress={() =>
              setSelectedCategoryFilter((prev) =>
                prev === "active" ? "all" : "active",
              )
            }
          >
            <Text
              style={[
                styles.filterCategoryChipText,
                selectedCategoryFilter === "active" &&
                  styles.filterCategoryChipTextSelected,
              ]}
            >
              Ativos ({activeCount})
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.filterCategoryChip,
              selectedCategoryFilter === "inactive" &&
                styles.filterCategoryChipSelectedInactive,
            ]}
            onPress={() =>
              setSelectedCategoryFilter((prev) =>
                prev === "inactive" ? "all" : "inactive",
              )
            }
          >
            <Text
              style={[
                styles.filterCategoryChipText,
                selectedCategoryFilter === "inactive" &&
                  styles.filterCategoryChipTextSelectedInactive,
              ]}
            >
              Desativados ({inactiveCount})
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.filterCategoryChip,
              selectedCategoryFilter === "with_stamp" &&
                styles.filterCategoryChipSelected,
            ]}
            onPress={() =>
              setSelectedCategoryFilter((prev) =>
                prev === "with_stamp" ? "all" : "with_stamp",
              )
            }
          >
            <Text
              style={[
                styles.filterCategoryChipText,
                selectedCategoryFilter === "with_stamp" &&
                  styles.filterCategoryChipTextSelected,
              ]}
            >
              Com Carimbo ({apIdsWithStamps.size})
            </Text>
          </Pressable>

          {categories.map((cat) => {
            const count = anchorPoints.filter(
              (ap) =>
                (ap.category_id?.toString() || ap.category?.id?.toString()) ===
                cat.id.toString(),
            ).length;

            return (
              <Pressable
                key={cat.id}
                style={[
                  styles.filterCategoryChip,
                  selectedCategoryFilter === cat.id.toString() &&
                    styles.filterCategoryChipSelected,
                ]}
                onPress={() => setSelectedCategoryFilter(cat.id.toString())}
              >
                <Text
                  style={[
                    styles.filterCategoryChipText,
                    selectedCategoryFilter === cat.id.toString() &&
                      styles.filterCategoryChipTextSelected,
                  ]}
                >
                  {cat.name} ({count})
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Lista de Pontos de Apoio */}
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Carregando dados...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredAnchorPoints}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <IconSymbol size={40} name="magnifyingglass" color="#94A3B8" />
              <Text style={styles.emptyTitle}>
                {selectedCategoryFilter === "inactive"
                  ? "Nenhum ponto desativado"
                  : "Nenhum ponto de apoio encontrado"}
              </Text>
              <Text style={styles.emptySubtitle}>
                {selectedCategoryFilter === "inactive"
                  ? "Todos os pontos de apoio cadastrados estão ativos no momento."
                  : "Tente ajustar sua busca ou selecionar outra categoria."}
              </Text>
              {(searchQuery.length > 0 || selectedCategoryFilter !== "all") && (
                <Pressable
                  style={styles.btnClearFilters}
                  onPress={() => {
                    setSearchQuery("");
                    setSelectedCategoryFilter("all");
                  }}
                >
                  <Text style={styles.btnClearFiltersText}>Limpar Filtros</Text>
                </Pressable>
              )}
            </View>
          }
          renderItem={({ item }) => {
            const hasStamp = stampMap.has(item.id.toString());
            const existingStamp = stampMap.get(item.id.toString());

            return (
              <View
                style={[styles.apCard, !item.active && styles.apCardInactive]}
              >
                <View style={styles.apCardHeader}>
                  <View style={styles.apTitleBox}>
                    <Text style={styles.apName}>
                      {item.name} {!item.active && "(Inativo)"}
                    </Text>
                    {item.business_hours && (
                      <Text style={styles.apHours}>
                        🕒 {item.business_hours}
                      </Text>
                    )}
                  </View>
                  <View style={{ flexDirection: "row", gap: 6 }}>
                    <View
                      style={
                        item.active ? styles.badgeActive : styles.badgeInactive
                      }
                    >
                      <Text
                        style={
                          item.active
                            ? styles.badgeActiveText
                            : styles.badgeInactiveText
                        }
                      >
                        {item.active ? "Ponto Ativo" : "Ponto Inativo"}
                      </Text>
                    </View>
                    <View
                      style={
                        hasStamp
                          ? styles.badgeStampActive
                          : styles.badgeStampInactive
                      }
                    >
                      <Text
                        style={
                          hasStamp
                            ? styles.badgeStampActiveText
                            : styles.badgeStampInactiveText
                        }
                      >
                        {hasStamp
                          ? existingStamp?.active
                            ? "Carimbo Ativo"
                            : "Carimbo Desativado"
                          : "Sem Carimbo"}
                      </Text>
                    </View>
                  </View>
                </View>

                {item.phone && (
                  <Text style={styles.apDetail}>📞 {item.phone}</Text>
                )}

                {/* Controles de Ação do Ponto de Apoio */}
                <View style={styles.apCardActionsRow}>
                  {/* Botões do Ponto de Apoio: Desativar/Ativar e Remover */}
                  <View style={{ flexDirection: "row", gap: 6 }}>
                    <Pressable
                      style={
                        item.active ? styles.btnApWarning : styles.btnApSuccess
                      }
                      onPress={() => handleToggleAnchorPointActive(item)}
                    >
                      <Text
                        style={
                          item.active
                            ? styles.btnApWarningText
                            : styles.btnApSuccessText
                        }
                      >
                        {item.active ? "Desativar Ponto" : "Ativar Ponto"}
                      </Text>
                    </Pressable>

                    <Pressable
                      style={styles.btnApDanger}
                      onPress={() => handleDeleteAnchorPoint(item)}
                    >
                      <Text style={styles.btnApDangerText}>Excluir</Text>
                    </Pressable>
                  </View>

                  {/* Botão de Carimbo */}
                  <Pressable
                    style={hasStamp ? styles.btnOutline : styles.btnSuccess}
                    onPress={() => {
                      setSelectedAP(item);
                      setStampName(
                        existingStamp
                          ? existingStamp.name
                          : `Carimbo ${item.name}`,
                      );
                      setCreatedStamp(existingStamp || null);
                      setModalStampVisible(true);
                    }}
                  >
                    <IconSymbol
                      size={14}
                      name={hasStamp ? "qrcode" : "star.fill"}
                      color={hasStamp ? "#2563EB" : "#FFFFFF"}
                    />
                    <Text
                      style={
                        hasStamp ? styles.btnOutlineText : styles.btnSuccessText
                      }
                    >
                      {hasStamp ? "QR / Carimbo" : "Vincular Carimbo"}
                    </Text>
                  </Pressable>
                </View>
              </View>
            );
          }}
        />
      )}

      {/* Modal: Criar Ponto de Apoio com KeyboardAvoidingView */}
      <Modal visible={modalAPVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Novo Ponto de Apoio</Text>
              <Pressable onPress={() => setModalAPVisible(false)}>
                <IconSymbol
                  size={20}
                  name="xmark.circle.fill"
                  color="#9CA3AF"
                />
              </Pressable>
            </View>

            <ScrollView
              style={{ maxHeight: 460 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.inputLabel}>Nome do Ponto de Apoio *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Lanchonete da Serra"
                value={apName}
                onChangeText={setApName}
              />

              {/* GPS */}
              <Pressable
                style={styles.btnGps}
                onPress={handleGetCurrentLocation}
                disabled={fetchingGPS}
              >
                {fetchingGPS ? (
                  <ActivityIndicator size="small" color="#2563EB" />
                ) : (
                  <IconSymbol
                    size={18}
                    name="mappin.circle.fill"
                    color="#2563EB"
                  />
                )}
                <Text style={styles.btnGpsText}>
                  {fetchingGPS
                    ? "Obtendo GPS..."
                    : "Usar Minha Localização Atual"}
                </Text>
              </Pressable>

              <View style={{ flexDirection: "row", gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Latitude</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="-29.950000"
                    keyboardType="numeric"
                    value={apLat}
                    onChangeText={handleLatChange}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Longitude</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="-51.620000"
                    keyboardType="numeric"
                    value={apLng}
                    onChangeText={handleLngChange}
                  />
                </View>
              </View>

              {/* Aviso de cidade autodetectada com margin top ajustado */}
              {autoCityDetectedName && (
                <View style={styles.detectedCityBadge}>
                  <IconSymbol
                    size={14}
                    name="checkmark.circle.fill"
                    color="#166534"
                  />
                  <Text style={styles.detectedCityText}>
                    Cidade identificada pelas coordenadas:{" "}
                    <Text style={{ fontWeight: "700" }}>
                      {autoCityDetectedName}
                    </Text>
                  </Text>
                </View>
              )}

              <Text style={styles.inputLabel}>Cidade *</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginBottom: 8 }}
              >
                {cities.map((city) => (
                  <Pressable
                    key={city.id}
                    style={[
                      styles.chip,
                      apCityId === city.id.toString() && styles.chipSelected,
                    ]}
                    onPress={() => {
                      setApCityId(city.id.toString());
                      setAutoCityDetectedName(null);
                    }}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        apCityId === city.id.toString() &&
                          styles.chipTextSelected,
                      ]}
                    >
                      {city.name}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>

              <Text style={styles.inputLabel}>Categoria do Ponto de Apoio</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginBottom: 8 }}
              >
                {categories.map((cat) => (
                  <Pressable
                    key={cat.id}
                    style={[
                      styles.chip,
                      apCategoryId === cat.id.toString() && styles.chipSelected,
                    ]}
                    onPress={() => setApCategoryId(cat.id.toString())}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        apCategoryId === cat.id.toString() &&
                          styles.chipTextSelected,
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>

              <Text style={styles.inputLabel}>Telefone / WhatsApp</Text>
              <TextInput
                style={styles.input}
                placeholder="(51) 99999-9999"
                keyboardType="phone-pad"
                value={apPhone}
                onChangeText={setApPhone}
              />

              <Text style={styles.inputLabel}>Horário de Funcionamento</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Seg a Sáb 08:00 - 18:00"
                value={apHours}
                onChangeText={setApHours}
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <Pressable
                style={styles.btnSecondary}
                onPress={() => setModalAPVisible(false)}
              >
                <Text style={styles.btnSecondaryText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={styles.btnPrimary}
                onPress={handleSaveAnchorPoint}
                disabled={savingAP}
              >
                {savingAP ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.btnPrimaryText}>Salvar Ponto</Text>
                )}
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modal: Gerenciar / Vincular Carimbo & QR Code */}
      <Modal visible={modalStampVisible} animationType="fade" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {createdStamp
                  ? "QR Code & Gestão do Carimbo"
                  : "Vincular Carimbo"}
              </Text>
              <Pressable onPress={() => setModalStampVisible(false)}>
                <IconSymbol
                  size={20}
                  name="xmark.circle.fill"
                  color="#9CA3AF"
                />
              </Pressable>
            </View>

            {createdStamp ? (
              <View style={styles.qrCodeBox}>
                <Text style={styles.qrCodeSub}>{createdStamp.name}</Text>
                <Text style={styles.qrCodeAp}>Ponto: {selectedAP?.name}</Text>

                <Image
                  source={{
                    uri: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
                      createdStamp.qr_code_token,
                    )}`,
                  }}
                  style={styles.qrImage}
                  contentFit="contain"
                />

                <View style={styles.tokenBox}>
                  <Text style={styles.tokenLabel}>Token Oficial:</Text>
                  <Text style={styles.tokenText}>
                    {createdStamp.qr_code_token}
                  </Text>
                </View>

                <View style={styles.stampControlBar}>
                  <Pressable
                    style={
                      createdStamp.active
                        ? styles.btnWarning
                        : styles.btnSuccess
                    }
                    onPress={() => handleToggleStampActive(createdStamp)}
                  >
                    <Text style={styles.btnWarningText}>
                      {createdStamp.active
                        ? "Desativar Carimbo"
                        : "Ativar Carimbo"}
                    </Text>
                  </Pressable>

                  <Pressable
                    style={styles.btnDanger}
                    onPress={() => handleDeleteStamp(createdStamp)}
                  >
                    <Text style={styles.btnDangerText}>Remover</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <View>
                <Text style={styles.apSelectedText}>
                  Ponto de Apoio:{" "}
                  <Text style={{ fontWeight: "700" }}>{selectedAP?.name}</Text>
                </Text>

                <Text style={styles.inputLabel}>
                  Nome do Carimbo / Medalha *
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: Carimbo Ouro Lanchonete da Serra"
                  value={stampName}
                  onChangeText={setStampName}
                />
              </View>
            )}

            <View style={styles.modalFooter}>
              <Pressable
                style={styles.btnSecondary}
                onPress={() => setModalStampVisible(false)}
              >
                <Text style={styles.btnSecondaryText}>Fechar</Text>
              </Pressable>

              {!createdStamp && (
                <Pressable
                  style={styles.btnSuccess}
                  onPress={handleSaveStamp}
                  disabled={savingStamp}
                >
                  {savingStamp ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.btnSuccessText}>Gerar QR Code</Text>
                  )}
                </Pressable>
              )}
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  restrictedContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
    padding: 20,
  },
  restrictedCard: {
    backgroundColor: "#FFFFFF",
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  restrictedTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E293B",
    marginTop: 12,
    marginBottom: 8,
  },
  restrictedSubtitle: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 8,
  },
  backArrow: {
    fontSize: 24,
    color: "#2563EB",
    fontWeight: "600",
    lineHeight: 24,
  },
  backLabel: {
    fontSize: 14,
    color: "#2563EB",
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  headerSubtitle: {
    fontSize: 11,
    color: "#64748B",
  },
  refreshButton: {
    padding: 8,
    backgroundColor: "#EFF6FF",
    borderRadius: 8,
  },

  metricsContainer: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  metricCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  metricNumber: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
    marginVertical: 2,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: "500",
    color: "#64748B",
  },

  actionsBar: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  btnPrimary: {
    backgroundColor: "#2563EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  btnPrimaryText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },

  btnGps: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 8,
  },
  btnGpsText: {
    color: "#2563EB",
    fontSize: 13,
    fontWeight: "600",
  },

  detectedCityBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    padding: 10,
    borderRadius: 8,
    marginTop: 12, // Spacing above badge to not collide with lat/lng inputs
    marginBottom: 8,
  },
  detectedCityText: {
    fontSize: 12,
    color: "#166534",
  },

  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 12,
  },
  apCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  apCardInactive: {
    backgroundColor: "#F8FAFC",
    borderColor: "#CBD5E1",
    opacity: 0.85,
  },
  apCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  apTitleBox: {
    flex: 1,
    marginRight: 8,
  },
  apName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },
  apHours: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
  },
  apDetail: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 6,
  },
  badgeActive: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeActiveText: {
    color: "#166534",
    fontSize: 10,
    fontWeight: "600",
  },
  badgeInactive: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeInactiveText: {
    color: "#64748B",
    fontSize: 10,
    fontWeight: "600",
  },
  badgeStampActive: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeStampActiveText: {
    color: "#92400E",
    fontSize: 10,
    fontWeight: "600",
  },
  badgeStampInactive: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeStampInactiveText: {
    color: "#94A3B8",
    fontSize: 10,
    fontWeight: "600",
  },

  apCardActionsRow: {
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  btnApSuccess: {
    backgroundColor: "#16A34A",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  btnApSuccessText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
  },
  btnApWarning: {
    backgroundColor: "#F59E0B",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  btnApWarningText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
  },
  btnApDanger: {
    backgroundColor: "#EF4444",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  btnApDangerText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
  },

  btnOutline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: "#2563EB",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  btnOutlineText: {
    color: "#2563EB",
    fontSize: 11,
    fontWeight: "600",
  },
  btnSuccess: {
    backgroundColor: "#2563EB",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  btnSuccessText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
  },
  btnWarning: {
    backgroundColor: "#EAB308",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  btnWarningText: {
    color: "#854D0E",
    fontSize: 12,
    fontWeight: "600",
  },
  btnDanger: {
    backgroundColor: "#EF4444",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  btnDangerText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },

  loadingBox: {
    padding: 40,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#64748B",
  },

  // Modais
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "center",
    padding: 16,
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 4,
    marginTop: 8,
  },
  input: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: "#0F172A",
  },
  chip: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 6,
  },
  chipSelected: {
    backgroundColor: "#2563EB",
  },
  chipText: {
    fontSize: 12,
    color: "#475569",
  },
  chipTextSelected: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 20,
  },
  btnSecondary: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#F1F5F9",
  },
  btnSecondaryText: {
    color: "#475569",
    fontWeight: "600",
  },

  qrCodeBox: {
    alignItems: "center",
    paddingVertical: 10,
  },
  qrCodeSub: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  qrCodeAp: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: 14,
  },
  qrImage: {
    width: 220,
    height: 220,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
  },
  tokenBox: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 14,
    alignItems: "center",
  },
  tokenLabel: {
    fontSize: 10,
    color: "#64748B",
  },
  tokenText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2563EB",
  },
  stampControlBar: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  apSelectedText: {
    fontSize: 14,
    color: "#334155",
    marginBottom: 12,
  },

  // Busca e Filtros
  searchFilterContainer: {
    paddingHorizontal: 20,
    marginBottom: 12,
    gap: 10,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#0F172A",
    height: "100%",
  },
  adminHeaderBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  adminHeaderBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  metricCardSelected: {
    borderColor: "#166534",
    backgroundColor: "#F0FDF4",
  },
  metricCardSelectedInactive: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
  categoryFilterScroll: {
    flexDirection: "row",
  },
  filterCategoryChip: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  filterCategoryChipSelected: {
    backgroundColor: "#273273",
    borderColor: "#273273",
  },
  filterCategoryChipSelectedInactive: {
    backgroundColor: "#EF4444",
    borderColor: "#DC2626",
  },
  filterCategoryChipText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#475569",
  },
  filterCategoryChipTextSelected: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  filterCategoryChipTextSelectedInactive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 36,
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginTop: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
    marginTop: 10,
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    marginTop: 4,
  },
  btnClearFilters: {
    marginTop: 14,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  btnClearFiltersText: {
    color: "#2563EB",
    fontSize: 12,
    fontWeight: "600",
  },
});

import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "@/components/contexts/AuthContext";

export interface ManualItem {
  id: string;
  category: string;
  title: string;
  iconName: keyof typeof MaterialCommunityIcons.glyphMap;
  featherIcon: keyof typeof Feather.glyphMap;
  text: string;
  chips: string[];
  themeColor: string;
  lightBg: string;
  borderColor: string;
}

const MANUAL_ITEMS: ManualItem[] = [
  {
    id: "lixo",
    category: "PRESERVAÇÃO AMBIENTAL",
    title: "Descarte consciente de lixo",
    iconName: "trash-can-outline",
    featherIcon: "trash-2",
    text: "Para garantir a prevenção de acidentes e manter o percurso em bom estado, seja consciente e jogue seu lixo nos pontos de apoio ao longo do trajeto. Ao fazer isso, você colabora com o meio ambiente e contribui para a manutenção e limpeza do percurso.",
    chips: ["Pontos de Apoio", "Coleta Seletiva", "Manutenção"],
    themeColor: "#059669",
    lightBg: "#ECFDF5",
    borderColor: "#A7F3D0",
  },
  {
    id: "seguranca",
    category: "EQUIPAMENTOS DE SEGURANÇA",
    title: "Sua segurança em primeiro lugar",
    iconName: "shield-check-outline",
    featherIcon: "shield",
    text: "Sua segurança é uma de nossas principais prioridades enquanto você está rodando e conhecendo a região. Para colaborar, é muito importante que você utilize os equipamentos de segurança necessários, como capacete, luzes de sinalização, lanterna e água.",
    chips: ["Capacete", "Luzes & Lanterna", "Hidratação"],
    themeColor: "#2563EB",
    lightBg: "#EFF6FF",
    borderColor: "#BFDBFE",
  },
  {
    id: "horario",
    category: "PLANEJAMENTO DE HORÁRIO",
    title: "Escolha o horário ideal",
    iconName: "watch",
    featherIcon: "clock",
    text: "Independentemente de ser da região ou não, ao percorrer a rota, certamente você deseja aproveitar ao máximo, certo? Nesse sentido, tenha consciência de escolher um horário adequado para você e para seus equipamentos de segurança, conforme descrito no informe anterior.",
    chips: ["Visibilidade", "Temperatura", "Iluminação"],
    themeColor: "#D97706",
    lightBg: "#FFFBEB",
    borderColor: "#FDE68A",
  },
  {
    id: "clima",
    category: "CONDIÇÕES CLIMÁTICAS",
    title: "Atenção ao clima da região",
    iconName: "weather-partly-cloudy",
    featherIcon: "sun",
    text: "Antes de visitar a Rota Ciclística da Região Imperial Carbonífera, certifique-se de que as condições climáticas na região estejam favoráveis e adequadas ao seu estilo de pedalada. Além disso, tenha em mente a sua segurança durante o turismo em nossa região.",
    chips: ["Previsão do Tempo", "Terreno", "Ritmo Seguro"],
    themeColor: "#7C3AED",
    lightBg: "#F5F3FF",
    borderColor: "#DDD6FE",
  },
];

export function CyclistManual() {
  const { primaryColor } = useAuth();
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const toggleCheck = (id: string) => {
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const completedCount = Object.values(checkedItems).filter(Boolean).length;
  const totalCount = MANUAL_ITEMS.length;
  const progressPercent = (completedCount / totalCount) * 100;

  return (
    <View style={styles.container}>
      {/* Cabeçalho */}
      <View style={styles.headerArea}>
        <View style={styles.headerBadgeRow}>
          <View style={[styles.headerBadge, { backgroundColor: (primaryColor || "#2563EB") + "15" }]}>
            <MaterialCommunityIcons name="bike-fast" size={14} color={primaryColor || "#2563EB"} />
            <Text style={[styles.headerBadgeText, { color: primaryColor || "#2563EB" }]}>
              GUIA DO CICLISTA
            </Text>
          </View>
        </View>

        <Text style={styles.mainTitle}>Manual do Ciclista</Text>

        <Text style={styles.mainSub}>
          Recomendações fundamentais para uma pedalada segura, consciente e inesquecível pela Região Carbonífera.
        </Text>

        {/* Barra de Progresso / Readiness */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Feather
                name={completedCount === totalCount ? "check-circle" : "check-square"}
                size={16}
                color={completedCount === totalCount ? "#10B981" : primaryColor || "#2563EB"}
              />
              <Text style={styles.progressTitle}>Checklist do Ciclista</Text>
            </View>
            <Text style={styles.progressCounter}>
              {completedCount}/{totalCount} lidos
            </Text>
          </View>

          <View style={styles.progressBarTrack}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${progressPercent}%`,
                  backgroundColor: completedCount === totalCount ? "#10B981" : primaryColor || "#2563EB",
                },
              ]}
            />
          </View>

          {completedCount === totalCount && (
            <View style={styles.completedBadge}>
              <Text style={styles.completedBadgeText}>
                🎉 Perfeito! Você está pronto para rodar com toda a segurança!
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Cartões Interativos */}
      <View style={styles.cardsContainer}>
        {MANUAL_ITEMS.map((item) => {
          const isChecked = Boolean(checkedItems[item.id]);
          return (
            <View
              key={item.id}
              style={[
                styles.modernCard,
                { borderColor: isChecked ? "#10B981" : item.borderColor },
              ]}
            >
              {/* Header do Cartão */}
              <View style={styles.cardHeader}>
                <View style={[styles.cardIconBox, { backgroundColor: item.themeColor }]}>
                  <MaterialCommunityIcons
                    name={item.iconName}
                    size={24}
                    color="#FFFFFF"
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardCategory, { color: item.themeColor }]}>
                    {item.category}
                  </Text>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                </View>

                {/* Botão Checkmark */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => toggleCheck(item.id)}
                  style={[
                    styles.checkBtn,
                    isChecked
                      ? { backgroundColor: "#10B981", borderColor: "#10B981" }
                      : { borderColor: "#CBD5E1", backgroundColor: "#F8FAFC" },
                  ]}
                >
                  <Feather
                    name="check"
                    size={14}
                    color={isChecked ? "#FFFFFF" : "#94A3B8"}
                  />
                </TouchableOpacity>
              </View>

              {/* Texto da Instrução */}
              <Text style={styles.cardText}>{item.text}</Text>

              {/* Chips / Tags Rápidas */}
              <View style={styles.chipsRow}>
                {item.chips.map((chip, i) => (
                  <View
                    key={i}
                    style={[styles.chipPill, { backgroundColor: item.lightBg }]}
                  >
                    <Text style={[styles.chipText, { color: item.themeColor }]}>
                      #{chip}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
    marginHorizontal: 16,
  },
  headerArea: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 22,
    marginBottom: 16,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  headerBadgeRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  headerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  headerBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1E293B",
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  mainSub: {
    fontSize: 13,
    color: "#64748B",
    lineHeight: 19,
    marginBottom: 16,
  },

  // Progresso
  progressCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1E293B",
  },
  progressCounter: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: "#E2E8F0",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  completedBadge: {
    marginTop: 10,
    backgroundColor: "#ECFDF5",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  completedBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#047857",
    textAlign: "center",
  },

  // Cartões Modernos
  cardsContainer: {
    gap: 14,
  },
  modernCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1.5,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  cardIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  cardCategory: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 2,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1E293B",
  },
  checkBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  cardText: {
    fontSize: 13.5,
    lineHeight: 21,
    color: "#475569",
    marginBottom: 14,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  chipPill: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  chipText: {
    fontSize: 10.5,
    fontWeight: "700",
  },
});

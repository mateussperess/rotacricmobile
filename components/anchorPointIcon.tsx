import BeverageStorage from "@/assets/images/anchorpoint_categories_logos/beverage_storage.svg";
import Food from "@/assets/images/anchorpoint_categories_logos/food.svg";
import GasStation from "@/assets/images/anchorpoint_categories_logos/gas_station.svg";
import Hospital from "@/assets/images/anchorpoint_categories_logos/hospital.svg";
import Hotel from "@/assets/images/anchorpoint_categories_logos/hotel.svg";
import Pharmacy from "@/assets/images/anchorpoint_categories_logos/pharmacy.svg";
import Repair from "@/assets/images/anchorpoint_categories_logos/repair.svg";
import Store from "@/assets/images/anchorpoint_categories_logos/store.svg";
import Tourism from "@/assets/images/anchorpoint_categories_logos/tourism.svg";
import React from "react";
import { StyleSheet, View } from "react-native";

const ICON_MAP: Record<
  string,
  React.FC<{ width: number; height: number; color?: string }>
> = {
  beverage_storage: BeverageStorage,
  food: Food,
  gas_station: GasStation,
  hospital: Hospital,
  hotel: Hotel,
  pharmacy: Pharmacy,
  repair: Repair,
  store: Store,
  tourism: Tourism,
};

interface Props {
  icon_name: string | null | undefined;
  on_route?: boolean;
}

const AnchorPointMarkerComponent = ({ icon_name, on_route }: Props) => {
  const IconComponent = icon_name ? ICON_MAP[icon_name] : null;

  return (
    <View style={styles.shadow}>
      {IconComponent ? (
        <IconComponent width={42} height={42} />
      ) : (
        <View style={styles.fallbackDot} />
      )}
    </View>
  );
};

AnchorPointMarkerComponent.displayName = "AnchorPointMarker";
export const AnchorPointMarker = React.memo(AnchorPointMarkerComponent);

const styles = StyleSheet.create({
  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 5,
  },
  fallbackDot: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#2563EB",
  },
});

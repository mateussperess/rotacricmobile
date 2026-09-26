import BeverageStorage from "@/assets/images/anchorpoint_categories_logos/beverage_storage.svg";
import Food from "@/assets/images/anchorpoint_categories_logos/food.svg";
import GasStation from "@/assets/images/anchorpoint_categories_logos/gas_station.svg";
import Hospital from "@/assets/images/anchorpoint_categories_logos/hospital.svg";
import Hotel from "@/assets/images/anchorpoint_categories_logos/hotel.svg";
import Pharmacy from "@/assets/images/anchorpoint_categories_logos/pharmacy.svg";
import Repair from "@/assets/images/anchorpoint_categories_logos/repair.svg";
import Store from "@/assets/images/anchorpoint_categories_logos/store.svg";
import Tourism from "@/assets/images/anchorpoint_categories_logos/tourism.svg";

import StoreCollected from "@/assets/images/anchorpoint_categories_logos/collected/store_collected.svg";

import { useAuth } from "@/components/contexts/AuthContext";
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

// const COLLECTED_ICON_MAP: Record<
//   string,
//   React.FC<{ width: number; height: number; color?: string }>
// > = {
//   beverage_storage: BeverageStorageCollected,
//   food: FoodCollected,
//   gas_station: GasStationCollected,
//   hospital: HospitalCollected,
//   hotel: HotelCollected,
//   pharmacy: PharmacyCollected,
//   repair: RepairCollected,
//   store: StoreCollected,
//   tourism: TourismCollected,
// };

interface Props {
  icon_name?: string | null;
  category_id?: string | number | null;
  on_route?: boolean;
  is_collected?: boolean;
}

const CATEGORY_ID_MAP: Record<string, string> = {
  "1": "gas_station",
  "2": "food",
  "3": "hotel",
  "4": "pharmacy",
  "5": "repair",
  "6": "store",
  "7": "tourism",
  "8": "hospital",
  "9": "beverage_storage",
};

const AnchorPointMarkerComponent = ({
  icon_name,
  category_id,
  on_route,
  is_collected = false,
}: Props) => {
  const auth = useAuth();
  const isLoggedIn = Boolean(auth?.isLoggedIn);
  const actualCollected = isLoggedIn && Boolean(is_collected);

  // const mapToUse = actualCollected ? COLLECTED_ICON_MAP : ICON_MAP;
  const mapToUse = ICON_MAP;
  let IconComponent = icon_name ? mapToUse[icon_name] : null;

  if (!IconComponent && category_id) {
    const catKey = CATEGORY_ID_MAP[category_id.toString()];
    if (catKey && mapToUse[catKey]) {
      IconComponent = mapToUse[catKey];
    }
  }

  if (!IconComponent) {
    IconComponent = actualCollected ? StoreCollected : Store;
  }

  return (
    <View style={styles.shadow}>
      <IconComponent width={42} height={42} />
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
});

// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolWeight } from "expo-symbols";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  "house.fill": "home",
  "paperplane.fill": "send",
  "map.fill": "map",
  "person.fill": "person",
  "chevron.left.forwardslash.chevron.right": "code",
  "chevron.right": "chevron-right",
  "arrow.forward.circle.fill": "directions",
  "barcode.viewfinder": "qr-code",
  "star.fill": "star",
  "building.2.fill": "location-city",

  "lock.fill": "lock",
  "award.fill": "military-tech",
  "mappin.and.ellipse": "place",
  "checkmark.circle.fill": "check-circle",
  "clock.fill": "access-time",
  "trophy.fill": "emoji-events",

  "bell.fill": "notifications",
  "shield.fill": "shield",
  "gearshape.fill": "settings",
  "questionmark.circle.fill": "help-outline",
  "rectangle.portrait.and.arrow.right": "logout",
  bicycle: "directions-bike",
} as const;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return (
    <MaterialIcons
      color={color}
      size={size}
      name={MAPPING[name]}
      style={style}
    />
  );
}

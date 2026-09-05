import { MaterialIcons } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import {
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { styles } from "./styles";

interface CustomInputProps extends TextInputProps {
  label: string;
  iconName?: keyof typeof MaterialIcons.glyphMap;
  rightIconName?: keyof typeof MaterialIcons.glyphMap;
  onRightIconPress?: () => void;
  error?: boolean;
  success?: boolean;
}

export function CustomInput({
  label,
  iconName,
  rightIconName,
  onRightIconPress,
  error,
  success,
  style,
  ...props
}: CustomInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    props.onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    props.onBlur?.(e);
  };

  const iconColor = success
    ? "#10B981"
    : error
      ? "#EF4444"
      : isFocused
        ? "#2563EB"
        : "#94A3B8";

  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TouchableWithoutFeedback onPress={() => inputRef.current?.focus()}>
        <View
          style={[
            styles.inputContainer,
            isFocused && styles.inputContainerFocused,
            error && { borderColor: "#EF4444" },
            success && { borderColor: "#10B981" },
          ]}
        >
          {iconName ? (
            <MaterialIcons name={iconName} size={20} color={iconColor} />
          ) : null}

          <TextInput
            ref={inputRef}
            {...props}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholderTextColor="#94A3B8"
            style={[
              styles.input,
              !iconName && { marginLeft: 0 },
              rightIconName ? { paddingRight: 36 } : null,
              style,
            ]}
          />

          {rightIconName ? (
            <TouchableOpacity
              onPress={onRightIconPress}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={{ position: "absolute", right: 14 }}
            >
              <MaterialIcons name={rightIconName} size={20} color="#94A3B8" />
            </TouchableOpacity>
          ) : null}
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
}

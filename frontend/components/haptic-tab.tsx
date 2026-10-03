import { BottomTabBarButtonProps } from "expo-router/js-tabs";
import * as Haptics from "expo-haptics";
import React, { useRef } from "react";
import { Animated, Pressable } from "react-native";

export function HapticTab(props: BottomTabBarButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = (ev: any) => {
    Animated.spring(scaleAnim, {
      toValue: 0.90,
      useNativeDriver: true,
      speed: 40,
      bounciness: 4,
    }).start();

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}

    props.onPressIn?.(ev);
  };

  const handlePressOut = (ev: any) => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 25,
      bounciness: 7,
    }).start();

    props.onPressOut?.(ev);
  };

  return (
    <Pressable
      {...props}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={(state) => [
        typeof props.style === "function" ? props.style(state) : props.style,
        { flex: 1 },
      ]}
      android_ripple={{ color: "transparent" }}
    >
      <Animated.View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          transform: [{ scale: scaleAnim }],
        }}
      >
        {props.children}
      </Animated.View>
    </Pressable>
  );
}

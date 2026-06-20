import { CityImage } from "@/services/cities/citiesService";
import { Image } from "expo-image";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_MARGIN = 20;
const IMAGE_WIDTH = SCREEN_WIDTH - CARD_MARGIN * 2 - 40;
const IMAGE_HEIGHT = 220;
const GAP = 12;
const SNAP_INTERVAL = IMAGE_WIDTH + GAP;

interface Props {
  images: CityImage[];
}

export function CityImageCarousel({ images }: Props) {
  const scrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const dotAnims = useRef(
    images.map((_, i) => new Animated.Value(i === 0 ? 1 : 0)),
  ).current;

  const loopedImages =
    images.length > 1
      ? [images[images.length - 1], ...images, images[0]]
      : images;

  const isLoop = images.length > 1;

  useEffect(() => {
    if (isLoop) {
      scrollRef.current?.scrollTo({ x: SNAP_INTERVAL, animated: false });
    }
  }, [isLoop]);

  const animateDots = useCallback(
    (index: number) => {
      dotAnims.forEach((anim, i) => {
        Animated.spring(anim, {
          toValue: i === index ? 1 : 0,
          useNativeDriver: false,
          speed: 20,
          bounciness: 6,
        }).start();
      });
    },
    [dotAnims],
  );

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!isLoop) return;

    const offsetX = e.nativeEvent.contentOffset.x;
    const rawIndex = Math.round(offsetX / SNAP_INTERVAL);

    const realIndex = (rawIndex - 1 + images.length) % images.length;
    setActiveIndex(realIndex);
    animateDots(realIndex);

    if (rawIndex === 0) {
      scrollRef.current?.scrollTo({
        x: SNAP_INTERVAL * images.length,
        animated: false,
      });
    }

    if (rawIndex === loopedImages.length - 1) {
      scrollRef.current?.scrollTo({
        x: SNAP_INTERVAL,
        animated: false,
      });
    }
  };

  if (images.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>Fotos</Text>
        <Text style={styles.counter}>
          {activeIndex + 1}/{images.length}
        </Text>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled={false}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        snapToInterval={SNAP_INTERVAL}
        decelerationRate="fast"
        contentContainerStyle={styles.scrollContent}
        scrollEventThrottle={16}
      >
        {(isLoop ? loopedImages : images).map((img, i) => (
          <View key={`${img.id}-${i}`} style={styles.imageWrapper}>
            <Image
              source={{ uri: img.url }}
              style={styles.image}
              contentFit="cover"
              cachePolicy="disk"
              transition={300}
            />
            {img.caption && (
              <View style={styles.captionContainer}>
                <Text style={styles.caption} numberOfLines={1}>
                  {img.caption}
                </Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      {/* Dots animados */}
      {images.length > 1 && (
        <View style={styles.dots}>
          {images.map((_, i) => {
            const width = dotAnims[i].interpolate({
              inputRange: [0, 1],
              outputRange: [6, 18],
            });
            const opacity = dotAnims[i].interpolate({
              inputRange: [0, 1],
              outputRange: [0.35, 1],
            });
            return (
              <Animated.View key={i} style={[styles.dot, { width, opacity }]} />
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 10 },

  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { fontSize: 16, fontWeight: "700", color: "#111827" },
  counter: { fontSize: 12, color: "#9CA3AF", fontWeight: "600" },

  scrollContent: { gap: GAP },

  imageWrapper: {
    width: IMAGE_WIDTH,
    height: IMAGE_HEIGHT,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#F3F4F6",
  },
  image: {
    width: IMAGE_WIDTH,
    height: IMAGE_HEIGHT,
  },

  captionContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 14,
    paddingVertical: 10,
    paddingTop: 28,
    backgroundColor: "rgba(0,0,0,0.40)",
  },
  caption: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
    letterSpacing: 0.2,
  },

  dots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
    marginTop: 2,
  },
  dot: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "#2563EB",
  },
});

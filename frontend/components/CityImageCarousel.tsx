import { IconSymbol } from "@/components/ui/icon-symbol";
import { CityImage } from "@/services/cities/citiesService";
import { getCityFallbackImage, resolveImageUrl } from "@/utils/imageUtils";
import { Image } from "expo-image";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
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
  cityName?: string;
}

export function CityImageCarousel({ images, cityName }: Props) {
  const scrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Mapear e resolver URLs de cada imagem
  const [resolvedImages, setResolvedImages] = useState<Array<CityImage & { resolvedUrl: string }>>([]);

  useEffect(() => {
    if (images && images.length > 0) {
      const mapped = images.map((img, idx) => {
        const rawUrl =
          img.url ||
          (img as any).image_path ||
          (img as any).image ||
          (img as any).uri ||
          "";
        return {
          ...img,
          resolvedUrl: resolveImageUrl(rawUrl, cityName, idx),
        };
      });
      setResolvedImages(mapped);
    } else {
      // Se não houver imagens vindas do backend, gerar carrossel com fotos padrão da cidade
      const fallbackUrl1 = getCityFallbackImage(cityName, 0);
      const fallbackUrl2 = getCityFallbackImage(cityName, 1);
      setResolvedImages([
        {
          id: `fallback-1-${cityName || "city"}`,
          city_id: "0",
          url: fallbackUrl1,
          resolvedUrl: fallbackUrl1,
          caption: cityName ? `Paisagem de ${cityName}` : "Rota CRIC",
          order: 0,
          created_at: new Date().toISOString(),
        },
        {
          id: `fallback-2-${cityName || "city"}`,
          city_id: "0",
          url: fallbackUrl2,
          resolvedUrl: fallbackUrl2,
          caption: cityName ? `Circuito de ${cityName}` : "Rota CRIC",
          order: 1,
          created_at: new Date().toISOString(),
        },
      ]);
    }
  }, [images, cityName]);

  const dotAnims = useRef<Animated.Value[]>([]);

  if (dotAnims.current.length !== resolvedImages.length) {
    dotAnims.current = resolvedImages.map(
      (_, i) => new Animated.Value(i === activeIndex ? 1 : 0),
    );
  }

  const loopedImages =
    resolvedImages.length > 1
      ? [resolvedImages[resolvedImages.length - 1], ...resolvedImages, resolvedImages[0]]
      : resolvedImages;

  const isLoop = resolvedImages.length > 1;

  useEffect(() => {
    if (isLoop && scrollRef.current) {
      scrollRef.current.scrollTo({ x: SNAP_INTERVAL, animated: false });
    }
  }, [isLoop, resolvedImages.length]);

  const animateDots = useCallback(
    (index: number) => {
      dotAnims.current.forEach((anim, i) => {
        Animated.spring(anim, {
          toValue: i === index ? 1 : 0,
          useNativeDriver: false,
          speed: 20,
          bounciness: 6,
        }).start();
      });
    },
    [],
  );

  const handleNext = () => {
    if (resolvedImages.length <= 1) return;
    const nextIndex = (activeIndex + 1) % resolvedImages.length;
    setActiveIndex(nextIndex);
    animateDots(nextIndex);
    const targetX = isLoop
      ? (nextIndex + 1) * SNAP_INTERVAL
      : nextIndex * SNAP_INTERVAL;
    scrollRef.current?.scrollTo({ x: targetX, animated: true });
  };

  const handlePrev = () => {
    if (resolvedImages.length <= 1) return;
    const prevIndex = (activeIndex - 1 + resolvedImages.length) % resolvedImages.length;
    setActiveIndex(prevIndex);
    animateDots(prevIndex);
    const targetX = isLoop
      ? (prevIndex + 1) * SNAP_INTERVAL
      : prevIndex * SNAP_INTERVAL;
    scrollRef.current?.scrollTo({ x: targetX, animated: true });
  };

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!isLoop) return;

    const offsetX = e.nativeEvent.contentOffset.x;
    const rawIndex = Math.round(offsetX / SNAP_INTERVAL);

    const realIndex = (rawIndex - 1 + resolvedImages.length) % resolvedImages.length;
    setActiveIndex(realIndex);
    animateDots(realIndex);

    if (rawIndex === 0) {
      scrollRef.current?.scrollTo({
        x: SNAP_INTERVAL * resolvedImages.length,
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

  const handleImageError = (imgId: string, idx: number) => {
    const fallback = getCityFallbackImage(cityName, idx);
    setResolvedImages((prev) =>
      prev.map((item, i) =>
        item.id === imgId || i === idx ? { ...item, resolvedUrl: fallback } : item
      )
    );
  };

  if (resolvedImages.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>Fotos</Text>
        <Text style={styles.counter}>
          {activeIndex + 1}/{resolvedImages.length}
        </Text>
      </View>

      <View style={styles.carouselWrapper}>
        {resolvedImages.length > 1 && (
          <>
            <Pressable
              style={[styles.navBtn, styles.navBtnLeft]}
              onPress={handlePrev}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <IconSymbol name="chevron.left" size={16} color="#FFFFFF" />
            </Pressable>

            <Pressable
              style={[styles.navBtn, styles.navBtnRight]}
              onPress={handleNext}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <IconSymbol name="chevron.right" size={16} color="#FFFFFF" />
            </Pressable>
          </>
        )}

        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled={false}
          showsHorizontalScrollIndicator={false}
          contentOffset={{ x: isLoop ? SNAP_INTERVAL : 0, y: 0 }}
          onMomentumScrollEnd={handleScroll}
          snapToInterval={SNAP_INTERVAL}
          decelerationRate="fast"
          contentContainerStyle={styles.scrollContent}
          scrollEventThrottle={16}
        >
          {(isLoop ? loopedImages : resolvedImages).map((img, i) => {
            return (
              <View key={`${img.id}-${i}`} style={styles.imageWrapper}>
                <Image
                  source={{ uri: img.resolvedUrl }}
                  style={styles.image}
                  contentFit="cover"
                  cachePolicy="disk"
                  transition={300}
                  onError={() => handleImageError(img.id, i)}
                />
                {img.caption && (
                  <View style={styles.captionContainer}>
                    <Text style={styles.caption} numberOfLines={1}>
                      {img.caption}
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>
      </View>

      {/* Dots animados */}
      {resolvedImages.length > 1 && (
        <View style={styles.dots}>
          {resolvedImages.map((_, i) => {
            const anim =
              dotAnims.current[i] || new Animated.Value(i === 0 ? 1 : 0);
            const width = anim.interpolate({
              inputRange: [0, 1],
              outputRange: [6, 18],
            });
            const opacity = anim.interpolate({
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

  carouselWrapper: {
    position: "relative",
  },
  navBtn: {
    position: "absolute",
    top: "50%",
    marginTop: -18,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.25)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  navBtnLeft: {
    left: 8,
  },
  navBtnRight: {
    right: 8,
  },

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

import React, { useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";


const { width, height } = Dimensions.get("window");

const slides = [
  {
    id: "1",
    title: "Welcome to Our App",
    description:
      "Break communication barriers and learn sign language with ease. Whether you're deaf, hard of hearing, or simply want to learn",
  },
  {
    id: "2",
    title: "Real-Time Sign Recognition",
    description:
      "Use your phone camera to recognize and translate signs in real time powered by AI and machine learning.",
  },
  {
    id: "3",
    title: "Learn, Translate, and Connect",
    description:
      "Access lessons, quizzes, and animated sign demos. Translate speech or text to sign language even offline!",
  },
];

// Instead of GIF
const onboardingImage = require("../../assets/images/muss-unscreen.gif");

const OnboardingScreen = () => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const flatListRef = useRef(null);
  const router = useRouter();

  const goToNextSlide = () => {
    const nextIndex = currentSlideIndex + 1;
    if (nextIndex < slides.length) {
      setCurrentSlideIndex(nextIndex);
    }
  };

  const handleNext = async () => {
    if (currentSlideIndex === slides.length - 1) {
      await AsyncStorage.setItem("hasSeenOnboarding", "true");
      router.push("/(pages)/forms/login");
    } else {
      goToNextSlide();
    }
  };

  const Footer = () => (
    <View style={styles.footer}>
      <View style={styles.indicatorContainer}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.indicator,
              currentSlideIndex === index && styles.activeIndicator,
            ]}
          />
        ))}
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.primaryBtn} onPress={handleNext}>
          <Text style={styles.btnText}>
            {currentSlideIndex === slides.length - 1 ? "Get Started" : "Next"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Handle swipe gestures for navigation
  const handleSwipe = (e) => {
    const contentOffsetX = e.nativeEvent.contentOffset.x;
    const newIndex = Math.round(contentOffsetX / width);
    if (newIndex !== currentSlideIndex) {
      setCurrentSlideIndex(newIndex);
    }
  };

  return (
    <View style={styles.container}>
      {/* Single animation/image at the top */}
      <View style={styles.imageContainer}>
        <Image
          source={onboardingImage}
          style={styles.image}
          resizeMode="contain"
        />
       
      </View>
      {/* Bottom content changes */}
      <View style={styles.overlay}>
        <View style={styles.bottomSheet}>
          <Text style={styles.title}>{slides[currentSlideIndex].title}</Text>
          <Text style={styles.description}>
            {slides[currentSlideIndex].description}
          </Text>
        </View>
      </View>
      {/* Footer with indicators and button */}
      <Footer />
      {/* Optional: Add swipe gesture support for bottom content */}
      {/* Hidden FlatList for swipe navigation, but not rendering slides */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          opacity: 0,
        }}
        pointerEvents="box-none"
      >
        <FlatList
          data={slides}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleSwipe}
          keyExtractor={(item) => item.id}
          renderItem={() => <View style={{ width, height: 1 }} />} // invisible
          ref={flatListRef}
        />
      </View>
    </View>
  );
};

export default OnboardingScreen;

const styles = StyleSheet.create({
  video: {
  width: "80%",
  height: undefined,
  aspectRatio: 1,
  marginBottom: 10,
},
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: undefined,
    aspectRatio: 1,
    marginTop: 90,
  },
  imageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 160,
    width: "100%",
  },
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    width: "100%",
    alignItems: "center",
  },
  bottomSheet: {
    backgroundColor: "#000",
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    padding: 25,
    paddingBottom: 40,
    alignItems: "center",
    minHeight: Dimensions.get("window").height * 0.4,
    width: "100%",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 10,
    width: "90%",
    alignSelf: "center",
  },
  description: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
    paddingHorizontal: 10,
    paddingTop: 10,
    width: "90%",
    alignSelf: "center",
  },
  footer: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    width: "100%",
    alignItems: "center",
  },
  indicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  indicator: {
    height: 8,
    width: 8,
    backgroundColor: "#f2f2f2",
    marginHorizontal: 4,
    borderRadius: 4,
  },
  activeIndicator: {
    backgroundColor: "gray",
    width: 16,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  primaryBtn: {
    flex: 1,
    backgroundColor: "#f2f2f2",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginLeft: 5,
  },
  btnText: {
    color: "#000",
    fontWeight: "600",
    fontSize: 16,
  },
});

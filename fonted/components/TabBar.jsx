// components/TabBar.js
import { View, StyleSheet} from "react-native";
import { useLinkBuilder, useTheme } from "@react-navigation/native";
import { PlatformPressable } from "@react-navigation/elements";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useEffect, useState } from "react";

export default function TabBar({ state, descriptors, navigation }) {
  const { colors } = useTheme();
  const { buildHref } = useLinkBuilder();

  // Correct useState
  const [dimensions, setDimensions] = useState({ height: 20, width: 100 });

  const buttonWidth = dimensions.width / state.routes.length;

  const onTabberLayout = (e) => {
    setDimensions({
      height: e.nativeEvent.layout.height,
      width: e.nativeEvent.layout.width,
    });
  };

  const tabPositionX = useSharedValue(0);
  const animatedHighlightStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: tabPositionX.value }],
    };
  });

  const scaleValues = state.routes.map((_, index) =>
    useSharedValue(index === state.index ? 1 : 0)
  );

  return (
    <View onLayout={onTabberLayout} style={styles.tabBarContainer}>
      <Animated.View
        style={[
          animatedHighlightStyle,
          {
            position: "absolute",
            backgroundColor: "#f2f2f2",
            borderRadius: 50,
            marginHorizontal: 12,
            height: 55,
            alignSelf: "center",
            textAlign: "center",
            justifyContent: "center",
            width: buttonWidth - 25,
          },
        ]}
      />
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel ?? options.title ?? route.name;
        const isFocused = state.index === index;
        const scale = scaleValues[index];

        useEffect(() => {
          scale.value = withSpring(isFocused ? 1 : 0, { damping: 10 });
          if (isFocused) {
            tabPositionX.value = withSpring(buttonWidth * index, { damping: 15 });
          }
        }, [isFocused]);

        const animatedIconStyle = useAnimatedStyle(() => {
          const scaleValue = interpolate(scale.value, [0, 1], [1, 1.2]);
          const top = interpolate(scale.value, [0, 1], [0, -3]);
          return {
            transform: [{ scale: scaleValue }],
            top,
          };
        });

        const animatedTextStyle = useAnimatedStyle(() => {
          const opacity = interpolate(scale.value, [0, 1], [1, 0.8]);
          return { opacity };
        });

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: "tabLongPress",
            target: route.key,
          });
        };

        const Icon = options.tabBarIcon
          ? options.tabBarIcon({
              focused: isFocused,
              color: isFocused ? "#000" : colors.text,
              size: 24,
            })
          : null;

        return (
          <PlatformPressable
            key={route.key}
            href={buildHref(route.name)}
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarButtonTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabItem}
          >
            <Animated.View style={animatedIconStyle}>{Icon}</Animated.View>
            <Animated.Text
              style={[
                {
                  color: isFocused ? "#333" : colors.text,
                  fontSize: 12,
                },
                animatedTextStyle,
              ]}
            >
              {label}
            </Animated.Text>
          </PlatformPressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: "absolute",
    bottom: 20,
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 35,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});

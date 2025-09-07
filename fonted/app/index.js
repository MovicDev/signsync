import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import OnboardingScreen from "./(onboarding)/OnboardingScreen";
// import AuthenticationInterface from "../components/Auth/AuthenticationInterface";

const { width, height } = Dimensions.get("window");
export default function Page() {
  return (
    <View style={styles.container}>
          <OnboardingScreen />
          {/* <AuthenticationInterface /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
 
});

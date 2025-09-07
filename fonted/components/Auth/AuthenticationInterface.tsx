import { Link, router } from "expo-router";
import React from "react";
import {
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


const AuthenticationInterface = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <Image
          source={require("../../assets/icon2.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.description}>
          Neque porro quisquam est qui dolorem ipsum quia dolor sit amet,
          consectetur, adipisci velit... "There is no one who loves pain
          itself, who seeks after it and wants to have it, simply because it is
          pain..."
        </Text>
        <Link href="forms/signup" asChild>
        <TouchableOpacity>
          <Text style={styles.signUpButton}>Sign Up</Text>
        </TouchableOpacity>
        </Link>

        <TouchableOpacity onPress={() => router.push("/forms/login")}>
          <Text style={styles.signInButton}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default AuthenticationInterface;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  logo: {
    width: 150,
    height: 150,

  },
  description: {
    fontSize: 18,
    color: "#333",
    paddingVertical: 20,
    textAlign: "center",
  },
  signUpButton: {
    color: "#fff",
    fontSize: 18,
    backgroundColor: "#000",
    paddingVertical: 15,
    paddingHorizontal: 100,
    borderRadius: 30,
    textAlign: "center",
    fontWeight: "bold",
  },
  signInButton: {
    color: "#000",
    fontSize: 18,
    backgroundColor: "transparent",
    paddingVertical: 15,
    paddingHorizontal: 100,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "#000",
    marginTop: 20,
    textAlign: "center",
    fontWeight: "bold",
  },
});

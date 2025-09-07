import {
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  ActivityIndicator
} from "react-native";
import React, { useEffect, useState } from "react";
import Feather from "@expo/vector-icons/Feather";
import Octicons from "@expo/vector-icons/Octicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from 'axios';
import {useRouter } from "expo-router";
import { API_BASE_URL } from "../../config";

const Home = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) throw new Error("Please login");
        
        const response = await axios.get(`${API_BASE_URL}/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.data?.success || !response.data.user) {
          throw new Error(response.data?.message || "Invalid response");
        }

        setUserInfo(response.data.user);
      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message;
        setError(errorMessage);
        await AsyncStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#0000ff" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>Authentication Error</Text>
        <Text style={styles.errorSubtext}>{error}</Text>
        <TouchableOpacity 
          style={styles.loginButton}
          onPress={() => router.replace("/(pages)/forms/login")}
        >
          <Text style={styles.buttonText}>Go to Login</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.mainContent}>
          <Text style={{fontSize:20,fontWeight:'bold'}}>Good Day, {userInfo?.username || 'User'} </Text>
          <TouchableOpacity 
            style={styles.video}
            onPress={() => router.push("/(pages)/sign-language-camera")}
          >
            <View>
              <Feather
                name="camera"
                size={50}
                color="white"
                style={{ alignSelf: "center", paddingTop: 10 }}
              />
              <Text style={styles.buttonText}>Live Camera</Text>
              <Text style={styles.subText}>Real-time Letter Detection</Text>
            </View>
          </TouchableOpacity>

          {/* <TouchableOpacity 
            style={styles.videoUpload}
            onPress={() => router.push("/(pages)/sign-language-video")}
          >
            <View>
              <Feather
                name="upload"
                size={50}
                color="white"
                style={{ alignSelf: "center", paddingTop: 10 }}
              />
              <Text style={styles.buttonText}> Video</Text>
              <Text style={styles.subText}>Process Video for Words & Sentences</Text>
            </View>
          </TouchableOpacity> */}
        </View>

        <View style={styles.recentActivity}>
          <Text style={styles.sectionTitle}>Recent Activities</Text>
          
          {[1, 2, 3].map((item, index) => (
            <View key={index} style={styles.activityCard}>
              <Octicons name="device-camera-video" size={24} color="gray" />
              <View>
                <Text style={styles.activityTitle}>Sign Language Detection</Text>
                <Text style={styles.activityTime}>Today, 2.30 PM</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    backgroundColor: "#fff",
  },
  scrollContent: {
    padding: 10,
    paddingBottom: 20,
  },
  mainContent: {
    marginVertical: 10,
    width: "100%",
  },
  video: {
    width: "100%",
    height: 200,
    backgroundColor: "#000",
    justifyContent: "center",
    marginVertical: 10,
    borderRadius: 10,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  videoUpload: {
    width: "100%",
    height: 200,
    backgroundColor: "#0066cc",
    justifyContent: "center",
    marginVertical: 10,
    borderRadius: 10,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    paddingTop: 10,
    fontSize: 20,
    fontWeight: "bold",
  },
  buttonTextWatch: {
    color: "#000",
    textAlign: "center",
    paddingTop: 10,
    fontSize: 20,
    fontWeight: "bold",
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    paddingTop: 10,
    fontSize: 20,
    fontWeight: "bold",
  },
  subText: {
    color: "#fff",
    textAlign: "center",
    paddingTop: 5,
  },
  recentActivity: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    marginBottom: 15,
  },
  activityCard: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderRadius: 10,
    padding: 15,
    gap: 10,
  },
  activityTitle: {
    color: "black",
    fontSize: 20,
  },
  activityTime: {
    color: "#444",
    fontSize: 15,
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 18,
    color: "red",
    marginBottom: 10,
  },
  errorSubtext: {
    fontSize: 16,
    color: "#555",
    marginBottom: 20,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  loginButton: {
    backgroundColor: "#000",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
  },
  watch: {
    color: "black",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    backgroundColor:'transparent',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    borderBlockColor: 'black',
    borderWidth: 2
    
  }
});

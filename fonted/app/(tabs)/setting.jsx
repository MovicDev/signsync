import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Switch,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Image,
  Alert,
  ActivityIndicator
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../../config";

// Light/Dark themes
const lightTheme = {
  background: "#fff",
  text: "#333",
  card: "#f1f1f1",
  border: "#eee",
  icon: "#555",
};
const darkTheme = {
  background: "#181818",
  text: "#fff",
  card: "#222",
  border: "#333",
  icon: "#fff",
};

export default function SettingsScreen() {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const theme = isDarkMode ? darkTheme : lightTheme;

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          router.replace("/(pages)/forms/login");
          return;
        }

        const response = await fetch(`${API_BASE_URL}/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setUserInfo(data.user);
        } else {
          throw new Error("Failed to fetch user info");
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
        Alert.alert("Error", "Failed to load user information");
      } finally {
        setLoading(false);
      }
    };

    const loadTheme = async () => {
      const saved = await AsyncStorage.getItem("theme");
      setIsDarkMode(saved === "dark");
    };

    fetchUserInfo();
    loadTheme();
  }, []);

  const handleLogout = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem("token");
              await AsyncStorage.removeItem("hasSeenOnboarding");
              router.replace("/(onboarding)/OnboardingScreen"); 
            } catch (error) {
              console.error("Logout error:", error);
              Alert.alert("Error", "Failed to sign out");
            }
          },
        },
      ]
    );
  };

  const handleThemeToggle = async () => {
    setIsDarkMode((prev) => {
      const newMode = !prev;
      AsyncStorage.setItem("theme", newMode ? "dark" : "light");
      return newMode;
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.text} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* User Info */}
        <View style={styles.profileContainer}>
          <Image
            source={require("./../../assets/icon.png")}
            style={styles.avatar}
          />
        </View>
        <Text style={[styles.userName, { color: theme.text }]}>
          {userInfo?.username || "User"}
        </Text>

        {/* Account Settings */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Account Settings</Text>
        <SettingsItem icon="person" label="Personal Information" theme={theme} />
        <SettingsItem icon="notifications" label="Notifications" theme={theme} />
        <SettingsItem icon="lock-closed" label="Privacy & Security" theme={theme} />

        {/* App Settings */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>App Settings</Text>
        <SettingsItem icon="language" label="Language" value="English" theme={theme} />
        <SettingsItem icon="volume-high" label="Sound & Haptics" theme={theme} />

        {/* Help */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Help</Text>
        <SettingsItem icon="help-circle" label="Help & Support" theme={theme} />

        {/* Logout */}
        <SettingsItem
          icon="log-out"
          label="Sign Out"
          theme={theme}
          onPress={handleLogout}
        />
      </ScrollView>
    </View>
  );
}

function SettingsItem({ icon, label, value, theme, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.item, { borderBottomColor: theme.border }]}
      onPress={onPress}
    >
      <Ionicons name={icon} size={20} color={theme.icon} />
      <Text style={[styles.itemText, { color: theme.text }]}>{label}</Text>
      {value && <Text style={[styles.itemValue, { color: theme.text }]}>{value}</Text>}
      <Ionicons name="chevron-forward" size={18} color={theme.icon} />
    </TouchableOpacity>
  );
}

function SettingsSwitch({ icon, label, value, onValueChange, theme }) {
  return (
    <View style={[styles.item, { borderBottomColor: theme.border }]}>
      <Ionicons name={icon} size={20} color={theme.icon} />
      <Text style={[styles.itemText, { color: theme.text }]}>{label}</Text>
      <Switch value={value} onValueChange={onValueChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 20,
  },
  content: {
    padding: 16,
    paddingBottom: 80,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginVertical: 30,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
  },
  itemText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
  },
  itemValue: {
    fontSize: 14,
    marginRight: 5,
  },
});

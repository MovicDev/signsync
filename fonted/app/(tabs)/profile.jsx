import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  StatusBar,
} from "react-native";
import { useRouter } from 'expo-router';

const ProfileScreen = () => {
  const router = useRouter();
  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      {/* Profile Info */}
      <View style={styles.profileInfo}>
        <Image 
          source={require("./../../assets/icon.png")} 
          style={styles.avatar} 
        />
        <Text style={styles.name}>Movic Unique</Text>
        <View style={styles.tagContainer}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>ASL</Text>
          </View>
          <Text style={styles.progressText}>65%</Text>
        </View>
        <TouchableOpacity 
          style={styles.editBtn}
          onPress={() => router.push('/(pages)/edit-profile')}
        >
          <Text style={styles.editText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <StatCard label="Day Streak" value="14" />
        <StatCard label="Signs Mastered" value="156" />
        <StatCard label="Accuracy" value="92%" />
      </View>



      {/* Achievements */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Achievements</Text>
        <View style={styles.statsRow}>
          <StatCard label="Alphabet Pro" value="0" />
          <StatCard label="100 Signs" value="0" />
          <StatCard label="7-Day Streak" value="0" />
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.recentItem}>
          <Text style={styles.activityTitle}>Hello Sign</Text>
          <Text style={styles.activitySubtitle}>95% Accuracy · 2h ago</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const StatCard = ({ label, value }) => (
  <View style={styles.statCard}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 16,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    // backgroundColor: "#fff", 
    marginTop:50,
      },
  header: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  title: { 
    fontSize: 24, 
    fontWeight: "bold", 
    textAlign: "center" 
  },
  profileInfo: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 4,
  },
  tagContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  tag: {
    backgroundColor: "#eee",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    color: "#555",
  },
  progressText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  editBtn: {
    backgroundColor: "#000",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  editText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#333",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
  },
  settingLabel: {
    fontSize: 14,
    color: "#333",
  },
  recentItem: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
  },
  activityTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 4,
  },
  activitySubtitle: {
    fontSize: 12,
    color: "#666",
  },
});
export default ProfileScreen;

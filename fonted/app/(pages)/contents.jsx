import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Image, Dimensions } from 'react-native';
import axios from 'axios';
import { WebView } from 'react-native-webview';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const API_KEY = 'AIzaSyCU1DwfUbdJY2o5jISyRf3BzpDYtEB2RIo';
const SEARCH_QUERY = 'sign language for beginners';

const SignLanguageVideos = () => {
  const [videos, setVideos] = useState([]);
  const [selectedVideoId, setSelectedVideoId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await axios.get(
        `https://www.googleapis.com/youtube/v3/search`, {
          params: {
            key: API_KEY,
            q: SEARCH_QUERY,
            part: 'snippet',
            maxResults: 50,
            type: 'video',
          },
        }
      );
      setVideos(response.data.items);
    } catch (error) {
      console.error('Failed to fetch videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => {
    const videoId = item.id.videoId;
    const title = item.snippet.title;
    const thumbnail = item.snippet.thumbnails.medium.url;
    const channelTitle = item.snippet.channelTitle;

    return (
      <TouchableOpacity
        style={styles.videoCard}
        onPress={() => setSelectedVideoId(videoId)}
      >
        <Image 
          source={{ uri: thumbnail }} 
          style={styles.thumbnail}
          resizeMode="cover"
        />
        <View style={styles.videoInfo}>
          <Text style={styles.videoTitle} numberOfLines={2}>{title}</Text>
          <Text style={styles.channelName}>{channelTitle}</Text>
          <View style={styles.playButton}>
            <Icon name="play-circle" size={24} color="#FF0000" />
            <Text style={styles.playText}>Watch Now</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0066cc', '#e9ecef']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Icon name="arrow-left" size={28} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Learning Content</Text>
          <View style={{ width: 28 }} />
        </View>
      </LinearGradient>

      {selectedVideoId ? (
        <View style={styles.videoContainer}>
          <WebView
            style={styles.webview}
            javaScriptEnabled={true}
            source={{ uri: `https://www.youtube.com/embed/${selectedVideoId}` }}
          />
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setSelectedVideoId(null)}
          >
            <Icon name="arrow-left" size={24} color="#333" />
            <Text style={styles.backText}>Back to Videos</Text>
          </TouchableOpacity>
        </View>
      ) : loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B6B" />
          <Text style={styles.loadingText}>Loading content...</Text>
        </View>
      ) : (
        <FlatList
          data={videos}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.videoId}
          contentContainerStyle={styles.videoList}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

export default SignLanguageVideos;

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  videoCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginHorizontal: 10,
  },
  thumbnail: {
    width: 120,
    height: 90,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  videoInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  videoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  channelName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  playText: {
    color: '#FF6B6B',
    marginLeft: 5,
    fontWeight: '600',
    fontSize: 13,
  },
  videoList: {
    padding: 10,
    paddingTop: 15,
  },
  videoContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    margin: 10,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#333',
  },
  backText: {
    marginLeft: 5,
    color: '#333',
    fontWeight: '500',
  },
  backTouchable: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 40,
    backgroundColor: 'transparent',
    borderRadius: 20,
    marginLeft: 10,
  },
});

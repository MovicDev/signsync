import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert
} from 'react-native';
import { aslImages } from '../../components/aslImages';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';

 Dimensions.get('window');

const Learning = () => {
  const [activeTab, setActiveTab] = useState('practice'); 
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  const words = text.toLowerCase().split(' ');
  const router = useRouter();

  const [recording, setRecording] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync();
      }
    };
  }, [recording]);

  const startRecording = async () => {
    try {
      console.log('Requesting permissions..');
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log('Starting recording..');
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      console.log('Recording started');
    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
    }
  };

  const stopRecording = async () => {
    console.log('Stopping recording..');
    setRecording(undefined);
    await recording.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });
    
    setText(prevText => prevText + ' [Speech input] ');
  };

  const toggleRecording = async () => {
    if (recording) {
      await stopRecording();
    } else {
      await startRecording();
    }
  };

  const renderWatchContent = () => (
    <View style={styles.contentContainer}>
      <Text style={styles.sectionTitle}>Watch and Learn</Text>
      <Text style={styles.sectionDescription}>
        Browse our collection of sign language tutorials and practice videos.
      </Text>
      <TouchableOpacity 
        style={styles.videoButton}
        onPress={() => router.push('/(pages)/contents')}
      >
        <Text style={styles.buttonText}>Browse Video Lessons</Text>
      </TouchableOpacity>
      <View style={styles.learningGrid}>
        <Text style={styles.sectionTitle}>Quick Categories</Text>
        <View style={styles.categoriesContainer}>
          {[
            { name: 'Alphabet', icon: 'alphabetical', color: '#4a90e2' },
            { name: 'Numbers', icon: 'numeric', color: '#e74c3c' },
            { name: 'Greetings', icon: 'hand-wave', color: '#2ecc71' },
            { name: 'Food', icon: 'food-apple', color: '#e67e22' },
            { name: 'Family', icon: 'account-group', color: '#9b59b6' },
            { name: 'Feelings', icon: 'emoticon-happy-outline', color: '#FF0000' },
            { name: 'Colors', icon: 'palette', color: '#f39c12' }, 
            { name: 'More', icon: 'dots-horizontal', color: '#95a5a6' },
          ].map(({ name, icon, color }) => (
            <TouchableOpacity 
              key={name}
              style={[styles.categoryCard, { backgroundColor: `${color}15`, borderColor: `${color}30` }]}
              onPress={() => console.log(`Selected: ${name}`)}
            >
              <MaterialCommunityIcons 
                name={icon} 
                size={32} 
                color={color} 
                style={styles.categoryIcon}
              />
              <Text style={[styles.categoryText, { color }]}>{name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderPracticeContent = () => (
    <View style={styles.contentContainer}>
      <Text style={styles.sectionTitle}>Practice Typing</Text>
      <Text style={styles.sectionDescription}>
        Type any word or sentence to see the ASL signs.
      </Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="Type or speak your text..."
          onChangeText={setText}
          value={text}
          multiline
        />
        <TouchableOpacity 
          style={[styles.micButton, recording && styles.micButtonActive]}
          onPress={toggleRecording}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <MaterialCommunityIcons 
              name={recording ? "stop" : "microphone"}
              size={24} 
              color="#fff"
            />
          )}
        </TouchableOpacity>
      </View>
      <Text style={styles.helperText}>
        {recording 
          ? "Listening... Speak now"
          : "Tap the microphone to speak"}
      </Text>
      <ScrollView contentContainerStyle={styles.imageContainer}>
        {words.map((word, wordIndex) => (
          <View key={wordIndex} style={styles.wordRow}>
            {word
              .replace(/[^a-z]/g, '')
              .split('')
              .map((letter, letterIndex, letters) => {
                const img = aslImages[letter];
                return (
                  <React.Fragment key={`${wordIndex}-${letterIndex}`}>
                    {img && (
                      <Image
                        source={img}
                        style={styles.image}
                        resizeMode="contain"
                      />
                    )}
                    {letterIndex < letters.length - 1 && (
                      <Text style={styles.arrow}>➔</Text>
                    )}
                  </React.Fragment>
                );
              })}
          </View>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'watch' && styles.activeTab]}
          onPress={() => setActiveTab('watch')}
        >
          <Text style={[styles.tabText, activeTab === 'watch' && styles.activeTabText]}>
            Watch Content
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'practice' && styles.activeTab]}
          onPress={() => setActiveTab('practice')}
        >
          <Text style={[styles.tabText, activeTab === 'practice' && styles.activeTabText]}>
            Practice Typing
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'watch' ? renderWatchContent() : renderPracticeContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f5f5f5',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginTop: 50,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#0066cc',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#0066cc',
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  sectionDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    fontSize: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    marginBottom: 0,
  },
  micButton: {
    backgroundColor: '#4a80f5',
    height: 50,
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  micButtonActive: {
    backgroundColor: '#e74c3c',
  },
  helperText: {
    color: '#666',
    fontSize: 12,
    marginTop: -10,
    marginBottom: 15,
    marginLeft: 10,
    fontStyle: 'italic'
  },
  imageContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    paddingBottom: 30,
  },
  wordRow: {
    flexDirection: 'row',
    marginBottom: 15,
    flexWrap: 'wrap',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  image: {
    width: 70,
    height: 70,
    marginRight: 8,
  },
  arrow: {
    fontSize: 16,
    alignSelf: 'center',
    marginRight: 8,
    color: '#999',
  },
  videoButton: {
    backgroundColor: '#0066cc',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  learningGrid: {
    marginTop: 30,
    width: '100%',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  categoryCard: {
    width: '48%',
    padding: 18,
    borderRadius: 16,
    marginBottom: 15,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    backgroundColor: 'white',
  },
  categoryIcon: {
    marginBottom: 10,
  },
  categoryText: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default Learning;

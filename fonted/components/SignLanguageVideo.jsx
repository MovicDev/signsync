import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  ActivityIndicator,
  Platform,
  Alert
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const BACKEND_URL = API_BASE_URL;

export default function SignLanguageVideo() {
  const [permission, requestPermission] = useCameraPermissions();
  const [prediction, setPrediction] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const [lastPredictionTime, setLastPredictionTime] = useState(null);
  const [letterHistory, setLetterHistory] = useState([]);
  const [builtSentence, setBuiltSentence] = useState('');
  
  const cameraRef = useRef(null);
  const router = useRouter();
  const intervalRef = useRef(null);

  useEffect(() => {
    initializeCamera();
    checkBackendConnection();
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const initializeCamera = async () => {
    try {
      if (!permission?.granted) {
        const result = await requestPermission();
        if (result.granted) {
          startPredictionLoop();
        }
      } else {
        startPredictionLoop();
      }
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      Alert.alert('Error', 'Failed to request camera permission');
    }
  };

  const checkBackendConnection = async () => {
    try {
      console.log('Checking backend connection at:', `${BACKEND_URL}/api/sign/health`);
      const response = await axios.get(`${BACKEND_URL}/api/sign/health`, {
        timeout: 5000, 
      });
      
      console.log('Health check response:', response.data);
      
      if (response.data.success && response.data.data.model_loaded) {
        setConnectionStatus('connected');
        console.log('Backend connected and model ready');
      } else {
        setConnectionStatus('model_not_ready');
        console.log('Backend connected but model not ready');
      }
    } catch (error) {
      console.error('Backend connection error details:', error);
      setConnectionStatus('disconnected');
      
      if (error.code === 'ECONNREFUSED') {
        console.error('Connection refused - backend not running');
        Alert.alert(
          'Backend Not Running',
          'The Node.js backend server is not running on port 3000. Please start it first.',
          [{ text: 'OK' }]
        );
      } else if (error.code === 'ENOTFOUND') {
        console.error('Host not found - network issue');
        Alert.alert(
          'Network Error',
          'Cannot resolve localhost. Check your network configuration.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Connection Error',
          `Cannot connect to backend: ${error.message}`,
          [{ text: 'OK' }]
        );
      }
    }
  };

  const startPredictionLoop = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Capture and predict every 1000ms for video mode (slightly slower than camera)
    intervalRef.current = setInterval(() => {
      if (isActive && !isProcessing && connectionStatus === 'connected') {
        captureAndPredict();
      }
    }, 1000);
  };

  const captureAndPredict = async () => {
    if (!cameraRef.current || isProcessing) return;

    try {
      setIsProcessing(true);
      
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.4,
        base64: true,
        skipProcessing: true,
      });

      const response = await axios.post(
        `${BACKEND_URL}/api/sign/predict`,
        {
          image: photo.base64
        },
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      if (response.data.success) {
        const { predicted_class, confidence: conf } = response.data.data;
        
        // Only add high-confidence predictions to avoid noise
        if (conf > 0.7) {
          // Update letter history
          setLetterHistory(prev => {
            const newHistory = [...prev, predicted_class];
            // Keep only recent letters (max 20)
            if (newHistory.length > 20) {
              newHistory.shift();
            }
            
            // Build sentence from letter sequence
            buildSentenceFromLetters(newHistory);
            
            return newHistory;
          });
        }
        
        setPrediction(predicted_class);
        setConfidence(conf);
        setLastPredictionTime(new Date());
      } else {
        console.error('Prediction failed:', response.data.message);
      }
    } catch (error) {
      console.error('Error during prediction:', error);
      if (error.code === 'ECONNREFUSED') {
        setConnectionStatus('disconnected');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const buildSentenceFromLetters = async (letters) => {
    try {
      // Send letter sequence to backend for sentence building
      const response = await axios.post(
        `${BACKEND_URL}/api/sign/build-sentence`,
        { letters: letters },
        { timeout: 2000 }
      );
      
      if (response.data.success && response.data.sentence) {
        setBuiltSentence(response.data.sentence);
      }
    } catch (error) {
      console.error('Error building sentence:', error);
    }
  };

  const clearSequence = () => {
    setLetterHistory([]);
    setBuiltSentence('');
    setPrediction('');
    setConfidence(0);
  };

  const toggleActive = () => {
    setIsActive(!isActive);
    if (!isActive) {
      startPredictionLoop();
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return '#4CAF50';
      case 'disconnected': return '#F44336';
      case 'model_not_ready': return '#FF9800';
      default: return '#9E9E9E';
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Model Ready';
      case 'disconnected': return 'Disconnected';
      case 'model_not_ready': return 'Model Loading';
      default: return 'Checking...';
    }
  };

  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.text}>Loading camera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>No access to camera</Text>
        <TouchableOpacity style={styles.button} onPress={initializeCamera}>
          <Text style={styles.buttonText}>Request Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header with back button and status */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Feather name="arrow-left" size={28} color="#fff" />
        </TouchableOpacity>
        
        <View style={styles.statusContainer}>
          <View style={[styles.statusDot, { backgroundColor: getConnectionStatusColor() }]} />
          <Text style={styles.statusText}>{getConnectionStatusText()}</Text>
        </View>
        
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.clearButton} onPress={clearSequence}>
            <Feather name="refresh-cw" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.toggleButton} onPress={toggleActive}>
            <Feather name={isActive ? "pause" : "play"} size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Camera */}
      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          facing="front"
          ref={cameraRef}
        />
        
        {/* Processing indicator */}
        {isProcessing && (
          <View style={styles.processingOverlay}>
            <ActivityIndicator size="small" color="#4CAF50" />
            <Text style={styles.processingText}>Analyzing...</Text>
          </View>
        )}
        
        {/* Capture indicator */}
        <View style={styles.captureIndicator}>
          <View style={[styles.captureRing, isProcessing && styles.captureRingActive]} />
        </View>
      </View>

      {/* Prediction Results */}
      <View style={styles.resultsContainer}>
        <View style={styles.mainPrediction}>
          <Text style={styles.predictionLabel}>Built Sentence:</Text>
          <Text style={styles.sentenceText}>
            {builtSentence || (isActive ? '🎥 Start signing to build sentences!' : 'Paused')}
          </Text>
          
          <View style={styles.currentSignContainer}>
            <Text style={styles.currentSignLabel}>Current Letter:</Text>
            <Text style={styles.currentSignText}>
              {prediction || '-'}
            </Text>
            {confidence > 0 && (
              <Text style={styles.confidenceText}>
                {(confidence * 100).toFixed(0)}%
              </Text>
            )}
          </View>
          
          {letterHistory.length > 0 && (
            <View style={styles.letterSequence}>
              <Text style={styles.sequenceLabel}>Letter Sequence:</Text>
              <Text style={styles.sequenceText}>
                {letterHistory.join(' - ')}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Instructions */}
      <View style={styles.instructions}>
        <Text style={styles.instructionText}>
          🎥 Sign letters to build sentences • Tap 🔄 to clear sequence
        </Text>
        <Text style={[styles.instructionText, { marginTop: 5, fontSize: 12 }]}>
          {isActive ? '📸 Capturing automatically every 1 second' : '⏸️ Recognition paused'}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  text: {
    color: '#fff',
    fontSize: 16,
    marginTop: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 20 : 10,
    paddingBottom: 10,
  },
  backButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 24,
    padding: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  clearButton: {
    backgroundColor: 'rgba(255,87,34,0.8)',
    borderRadius: 20,
    padding: 6,
  },
  toggleButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 24,
    padding: 8,
  },
  cameraContainer: {
    flex: 1,
    margin: 20,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  processingOverlay: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 20,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  processingText: {
    color: '#4CAF50',
    fontSize: 12,
    marginLeft: 5,
    fontWeight: '500',
  },
  captureIndicator: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
  },
  captureRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  captureRingActive: {
    borderColor: '#4CAF50',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  resultsContainer: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    margin: 20,
    borderRadius: 15,
    padding: 20,
  },
  mainPrediction: {
    alignItems: 'center',
    marginBottom: 15,
  },
  predictionLabel: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 5,
  },
  sentenceText: {
    color: '#4CAF50',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    minHeight: 30,
  },
  currentSignContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    gap: 10,
  },
  currentSignLabel: {
    color: '#ccc',
    fontSize: 14,
  },
  currentSignText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  letterSequence: {
    marginTop: 10,
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
  },
  sequenceLabel: {
    color: '#ccc',
    fontSize: 12,
    marginBottom: 5,
  },
  sequenceText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
  confidenceText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '500',
  },
  instructions: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  instructionText: {
    color: '#ccc',
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  videoSection: {
    margin: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 15,
    padding: 20,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  videoContainer: {
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 15,
  },
  video: {
    width: '100%',
    height: 200,
  },
  placeholderContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
    marginBottom: 15,
  },
  placeholderText: {
    color: '#666',
    fontSize: 16,
    marginTop: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pickButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 10,
  },
  processButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
    marginLeft: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  progressContainer: {
    marginTop: 15,
  },
  progressText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 2,
  },
  resultsSection: {
    margin: 20,
    marginTop: 0,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 15,
    padding: 20,
  },
  sentenceContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: 'rgba(76,175,80,0.1)',
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  sentenceLabel: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  sentenceText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  wordsContainer: {
    marginBottom: 20,
  },
  wordsLabel: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 10,
  },
  wordsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  wordChip: {
    backgroundColor: 'rgba(0,122,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  wordText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  predictionsContainer: {
    marginBottom: 10,
  },
  predictionsLabel: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 10,
  },
  predictionsRow: {
    flexDirection: 'row',
  },
  predictionCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 10,
    borderRadius: 8,
    marginRight: 10,
    alignItems: 'center',
    minWidth: 80,
  },
  predictionFrame: {
    color: '#666',
    fontSize: 10,
    marginBottom: 4,
  },
  predictionLetter: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  predictionConfidence: {
    color: '#4CAF50',
    fontSize: 10,
  },
  instructions: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  instructionText: {
    color: '#ccc',
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 20,
  },
});

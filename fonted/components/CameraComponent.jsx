import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Camera, CameraType } from 'expo-camera';
import axios from 'axios';

export default function CameraComponent() {
  const [hasPermission, setHasPermission] = useState(null);
  const [translatedText, setTranslatedText] = useState('');
  const cameraRef = useRef(null);
  const [cameraType, setCameraType] = useState(CameraType.front);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  useEffect(() => {
    let interval;
    if (hasPermission) {
      interval = setInterval(() => {
        captureAndSendFrame();
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [hasPermission]);

  const captureAndSendFrame = async () => {
    if (cameraRef.current) {
      try {
        console.log('Taking picture...');
        const photo = await cameraRef.current.takePictureAsync({ base64: true });
        console.log('Picture taken, sending to backend...');
        
        const response = await axios.post('http://localhost:3000/api/sign/predict', {
          image: photo.base64,
        });
        
        console.log('Response received:', response.data);
        
        if (response.data.success && response.data.data) {
          setTranslatedText(response.data.data.predicted_class);
          console.log('Prediction:', response.data.data.predicted_class);
        } else {
          console.log('No prediction data in response');
          setTranslatedText('No prediction');
        }
      } catch (error) {
        console.error('Error details:', error);
        if (error.response) {
          console.error('Response error:', error.response.data);
          setTranslatedText(`Error: ${error.response.data.message || 'Unknown error'}`);
        } else if (error.request) {
          console.error('Network error - no response received');
          setTranslatedText('Network error - check if backend is running');
        } else {
          console.error('Request setup error:', error.message);
          setTranslatedText(`Error: ${error.message}`);
        }
      }
    }
  };

  if (hasPermission === null) {
    return <View><Text>Requesting camera permission...</Text></View>;
  }

  if (hasPermission === false) {
    return <View><Text>No access to camera.</Text></View>;
  }

  return (
    <View style={styles.container}>
      <Camera
        style={styles.camera}
        type={cameraType}
        ref={cameraRef}
        ratio="16:9"
      />
      <View style={styles.overlay}>
        <Text style={styles.translation}>Translation: {translatedText}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  translation: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    color: '#fff',
    fontSize: 18,
    padding: 10,
    borderRadius: 10,
  },
});

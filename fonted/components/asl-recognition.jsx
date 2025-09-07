import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Platform, TouchableOpacity, Dimensions, SafeAreaView } from 'react-native';
import { Camera } from 'expo-camera';
import * as tf from '@tensorflow/tfjs';
import * as tfjsReactNative from '@tensorflow/tfjs-react-native';
import { cameraWithTensors } from '@tensorflow/tfjs-react-native';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';
import { useRouter } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';

const asset = Asset.fromModule(require('../assets/asl_mobilenetv2_finetuned.tflite'));
const { width, height } = Dimensions.get('window');
const TensorCamera = cameraWithTensors(Camera);

const ASL_LABELS = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
  'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
];

export default function ASLRecognitionScreen() {
  const [hasPermission, setHasPermission] = useState(null);
  const [isTfReady, setIsTfReady] = useState(false);
  const [model, setModel] = useState(null);
  const [prediction, setPrediction] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();


  // Camera settings
  const textureDims = Platform.OS === 'ios'
    ? { width: 1920, height: 1080 }
    : { width: 1200, height: 1600 };
  const tensorDims = { width: 224, height: 224 };

  useEffect(() => {
    (async () => {
      // 1. Camera permissions
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');

      // 2. TensorFlow.js setup
      await tf.ready();
      setIsTfReady(true);

      // 3. Load TFLite model using expo-asset
      const asset = Asset.fromModule(require('../assets/asl_mobilenetv2_finetuned.tflite'));
      await asset.downloadAsync(); // Ensure it's available
      const modelUri = asset.localUri || asset.uri;
      const loadedModel = await tfjsReactNative.loadTFLiteModel(modelUri);
      setModel(loadedModel);
      setLoading(false);
    })();
  }, []);

  // Inference loop
  const handleCameraStream = (images, updatePreview, gl) => {
    const loop = async () => {
      const nextImageTensor = images.next().value;
      if (model && nextImageTensor) {
        // Preprocess: resize, normalize, batch
        const resized = tf.image.resizeBilinear(nextImageTensor, [224, 224]);
        const normalized = resized.div(255.0).expandDims(0);

        // Run inference
        const output = await model.predict(normalized);
        const outputData = output.dataSync();
        const maxIdx = outputData.indexOf(Math.max(...outputData));
        setPrediction(ASL_LABELS[maxIdx]);

        tf.dispose([nextImageTensor, resized, normalized, output]);
      }
      requestAnimationFrame(loop);
    };
    loop();
  };

  if (loading || !isTfReady || !model || hasPermission === null) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.text}>Loading model and camera...</Text>
      </View>
    );
  }
  if (hasPermission === false) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>No access to camera</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Feather name="arrow-left" size={28} color="#fff" />
      </TouchableOpacity>
      {/* Camera Preview */}
      <View style={styles.cameraContainer}>
        <TensorCamera
          style={styles.camera}
          type={Camera.Constants.Type.front}
          cameraTextureHeight={textureDims.height}
          cameraTextureWidth={textureDims.width}
          resizeHeight={tensorDims.height}
          resizeWidth={tensorDims.width}
          resizeDepth={3}
          onReady={handleCameraStream}
          autorender={true}
        />
        {/* Prediction Overlay */}
        <View style={styles.predictionOverlay}>
          <Text style={styles.predictionText}>{prediction || 'Waiting for prediction...'}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 40 : 20,
    left: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 24,
    padding: 8,
  },
  cameraContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  camera: {
    width: width * 0.95,
    height: height * 0.65,
    borderRadius: 24,
    overflow: 'hidden',
    alignSelf: 'center',
    marginTop: height * 0.08,
  },
  predictionOverlay: {
    position: 'absolute',
    bottom: 40,
    left: width * 0.05,
    width: width * 0.9,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  predictionText: {
    fontSize: 48,
    color: '#fff',
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
  },
  text: { color: '#fff', fontSize: 20, marginTop: 20 },
}); 
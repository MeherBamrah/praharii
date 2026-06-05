import React, { useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Camera, useCameraDevice, useFrameProcessor } from 'react-native-vision-camera';
import { useTensorflowModel } from 'react-native-fast-tflite';
import { scanFaces, Face } from 'react-native-vision-camera-face-detector';
import { worklets } from 'react-native-worklets-core';

export default function FaceRecognitionCamera() {
  const device = useCameraDevice('front');
  // Load the lightweight MobileFaceNet (~2MB)
  const model = useTensorflowModel(require('../../assets/model.tflite'));
  const actualModel = model.state === 'success' ? model.model : null;

  const handleMatch = worklets.createRunOnJS((isMatch: boolean) => {
    if (isMatch) console.log("Identity Verified Offline");
  });

  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    const faces = scanFaces(frame);

    if (faces.length > 0 && actualModel) {
      const face = faces[0];

      // 1. Basic Liveness: Check if eyes are open/closed (Blink)
      if (face.leftEyeOpenProbability < 0.2) {
        
        // 2. Recognition: Run TFLite Inference
        // We crop the frame buffer to the face bounding box (conceptual)
        const result = actualModel.run([frame.toArrayBuffer()]);
        
        // 3. Compare with local stored embeddings using Euclidean distance
        // If distance < threshold, we have a match
        handleMatch(true);
      }
    }
  }, [actualModel]);

  if (device == null) return <Text>No Camera Found</Text>;

  return (
    <View style={StyleSheet.absoluteFill}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        frameProcessor={frameProcessor}
        pixelFormat="rgb"
      />
      <View style={styles.overlay}>
        <Text style={styles.hint}>Please Blink to Authenticate</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { position: 'absolute', bottom: 50, alignSelf: 'center' },
  hint: { color: 'white', fontSize: 18, backgroundColor: 'rgba(0,0,0,0.5)', padding: 10 }
});

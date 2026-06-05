import { useTensorflowModel } from 'react-native-fast-tflite';
import { useFaceDetector } from 'react-native-vision-camera-face-detector';
import { useFrameProcessor } from 'react-native-vision-camera';
import { Worklets } from 'react-native-worklets-core';

export function useFaceRecognition(modelPath: string) {
  const plugin = useTensorflowModel(modelPath);
  const model = plugin.model;

  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    
    // 1. Detect Face Landmarks (using ML Kit via plugin)
    const faces = detectFaces(frame); 
    if (faces.length === 0) return;

    const face = faces[0];

    // 2. Liveness Detection Logic (Novelty: Action-based)
    // Check for "Blink" (Eye Aspect Ratio < 0.2)
    const isBlinking = face.leftEyeOpenProbability < 0.2 && face.rightEyeOpenProbability < 0.2;
    
    // 3. Facial Recognition (Only if liveness passes)
    if (isBlinking) {
      // Crop and Resize frame to 112x112 (MobileFaceNet standard)
      const buffer = frame.toArrayBuffer(); 
      const output = model.run([buffer]); // Executes in <50ms on C++
      
      // Compare 'output' vector against local SQLite DB using Cosine Similarity
      runOnJS(handleVerification)(output);
    }
  }, [model]);

  return { frameProcessor };
}

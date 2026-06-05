import { Camera, useCameraDevice } from 'react-native-vision-camera';

export default function CameraScreen() {
  const device = useCameraDevice('front');
  const { frameProcessor } = useFaceRecognition(require('../../assets/mobile_facenet.tflite'));

  if (device == null) return <NoCameraErrorView />;

  return (
    <Camera
      style={StyleSheet.absoluteFill}
      device={device}
      isActive={true}
      frameProcessor={frameProcessor}
      pixelFormat="rgb" // Required for most TFLite models
      fps={30} // Ensures <1s response
    />
  );
}

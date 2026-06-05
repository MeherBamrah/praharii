import { useState, useCallback } from 'react';

export type LivenessState = 'SCANNING' | 'BLINK_REQUIRED' | 'SMILE_REQUIRED' | 'SUCCESS';

export const useLivenessDetection = () => {
  const [step, setStep] = useState<LivenessState>('SCANNING');

  const processLiveness = useCallback((face: any) => {
    'worklet';
    
    if (step === 'SCANNING' && face.faceInView) {
      setStep('BLINK_REQUIRED');
    }

    // Blink Detection (Eye Aspect Ratio logic)
    if (step === 'BLINK_REQUIRED' && face.leftEyeOpenProbability < 0.3) {
      setStep('SMILE_REQUIRED');
    }

    // Smile Detection
    if (step === 'SMILE_REQUIRED' && face.smilingProbability > 0.7) {
      setStep('SUCCESS');
    }
  }, [step]);

  return { step, processLiveness, setStep };
};

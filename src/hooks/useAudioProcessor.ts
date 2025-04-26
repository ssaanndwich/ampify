'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

export type AudioSource = 'screen' | 'microphone';

export interface AudioProcessorResult {
  analyserNode: AnalyserNode | null;
  start: (source: AudioSource) => Promise<void>;
  stop: () => void;
  isRecording: boolean;
  error: string | null;
  audioContext: AudioContext | null;
  audioSource: AudioSource | null;
}

export const useAudioProcessor = (): AudioProcessorResult => {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioSource, setAudioSource] = useState<AudioSource | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  const stop = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (sourceRef.current) {
        sourceRef.current.disconnect();
        sourceRef.current = null;
    }
    // Don't close the audio context immediately, let analyser cleanup handle it if needed
    // or manage its lifecycle separately if shared.
    // Analyser node is disconnected by sourceRef.current.disconnect()

    setIsRecording(false);
    setAudioSource(null);
    setError(null); // Clear error on stop
    console.log("Audio processing stopped.");
  }, []);

  const getScreenAudio = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
      throw new Error('Screen sharing is not supported in this browser');
    }

    const stream = await navigator.mediaDevices.getDisplayMedia({
      audio: true,
      video: true, // Required by some browsers for audio capture
    });
    
    // Handle stream ending (e.g., user stops sharing)
    stream.getTracks().forEach(track => {
      track.onended = () => {
        console.log("Screen sharing ended.");
        stop();
      };
    });
    
    return stream;
  };

  const getMicrophoneAudio = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Microphone access is not supported in this browser');
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });
    
    console.log("Microphone stream obtained");
    return stream;
  };


  const start = useCallback(async (source: AudioSource) => {
    setError(null);
    setIsRecording(false); // Reset recording state initially
    setAudioSource(source);

    try {
      // Ensure previous stream is stopped
      if (streamRef.current) {
          stop();
      }

      let stream: MediaStream;
      
      // Get stream based on the selected source
      if (source === 'screen') {
        stream = await getScreenAudio();
        console.log("Obtained screen audio stream");
      } else if (source === 'microphone') {
        stream = await getMicrophoneAudio();
        console.log("Obtained microphone stream");
      } else {
        throw new Error('Invalid audio source');
      }
      
      streamRef.current = stream;

      // Create or resume AudioContext
      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        console.log("AudioContext created or recreated.");
      } else if (audioContextRef.current.state === 'suspended') {
         await audioContextRef.current.resume();
         console.log("AudioContext resumed.");
      }

      const audioContext = audioContextRef.current;

      // Create AnalyserNode if it doesn't exist for this context
      if (!analyserRef.current) {
          analyserRef.current = audioContext.createAnalyser();
          analyserRef.current.fftSize = 256;
          console.log("AnalyserNode created.");
      }

       // Create MediaStreamSource
      sourceRef.current = audioContext.createMediaStreamSource(stream);
      sourceRef.current.connect(analyserRef.current);
      console.log("Audio source connected to analyser.");

      setIsRecording(true);

    } catch (err) {
      console.error(`Error accessing ${source} audio:`, err);
      let message = 'An unknown error occurred.';
      if (err instanceof Error) {
        message = err.message;
         if (err.name === 'NotAllowedError') {
            message = `${source === 'screen' ? 'Screen sharing' : 'Microphone'} permission denied.`;
        } else if (err.name === 'NotFoundError') {
            message = source === 'microphone' 
              ? 'No microphone found. Please check your device connections.' 
              : 'No suitable screen or audio source found.';
        } else if (err.name === 'NotSupportedError') {
             message = `${source === 'screen' ? 'Screen sharing' : 'Microphone access'} is not supported by your browser or OS settings.`;
        } else if (err.message.includes('secure context')) {
             message = 'This feature requires a secure context (HTTPS) or localhost.';
        }
      }
      setError(message);
      setIsRecording(false);
      setAudioSource(null);
      stop(); // Ensure cleanup on error
    }
  }, [stop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log("Cleaning up useAudioProcessor hook.");
      stop();
       if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close().then(() => console.log("AudioContext closed on unmount.")).catch(e => console.error("Error closing AudioContext on unmount:", e));
            audioContextRef.current = null;
        }
        analyserRef.current = null; // Clear analyser ref
    };
  }, [stop]);

  return {
    analyserNode: analyserRef.current,
    start,
    stop,
    isRecording,
    error,
    audioContext: audioContextRef.current,
    audioSource
  };
}; 
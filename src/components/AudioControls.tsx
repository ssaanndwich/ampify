'use client';

import { useState } from 'react';
import { AudioSource } from '@/hooks/useAudioProcessor';

interface AudioControlsProps {
  start: (source: AudioSource) => Promise<void>;
  stop: () => void;
  isRecording: boolean;
  error: string | null;
  audioSource: AudioSource | null;
}

const AudioControls = ({
  start,
  stop,
  isRecording,
  error,
  audioSource,
}: AudioControlsProps) => {
  const [showErrorDetails, setShowErrorDetails] = useState(false);

  const handleSourceSelect = async (source: AudioSource) => {
    if (isRecording && audioSource === source) {
      stop();
    } else {
      await start(source);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <div className="flex gap-2">
        <button
          onClick={() => handleSourceSelect('microphone')}
          className={`rounded-md px-4 py-2 text-sm font-medium ${
            isRecording && audioSource === 'microphone'
              ? 'bg-red-500 text-white'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          {isRecording && audioSource === 'microphone' ? 'Stop Microphone' : 'Use Microphone'}
        </button>
        
        <button
          onClick={() => handleSourceSelect('screen')}
          className={`rounded-md px-4 py-2 text-sm font-medium ${
            isRecording && audioSource === 'screen'
              ? 'bg-red-500 text-white'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          {isRecording && audioSource === 'screen' ? 'Stop Screen Audio' : 'Use Screen Audio'}
        </button>
      </div>

      {error && (
        <div className="w-full max-w-md bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-2">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
          {error.includes('permission') && (
            <button
              className="underline text-xs mt-1 text-red-800"
              onClick={() => setShowErrorDetails(!showErrorDetails)}
            >
              {showErrorDetails ? 'Hide details' : 'Show details'}
            </button>
          )}
          {showErrorDetails && (
            <div className="text-xs mt-2">
              <p>
                This app requires permission to access your {audioSource === 'microphone' ? 'microphone' : 'screen audio'}.
                Please ensure you've granted the necessary permissions in your browser settings.
              </p>
            </div>
          )}
        </div>
      )}

      {isRecording && (
        <div className="flex items-center mt-2">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-2"></div>
          <span className="text-sm">
            Listening to {audioSource === 'microphone' ? 'microphone' : 'screen audio'}...
          </span>
        </div>
      )}
    </div>
  );
};

export default AudioControls; 
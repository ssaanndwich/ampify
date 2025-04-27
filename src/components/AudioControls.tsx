'use client';

import { useState, useEffect } from 'react';
import { AudioSource, AudioDevice } from '@/hooks/useAudioProcessor';
import { FiMic, FiMonitor, FiRefreshCw, FiSettings, FiXCircle, FiAlertTriangle, FiChevronDown, FiChevronUp, FiCheck } from 'react-icons/fi';

interface AudioControlsProps {
  start: (source: AudioSource, deviceId?: string) => Promise<void>;
  stop: () => void;
  isRecording: boolean;
  error: string | null;
  audioSource: AudioSource | null;
  audioDevices: AudioDevice[];
  refreshDevices: () => Promise<void>;
  selectedDeviceId: string | null;
}

const AudioControls = ({
  start,
  stop,
  isRecording,
  error,
  audioSource,
  audioDevices,
  refreshDevices,
  selectedDeviceId,
}: AudioControlsProps) => {
  const [showErrorDetails, setShowErrorDetails] = useState(false);
  const [showDeviceSelector, setShowDeviceSelector] = useState(false);
  const [pendingDeviceId, setPendingDeviceId] = useState<string | null>(selectedDeviceId);

  useEffect(() => {
    setPendingDeviceId(selectedDeviceId);
  }, [selectedDeviceId]);

  const handleSourceSelect = async (source: AudioSource) => {
    if (isRecording && audioSource === source) {
      stop();
    } else {
      const deviceToUse = source === 'microphone' ? pendingDeviceId || undefined : undefined;
      await start(source, deviceToUse);
    }
  };

  const handleDeviceRefresh = async () => {
    await refreshDevices();
  };

  const handleDeviceSelect = async (deviceId: string) => {
    setPendingDeviceId(deviceId);
    if (isRecording && audioSource === 'microphone') {
      await start('microphone', deviceId);
    }
  };

  const getButtonClass = (source: AudioSource) => {
    const baseClass = 'btn flex items-center justify-center space-x-2 w-full sm:w-auto';
    if (isRecording && audioSource === source) {
      return `${baseClass} btn-danger`;
    }
    if (source === 'microphone') {
      return `${baseClass} btn-primary`;
    }
    if (source === 'screen') {
      return `${baseClass} bg-purple-600 text-white hover:bg-purple-500 shadow-md hover:shadow-lg`;
    }
    return `${baseClass} btn-secondary`;
  };

  return (
    <div>
      <div className="flex flex-row gap-6 space-x-6 justify-center">
        <button
          onClick={() => handleSourceSelect('microphone')}
          className={getButtonClass('microphone')}
          disabled={error?.includes('microphone') && !isRecording}
        >
          <FiMic className="w-4 h-4" />
          <span>{isRecording && audioSource === 'microphone' ? 'Stop Mic' : 'Use Mic'}</span>
        </button>
        
        <button
          onClick={() => handleSourceSelect('screen')}
          className={getButtonClass('screen')}
          disabled={error?.includes('screen') && !isRecording}
        >
          <FiMonitor className="w-4 h-4" />
          <span>{isRecording && audioSource === 'screen' ? 'Stop Screen' : 'Use Screen'}</span>
        </button>
        
        <button
          onClick={() => setShowDeviceSelector(!showDeviceSelector)}
          className="btn btn-secondary flex items-center justify-center space-x-2 w-full sm:w-auto"
          title="Configure Audio Input Device"
        >
          <FiSettings className="w-4 h-4" />
          <span>{showDeviceSelector ? 'Hide Settings' : 'Audio Settings'}</span>
          {showDeviceSelector ? <FiChevronUp className="w-3 h-3"/> : <FiChevronDown className="w-3 h-3"/>}
        </button>
      </div>

      {showDeviceSelector && (
        <div className="w-full p-4 border border-gray-700 rounded-lg bg-gray-800/50 mt-2 space-y-3">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-gray-300">Select Microphone</h3>
            <button
              onClick={handleDeviceRefresh}
              className="btn btn-secondary btn-sm text-xs px-2 py-1 flex items-center space-x-1"
              title="Refresh device list"
            >
              <FiRefreshCw className="w-3 h-3" />
              <span>Refresh</span>
            </button>
          </div>
          
          {audioDevices.length === 0 ? (
            <div className="p-3 text-center text-sm text-gray-500 bg-gray-700/50 rounded-md">
              <FiMic className="w-6 h-6 mx-auto text-gray-600 mb-1" />
              <p>No audio input devices found.</p>
              <p className="text-xs mt-1">Ensure microphone is connected and permissions are granted.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {audioDevices.map(device => (
                <div 
                  key={device.id}
                  className={`p-2.5 rounded-md cursor-pointer transition-all duration-150 flex items-center justify-between text-sm border ${
                    pendingDeviceId === device.id 
                      ? 'border-blue-500 bg-blue-900/30 text-blue-200' 
                      : 'border-gray-600 hover:bg-gray-700/50 text-gray-300'
                  }`}
                  onClick={() => handleDeviceSelect(device.id)}
                >
                  <span className="truncate mr-2">{device.label || 'Unknown Device'}</span>
                  {pendingDeviceId === device.id && <FiCheck className="w-4 h-4 text-blue-400 flex-shrink-0"/>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="w-full bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg relative mt-2 text-sm">
          <div className="flex items-start">
            <FiXCircle className="h-5 w-5 text-red-400 flex-shrink-0 mr-2 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium">Audio Error</p>
              <p className="text-xs mt-1">{error}</p>
              {error.includes('permission') && (
                <button
                  className="underline text-xs mt-1.5 text-red-400 hover:text-red-300"
                  onClick={() => setShowErrorDetails(!showErrorDetails)}
                >
                  {showErrorDetails ? 'Hide Details' : 'Show Details'}
                </button>
              )}
              {showErrorDetails && (
                <div className="text-xs mt-2 text-red-400/80 border-t border-red-700/50 pt-2">
                  <p>
                    Please ensure your browser has permission to access your {audioSource === 'microphone' ? 'microphone' : 'screen audio'}.
                    Check your browser site settings for this page.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AudioControls; 
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
    const baseClass = 'flex items-center gap-2 py-2 px-3 rounded-lg text-sm transition-all';
    if (isRecording && audioSource === source) {
      return `${baseClass} ${source === 'microphone' ? 'bg-red-500/80' : 'bg-orange-500/80'} text-white`;
    }
    return `${baseClass} bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white`;
  };

  return (
    <div className="relative">
      <div className="flex gap-2">
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
          className="flex items-center gap-2 py-2 px-3 rounded-lg text-sm transition-all bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white"
          title="Configure Audio Input Device"
        >
          <FiSettings className="w-4 h-4" />
          {showDeviceSelector ? <FiChevronUp className="w-3.5 h-3.5"/> : <FiChevronDown className="w-3.5 h-3.5"/>}
        </button>
      </div>

      {showDeviceSelector && (
        <div className="absolute top-full right-0 mt-2 w-72 p-3 border border-gray-700 rounded-lg bg-gray-900 shadow-xl z-10">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-gray-300">Select Microphone</h3>
            <button
              onClick={handleDeviceRefresh}
              className="flex items-center gap-1.5 px-2 py-1 text-xs bg-gray-700/80 text-gray-300 hover:text-white rounded-md transition-colors"
              title="Refresh device list"
            >
              <FiRefreshCw className="w-3 h-3" />
              <span>Refresh</span>
            </button>
          </div>
          
          {audioDevices.length === 0 ? (
            <div className="p-3 text-center text-sm text-gray-400 bg-gray-800/70 rounded-lg">
              <p className="font-medium">No audio devices found</p>
            </div>
          ) :
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
              {audioDevices.map(device => (
                <div 
                  key={device.id}
                  className={`p-2 rounded-md cursor-pointer transition-all flex items-center justify-between text-xs ${
                    pendingDeviceId === device.id 
                      ? 'bg-purple-900/20 text-purple-200' 
                      : 'hover:bg-gray-800 text-gray-300'
                  }`}
                  onClick={() => handleDeviceSelect(device.id)}
                >
                  <div className="flex items-center gap-2 truncate">
                    <FiMic className={`w-3.5 h-3.5 ${pendingDeviceId === device.id ? 'text-purple-300' : 'text-gray-400'}`} />
                    <span className="truncate">{device.label || 'Unknown Device'}</span>
                  </div>
                  {pendingDeviceId === device.id && 
                    <FiCheck className="w-3.5 h-3.5 text-purple-400 flex-shrink-0"/>
                  }
                </div>
              ))}
            </div>
          }
        </div>
      )}

      {error && (
        <div className="absolute top-full right-0 mt-2 w-72 p-3 bg-red-950/80 border border-red-800 text-red-300 rounded-lg shadow-xl z-10">
          <div className="flex items-start gap-2">
            <FiXCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm">Audio Error</p>
              <p className="mt-1 text-xs text-red-300/90">{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioControls; 
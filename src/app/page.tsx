'use client';

import { useState, useTransition } from 'react';
import { useAudioProcessor } from '@/hooks/useAudioProcessor';
import ComponentPromptForm from '@/components/ComponentPromptForm';
import DynamicComponentRenderer from '@/components/DynamicComponentRenderer';
import { generateComponent } from './actions/generateComponent';
import AudioControls from '@/components/AudioControls';
import { FiCode, FiCpu, FiMusic, FiSettings, FiInfo } from 'react-icons/fi';

export default function ComponentVisualizerPage() {
  // State for component data
  const [componentCode, setComponentCode] = useState<string>('');
  const [componentDescription, setComponentDescription] = useState<string>('');
  const [lastPrompt, setLastPrompt] = useState<string>('');
  const [showCode, setShowCode] = useState(false);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [openaiError, setOpenaiError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  
  // Audio processing
  const audioProcessor = useAudioProcessor();

  const handlePromptSubmit = async (prompt: string) => {
    console.log('[Client] Submitting component prompt:', prompt);
    setLastPrompt(prompt);
    setLoading(true);
    setOpenaiError(null);
    setComponentCode(''); // Clear previous component on new submission
    setComponentDescription('');
    
    startTransition(async () => {
      try {
        console.log('[Client] Calling server action');
        const result = await generateComponent(prompt);
        console.log('[Client] Received response from server action');
        
        if (result && result.componentCode) {
          console.log('[Client] Updating component state with new data');
          setComponentCode(result.componentCode);
          setComponentDescription(result.description);
          console.log('[Client] State updated');
        } else {
          // Handle potential errors more robustly
          const errorMessage = result && typeof result === 'object' && 'error' in result 
                             ? result.error 
                             : 'Failed to generate component: Invalid response format';
          setOpenaiError(String(errorMessage)); 
        }
      } catch (error) {
        console.error('[Client] Error in handlePromptSubmit:', error);
        const message = error instanceof Error ? error.message : 'An unknown error occurred';
        setOpenaiError(`Generation failed: ${message}`);
      } finally {
        setLoading(false);
      }
    });
  };

  return (
    <div className="flex flex-col min-h-screen text-gray-200">
      {/* Header */}
      <header className="bg-gray-800/80 backdrop-blur-sm sticky top-0 z-10 border-b border-gray-700 shadow-md">
        <div className="container mx-auto py-3 px-6 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <FiMusic className="text-blue-400 w-6 h-6" />
            <h1 className="text-xl font-semibold text-gray-100">Ampify</h1>
          </div>
          {/* Audio Setup Inline in Header */}
          <div>
              <AudioControls
                start={audioProcessor.start}
                stop={audioProcessor.stop}
                isRecording={audioProcessor.isRecording}
                error={audioProcessor.error}
                audioSource={audioProcessor.audioSource}
                audioDevices={audioProcessor.audioDevices}
                refreshDevices={audioProcessor.refreshDevices}
                selectedDeviceId={audioProcessor.selectedDeviceId}
              />
          </div>
          {/* <span className="text-xs text-gray-400">by Evan Phibbs</span> */}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Control Panel (Left Side) */}
          <div className="md:col-span-4 flex flex-col space-y-6">
            {/* Prompt Form Card */}
            <div className="card p-5">
              <h2 className="text-lg font-semibold mb-4 text-gray-100 flex items-center">
                <FiCpu className="mr-2 text-purple-400" /> Generate Visualization
              </h2>
              <ComponentPromptForm 
                onSubmit={handlePromptSubmit} 
                loading={loading || isPending}
              />
              {openaiError && (
                <div className="mt-4 p-3 bg-red-900/50 border border-red-700 text-red-300 rounded-md text-sm">
                  <p className="font-medium">Error:</p>
                  <p>{openaiError}</p>
                  {openaiError.includes('API key') && 
                    <p className="text-xs mt-1 text-red-400">Check your `.env.local` file.</p>
                  }
                </div>
              )}
            </div>
          </div>

          {/* Visualization Area (Right Side) */}
          <div className="md:col-span-8">
            <div className="card overflow-hidden h-[600px] flex flex-col">
              {/* Visualization Renderer */}
              <div className="flex-grow relative bg-black">
                {componentCode ? (
                  <DynamicComponentRenderer 
                    componentCode={componentCode} 
                    showCode={showCode}
                    analyserNode={audioProcessor.analyserNode}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <FiMusic className="w-16 h-16 mx-auto mb-4 opacity-30" />
                      <h3 className="text-lg font-semibold mb-1 text-gray-400">Visualization Area</h3>
                      <p className="text-sm">
                        {loading ? 'Generating your visualization...' : 'Generate a component to see it here.'}
                      </p>
                    </div>
                  </div>
                )}
                {/* Loading Overlay */} 
                {loading && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-10">
                     <div className="flex flex-col items-center space-y-2">
                        <svg className="animate-spin h-8 w-8 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="text-sm text-gray-300">Generating...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Component Info Footer */}
              {componentDescription && (
                <div className="bg-gray-800/90 p-4 border-t border-gray-700">
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-gray-400 italic truncate mr-4">
                      Generated based on: "{lastPrompt}"
                    </p>
                    <button
                      onClick={() => setShowCode(!showCode)}
                      className="btn btn-secondary btn-sm flex items-center text-xs px-2 py-1"
                      title={showCode ? 'Hide Generated Code' : 'Show Generated Code'}
                    >
                      <FiCode className="mr-1"/> {showCode ? 'Hide Code' : 'Show Code'}
                    </button>
                  </div>
                  {/* <p className="text-sm text-gray-300 mt-2">{componentDescription}</p> */} 
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 py-4 px-6 bg-gray-900 border-t border-gray-700 text-center">
        <p className="text-xs text-gray-500">
          AI Music Visualizer - Experimenting with generative UI and Web Audio API.
        </p>
      </footer>
    </div>
  );
} 
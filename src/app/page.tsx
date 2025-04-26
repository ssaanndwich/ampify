'use client';

import { useState, useTransition } from 'react';
import { useAudioProcessor } from '@/hooks/useAudioProcessor';
import ShaderVisualizer from '@/components/ShaderVisualizer';
import AudioControls from '@/components/AudioControls';
import PromptForm from '@/components/PromptForm';
import { defaultVertexShader, defaultFragmentShader, defaultDescription } from '@/components/DefaultShaders';
import { generateShader } from './actions/generateShader';

export default function Home() {
  // State for shader data
  const [vertexShader, setVertexShader] = useState(defaultVertexShader);
  const [fragmentShader, setFragmentShader] = useState(defaultFragmentShader);
  const [shaderDescription, setShaderDescription] = useState(defaultDescription);
  const [generatedShader, setGeneratedShader] = useState(false);
  const [lastPrompt, setLastPrompt] = useState<string>('');
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [openaiError, setOpenaiError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  
  // Audio processing
  const audioProcessor = useAudioProcessor();

  const handlePromptSubmit = async (prompt: string) => {
    console.log('[Client] Submitting prompt:', prompt);
    setLastPrompt(prompt);
    setLoading(true);
    setOpenaiError(null);
    
    // Use React transitions for server actions
    startTransition(async () => {
      try {
        console.log('[Client] Calling server action');
        const result = await generateShader(prompt);
        console.log('[Client] Received response from server action');
        
        if (result) {
          console.log('[Client] Updating shader state with new data');
          
          // Update all shader state at once
          setVertexShader(result.vertexShader);
          setFragmentShader(result.fragmentShader);
          setShaderDescription(result.description);
          setGeneratedShader(true);
          
          console.log('[Client] State updated');
        } else {
          setOpenaiError('Failed to generate shader: Empty response');
        }
      } catch (error) {
        console.error('[Client] Error in handlePromptSubmit:', error);
        setOpenaiError(error instanceof Error ? error.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="py-4 px-6 border-b bg-white">
        <h1 className="text-2xl font-bold text-center">AI Music Visualizer</h1>
      </header>

      <main className="flex flex-col flex-grow p-4 gap-6">
        {/* Audio Controls */}
        <div className="w-full py-2">
          <AudioControls
            start={audioProcessor.start}
            stop={audioProcessor.stop}
            isRecording={audioProcessor.isRecording}
            error={audioProcessor.error}
            audioSource={audioProcessor.audioSource}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-grow">
          {/* Visualization Panel */}
          <div className="flex flex-col rounded-lg overflow-hidden border bg-black md:order-2 h-[400px]">
            <div className="h-full relative">
              <ShaderVisualizer
                fragmentShader={fragmentShader}
                vertexShader={vertexShader}
                analyserNode={audioProcessor.analyserNode}
              />
              
              {!audioProcessor.isRecording && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                  <div className="text-white text-center max-w-xs mx-auto p-4">
                    <h3 className="text-lg font-bold mb-2">Start Audio Input</h3>
                    <p className="text-sm">
                      Select a microphone or screen audio source to begin the visualization.
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Visualization Description */}
            {shaderDescription && (
              <div className="bg-gray-800 p-3 text-white text-sm">
                <p>{shaderDescription}</p>
                {generatedShader && (
                  <p className="mt-1 text-xs text-gray-300">
                    AI-generated based on your prompt: "{lastPrompt}"
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Prompt Panel */}
          <div className="flex flex-col bg-white rounded-lg border p-4 md:order-1">
            <h2 className="text-xl font-semibold mb-4">
              Generate Your Visualization
            </h2>
            
            <PromptForm 
              onSubmit={handlePromptSubmit} 
              loading={loading || isPending}
            />
            
            {openaiError && (
              <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                <p className="font-bold">Error: {openaiError}</p>
                <p className="text-sm mt-1">
                  Make sure your OpenAI API key is correctly configured in the .env.local file with the variable name OPENAI_API_KEY.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="py-3 px-6 border-t text-center text-sm text-gray-500">
        <p>
          AI-powered WebGL Music Visualizer • Powered by Next.js, Three.js, and OpenAI
        </p>
      </footer>
    </div>
  );
}

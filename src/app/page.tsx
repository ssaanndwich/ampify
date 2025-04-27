'use client';

import { useState, useEffect } from 'react';
import { useAudioProcessor } from '@/hooks/useAudioProcessor';
import AudioControls from '@/components/AudioControls';
import ShaderVisualizer from '@/components/ShaderVisualizer';
import { defaultFragmentShader, defaultVertexShader } from '@/components/DefaultShaders';
import { Dialog } from '@/components/Dialog';
import { generateComponent } from './actions/generateComponent';
import DynamicComponentRenderer from '@/components/DynamicComponentRenderer';

interface Generation {
  id: string;
  prompt: string;
  fragmentShader: string;
  vertexShader: string;
  componentCode?: string;
  createdAt: Date;
}

export default function Home() {
  const audioProcessor = useAudioProcessor();
  const [prompt, setPrompt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [activeGeneration, setActiveGeneration] = useState<Generation | null>(null);
  const [showGenerationDialog, setShowGenerationDialog] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    setShowGenerationDialog(true);
    
    try {
      // Call the generateComponent server action with the prompt
      const result = await generateComponent(prompt);
      
      const newGeneration: Generation = {
        id: Date.now().toString(),
        prompt,
        fragmentShader: defaultFragmentShader,
        vertexShader: defaultVertexShader,
        componentCode: result.componentCode,
        createdAt: new Date()
      };
      
      setGenerations(prev => [newGeneration, ...prev]);
      setActiveGeneration(newGeneration);
      setPrompt('');
    } catch (error) {
      console.error('Error generating visualization:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectGeneration = (generation: Generation) => {
    setActiveGeneration(generation);
    setShowGenerationDialog(true);
  };

  return (
    <main className="flex flex-col min-h-screen bg-gradient-to-b from-black via-gray-900 to-purple-950">
      {/* Header with title and audio controls */}
      <header className="py-4 px-6 flex justify-between items-center border-b border-gray-800 bg-black/30 backdrop-blur-sm">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
          Audio Visualizer
        </h1>
        
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
      </header>

      {/* Main content */}
      <div className="flex-1 flex flex-col p-4 sm:p-6 max-w-7xl mx-auto w-full">
        {/* Prompt Input */}
        <div className="w-full max-w-3xl mx-auto mb-10 mt-10">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              placeholder="Describe your visualization (e.g., neon waves pulsing with the beat...)"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full px-5 py-3 rounded-full bg-gray-800/60 border border-gray-700 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={isSubmitting || !prompt.trim()}
              className={`px-6 py-3 rounded-full font-medium transition-all
                ${isSubmitting || !prompt.trim() 
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'}`}
            >
              Generate
            </button>
          </form>
        </div>
        
        {/* Previous Generations Grid */}
        <div className="mt-6">
          <h2 className="text-lg font-medium text-gray-300 mb-4">Your Visualizations</h2>
          
          {generations.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              No visualizations yet. Create one using the prompt above.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {generations.map(generation => (
                <div 
                  key={generation.id}
                  onClick={() => handleSelectGeneration(generation)}
                  className="relative group bg-gray-900/60 border border-gray-800 rounded-xl overflow-hidden cursor-pointer transition-all hover:border-purple-500 h-48"
                >
                  <div className="absolute inset-0 opacity-60 pointer-events-none">
                    {generation.componentCode ? (
                      <DynamicComponentRenderer
                        componentCode={generation.componentCode}
                        analyserNode={audioProcessor.analyserNode}
                      />
                    ) : (
                      <ShaderVisualizer 
                        fragmentShader={generation.fragmentShader}
                        vertexShader={generation.vertexShader}
                        analyserNode={audioProcessor.analyserNode}
                      />
                    )}
                  </div>
                  <div className="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-black/80 to-transparent">
                    <p className="text-sm text-white font-medium line-clamp-2">{generation.prompt}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {generation.createdAt.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Generation Dialog */}
      <Dialog
        isOpen={showGenerationDialog}
        onClose={() => setShowGenerationDialog(false)}
        className="w-full max-w-4xl"
      >
        {isSubmitting ? (
          <div className="p-6 flex flex-col items-center justify-center">
            <div className="animate-spin h-12 w-12 border-4 border-purple-500 border-t-transparent rounded-full mb-4"></div>
            <h3 className="text-xl font-medium text-white">Generating visualization...</h3>
            <p className="text-gray-400 mt-2">This may take a few moments</p>
          </div>
        ) : activeGeneration ? (
          ({ isFullscreen }) => (
            <div className="flex flex-col h-full">
              <div className={`${isFullscreen ? 'h-[calc(100%-70px)]' : 'h-[500px]'} relative rounded-t-xl overflow-hidden flex-1`}>
                {activeGeneration.componentCode ? (
                  <DynamicComponentRenderer
                    componentCode={activeGeneration.componentCode}
                    analyserNode={audioProcessor.analyserNode}
                  />
                ) : (
                  <ShaderVisualizer 
                    fragmentShader={activeGeneration.fragmentShader}
                    vertexShader={activeGeneration.vertexShader}
                    analyserNode={audioProcessor.analyserNode}
                  />
                )}
                
                {!audioProcessor.isRecording && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="text-center p-6 rounded-xl">
                      <p className="text-gray-400 max-w-xs mx-auto">
                        Connect audio from the header controls to see this visualization
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <div className={`p-5 bg-gray-900 border-t border-gray-800 rounded-b-xl ${isFullscreen ? 'fixed bottom-0 left-0 right-0 z-10' : ''}`}>
                <h3 className="text-lg font-medium text-white mb-1">{activeGeneration.prompt}</h3>
                <p className="text-sm text-gray-400">
                  Created on {activeGeneration.createdAt.toLocaleString()}
                </p>
              </div>
            </div>
          )
        ) : null}
      </Dialog>
    </main>
  );
}

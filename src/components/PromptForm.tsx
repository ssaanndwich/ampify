'use client';

import { useState, FormEvent } from 'react';

interface PromptFormProps {
  onSubmit: (prompt: string) => void;
  loading: boolean;
}

const PromptForm = ({ onSubmit, loading }: PromptFormProps) => {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onSubmit(prompt.trim());
    }
  };

  const examplePrompts = [
    'Create a colorful wave visualization that reacts to bass',
    'Generate a cosmic nebula that pulses with the music beat',
    'Make a geometric pattern that transforms with audio frequency',
    'Design a liquid metal effect that ripples with sound',
  ];

  const handleExampleClick = (example: string) => {
    setPrompt(example);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium mb-1">
            Describe your music visualization
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="E.g., Create a colorful wave visualization that reacts to bass..."
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
            disabled={loading}
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium">Try:</span>
          {examplePrompts.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => handleExampleClick(example)}
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
              disabled={loading}
            >
              {example}
            </button>
          ))}
        </div>
        
        <button
          type="submit"
          className={`w-full py-2 px-4 rounded-md text-white font-medium ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
          disabled={loading || !prompt.trim()}
        >
          {loading ? 'Generating...' : 'Generate Visualization'}
        </button>
      </form>
    </div>
  );
};

export default PromptForm; 
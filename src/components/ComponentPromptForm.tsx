'use client';

import React, { useState, FormEvent } from 'react';
import { FiSend } from 'react-icons/fi';

interface ComponentPromptFormProps {
  onSubmit: (prompt: string) => void;
  loading: boolean;
}

const ComponentPromptForm: React.FC<ComponentPromptFormProps> = ({
  onSubmit,
  loading
}) => {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || loading) return;
    onSubmit(prompt);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label 
          htmlFor="prompt" 
          className="block text-sm font-medium text-gray-300 mb-2"
        >
          Describe the visualization
        </label>
        
        <textarea
          id="prompt"
          name="prompt"
          rows={5}
          className="input-field resize-none"
          placeholder="e.g., 'A circle of pulsing bars reacting to bass, using neon blue and purple'"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={loading}
        />
      </div>
      
      <div>
        <button
          type="submit"
          disabled={loading || !prompt.trim()}
          className={`w-full flex items-center justify-center btn btn-primary ${
            loading || !prompt.trim() ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </>
          ) : (
            <>
              <FiSend className="mr-2 h-4 w-4" /> Create Visualization
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default ComponentPromptForm; 
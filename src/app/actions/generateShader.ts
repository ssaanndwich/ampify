'use server';

import OpenAI from 'openai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export interface ShaderResponse {
  vertexShader: string;
  fragmentShader: string;
  description: string;
}

export async function generateShader(formData: FormData | string): Promise<ShaderResponse> {
  try {
    // Extract prompt from FormData if needed
    const prompt = typeof formData === 'string' 
      ? formData 
      : formData.get('prompt') as string;
    
    console.log(`[Server Action] Generating shader for prompt: "${prompt}"`);
    
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert in WebGL and GLSL shaders. Your task is to create a music visualizer shader that can be animated based on audio frequency data. Return only valid code that can be used directly with React Three Fiber."
        },
        {
          role: "user",
          content: `Create a music visualizer shader based on this prompt: "${prompt}". Return a JSON object with three properties: vertexShader (string), fragmentShader (string), and description (string). The fragment shader should utilize audioData (frequency data array) and time (elapsed time in seconds) as uniforms. Make sure the shader is performant and visually appealing.`
        }
      ],
      temperature: 0.0,
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content || '{}';
    console.log(`[Server Action] Received response from OpenAI: ${content.substring(0, 50)}...`);
    
    const result = JSON.parse(content);
    
    // Create a well-formed response object
    const shaderResponse: ShaderResponse = {
      vertexShader: result.vertexShader || '',
      fragmentShader: result.fragmentShader || '',
      description: result.description || ''
    };
    
    console.log('[Server Action] Shader generated successfully');
    
    // Log the first few characters of each shader to debug
    console.log(`[Server Action] Vertex shader preview: ${shaderResponse.vertexShader.substring(0, 30)}...`);
    console.log(`[Server Action] Fragment shader preview: ${shaderResponse.fragmentShader.substring(0, 30)}...`);
    
    return shaderResponse;
  } catch (err) {
    console.error('[Server Action] Error generating shader:', err);
    // Return a default shader response on error instead of throwing
    return {
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform sampler2D audioData;
        varying vec2 vUv;
        
        void main() {
          vec2 uv = vUv;
          vec3 color = vec3(0.5 + 0.5 * sin(time + uv.x * 10.0), 0.5, 0.5);
          gl_FragColor = vec4(color, 1.0);
        }
      `,
      description: "Error occurred while generating your shader. This is a fallback shader."
    };
  }
} 
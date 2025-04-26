// Default vertex shader
export const defaultVertexShader = `
  varying vec2 vUv;
  
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Default fragment shader that responds to audio
export const defaultFragmentShader = `
  uniform float time;
  uniform sampler2D audioData;
  uniform vec2 resolution;
  varying vec2 vUv;
  
  float getAudioData(float index) {
    return texture2D(audioData, vec2(index / 128.0, 0.0)).r;
  }
  
  void main() {
    vec2 uv = vUv;
    
    // Get various frequency bands
    float bass = getAudioData(0.05);
    float midrange = getAudioData(0.3);
    float treble = getAudioData(0.8);
    
    // Create a simple circular visualization
    float dist = length(uv - vec2(0.5));
    
    // Pulse circle based on bass
    float circle = smoothstep(0.3 + bass * 0.2, 0.29 + bass * 0.2, dist);
    
    // Add ripples based on midrange
    float ripple = sin(dist * 50.0 - time * 2.0) * 0.5 + 0.5;
    ripple *= midrange * 0.2;
    
    // Color gradient based on distance and treble
    vec3 color = mix(
      vec3(0.0, 0.5, 1.0), 
      vec3(1.0, 0.0, 0.5),
      dist + treble * 0.5
    );
    
    // Apply the effects
    color = mix(color, vec3(1.0), circle);
    color += ripple;
    
    // Add some movement
    color += 0.05 * sin(time + uv.x * 10.0) * sin(time + uv.y * 10.0);
    
    gl_FragColor = vec4(color, 1.0);
  }
`;

export const defaultDescription = "A default audio visualizer that displays a pulsing circle that reacts to bass frequencies, with ripples that respond to midrange frequencies, and a color gradient affected by treble."; 
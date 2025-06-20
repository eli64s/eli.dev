import { useEffect, useRef } from 'react';

interface QuantumFieldShaderProps {
  className?: string;
  speed?: number;
  colorHue?: number;
  colorSaturation?: number;
  intensity?: number;
}

export default function QuantumFieldShader({ 
  className = '', 
  speed = 1.0, 
  colorHue = 0.5, 
  colorSaturation = 0.8, 
  intensity = 1.0 
}: QuantumFieldShaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  const vertexShaderSource = `
    attribute vec2 position;
    void main() {
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `;

  const fragmentShaderSource = `
    precision mediump float;
    uniform vec2 resolution;
    uniform float time;
    uniform float speed;
    uniform float colorHue;
    uniform float colorSaturation;
    uniform float intensity;
    
    vec3 hsv2rgb(vec3 c) {
      vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
      vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
      return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
    }
    
    vec2 complexMul(vec2 a, vec2 b) {
      return vec2(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x);
    }
    
    vec2 complexDiv(vec2 a, vec2 b) {
      float d = dot(b, b);
      return vec2(dot(a, b), a.y * b.x - a.x * b.y) / d;
    }
    
    float quantumWave(vec2 p, float t, float frequency, float phase) {
      vec2 wave = vec2(cos(frequency * length(p) + phase + t), 
                       sin(frequency * length(p) + phase + t));
      
      float interference = sin(p.x * frequency + t + phase) * cos(p.y * frequency + t + phase);
      float amplitude = exp(-length(p) * 0.5);
      
      return amplitude * (wave.x + interference * 0.3);
    }
    
    float heisenbergUncertainty(vec2 p, float t) {
      float momentum = length(p) * 2.0;
      float position = atan(p.y, p.x) / 6.28318;
      
      float uncertainty = 1.0 / (1.0 + momentum * position * 4.0);
      float fluctuation = sin(t * 8.0 + momentum * 10.0) * uncertainty;
      
      return fluctuation * 0.5 + 0.5;
    }
    
    vec2 quantumTunneling(vec2 p, float t) {
      float barrier = smoothstep(-0.1, 0.1, sin(p.x * 8.0 + t));
      float tunnelProb = exp(-abs(p.y) * 5.0 * barrier);
      
      vec2 tunneled = p;
      tunneled.x += tunnelProb * sin(t * 3.0 + p.y * 5.0) * 0.2;
      tunneled.y += tunnelProb * cos(t * 2.0 + p.x * 3.0) * 0.1;
      
      return tunneled;
    }
    
    float schrodingerEquation(vec2 p, float t) {
      vec2 psi = vec2(0.0);
      float energy = 0.0;
      
      // Multiple quantum states superposition
      for (int n = 1; n <= 5; n++) {
        float En = float(n * n) * 0.1;
        float waveNum = sqrt(2.0 * En);
        
        vec2 eigenstate = vec2(
          sin(waveNum * p.x) * exp(-p.x * p.x * 0.5),
          cos(waveNum * p.y) * exp(-p.y * p.y * 0.5)
        );
        
        float timeEvolution = cos(En * t) + sin(En * t);
        psi += eigenstate * timeEvolution / float(n);
        energy += En * dot(eigenstate, eigenstate);
      }
      
      return dot(psi, psi) + energy * 0.1;
    }
    
    float quantumEntanglement(vec2 p1, vec2 p2, float t) {
      float distance = length(p1 - p2);
      float correlation = cos(distance * 5.0 + t * 2.0) * exp(-distance * 0.5);
      
      float spin1 = sin(t + length(p1) * 3.0);
      float spin2 = -sin(t + length(p2) * 3.0); // Entangled opposite spin
      
      return correlation * spin1 * spin2 * 0.5 + 0.5;
    }
    
    vec3 quantumField(vec2 p, float t) {
      vec2 tunneledP = quantumTunneling(p, t);
      
      // Multiple quantum phenomena
      float wave1 = quantumWave(tunneledP, t, 3.0, 0.0);
      float wave2 = quantumWave(tunneledP, t, 5.0, 1.57);
      float wave3 = quantumWave(tunneledP, t, 7.0, 3.14);
      
      float uncertainty = heisenbergUncertainty(tunneledP, t);
      float schrodinger = schrodingerEquation(tunneledP, t);
      
      // Quantum entanglement with virtual particles
      vec2 virtualP = tunneledP + vec2(sin(t * 1.3), cos(t * 1.7)) * 0.3;
      float entanglement = quantumEntanglement(tunneledP, virtualP, t);
      
      // Wave function collapse simulation
      float observation = smoothstep(0.7, 1.0, sin(t * 0.5 + length(tunneledP) * 2.0));
      float collapsed = mix(wave1 + wave2 + wave3, abs(wave1), observation);
      
      // Quantum foam at Planck scale
      float planckFoam = 0.0;
      for (int i = 0; i < 8; i++) {
        float scale = pow(2.0, float(i));
        vec2 foamP = tunneledP * scale + t * scale * 0.1;
        planckFoam += sin(foamP.x * 20.0) * cos(foamP.y * 20.0) / scale;
      }
      planckFoam *= 0.1;
      
      // Combine quantum effects
      float fieldStrength = collapsed * uncertainty + schrodinger * 0.3 + entanglement * 0.4 + planckFoam;
      float coherence = wave1 * wave2 * wave3;
      float decoherence = 1.0 - exp(-t * 0.1);
      
      return vec3(fieldStrength, coherence, decoherence);
    }
    
    void main() {
      vec2 uv = gl_FragCoord.xy / resolution.xy;
      vec2 p = (gl_FragCoord.xy - 0.5 * resolution.xy) / min(resolution.x, resolution.y);
      
      float animTime = time * speed;
      
      // Generate quantum field
      vec3 quantum = quantumField(p, animTime);
      float fieldStrength = quantum.x;
      float coherence = quantum.y;
      float decoherence = quantum.z;
      
      // Probability density visualization
      float probability = fieldStrength * fieldStrength;
      probability = smoothstep(0.0, 1.0, probability);
      
      // Energy level transitions
      float energyTransition = sin(animTime * 4.0 + length(p) * 8.0) * 0.1 + 0.9;
      probability *= energyTransition;
      
      // Quantum superposition interference
      float interference = coherence * (1.0 - decoherence);
      float superposition = mix(probability, abs(interference), 0.3);
      
      // Virtual particle pairs
      float virtualPairs = 0.0;
      for (int i = 0; i < 6; i++) {
        float phase = float(i) * 1.047 + animTime;
        vec2 pairPos = vec2(cos(phase), sin(phase)) * 0.5;
        float pairDist = length(p - pairPos);
        virtualPairs += exp(-pairDist * 8.0) * sin(animTime * 10.0 + phase) * 0.2;
      }
      superposition += virtualPairs;
      
      // Color mapping with quantum energy levels
      float energyLevel = mod(fieldStrength * 5.0 + animTime * 0.2, 1.0);
      float hue = colorHue + energyLevel * 0.4 + interference * 0.2;
      float sat = colorSaturation * (0.7 + 0.3 * coherence);
      float val = intensity * superposition;
      
      vec3 color = hsv2rgb(vec3(hue, sat, val));
      
      // Add quantum glow effects
      float glow = exp(-length(p) * 2.0) * 0.3;
      color += vec3(0.4, 0.8, 1.0) * glow * probability;
      
      // Photon emission visualization
      float photonEmission = smoothstep(0.9, 1.0, probability);
      color += vec3(1.0, 1.0, 0.8) * photonEmission * 0.5;
      
      gl_FragColor = vec4(color, 1.0);
    }
  `;

  const createShader = (gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null => {
    const shader = gl.createShader(type);
    if (!shader) return null;
    
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    
    return shader;
  };

  const createProgram = (gl: WebGLRenderingContext): WebGLProgram | null => {
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    
    if (!vertexShader || !fragmentShader) return null;
    
    const program = gl.createProgram();
    if (!program) return null;
    
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program linking error:', gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      return null;
    }
    
    return program;
  };

  const setupWebGL = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl || !(gl instanceof WebGLRenderingContext)) {
      console.error('WebGL not supported');
      return;
    }
    
    glRef.current = gl;
    
    const program = createProgram(gl);
    if (!program) return;
    
    programRef.current = program;
    
    const positions = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
       1,  1,
    ]);
    
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    
    const positionLocation = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    
    gl.useProgram(program);
  };

  const render = () => {
    const gl = glRef.current;
    const program = programRef.current;
    const canvas = canvasRef.current;
    
    if (!gl || !program || !canvas) return;
    
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
    
    const timeLocation = gl.getUniformLocation(program, 'time');
    const resolutionLocation = gl.getUniformLocation(program, 'resolution');
    const speedLocation = gl.getUniformLocation(program, 'speed');
    const colorHueLocation = gl.getUniformLocation(program, 'colorHue');
    const colorSaturationLocation = gl.getUniformLocation(program, 'colorSaturation');
    const intensityLocation = gl.getUniformLocation(program, 'intensity');
    
    const currentTime = (Date.now() - startTimeRef.current) / 1000;
    gl.uniform1f(timeLocation, currentTime);
    gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
    gl.uniform1f(speedLocation, speed);
    gl.uniform1f(colorHueLocation, colorHue);
    gl.uniform1f(colorSaturationLocation, colorSaturation);
    gl.uniform1f(intensityLocation, intensity);
    
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    
    animationRef.current = requestAnimationFrame(render);
  };

  useEffect(() => {
    setupWebGL();
    render();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full ${className}`}
      style={{ display: 'block' }}
    />
  );
}
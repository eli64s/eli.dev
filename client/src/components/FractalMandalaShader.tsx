import { useEffect, useRef } from 'react';

interface FractalMandalaShaderProps {
  className?: string;
  speed?: number;
  colorHue?: number;
  colorSaturation?: number;
  intensity?: number;
}

export default function FractalMandalaShader({ 
  className = '', 
  speed = 1.0, 
  colorHue = 0.5, 
  colorSaturation = 0.8, 
  intensity = 1.0 
}: FractalMandalaShaderProps) {
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
    
    vec2 rotate(vec2 v, float a) {
      float c = cos(a);
      float s = sin(a);
      return vec2(c * v.x - s * v.y, s * v.x + c * v.y);
    }
    
    float mandala(vec2 p, float time) {
      float d = length(p);
      float a = atan(p.y, p.x);
      
      // Create 8-fold symmetry
      float segments = 8.0;
      a = mod(a, 6.28318 / segments);
      a = abs(a - 3.14159 / segments);
      
      vec2 q = vec2(cos(a) * d, sin(a) * d);
      
      // Nested patterns
      float pattern = 0.0;
      
      // Concentric rings
      float rings = sin(d * 12.0 - time * 2.0) * 0.5 + 0.5;
      pattern += rings * 0.3;
      
      // Radial spokes
      float spokes = sin(a * segments * 4.0 + time) * 0.5 + 0.5;
      pattern += spokes * 0.2;
      
      // Petals
      float petals = sin(d * 6.0 + sin(a * segments * 2.0) * 2.0 - time) * 0.5 + 0.5;
      pattern += petals * 0.3;
      
      // Sacred geometry circles
      vec2 center1 = vec2(0.3, 0.0);
      vec2 center2 = rotate(center1, 6.28318 / 6.0);
      vec2 center3 = rotate(center1, 6.28318 / 3.0);
      
      float circle1 = 1.0 - smoothstep(0.1, 0.15, length(q - center1));
      float circle2 = 1.0 - smoothstep(0.1, 0.15, length(q - center2));
      float circle3 = 1.0 - smoothstep(0.1, 0.15, length(q - center3));
      
      pattern += (circle1 + circle2 + circle3) * 0.2;
      
      return pattern;
    }
    
    float fractalNoise(vec2 p, float time) {
      float noise = 0.0;
      float amplitude = 1.0;
      float frequency = 1.0;
      
      for (int i = 0; i < 6; i++) {
        vec2 q = p * frequency;
        q = rotate(q, time * 0.1 + float(i) * 0.3);
        
        float n = sin(q.x * 3.0) * cos(q.y * 3.0);
        n += sin(q.x * 6.0 + q.y * 2.0) * 0.5;
        n += sin((q.x + q.y) * 4.0) * 0.25;
        
        noise += n * amplitude;
        amplitude *= 0.5;
        frequency *= 2.0;
        p = rotate(p, 0.5);
      }
      
      return noise * 0.5 + 0.5;
    }
    
    float flowerOfLife(vec2 p, float time) {
      float pattern = 0.0;
      float d = length(p);
      
      // Central circle
      pattern += 1.0 - smoothstep(0.18, 0.22, d);
      
      // Six surrounding circles
      for (int i = 0; i < 6; i++) {
        float angle = float(i) * 6.28318 / 6.0 + time * 0.2;
        vec2 center = vec2(cos(angle), sin(angle)) * 0.2;
        float dist = length(p - center);
        pattern += (1.0 - smoothstep(0.18, 0.22, dist)) * 0.7;
      }
      
      // Outer ring of circles
      for (int i = 0; i < 12; i++) {
        float angle = float(i) * 6.28318 / 12.0 - time * 0.1;
        vec2 center = vec2(cos(angle), sin(angle)) * 0.4;
        float dist = length(p - center);
        pattern += (1.0 - smoothstep(0.15, 0.18, dist)) * 0.5;
      }
      
      return pattern;
    }
    
    void main() {
      vec2 uv = gl_FragCoord.xy / resolution.xy;
      vec2 p = (gl_FragCoord.xy - 0.5 * resolution.xy) / min(resolution.x, resolution.y);
      
      float animTime = time * speed;
      
      // Rotate the entire pattern
      p = rotate(p, animTime * 0.1);
      
      // Generate mandala pattern
      float mandalaPattern = mandala(p * 1.5, animTime);
      
      // Add flower of life geometry
      float flowerPattern = flowerOfLife(p * 2.0, animTime);
      
      // Fractal noise overlay
      float noise = fractalNoise(p * 3.0, animTime);
      
      // Combine patterns
      float combined = mandalaPattern * 0.6 + flowerPattern * 0.3 + noise * 0.1;
      
      // Breathing effect
      float breath = sin(animTime * 1.5) * 0.1 + 0.9;
      combined *= breath;
      
      // Radial fade
      float fade = 1.0 - smoothstep(0.3, 1.2, length(p));
      combined *= fade;
      
      // Energy pulses from center
      float pulse = sin(length(p) * 8.0 - animTime * 4.0) * 0.2 + 0.8;
      combined *= pulse;
      
      // Multi-layered color mapping
      float angle = atan(p.y, p.x);
      float hue = colorHue + angle / 6.28318 * 0.3 + animTime * 0.05;
      float sat = colorSaturation * (0.8 + 0.2 * sin(combined * 5.0));
      float val = intensity * combined;
      
      vec3 color = hsv2rgb(vec3(hue, sat, val));
      
      // Add golden highlights
      float highlight = smoothstep(0.7, 1.0, combined);
      color += vec3(1.0, 0.8, 0.4) * highlight * 0.4;
      
      // Subtle shimmer
      float shimmer = sin(p.x * 30.0 + animTime * 8.0) * sin(p.y * 30.0 + animTime * 6.0);
      shimmer = smoothstep(0.8, 1.0, shimmer);
      color += vec3(0.9, 0.9, 1.0) * shimmer * 0.2;
      
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
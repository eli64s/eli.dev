import { useEffect, useRef } from 'react';

interface FractalNoiseShaderProps {
  className?: string;
  speed?: number;
  colorHue?: number;
  colorSaturation?: number;
  intensity?: number;
}

export default function FractalNoiseShader({ 
  className = '', 
  speed = 1.0, 
  colorHue = 0.5, 
  colorSaturation = 0.8, 
  intensity = 1.0 
}: FractalNoiseShaderProps) {
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
    
    vec2 hash22(vec2 p) {
      p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
      return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
    }
    
    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      
      return mix(mix(dot(hash22(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)),
                     dot(hash22(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
                 mix(dot(hash22(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
                     dot(hash22(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x), u.y);
    }
    
    float fbm(vec2 p, int octaves) {
      float value = 0.0;
      float amplitude = 0.5;
      float frequency = 1.0;
      
      for (int i = 0; i < 8; i++) {
        if (i >= octaves) break;
        value += amplitude * noise(p * frequency);
        frequency *= 2.0;
        amplitude *= 0.5;
      }
      return value;
    }
    
    float turbulence(vec2 p, int octaves) {
      float value = 0.0;
      float amplitude = 0.5;
      float frequency = 1.0;
      
      for (int i = 0; i < 8; i++) {
        if (i >= octaves) break;
        value += amplitude * abs(noise(p * frequency));
        frequency *= 2.0;
        amplitude *= 0.5;
      }
      return value;
    }
    
    float ridgedNoise(vec2 p, int octaves) {
      float value = 0.0;
      float amplitude = 0.5;
      float frequency = 1.0;
      
      for (int i = 0; i < 8; i++) {
        if (i >= octaves) break;
        float n = noise(p * frequency);
        n = 1.0 - abs(n);
        n = n * n;
        value += amplitude * n;
        frequency *= 2.0;
        amplitude *= 0.5;
      }
      return value;
    }
    
    float warpedNoise(vec2 p, float time) {
      vec2 q = vec2(fbm(p + vec2(0.0, 0.0), 6),
                    fbm(p + vec2(5.2, 1.3), 6));
      
      vec2 r = vec2(fbm(p + 4.0 * q + vec2(1.7, 9.2) + time * 0.15, 6),
                    fbm(p + 4.0 * q + vec2(8.3, 2.8) + time * 0.126, 6));
      
      return fbm(p + 4.0 * r + time * 0.2, 6);
    }
    
    vec3 domainWarping(vec2 p, float time) {
      float pattern1 = warpedNoise(p * 2.0, time);
      float pattern2 = warpedNoise(p * 4.0 + 100.0, time * 1.3);
      float pattern3 = ridgedNoise(p * 8.0, 6) * 0.5;
      
      return vec3(pattern1, pattern2, pattern3);
    }
    
    void main() {
      vec2 uv = gl_FragCoord.xy / resolution.xy;
      vec2 p = (gl_FragCoord.xy - 0.5 * resolution.xy) / min(resolution.x, resolution.y);
      
      float animTime = time * speed;
      
      // Multi-scale domain warping
      vec3 patterns = domainWarping(p * 3.0, animTime);
      
      // Combine different noise types
      float base = patterns.x * 0.6 + patterns.y * 0.3 + patterns.z * 0.1;
      
      // Add fine detail layers
      float detail1 = turbulence(p * 16.0 + animTime * 0.1, 4) * 0.2;
      float detail2 = fbm(p * 32.0 - animTime * 0.05, 3) * 0.1;
      
      // Create flowing patterns
      vec2 flow = vec2(sin(animTime * 0.3), cos(animTime * 0.4)) * 2.0;
      float flowNoise = fbm(p * 6.0 + flow, 5) * 0.3;
      
      // Combine all patterns
      float combined = base + detail1 + detail2 + flowNoise;
      combined = smoothstep(-0.5, 1.0, combined);
      
      // Create energy pulses
      float pulse = sin(animTime * 2.0 + length(p) * 5.0) * 0.1 + 0.9;
      combined *= pulse;
      
      // Add swirling motion
      float angle = atan(p.y, p.x);
      float radius = length(p);
      float spiral = sin(angle * 3.0 + radius * 8.0 - animTime * 4.0) * 0.5 + 0.5;
      combined = mix(combined, spiral, 0.2);
      
      // Color mapping with complex hue shifts
      float hueShift = combined * 0.3 + animTime * 0.1 + angle * 0.1;
      float hue = colorHue + hueShift;
      float sat = colorSaturation * (0.7 + 0.3 * sin(combined * 6.0));
      float val = intensity * combined;
      
      vec3 color = hsv2rgb(vec3(hue, sat, val));
      
      // Add luminous highlights
      float highlight = smoothstep(0.8, 1.0, combined);
      color += vec3(1.0, 0.9, 0.8) * highlight * 0.3;
      
      // Atmospheric scattering effect
      float scatter = exp(-radius * 2.0) * 0.2;
      color += vec3(0.4, 0.6, 1.0) * scatter;
      
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
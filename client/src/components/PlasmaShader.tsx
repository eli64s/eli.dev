import { useEffect, useRef } from 'react';

interface PlasmaShaderProps {
  className?: string;
  speed?: number;
  colorHue?: number;
  colorSaturation?: number;
  intensity?: number;
}

export default function PlasmaShader({ 
  className = '', 
  speed = 1.0, 
  colorHue = 0.5, 
  colorSaturation = 0.8, 
  intensity = 1.0 
}: PlasmaShaderProps) {
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
    
    float plasma(vec2 p, float time) {
      float a = sin(p.x * 3.0 + time * 2.0);
      float b = sin(p.y * 4.0 + time * 1.5);
      float c = sin((p.x + p.y) * 2.0 + time * 3.0);
      float d = sin(sqrt(p.x * p.x + p.y * p.y) * 5.0 + time * 4.0);
      return (a + b + c + d) * 0.25;
    }
    
    float fbm(vec2 p, float time) {
      float value = 0.0;
      float amplitude = 0.5;
      float frequency = 1.0;
      
      for(int i = 0; i < 8; i++) {
        value += amplitude * sin(p.x * frequency + time) * cos(p.y * frequency + time * 1.3);
        frequency *= 2.0;
        amplitude *= 0.5;
        p = vec2(p.x * 1.3 - p.y * 0.7, p.y * 1.3 + p.x * 0.7);
      }
      return value;
    }
    
    void main() {
      vec2 uv = gl_FragCoord.xy / resolution.xy;
      vec2 p = (gl_FragCoord.xy - 0.5 * resolution.xy) / min(resolution.x, resolution.y);
      
      float animTime = time * speed;
      
      // Multiple plasma layers
      float plasma1 = plasma(p * 2.0, animTime);
      float plasma2 = plasma(p * 3.0 + vec2(100.0), animTime * 0.7);
      float plasma3 = fbm(p * 1.5, animTime * 0.5);
      
      // Combine plasmas
      float combined = (plasma1 + plasma2 * 0.7 + plasma3 * 0.5) * 0.6;
      
      // Create ripple effect
      float dist = length(p);
      float ripple = sin(dist * 8.0 - animTime * 6.0) * exp(-dist * 2.0);
      combined += ripple * 0.3;
      
      // Color mapping with HSV
      float hue = colorHue + combined * 0.2 + animTime * 0.1;
      float sat = colorSaturation * (0.8 + 0.2 * sin(combined * 5.0));
      float val = intensity * (0.5 + 0.5 * abs(combined));
      
      vec3 color = hsv2rgb(vec3(hue, sat, val));
      
      // Add glow effect
      float glow = 1.0 - smoothstep(0.0, 1.0, dist);
      color += vec3(0.1, 0.2, 0.4) * glow * intensity * 0.3;
      
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
import { useEffect, useRef } from 'react';

interface CyberGridShaderProps {
  className?: string;
  speed?: number;
  colorHue?: number;
  colorSaturation?: number;
  intensity?: number;
}

export default function CyberGridShader({ 
  className = '', 
  speed = 1.0, 
  colorHue = 0.5, 
  colorSaturation = 0.8, 
  intensity = 1.0 
}: CyberGridShaderProps) {
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
    
    float hash21(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }
    
    float grid(vec2 p, float scale) {
      vec2 gridLines = abs(fract(p * scale) - 0.5);
      return 1.0 - smoothstep(0.0, 0.05, min(gridLines.x, gridLines.y));
    }
    
    float hexGrid(vec2 p, float scale) {
      p *= scale;
      vec2 h = vec2(1.0, sqrt(3.0));
      vec2 a = mod(p, h) - h * 0.5;
      vec2 b = mod(p - h * 0.5, h) - h * 0.5;
      return length(a) < length(b) ? length(a) : length(b);
    }
    
    float tunnel(vec2 p, float time) {
      float angle = atan(p.y, p.x);
      float radius = length(p);
      
      vec2 tuv = vec2(angle / 6.28318, 1.0 / radius + time * 0.5);
      return sin(tuv.x * 20.0) * sin(tuv.y * 10.0);
    }
    
    void main() {
      vec2 uv = gl_FragCoord.xy / resolution.xy;
      vec2 p = (gl_FragCoord.xy - 0.5 * resolution.xy) / min(resolution.x, resolution.y);
      
      float animTime = time * speed;
      
      // Perspective grid effect
      float perspective = 1.0 / (1.0 + p.y * 0.5 + 1.0);
      vec2 gridUV = p * perspective + vec2(0.0, animTime * 2.0);
      
      // Multiple grid layers
      float mainGrid = grid(gridUV, 8.0);
      float fineGrid = grid(gridUV, 32.0) * 0.3;
      float hexPattern = 1.0 - smoothstep(0.0, 0.1, hexGrid(gridUV, 6.0));
      
      // Tunnel effect
      float tunnelEffect = tunnel(p, animTime * 0.1);
      
      // Data stream lines
      float stream1 = sin(p.x * 15.0 + animTime * 8.0) * exp(-abs(p.y + 0.3) * 10.0);
      float stream2 = sin(p.x * 12.0 - animTime * 6.0) * exp(-abs(p.y - 0.1) * 8.0);
      float streams = max(stream1, stream2) * 0.5;
      
      // Circuit patterns
      vec2 circuitUV = p * 5.0 + vec2(animTime * 0.2, 0.0);
      float circuit = 0.0;
      for(int i = 0; i < 3; i++) {
        vec2 id = floor(circuitUV);
        float rand = hash21(id + float(i));
        if(rand > 0.7) {
          vec2 local = fract(circuitUV) - 0.5;
          circuit += 1.0 - smoothstep(0.1, 0.2, abs(local.x)) * smoothstep(0.3, 0.4, abs(local.y));
        }
        circuitUV *= 1.3;
      }
      
      // Combine all effects
      float combined = mainGrid + fineGrid + hexPattern * 0.5 + streams + circuit * 0.3;
      combined += tunnelEffect * 0.2;
      
      // Distance fade
      float fade = 1.0 - smoothstep(0.5, 1.5, length(p));
      combined *= fade;
      
      // Scan line effect
      float scanlines = sin(uv.y * resolution.y * 2.0) * 0.1 + 0.9;
      combined *= scanlines;
      
      // Color mapping
      float hue = colorHue + combined * 0.1 + animTime * 0.05;
      float sat = colorSaturation * (0.7 + 0.3 * combined);
      float val = intensity * combined;
      
      vec3 color = hsv2rgb(vec3(hue, sat, val));
      
      // Add glow
      color += vec3(0.0, 0.2, 0.4) * combined * 0.3;
      
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
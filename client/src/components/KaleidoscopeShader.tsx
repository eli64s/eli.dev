import { useEffect, useRef } from 'react';

interface KaleidoscopeShaderProps {
  className?: string;
  speed?: number;
  colorHue?: number;
  colorSaturation?: number;
  intensity?: number;
}

export default function KaleidoscopeShader({ 
  className = '', 
  speed = 1.0, 
  colorHue = 0.5, 
  colorSaturation = 0.8, 
  intensity = 1.0 
}: KaleidoscopeShaderProps) {
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
    
    float kaleidoscope(vec2 p, int segments) {
      float angle = 6.28318 / float(segments);
      float a = atan(p.y, p.x);
      float r = length(p);
      
      // Fold into one segment
      a = mod(a, angle);
      if (a > angle * 0.5) {
        a = angle - a;
      }
      
      p = vec2(cos(a), sin(a)) * r;
      return length(p);
    }
    
    vec2 kaleidoscopeUV(vec2 p, int segments) {
      float angle = 6.28318 / float(segments);
      float a = atan(p.y, p.x);
      float r = length(p);
      
      a = mod(a, angle);
      if (a > angle * 0.5) {
        a = angle - a;
      }
      
      return vec2(cos(a), sin(a)) * r;
    }
    
    float mandala(vec2 p, float time) {
      float d = length(p);
      float a = atan(p.y, p.x);
      
      // Radial segments
      float segments = 8.0;
      float segmentAngle = 6.28318 / segments;
      a = mod(a + time * 0.1, segmentAngle);
      
      // Create symmetrical pattern
      if (a > segmentAngle * 0.5) {
        a = segmentAngle - a;
      }
      
      vec2 polar = vec2(cos(a) * d, sin(a) * d);
      
      // Concentric circles
      float rings = sin(d * 10.0 - time * 2.0) * 0.5 + 0.5;
      
      // Radial lines
      float spokes = sin(a * segments * 2.0 + time) * 0.5 + 0.5;
      
      // Combine patterns
      return rings * spokes;
    }
    
    float fractalPattern(vec2 p, float time) {
      float pattern = 0.0;
      float scale = 1.0;
      
      for (int i = 0; i < 6; i++) {
        vec2 kp = kaleidoscopeUV(p * scale, 6);
        
        // Add rotating elements
        kp = rotate(kp, time * 0.5 + float(i) * 0.5);
        
        // Create geometric shapes
        float shape = abs(sin(kp.x * 5.0)) * abs(cos(kp.y * 5.0));
        shape = smoothstep(0.3, 0.7, shape);
        
        pattern += shape / scale;
        scale *= 2.0;
        p = rotate(p, 0.7);
      }
      
      return pattern;
    }
    
    void main() {
      vec2 uv = gl_FragCoord.xy / resolution.xy;
      vec2 p = (gl_FragCoord.xy - 0.5 * resolution.xy) / min(resolution.x, resolution.y);
      
      float animTime = time * speed;
      
      // Create kaleidoscope effect
      vec2 kp = kaleidoscopeUV(p * 2.0, 12);
      
      // Rotate the pattern
      kp = rotate(kp, animTime * 0.3);
      
      // Generate mandala pattern
      float mandalaPattern = mandala(kp, animTime);
      
      // Add fractal details
      float fractal = fractalPattern(kp * 0.5, animTime);
      
      // Combine patterns
      float combined = mandalaPattern * 0.7 + fractal * 0.3;
      
      // Add radial gradient
      float radial = 1.0 - smoothstep(0.0, 1.0, length(p));
      combined *= radial;
      
      // Pulsing effect
      float pulse = sin(animTime * 3.0 + length(p) * 5.0) * 0.2 + 0.8;
      combined *= pulse;
      
      // Color mapping with multiple hues
      float angle = atan(p.y, p.x);
      float hue = colorHue + angle / 6.28318 + animTime * 0.1;
      float sat = colorSaturation * (0.7 + 0.3 * combined);
      float val = intensity * combined;
      
      vec3 color = hsv2rgb(vec3(hue, sat, val));
      
      // Add bright accents
      float accent = smoothstep(0.8, 1.0, combined);
      color += vec3(1.0, 0.9, 0.7) * accent * 0.5;
      
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
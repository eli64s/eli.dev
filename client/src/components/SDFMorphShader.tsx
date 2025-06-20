import { useEffect, useRef } from 'react';

interface SDFMorphShaderProps {
  className?: string;
  speed?: number;
  colorHue?: number;
  colorSaturation?: number;
  intensity?: number;
}

export default function SDFMorphShader({ 
  className = '', 
  speed = 1.0, 
  colorHue = 0.5, 
  colorSaturation = 0.8, 
  intensity = 1.0 
}: SDFMorphShaderProps) {
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
    
    // Smooth minimum operations from IQ's work
    float sminExp(float a, float b, float k) {
      float r = exp2(-a/k) + exp2(-b/k);
      return -k * log2(r);
    }
    
    float sminPoly(float a, float b, float k) {
      float h = max(k - abs(a - b), 0.0) / k;
      return min(a, b) - h * h * k * 0.25;
    }
    
    float sminCubic(float a, float b, float k) {
      float h = max(k - abs(a - b), 0.0) / k;
      return min(a, b) - h * h * h * k * (1.0/6.0);
    }
    
    // SDF primitives
    float sdSphere(vec2 p, float r) {
      return length(p) - r;
    }
    
    float sdBox(vec2 p, vec2 b) {
      vec2 d = abs(p) - b;
      return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
    }
    
    float sdRoundBox(vec2 p, vec2 b, float r) {
      vec2 q = abs(p) - b + r;
      return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
    }
    
    float sdHexagon(vec2 p, float r) {
      vec2 q = abs(p);
      float c = dot(q, normalize(vec2(1.0, 1.732)));
      return max(c, q.x) - r;
    }
    
    float sdStar(vec2 p, float r, int n, float m) {
      float an = 3.14159 / float(n);
      float en = 3.14159 / m;
      vec2 acs = vec2(cos(an), sin(an));
      vec2 ecs = vec2(cos(en), sin(en));
      
      float bn = mod(atan(p.x, p.y), 2.0 * an) - an;
      p = length(p) * vec2(cos(bn), abs(sin(bn)));
      p -= r * acs;
      p += ecs * clamp(-dot(p, ecs), 0.0, r * acs.y / ecs.y);
      return length(p) * sign(p.x);
    }
    
    // Complex morphing scene
    float morphingScene(vec2 p, float time) {
      float t = time * speed;
      
      // Base transformations
      p = rotate(p, t * 0.1);
      
      // Multiple morphing shapes
      float morph1 = sin(t * 0.8) * 0.5 + 0.5;
      float morph2 = sin(t * 1.2 + 1.0) * 0.5 + 0.5;
      float morph3 = sin(t * 0.6 + 2.0) * 0.5 + 0.5;
      
      // Shape 1: Morphing between sphere and box
      vec2 p1 = p - vec2(0.3, 0.0);
      p1 = rotate(p1, t * 0.5);
      float sphere1 = sdSphere(p1, 0.15);
      float box1 = sdBox(p1, vec2(0.12));
      float shape1 = mix(sphere1, box1, morph1);
      
      // Shape 2: Star morphing
      vec2 p2 = p + vec2(0.3, 0.0);
      p2 = rotate(p2, -t * 0.7);
      float star1 = sdStar(p2, 0.15, 5, 2.0);
      float hex1 = sdHexagon(p2, 0.15);
      float shape2 = mix(star1, hex1, morph2);
      
      // Shape 3: Central morphing element
      vec2 p3 = p + vec2(0.0, 0.4);
      p3 = rotate(p3, t * 0.3);
      float box3 = sdRoundBox(p3, vec2(0.1), 0.05);
      float sphere3 = sdSphere(p3, 0.12);
      float shape3 = mix(box3, sphere3, morph3);
      
      // Combine with smooth unions
      float combined = sminCubic(shape1, shape2, 0.1);
      combined = sminPoly(combined, shape3, 0.15);
      
      // Add distortion waves
      float distortion = sin(p.x * 8.0 + t * 2.0) * sin(p.y * 6.0 + t * 1.5) * 0.02;
      combined += distortion;
      
      return combined;
    }
    
    void main() {
      vec2 uv = gl_FragCoord.xy / resolution.xy;
      vec2 p = (gl_FragCoord.xy - 0.5 * resolution.xy) / min(resolution.x, resolution.y);
      
      float animTime = time * speed;
      
      // Create the morphing SDF scene
      float dist = morphingScene(p, animTime);
      
      // Add fractal detail
      for (int i = 0; i < 4; i++) {
        float scale = pow(2.0, float(i));
        vec2 q = p * scale + animTime * 0.1 * scale;
        q = rotate(q, float(i) * 0.5);
        float detail = morphingScene(q, animTime * (1.0 + float(i) * 0.3)) / scale;
        dist = sminExp(dist, detail, 0.05);
      }
      
      // Convert distance to color
      float edge = 1.0 - smoothstep(0.0, 0.02, abs(dist));
      float fill = 1.0 - smoothstep(0.0, 0.0, dist);
      
      // Create glow effect
      float glow = exp(-abs(dist) * 20.0) * 0.5;
      
      // Animate color based on distance and position
      float colorShift = dist * 5.0 + animTime * 0.3 + length(p) * 2.0;
      float hue = colorHue + colorShift * 0.1;
      float sat = colorSaturation * (0.8 + 0.2 * sin(colorShift * 3.0));
      float val = intensity * (edge * 0.8 + fill * 0.3 + glow);
      
      vec3 color = hsv2rgb(vec3(hue, sat, val));
      
      // Add chromatic aberration effect
      float aberration = abs(dist) * 2.0;
      color.r *= 1.0 + aberration * 0.1;
      color.b *= 1.0 - aberration * 0.1;
      
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
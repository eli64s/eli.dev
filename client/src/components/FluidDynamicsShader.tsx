import { useEffect, useRef } from 'react';

interface FluidDynamicsShaderProps {
  className?: string;
  speed?: number;
  colorHue?: number;
  colorSaturation?: number;
  intensity?: number;
}

export default function FluidDynamicsShader({ 
  className = '', 
  speed = 1.0, 
  colorHue = 0.5, 
  colorSaturation = 0.8, 
  intensity = 1.0 
}: FluidDynamicsShaderProps) {
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
    
    vec2 curl(vec2 p, float t) {
      float eps = 0.01;
      float n1 = noise(p + vec2(eps, 0.0) + t);
      float n2 = noise(p - vec2(eps, 0.0) + t);
      float n3 = noise(p + vec2(0.0, eps) + t);
      float n4 = noise(p - vec2(0.0, eps) + t);
      
      float dx = (n1 - n2) / (2.0 * eps);
      float dy = (n3 - n4) / (2.0 * eps);
      
      return vec2(dy, -dx);
    }
    
    vec2 fluidVelocity(vec2 p, float t) {
      vec2 velocity = vec2(0.0);
      
      // Multiple vortex sources
      vec2 vortex1 = vec2(sin(t * 0.3) * 0.5, cos(t * 0.4) * 0.3);
      vec2 vortex2 = vec2(cos(t * 0.5) * 0.4, sin(t * 0.6) * 0.5);
      vec2 vortex3 = vec2(sin(t * 0.2) * 0.3, cos(t * 0.3) * 0.4);
      
      // Distance-based vortex influence
      float d1 = length(p - vortex1);
      float d2 = length(p - vortex2);
      float d3 = length(p - vortex3);
      
      // Vortex strength with distance falloff
      float strength1 = 0.5 / (1.0 + d1 * d1 * 4.0);
      float strength2 = 0.4 / (1.0 + d2 * d2 * 3.0);
      float strength3 = 0.3 / (1.0 + d3 * d3 * 5.0);
      
      // Rotational velocity around vortices
      vec2 dir1 = normalize(p - vortex1);
      vec2 dir2 = normalize(p - vortex2);
      vec2 dir3 = normalize(p - vortex3);
      
      velocity += strength1 * vec2(-dir1.y, dir1.x);
      velocity += strength2 * vec2(dir2.y, -dir2.x);
      velocity += strength3 * vec2(-dir3.y, dir3.x);
      
      // Add curl noise for turbulence
      velocity += curl(p * 2.0, t * 0.1) * 0.2;
      velocity += curl(p * 4.0, t * 0.15) * 0.1;
      
      return velocity;
    }
    
    float divergence(vec2 p, float t) {
      float eps = 0.01;
      vec2 v1 = fluidVelocity(p + vec2(eps, 0.0), t);
      vec2 v2 = fluidVelocity(p - vec2(eps, 0.0), t);
      vec2 v3 = fluidVelocity(p + vec2(0.0, eps), t);
      vec2 v4 = fluidVelocity(p - vec2(0.0, eps), t);
      
      float dvx = (v1.x - v2.x) / (2.0 * eps);
      float dvy = (v3.y - v4.y) / (2.0 * eps);
      
      return dvx + dvy;
    }
    
    float pressure(vec2 p, float t) {
      return -divergence(p, t) * 0.5;
    }
    
    vec3 fluidSimulation(vec2 p, float t) {
      vec2 velocity = fluidVelocity(p, t);
      float press = pressure(p, t);
      float vorticity = length(curl(p, t));
      
      // Advect particles through velocity field
      vec2 advected = p;
      float dt = 0.016;
      for (int i = 0; i < 8; i++) {
        vec2 vel = fluidVelocity(advected, t - dt * float(i));
        advected -= vel * dt * 0.1;
      }
      
      // Sample noise at advected position for density
      float density = noise(advected * 3.0 + t * 0.2) * 0.5 + 0.5;
      density += noise(advected * 6.0 + t * 0.3) * 0.25;
      density += noise(advected * 12.0 + t * 0.4) * 0.125;
      
      // Enhance density based on fluid properties
      density *= (1.0 + vorticity * 2.0);
      density *= (1.0 + abs(press) * 3.0);
      
      return vec3(density, length(velocity), vorticity);
    }
    
    void main() {
      vec2 uv = gl_FragCoord.xy / resolution.xy;
      vec2 p = (gl_FragCoord.xy - 0.5 * resolution.xy) / min(resolution.x, resolution.y);
      
      float animTime = time * speed;
      
      // Simulate fluid dynamics
      vec3 fluid = fluidSimulation(p, animTime);
      float density = fluid.x;
      float velocityMag = fluid.y;
      float vorticity = fluid.z;
      
      // Add temperature-like effects
      float temperature = density + velocityMag * 0.5;
      temperature += sin(animTime + length(p) * 4.0) * 0.1;
      
      // Create heat distortion effect
      vec2 distortion = fluidVelocity(p, animTime) * 0.02;
      vec2 distortedP = p + distortion;
      vec3 distortedFluid = fluidSimulation(distortedP, animTime);
      
      // Blend original and distorted
      density = mix(density, distortedFluid.x, 0.3);
      
      // Add buoyancy effects
      float buoyancy = temperature * (1.0 - uv.y) * 0.5;
      density += buoyancy;
      
      // Create smoke-like trails
      float trails = 0.0;
      for (int i = 0; i < 5; i++) {
        float trailTime = animTime - float(i) * 0.2;
        vec2 trailPos = p + fluidVelocity(p, trailTime) * 0.1 * float(i);
        trails += exp(-length(trailPos) * 2.0) * 0.2;
      }
      density += trails;
      
      // Smooth density transitions
      density = smoothstep(0.0, 1.0, density);
      
      // Color mapping based on fluid properties
      float hue = colorHue + temperature * 0.2 + vorticity * 0.3;
      float sat = colorSaturation * (0.6 + 0.4 * velocityMag);
      float val = intensity * density;
      
      vec3 color = hsv2rgb(vec3(hue, sat, val));
      
      // Add energy visualization
      float energy = velocityMag + vorticity * 0.5;
      color += vec3(1.0, 0.6, 0.2) * energy * 0.3;
      
      // Add pressure visualization
      float pressureVis = abs(pressure(p, animTime));
      color += vec3(0.2, 0.4, 1.0) * pressureVis * 0.2;
      
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
import { useEffect, useRef } from 'react';

interface TurbulenceShaderProps {
  className?: string;
  speed?: number;
  colorHue?: number;
  colorSaturation?: number;
  intensity?: number;
}

export default function TurbulenceShader({ 
  className = '', 
  speed = 1.0,
  colorHue = 200,
  colorSaturation = 80,
  intensity = 1.0
}: TurbulenceShaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

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
    const vertexShaderSource = `
      attribute vec2 a_position;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const fragmentShaderSource = `
      precision mediump float;
      uniform vec2 u_resolution;
      uniform float u_time;
      uniform float u_speed;
      uniform float u_hue;
      uniform float u_saturation;
      uniform float u_intensity;

      // Number of turbulence waves
      #define TURB_NUM 12.0
      // Turbulence wave amplitude
      #define TURB_AMP 0.6
      // Turbulence frequency
      #define TURB_FREQ 3.0
      // Turbulence frequency multiplier
      #define TURB_EXP 1.4

      // HSV to RGB conversion
      vec3 hsv2rgb(vec3 c) {
        vec4 K = vec4(1.0, 2.0/3.0, 1.0/3.0, 3.0);
        vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
        return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
      }

      // Apply turbulence to coordinates
      vec2 turbulence(vec2 p, float time) {
        float freq = TURB_FREQ;
        mat2 rot = mat2(0.6, -0.8, 0.8, 0.6);
        
        for(float i = 0.0; i < TURB_NUM; i++) {
          float phase = freq * (p * rot).y + time * u_speed * 2.0 + i;
          p += TURB_AMP * rot[0] * sin(phase) / freq;
          
          rot *= mat2(0.6, -0.8, 0.8, 0.6);
          freq *= TURB_EXP;
        }
        
        return p;
      }

      // Multi-scale noise function
      float noise(vec2 p) {
        return sin(p.x * 0.5) * cos(p.y * 0.7) + 
               sin(p.x * 1.2) * cos(p.y * 1.1) * 0.5 +
               sin(p.x * 2.1) * cos(p.y * 2.3) * 0.25;
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.x, u_resolution.y);
        
        // Scale coordinates for better turbulence visualization
        vec2 p = uv * 2.0;
        
        // Apply turbulence transformation
        vec2 turbPos = turbulence(p, u_time);
        
        // Create flowing patterns using the turbulent coordinates
        float pattern1 = sin(turbPos.x * 3.0) * cos(turbPos.y * 2.0);
        float pattern2 = sin(turbPos.x * 1.5 + u_time * u_speed) * sin(turbPos.y * 1.8);
        float pattern3 = cos(length(turbPos) * 4.0 - u_time * u_speed * 2.0);
        
        // Combine patterns with noise
        float combined = (pattern1 + pattern2 * 0.7 + pattern3 * 0.5) * 0.5 + 0.5;
        combined += noise(turbPos * 2.0) * 0.3;
        
        // Add flowing motion
        float flow = sin(turbPos.x * 2.0 + u_time * u_speed) * 
                    cos(turbPos.y * 1.5 + u_time * u_speed * 0.8);
        combined += flow * 0.4;
        
        // Create smooth gradients
        float gradient = 1.0 - length(uv) * 0.8;
        combined *= gradient;
        
        // Dynamic color mapping
        float baseHue = u_hue / 360.0;
        float hueShift = combined * 0.3 + sin(u_time * u_speed * 0.5) * 0.1;
        float finalHue = fract(baseHue + hueShift);
        
        // Saturation varies with pattern intensity
        float sat = u_saturation / 100.0 * (0.7 + combined * 0.3);
        
        // Brightness with turbulent variation
        float brightness = u_intensity * (0.4 + combined * 0.6);
        brightness *= (0.8 + sin(u_time * u_speed * 0.3) * 0.2);
        
        vec3 color = hsv2rgb(vec3(finalHue, sat, brightness));
        
        // Add atmospheric glow
        float glow = exp(-length(uv) * 2.0) * 0.3;
        color += vec3(glow * u_intensity);
        
        // Smooth edges
        float edge = smoothstep(1.5, 1.0, length(uv));
        color *= edge;
        
        gl_FragColor = vec4(color, 1.0);
      }
    `;

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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl');
    if (!gl) return;

    const program = createProgram(gl);
    if (!program) return;

    // Create buffer
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    
    const positions = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
       1,  1,
    ]);
    
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    // Get attribute and uniform locations
    const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
    const resolutionUniformLocation = gl.getUniformLocation(program, 'u_resolution');
    const timeUniformLocation = gl.getUniformLocation(program, 'u_time');
    const speedUniformLocation = gl.getUniformLocation(program, 'u_speed');
    const hueUniformLocation = gl.getUniformLocation(program, 'u_hue');
    const saturationUniformLocation = gl.getUniformLocation(program, 'u_saturation');
    const intensityUniformLocation = gl.getUniformLocation(program, 'u_intensity');

    const render = (time: number) => {
      // Resize canvas to match display size
      const displayWidth = canvas.clientWidth;
      const displayHeight = canvas.clientHeight;

      if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
      }

      // Clear and setup
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(program);

      // Set uniforms
      gl.uniform2f(resolutionUniformLocation, canvas.width, canvas.height);
      gl.uniform1f(timeUniformLocation, time * 0.001);
      gl.uniform1f(speedUniformLocation, speed);
      gl.uniform1f(hueUniformLocation, colorHue);
      gl.uniform1f(saturationUniformLocation, colorSaturation);
      gl.uniform1f(intensityUniformLocation, intensity);

      // Setup attributes
      gl.enableVertexAttribArray(positionAttributeLocation);
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

      // Draw
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      animationRef.current = requestAnimationFrame(render);
    };

    animationRef.current = requestAnimationFrame(render);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [speed, colorHue, colorSaturation, intensity]);

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full ${className}`}
      style={{ display: 'block' }}
    />
  );
}
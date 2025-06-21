import React, { useEffect, useRef } from 'react';

interface BubbleColorsShaderProps {
  className?: string;
  speed?: number;
  colorHue?: number;
  colorSaturation?: number;
  intensity?: number;
}

export default function BubbleColorsShader({
  className = "",
  speed = 1.0,
  colorHue = 0,
  colorSaturation = 1.0,
  intensity = 1.0
}: BubbleColorsShaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const programRef = useRef<WebGLProgram | null>(null);
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
      attribute vec4 a_position;
      void main() {
        gl_Position = a_position;
      }
    `;

    const fragmentShaderSource = `
      precision highp float;
      uniform vec2 u_resolution;
      uniform float u_time;
      uniform float u_speed;
      uniform float u_hue;
      uniform float u_saturation;
      uniform float u_intensity;

      // HSV to RGB conversion
      vec3 hsv2rgb(vec3 c) {
        vec4 K = vec4(1.0, 2.0/3.0, 1.0/3.0, 3.0);
        vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
        return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
      }

      void main() {
        vec2 u = gl_FragCoord.xy;
        vec4 o = vec4(0.0);
        
        float i = 0.0;
        float r, s, d = 0.0, n, t = u_time * u_speed;
        vec3 p = vec3(u_resolution, 0.0);
        
        u = (u - p.xy / 2.0) / p.y;
        
        // Main raymarching loop - simplified from original golf code
        for (int iter = 0; iter < 90; iter++) {
          float fi = float(iter);
          if (fi >= 90.0) break;
          
          // Distance field calculation
          s = 0.005 + abs(r) * 0.2;
          d += s;
          
          // Color accumulation with bubble-like coloring
          vec4 colorContrib = (1.0 + cos(0.1 * p.z + vec4(3.0, 1.0, 0.0, 0.0))) / s;
          o += colorContrib;
          
          // Raymarching position
          p = vec3(u * d, d + t * 16.0);
          
          // Distance field function - creates bubble-like shapes
          r = 50.0 - abs(p.y) + cos(t - dot(u, u) * 6.0) * 3.3;
          
          // Noise octaves for detail
          for (n = 0.08; n < 0.8; n *= 1.4) {
            r -= abs(dot(sin(0.3 * t + 0.8 * p * n), vec3(0.7) + p - p)) / n;
          }
        }
        
        // Manual tanh implementation for WebGL compatibility
        float safe_tanh_scalar(float x) {
          float e2x = exp(2.0 * x);
          return (e2x - 1.0) / (e2x + 1.0);
        }
        
        vec4 safe_tanh_vec4(vec4 v) {
          return vec4(
            safe_tanh_scalar(v.x),
            safe_tanh_scalar(v.y), 
            safe_tanh_scalar(v.z),
            safe_tanh_scalar(v.w)
          );
        }
        
        // Final color processing
        o = safe_tanh_vec4(o / 2000.0);
        
        // Apply user controls
        vec3 finalColor = o.rgb * u_intensity;
        
        // Apply hue shift
        vec3 hsv = vec3(u_hue / 360.0, 1.0, 1.0);
        vec3 hueShift = hsv2rgb(hsv);
        finalColor *= hueShift;
        
        // Apply saturation
        float gray = dot(finalColor, vec3(0.299, 0.587, 0.114));
        finalColor = mix(vec3(gray), finalColor, u_saturation);
        
        gl_FragColor = vec4(finalColor, 1.0);
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
    if (!gl) {
      console.error('WebGL not supported');
      return;
    }

    const program = createProgram(gl);
    if (!program) return;

    programRef.current = program;

    // Create buffer for a full-screen quad
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1,
      1, -1,
      -1, 1,
      1, 1,
    ]), gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
    const timeLocation = gl.getUniformLocation(program, 'u_time');
    const speedLocation = gl.getUniformLocation(program, 'u_speed');
    const hueLocation = gl.getUniformLocation(program, 'u_hue');
    const saturationLocation = gl.getUniformLocation(program, 'u_saturation');
    const intensityLocation = gl.getUniformLocation(program, 'u_intensity');

    const render = (time: number) => {
      if (!canvas || !gl || !program) return;

      // Resize canvas to match display size
      const displayWidth = canvas.clientWidth;
      const displayHeight = canvas.clientHeight;

      if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
      }

      gl.viewport(0, 0, canvas.width, canvas.height);

      gl.useProgram(program);

      // Set up the position attribute
      gl.enableVertexAttribArray(positionLocation);
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

      // Set uniforms
      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
      gl.uniform1f(timeLocation, time * 0.001);
      gl.uniform1f(speedLocation, speed);
      gl.uniform1f(hueLocation, colorHue);
      gl.uniform1f(saturationLocation, colorSaturation);
      gl.uniform1f(intensityLocation, intensity);

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
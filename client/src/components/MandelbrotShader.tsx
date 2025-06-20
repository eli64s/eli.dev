import { useEffect, useRef } from 'react';

interface MandelbrotShaderProps {
  className?: string;
  speed?: number;
  colorHue?: number;
  colorSaturation?: number;
  intensity?: number;
}

export default function MandelbrotShader({ 
  className = '',
  speed = 1.0,
  colorHue = 0.5,
  colorSaturation = 0.8,
  intensity = 1.0
}: MandelbrotShaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const programRef = useRef<WebGLProgram | null>(null);
  const startTimeRef = useRef<number>(Date.now());

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
      uniform float u_colorHue;
      uniform float u_colorSaturation;
      uniform float u_intensity;

      vec3 hsv2rgb(vec3 c) {
        vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
        vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
        return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
      }

      vec2 complexMul(vec2 a, vec2 b) {
        return vec2(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x);
      }

      vec2 complexPow(vec2 z, float n) {
        float r = length(z);
        float theta = atan(z.y, z.x);
        return pow(r, n) * vec2(cos(n * theta), sin(n * theta));
      }

      float mandelbrot(vec2 c, float time) {
        vec2 z = vec2(0.0);
        float iterations = 0.0;
        float maxIter = 100.0;
        
        // Add time-based morphing
        float morph = sin(time * 0.3) * 0.1;
        c += vec2(morph, morph * 0.7);
        
        for (float i = 0.0; i < 100.0; i++) {
          if (length(z) > 2.0) break;
          
          // Dynamic power variation
          float power = 2.0 + sin(time * 0.5 + c.x * 2.0) * 0.5;
          z = complexPow(z, power) + c;
          
          iterations = i;
        }
        
        // Smooth coloring
        if (length(z) > 2.0) {
          iterations += 1.0 - log2(log2(length(z)));
        }
        
        return iterations / maxIter;
      }

      float julia(vec2 z, float time) {
        // Animated Julia constant
        vec2 c = vec2(
          -0.8 + sin(time * 0.4) * 0.2,
          0.156 + cos(time * 0.3) * 0.1
        );
        
        float iterations = 0.0;
        float maxIter = 80.0;
        
        for (float i = 0.0; i < 80.0; i++) {
          if (length(z) > 2.0) break;
          
          // Burning ship variation
          z = vec2(abs(z.x), abs(z.y));
          z = complexMul(z, z) + c;
          
          iterations = i;
        }
        
        if (length(z) > 2.0) {
          iterations += 1.0 - log2(log2(length(z)));
        }
        
        return iterations / maxIter;
      }

      void main() {
        vec2 fragCoord = gl_FragCoord.xy;
        vec2 resolution = u_resolution.xy;
        
        // Complex plane mapping with zoom
        float zoom = 1.0 + sin(u_time * u_speed * 0.2) * 0.5;
        vec2 uv = (fragCoord - resolution * 0.5) / min(resolution.x, resolution.y) * 3.0 / zoom;
        
        float time = u_time * u_speed;
        
        // Blend multiple fractal types
        float m = mandelbrot(uv, time);
        float j = julia(uv + vec2(0.5, 0.0), time);
        
        // Combine fractals with time-based mixing
        float mixFactor = sin(time * 0.25) * 0.5 + 0.5;
        float fractal = mix(m, j, mixFactor);
        
        // Multi-layered coloring
        vec3 color1 = hsv2rgb(vec3(
          u_colorHue + fractal * 0.3 + time * 0.1,
          u_colorSaturation * (0.7 + fractal * 0.3),
          0.5 + fractal * 0.5
        ));
        
        vec3 color2 = hsv2rgb(vec3(
          u_colorHue + 0.3 + fractal * 0.5,
          u_colorSaturation * 0.8,
          0.3 + fractal * 0.7
        ));
        
        // Detail enhancement
        float detail = sin(fractal * 50.0 + time) * 0.1 + 0.9;
        vec3 finalColor = mix(color1, color2, sin(fractal * 10.0 + time * 2.0) * 0.5 + 0.5);
        finalColor *= detail;
        
        // Edge detection for sharp boundaries
        vec2 eps = vec2(1.0) / resolution;
        float edge = abs(mandelbrot(uv + eps.xy, time) - mandelbrot(uv - eps.xy, time));
        edge += abs(mandelbrot(uv + eps.yx, time) - mandelbrot(uv - eps.yx, time));
        
        finalColor += vec3(edge * 2.0) * u_intensity;
        finalColor *= u_intensity;
        
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

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1, 1, -1, -1, 1, 1, 1,
    ]), gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
    const timeLocation = gl.getUniformLocation(program, 'u_time');
    const speedLocation = gl.getUniformLocation(program, 'u_speed');
    const colorHueLocation = gl.getUniformLocation(program, 'u_colorHue');
    const colorSaturationLocation = gl.getUniformLocation(program, 'u_colorSaturation');
    const intensityLocation = gl.getUniformLocation(program, 'u_intensity');

    const render = () => {
      if (!gl || !program) return;

      const displayWidth = canvas.clientWidth;
      const displayHeight = canvas.clientHeight;
      
      if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
      }

      gl.useProgram(program);
      
      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
      gl.uniform1f(timeLocation, (Date.now() - startTimeRef.current) / 1000);
      gl.uniform1f(speedLocation, speed);
      gl.uniform1f(colorHueLocation, colorHue);
      gl.uniform1f(colorSaturationLocation, colorSaturation);
      gl.uniform1f(intensityLocation, intensity);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      
      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [speed, colorHue, colorSaturation, intensity]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full ${className}`}
      style={{ width: '100%', height: '100%' }}
    />
  );
}
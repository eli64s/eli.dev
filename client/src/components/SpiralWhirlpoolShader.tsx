import React, { useEffect, useRef } from 'react';

interface SpiralWhirlpoolShaderProps {
  className?: string;
  speed?: number;
  colorHue?: number;
  colorSaturation?: number;
  intensity?: number;
}

export default function SpiralWhirlpoolShader({ 
  className = "", 
  speed = 1.0,
  colorHue = 0,
  colorSaturation = 1.0,
  intensity = 1.0
}: SpiralWhirlpoolShaderProps) {
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

      #define T (u_time * u_speed * 5.0)
      
      // Rotation matrix
      mat2 rotMatrix(float angle) {
        float c = cos(angle);
        float s = sin(angle);
        return mat2(c, -s, s, c);
      }
      
      // Hue to RGB conversion  
      vec3 hue2rgb(float h) {
        return cos((h + 0.5) * 6.2832 + vec3(1.047, 0.0, -1.047)) * 0.5 + 0.5;
      }
      
      // Manual tanh implementation for WebGL compatibility
      float safe_tanh(float x) {
        float e2x = exp(2.0 * x);
        return (e2x - 1.0) / (e2x + 1.0);
      }

      float map(vec3 u) {
        float t = T;
        float l = 5.0;
        float w = 40.0;
        float s = 0.4;
        float f = 1e20;
        float y, z;
        
        u.yz = -u.zy;
        u.xy = vec2(atan(u.x, u.y), length(u.xy));
        u.x += t / 6.0;
        
        vec3 p;
        for (int iter = 0; iter < 5; iter++) {
          float i = float(iter) + 1.0;
          p = u;
          y = floor(max(p.y - i, 0.0) / l) * l + i;
          p.x *= y;
          p.x -= sqrt(y * t * t * 2.0);
          p.x -= floor(p.x / 6.2832) * 6.2832;
          p.y -= y;
          p.z += sqrt(y / w) * w;
          z = cos(y * t / 50.0) * 0.5 + 0.5;
          p.z += z * 2.0;
          p = abs(p);
          f = min(f, max(p.x, max(p.y, p.z)) - s * z);
        }
        
        return f;
      }

      void main() {
        vec2 R = u_resolution.xy;
        vec2 U = gl_FragCoord.xy;
        
        vec2 m = vec2(0.0, -0.17);
        
        vec3 o = vec3(0.0, 20.0, -120.0);
        vec3 rayDir = normalize(vec3(U - R / 2.0, R.y));
        vec3 c = vec3(0.0);
        
        mat2 v = rotMatrix(m.y * 3.1416);
        mat2 h = rotMatrix(m.x * 3.1416);
        
        float d = 0.0;
        for (int iter = 0; iter < 50; iter++) {
          vec3 p = rayDir * d + o;
          vec2 pyz = v * p.yz;
          p.yz = pyz;
          vec2 pxz = h * p.xz;
          p.xz = pxz;
          
          float s = map(p);
          float r = (cos(floor(length(p.xz)) * T / 50.0) * 0.7 - 1.8) / 2.0;
          
          vec3 colorContrib = min(s, exp(-s / 0.07)) * hue2rgb(r + 0.5) * (r + 2.4);
          c += colorContrib;
          
          if (s < 1e-3 || d > 1e3) break;
          d += s * 0.7;
        }
        
        vec3 finalColor = exp(log(max(c, vec3(0.001))) / 2.2);
        finalColor *= u_intensity;
        
        // Simple hue shift using rotation
        float hueShift = u_hue * 0.0174533; // degrees to radians
        vec3 k = vec3(0.57735, 0.57735, 0.57735); // normalized (1,1,1)
        finalColor = finalColor * cos(hueShift) + cross(k, finalColor) * sin(hueShift) + k * dot(k, finalColor) * (1.0 - cos(hueShift));
        
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
      -1,  1,
       1,  1,
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
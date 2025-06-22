import { useEffect, useRef } from 'react';

interface BurningShipShaderProps {
  className?: string;
  speed?: number;
  colorHue?: number;
  colorSaturation?: number;
  intensity?: number;
}

export default function BurningShipShader({
  className = '',
  speed = 1.0,
  colorHue = 0.5,
  colorSaturation = 0.8,
  intensity = 1.0
}: BurningShipShaderProps) {
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

    // --- OPTIMIZED FRAGMENT SHADER ---
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

      // OPTIMIZED: Use dot(z,z) instead of length(z) to avoid expensive sqrt in a loop.
      float burningShip(vec2 c, float time) {
        vec2 z = vec2(0.0);
        float iterations = 0.0;
        float maxIter = 100.0; // Slightly reduced for performance balance
        
        vec2 offset = vec2(sin(time * 0.3) * 0.1, cos(time * 0.2) * 0.05);
        c += offset;
        
        for (float i = 0.0; i < 100.0; i++) {
          if (dot(z,z) > 16.0) break; // OPTIMIZATION: Faster than length(z) > 4.0
          z = vec2(abs(z.x), abs(z.y));
          z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
          iterations = i;
        }
        
        if (dot(z,z) > 16.0) {
          iterations += 1.0 - log2(log2(length(z)));
        }
        
        return iterations / maxIter;
      }

      float tricorn(vec2 c, float time) {
        vec2 z = vec2(0.0);
        float iterations = 0.0;
        float maxIter = 80.0; // Reduced
        
        vec2 shift = vec2(cos(time * 0.4) * 0.2, sin(time * 0.5) * 0.15);
        c += shift;
        
        for (float i = 0.0; i < 80.0; i++) {
          if (dot(z,z) > 16.0) break; // OPTIMIZATION
          z = vec2(z.x * z.x - z.y * z.y, -2.0 * z.x * z.y) + c;
          iterations = i;
        }
        
        if (dot(z,z) > 16.0) {
          iterations += 1.0 - log2(log2(length(z)));
        }
        
        return iterations / maxIter;
      }

      float multicorn(vec2 c, float time) {
        vec2 z = vec2(0.0);
        float iterations = 0.0;
        float maxIter = 60.0; // Reduced
        
        float power = 3.0 + sin(time * 0.6) * 1.0;
        
        for (float i = 0.0; i < 60.0; i++) {
          if (dot(z,z) > 16.0) break; // OPTIMIZATION
          float r = length(z);
          float theta = atan(z.y, z.x);
          z = pow(r, power) * vec2(cos(power * theta), -sin(power * theta)) + c;
          iterations = i;
        }
        
        if (dot(z,z) > 16.0) {
          iterations += 1.0 - log2(log2(length(z))) / log2(power);
        }
        
        return iterations / maxIter;
      }
      
      float featherFractal(vec2 c, float time) {
        vec2 z = c;
        float iterations = 0.0;
        float maxIter = 50.0; // Reduced
        
        vec2 featherC = vec2(-1.25 + sin(time * 0.7) * 0.3, 0.02 + cos(time * 0.8) * 0.1);
        
        for (float i = 0.0; i < 50.0; i++) {
          if (dot(z,z) > 16.0) break; // OPTIMIZATION
          z = vec2(z.x * z.x - z.y * z.y, abs(2.0 * z.x * z.y)) + featherC;
          iterations = i;
        }
        
        return iterations / maxIter;
      }

      void main() {
        vec2 fragCoord = gl_FragCoord.xy;
        vec2 resolution = u_resolution.xy;
        
        float zoom = 0.8 + sin(u_time * u_speed * 0.2) * 0.6;
        vec2 center = vec2(-0.5 + cos(u_time * u_speed * 0.15) * 0.3, 
                          0.0 + sin(u_time * u_speed * 0.1) * 0.2);
        
        vec2 uv = (fragCoord - resolution * 0.5) / min(resolution.x, resolution.y) * 3.0 / zoom + center;
        
        float time = u_time * u_speed;
        
        float ship = burningShip(uv, time);
        float tri = tricorn(uv * 1.2 + vec2(0.3, 0.1), time);
        float multi = multicorn(uv * 0.8 + vec2(-0.2, 0.3), time);
        float feather = featherFractal(uv * 1.5, time);
        
        float w1 = sin(time * 0.3) * 0.5 + 0.5;
        float w2 = cos(time * 0.25) * 0.5 + 0.5;
        float w3 = sin(time * 0.4 + 1.0) * 0.5 + 0.5;
        
        float combined = mix(mix(ship, tri, w1), mix(multi, feather, w2), w3);
        
        vec3 color1 = hsv2rgb(vec3(u_colorHue + combined * 0.6 + time * 0.08, u_colorSaturation * (0.7 + combined * 0.3), 0.4 + combined * 0.6));
        vec3 color2 = hsv2rgb(vec3(u_colorHue + 0.2 + ship * 0.8, u_colorSaturation * 0.9, 0.3 + tri * 0.7));
        vec3 color3 = hsv2rgb(vec3(u_colorHue + 0.4 + multi * 0.5, u_colorSaturation * 0.8, 0.5 + feather * 0.5));
        
        float mix1 = sin(combined * 20.0 + time * 4.0) * 0.5 + 0.5;
        float mix2 = cos(combined * 35.0 + time * 3.0) * 0.5 + 0.5;
        
        vec3 finalColor = mix(mix(color1, color2, mix1), color3, mix2 * 0.4);
        
        // This edge detection is expensive. It calculates the fractal 4 more times.
        // It provides detail but could be removed for a large performance boost.
        vec2 eps = vec2(1.5) / resolution;
        float edge = abs(burningShip(uv + eps.xy, time) - burningShip(uv - eps.xy, time));
        finalColor += vec3(edge * 4.0) * u_intensity;
        
        finalColor *= 0.7 + (abs(ship - tri) + abs(tri - multi)) * 0.3; // Simplified for performance
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
      className={`absolute inset-0 w-full h-full ${className} transition-opacity duration-1000 animate-fade-in`}
      style={{ width: '100%', height: '100%' }}
    />
  );
}
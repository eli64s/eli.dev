import { useEffect, useRef } from 'react';

interface JuliaSetShaderProps {
  className?: string;
  speed?: number;
  colorHue?: number;
  colorSaturation?: number;
  intensity?: number;
}

export default function JuliaSetShader({ 
  className = '',
  speed = 1.0,
  colorHue = 0.5,
  colorSaturation = 0.8,
  intensity = 1.0
}: JuliaSetShaderProps) {
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

      vec2 complexDiv(vec2 a, vec2 b) {
        float denom = dot(b, b);
        return vec2(dot(a, b), a.y * b.x - a.x * b.y) / denom;
      }

      vec2 complexPow(vec2 z, float power) {
        float r = length(z);
        float theta = atan(z.y, z.x);
        return pow(r, power) * vec2(cos(power * theta), sin(power * theta));
      }

      float juliaVariation(vec2 z, vec2 c, float power, int maxIter) {
        float iterations = 0.0;
        
        for (int i = 0; i < 120; i++) {
          if (i >= maxIter) break;
          if (length(z) > 4.0) break;
          
          z = complexPow(z, power) + c;
          iterations = float(i);
        }
        
        // Smooth coloring
        if (length(z) > 4.0) {
          iterations += 1.0 - log2(log2(length(z))) / log2(power);
        }
        
        return iterations / float(maxIter);
      }

      float newtonFractal(vec2 z, float time) {
        // Newton's method for z^3 - 1 = 0
        vec2 one = vec2(1.0, 0.0);
        
        for (int i = 0; i < 20; i++) {
          vec2 z2 = complexMul(z, z);
          vec2 z3 = complexMul(z2, z);
          vec2 numerator = z3 - one;
          vec2 denominator = 3.0 * z2;
          
          if (length(denominator) < 0.001) break;
          
          z = z - complexDiv(numerator, denominator);
        }
        
        // Color based on which root we converged to
        vec2 root1 = vec2(1.0, 0.0);
        vec2 root2 = vec2(-0.5, 0.866);
        vec2 root3 = vec2(-0.5, -0.866);
        
        float d1 = length(z - root1);
        float d2 = length(z - root2);
        float d3 = length(z - root3);
        
        float minDist = min(d1, min(d2, d3));
        
        if (minDist == d1) return 0.0;
        if (minDist == d2) return 0.33;
        return 0.66;
      }

      void main() {
        vec2 fragCoord = gl_FragCoord.xy;
        vec2 resolution = u_resolution.xy;
        
        // Complex plane mapping
        float zoom = 1.0 + sin(u_time * u_speed * 0.3) * 0.8;
        vec2 uv = (fragCoord - resolution * 0.5) / min(resolution.x, resolution.y) * 2.5 / zoom;
        
        float time = u_time * u_speed;
        
        // Multi-layer Julia sets with different parameters
        vec2 c1 = vec2(-0.8 + sin(time * 0.5) * 0.2, 0.156 + cos(time * 0.3) * 0.15);
        vec2 c2 = vec2(-0.4 + cos(time * 0.4) * 0.3, -0.6 + sin(time * 0.7) * 0.2);
        vec2 c3 = vec2(0.285 + sin(time * 0.6) * 0.1, 0.01 + cos(time * 0.8) * 0.1);
        
        // Dynamic power variations
        float power1 = 2.0 + sin(time * 0.4) * 0.5;
        float power2 = 2.0 + cos(time * 0.6) * 0.8;
        
        // Multiple fractal layers
        float julia1 = juliaVariation(uv, c1, power1, 80);
        float julia2 = juliaVariation(uv * 1.2, c2, power2, 60);
        float julia3 = juliaVariation(uv * 0.8, c3, 2.0, 100);
        
        // Newton fractal for additional complexity
        float newton = newtonFractal(uv * 1.5, time);
        
        // Blend multiple fractals
        float blend1 = sin(time * 0.2) * 0.5 + 0.5;
        float blend2 = cos(time * 0.15) * 0.5 + 0.5;
        
        float combinedFractal = mix(
          mix(julia1, julia2, blend1),
          mix(julia3, newton, blend2),
          sin(time * 0.25) * 0.5 + 0.5
        );
        
        // Advanced coloring with multiple hue shifts
        vec3 color1 = hsv2rgb(vec3(
          u_colorHue + combinedFractal * 0.8 + time * 0.1,
          u_colorSaturation * (0.6 + combinedFractal * 0.4),
          0.3 + combinedFractal * 0.7
        ));
        
        vec3 color2 = hsv2rgb(vec3(
          u_colorHue + 0.25 + julia1 * 0.5,
          u_colorSaturation * 0.9,
          0.5 + julia2 * 0.5
        ));
        
        vec3 color3 = hsv2rgb(vec3(
          u_colorHue + 0.5 + newton,
          u_colorSaturation * 0.7,
          0.4 + julia3 * 0.6
        ));
        
        // Multi-frequency color mixing
        float colorMix1 = sin(combinedFractal * 15.0 + time * 3.0) * 0.5 + 0.5;
        float colorMix2 = cos(combinedFractal * 25.0 + time * 2.0) * 0.5 + 0.5;
        
        vec3 finalColor = mix(
          mix(color1, color2, colorMix1),
          color3,
          colorMix2 * 0.3
        );
        
        // Edge enhancement and detail sharpening
        vec2 eps = vec2(2.0) / resolution;
        float edge = 0.0;
        edge += abs(juliaVariation(uv + eps.xy, c1, power1, 40) - juliaVariation(uv - eps.xy, c1, power1, 40));
        edge += abs(juliaVariation(uv + eps.yx, c1, power1, 40) - juliaVariation(uv - eps.yx, c1, power1, 40));
        
        finalColor += vec3(edge * 3.0) * u_intensity;
        
        // Orbital traps for additional detail
        float trap = min(abs(uv.x), abs(uv.y));
        trap = min(trap, length(uv - vec2(0.0, 1.0)));
        finalColor *= 0.8 + trap * 0.4;
        
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
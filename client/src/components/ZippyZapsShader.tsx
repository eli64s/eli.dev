import { useEffect, useRef } from 'react';

interface ZippyZapsShaderProps {
  className?: string;
  speed?: number;
  colorHue?: number;
  colorSaturation?: number;
  intensity?: number;
}

export default function ZippyZapsShader({ 
  className = '',
  speed = 1.0,
  colorHue = 0.5,
  colorSaturation = 0.8,
  intensity = 1.0
}: ZippyZapsShaderProps) {
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

      vec2 stanh(vec2 a) {
        vec2 clamped = clamp(a, -40.0, 40.0);
        return (exp(2.0 * clamped) - 1.0) / (exp(2.0 * clamped) + 1.0);
      }

      vec3 hsv2rgb(vec3 c) {
        vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
        vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
        return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
      }

      void main() {
        vec2 fragCoord = gl_FragCoord.xy;
        vec2 resolution = u_resolution.xy;
        vec2 uv = (fragCoord * 2.0 - resolution.xy) / resolution.y;
        
        float time = u_time * u_speed;
        vec3 color = vec3(0.0);
        
        // Create electric field effect
        for (float i = 0.0; i < 8.0; i++) {
          float layer = i / 8.0;
          
          // Create rotating electric field
          float angle = time * 0.5 + i * 0.8;
          vec2 center = vec2(cos(angle * 0.3), sin(angle * 0.5)) * 0.4;
          
          vec2 pos = uv - center;
          float dist = length(pos);
          
          // Electric discharge pattern
          float electric = 1.0 / (1.0 + dist * 10.0);
          electric *= sin(dist * 30.0 - time * 8.0 + i * 2.0);
          electric = max(0.0, electric);
          
          // Lightning branches
          float branch = sin(pos.x * 15.0 + time * 3.0) * sin(pos.y * 12.0 + time * 2.0);
          branch = pow(max(0.0, branch), 2.0);
          
          // Combine effects
          float intensity = electric * (0.5 + branch * 0.5) * u_intensity;
          
          // Color variation per layer
          vec3 layerColor = vec3(
            0.3 + 0.7 * sin(layer * 6.28 + time + u_colorHue * 6.28),
            0.5 + 0.5 * sin(layer * 6.28 + time * 1.3 + u_colorHue * 6.28 + 2.0),
            0.7 + 0.3 * sin(layer * 6.28 + time * 0.7 + u_colorHue * 6.28 + 4.0)
          );
          
          color += layerColor * intensity * u_colorSaturation;
        }
        
        // Central energy core
        float core = 1.0 / (1.0 + length(uv) * 3.0);
        core *= sin(time * 4.0) * 0.5 + 0.5;
        color += vec3(core * 0.3) * u_intensity;
        
        // Vignette effect
        float vignette = 1.0 - dot(uv, uv) * 0.3;
        color *= vignette;
        
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
    if (!gl) {
      console.error('WebGL not supported');
      return;
    }

    const program = createProgram(gl);
    if (!program) return;
    
    programRef.current = program;

    // Create vertex buffer
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
       1,  1,
    ]), gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // Get uniform locations
    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
    const timeLocation = gl.getUniformLocation(program, 'u_time');
    const speedLocation = gl.getUniformLocation(program, 'u_speed');
    const colorHueLocation = gl.getUniformLocation(program, 'u_colorHue');
    const colorSaturationLocation = gl.getUniformLocation(program, 'u_colorSaturation');
    const intensityLocation = gl.getUniformLocation(program, 'u_intensity');

    const render = () => {
      if (!gl || !program) return;

      // Resize canvas to match display size
      const displayWidth = canvas.clientWidth;
      const displayHeight = canvas.clientHeight;
      
      if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
      }

      gl.useProgram(program);
      
      // Set uniforms
      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
      gl.uniform1f(timeLocation, (Date.now() - startTimeRef.current) / 1000);
      gl.uniform1f(speedLocation, speed);
      gl.uniform1f(colorHueLocation, colorHue);
      gl.uniform1f(colorSaturationLocation, colorSaturation);
      gl.uniform1f(intensityLocation, intensity);

      // Draw
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
import React, { useRef, useEffect } from 'react';

interface TunnelVisionShaderProps {
  speed?: number;
  colorHue?: number;
  colorSaturation?: number;
  intensity?: number;
}

export default function TunnelVisionShader({ 
  speed = 1.0,
  colorHue = 0.5,
  colorSaturation = 0.8,
  intensity = 1.0
}: TunnelVisionShaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return;

    const vertexShaderSource = `
      attribute vec4 position;
      void main() {
        gl_Position = position;
      }
    `;

    const fragmentShaderSource = `
      precision highp float;
      uniform float iTime;
      uniform vec2 iResolution;
      uniform float speed;
      uniform float colorHue;
      uniform float colorSaturation;
      uniform float intensity;
      uniform sampler2D iChannel0;

      vec3 hsv2rgb(vec3 c) {
        vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
        vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
        return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
      }

      vec3 aces_approx(vec3 v) {
        v = max(v, 0.0);
        v *= 0.6;
        float a = 2.51;
        float b = 0.03;
        float c = 2.43;
        float d = 0.59;
        float e = 0.14;
        return clamp((v*(a*v+b))/(v*(c*v+d)+e), 0.0, 1.0);
      }

      #define PI 3.141592653589793
      #define TAU 6.283185307179586

      float hash(float n) {
        return fract(sin(n) * 43758.5453123);
      }

      float noise(float p) {
        float i = floor(p);
        float f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(hash(i), hash(i + 1.0), f);
      }

      mat2 rot2(float a) {
        float c = cos(a);
        float s = sin(a);
        return mat2(c, -s, s, c);
      }

      vec3 tunnel(vec2 uv, float t) {
        float angle = atan(uv.y, uv.x);
        float dist = 1.0 / length(uv);
        
        // Create tunnel effect
        float z = dist * 0.5 + t * speed * 2.0;
        float rings = sin(z * 10.0 - t * speed * 3.0) * 0.5 + 0.5;
        float spiral = sin(angle * 5.0 + z * 2.0 - t * speed * 4.0) * 0.5 + 0.5;
        
        // Add noise for texture
        float n = noise(z * 5.0 + angle * 10.0) * 0.3;
        
        // Create neon effect
        float glow = exp(-dist * 0.3) * 2.0;
        float edge = 1.0 - smoothstep(0.0, 0.1, abs(rings - 0.5));
        
        // Color based on position and time
        vec3 col = vec3(0.0);
        float hue = colorHue + z * 0.1 + angle * 0.05 + t * speed * 0.1;
        hue = fract(hue);
        
        vec3 neonColor = hsv2rgb(vec3(hue, colorSaturation, 1.0));
        
        // Combine effects
        col += neonColor * rings * spiral * glow * intensity;
        col += neonColor * edge * glow * 2.0 * intensity;
        col += neonColor * n * 0.5 * intensity;
        
        // Add distance fog
        col *= exp(-dist * 0.1);
        
        return col;
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy - 0.5 * iResolution.xy) / iResolution.y;
        float t = iTime;
        
        // Add some movement
        uv *= rot2(sin(t * speed * 0.2) * 0.1);
        uv *= 1.0 + sin(t * speed * 0.3) * 0.1;
        
        vec3 col = vec3(0.0);
        
        // Multiple layers for depth
        for(float i = 0.0; i < 3.0; i++) {
          vec2 offset = vec2(
            sin(t * speed * (0.7 + i * 0.1)) * 0.02,
            cos(t * speed * (0.9 + i * 0.1)) * 0.02
          );
          float scale = 1.0 + i * 0.2;
          col += tunnel(uv * scale + offset, t + i * 0.5) / (1.0 + i);
        }
        
        // Post processing
        col = aces_approx(col);
        col = sqrt(col);
        
        // Add vignette
        float vignette = 1.0 - dot(uv, uv) * 0.5;
        col *= vignette;
        
        gl_FragColor = vec4(col, 1.0);
      }
    `;

    function createShader(gl: WebGLRenderingContext, type: number, source: string) {
      const shader = gl.createShader(type);
      if (!shader) return null;
      
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      
      return shader;
    }

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) return;
    
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      return;
    }

    const positionAttributeLocation = gl.getAttribLocation(program, 'position');
    const timeUniformLocation = gl.getUniformLocation(program, 'iTime');
    const resolutionUniformLocation = gl.getUniformLocation(program, 'iResolution');
    const speedUniformLocation = gl.getUniformLocation(program, 'speed');
    const colorHueUniformLocation = gl.getUniformLocation(program, 'colorHue');
    const colorSaturationUniformLocation = gl.getUniformLocation(program, 'colorSaturation');
    const intensityUniformLocation = gl.getUniformLocation(program, 'intensity');

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
       1,  1,
    ]), gl.STATIC_DRAW);

    function resize() {
      if (!canvas) return;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    }

    function render() {
      if (!canvas) return;
      
      const currentTime = (Date.now() - startTimeRef.current) / 1000;
      
      resize();
      
      gl.clearColor(0.0, 0.0, 0.0, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      
      gl.useProgram(program);
      
      gl.uniform1f(timeUniformLocation, currentTime);
      gl.uniform2f(resolutionUniformLocation, canvas.width, canvas.height);
      gl.uniform1f(speedUniformLocation, speed);
      gl.uniform1f(colorHueUniformLocation, colorHue);
      gl.uniform1f(colorSaturationUniformLocation, colorSaturation);
      gl.uniform1f(intensityUniformLocation, intensity);
      
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.enableVertexAttribArray(positionAttributeLocation);
      gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
      
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      
      animationRef.current = requestAnimationFrame(render);
    }

    resize();
    render();

    const handleResize = () => resize();
    window.addEventListener('resize', handleResize);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [speed, colorHue, colorSaturation, intensity]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ background: 'transparent' }}
    />
  );
}
import React, { useRef, useEffect } from 'react';

interface GalaxyShaderProps {
  speed?: number;
  colorHue?: number;
  colorSaturation?: number;
  intensity?: number;
}

export default function GalaxyShader({ 
  speed = 1.0,
  colorHue = 0.5,
  colorSaturation = 0.8,
  intensity = 1.0
}: GalaxyShaderProps) {
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

      vec3 hsv2rgb(vec3 c) {
        vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
        vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
        return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy / iResolution.xy) - 0.5;
        float t = iTime * 0.1 * speed + ((0.25 + 0.05 * sin(iTime * 0.1 * speed))/(length(uv.xy) + 0.07)) * 2.2;
        float si = sin(t);
        float co = cos(t);
        mat2 ma = mat2(co, si, -si, co);

        float v1, v2, v3;
        v1 = v2 = v3 = 0.0;
        
        float s = 0.0;
        for (int i = 0; i < 90; i++) {
          vec3 p = s * vec3(uv, 0.0);
          p.xy *= ma;
          p += vec3(0.22, 0.3, s - 1.5 - sin(iTime * 0.13 * speed) * 0.1);
          for (int j = 0; j < 8; j++) {
            p = abs(p) / dot(p,p) - 0.659;
          }
          v1 += dot(p,p) * 0.0015 * (1.8 + sin(length(uv.xy * 13.0) + 0.5 - iTime * 0.2 * speed));
          v2 += dot(p,p) * 0.0013 * (1.5 + sin(length(uv.xy * 14.5) + 1.2 - iTime * 0.3 * speed));
          v3 += length(p.xy*10.0) * 0.0003;
          s += 0.035;
        }
        
        float len = length(uv);
        v1 *= smoothstep(0.7, 0.0, len);
        v2 *= smoothstep(0.5, 0.0, len);
        v3 *= smoothstep(0.9, 0.0, len);
        
        vec3 baseCol = vec3(
          v3 * (1.5 + sin(iTime * 0.2 * speed) * 0.4),
          (v1 + v3) * 0.3,
          v2
        ) + smoothstep(0.2, 0.0, len) * 0.85 + smoothstep(0.0, 0.6, v3) * 0.3;
        
        // Apply color customization
        vec3 hsvCol = vec3(colorHue, colorSaturation, 1.0);
        vec3 tintColor = hsv2rgb(hsvCol);
        vec3 col = baseCol * tintColor * intensity;
        
        gl_FragColor = vec4(min(pow(abs(col), vec3(1.2)), 1.0), 1.0);
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
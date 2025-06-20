import { useEffect, useRef } from 'react';

interface CloudsShaderProps {
  className?: string;
  speed?: number;
  colorHue?: number;
  colorSaturation?: number;
  intensity?: number;
}

export default function CloudsShader({ 
  className = '', 
  speed = 1.0,
  colorHue = 220,
  colorSaturation = 30,
  intensity = 1.0
}: CloudsShaderProps) {
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

      // HSV to RGB conversion
      vec3 hsv2rgb(vec3 c) {
        vec4 K = vec4(1.0, 2.0/3.0, 1.0/3.0, 3.0);
        vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
        return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
      }

      // 3D noise function
      float noise(vec3 x) {
        vec3 p = floor(x);
        vec3 f = fract(x);
        f = f * f * (3.0 - 2.0 * f);
        
        // Simple hash function for noise
        float h00 = fract(sin(dot(p + vec3(0.0, 0.0, 0.0), vec3(127.1, 311.7, 74.7))) * 43758.5453);
        float h10 = fract(sin(dot(p + vec3(1.0, 0.0, 0.0), vec3(127.1, 311.7, 74.7))) * 43758.5453);
        float h01 = fract(sin(dot(p + vec3(0.0, 1.0, 0.0), vec3(127.1, 311.7, 74.7))) * 43758.5453);
        float h11 = fract(sin(dot(p + vec3(1.0, 1.0, 0.0), vec3(127.1, 311.7, 74.7))) * 43758.5453);
        float h001 = fract(sin(dot(p + vec3(0.0, 0.0, 1.0), vec3(127.1, 311.7, 74.7))) * 43758.5453);
        float h101 = fract(sin(dot(p + vec3(1.0, 0.0, 1.0), vec3(127.1, 311.7, 74.7))) * 43758.5453);
        float h011 = fract(sin(dot(p + vec3(0.0, 1.0, 1.0), vec3(127.1, 311.7, 74.7))) * 43758.5453);
        float h111 = fract(sin(dot(p + vec3(1.0, 1.0, 1.0), vec3(127.1, 311.7, 74.7))) * 43758.5453);
        
        float i1 = mix(mix(h00, h10, f.x), mix(h01, h11, f.x), f.y);
        float i2 = mix(mix(h001, h101, f.x), mix(h011, h111, f.x), f.y);
        
        return mix(i1, i2, f.z) * 2.0 - 1.0;
      }

      // Fractal Brownian Motion (fBM)
      float fbm(vec3 p) {
        float f = 0.0;
        float a = 0.5;
        for(int i = 0; i < 5; i++) {
          f += a * noise(p);
          p = p * 2.02;
          a *= 0.5;
        }
        return f;
      }

      // Cloud density function
      float cloudMap(vec3 p) {
        vec3 q = p - vec3(0.0, 0.1, 1.0) * u_time * u_speed * 0.3;
        float g = 0.5 + 0.5 * noise(q * 0.3);
        
        float f = fbm(q);
        f = mix(f * 0.1 - 0.5, f, g * g);
        
        return clamp(1.5 * f - 0.5 - p.y, 0.0, 1.0);
      }

      // Simplified raymarching for clouds
      vec4 raymarchClouds(vec3 ro, vec3 rd, vec3 bgcol) {
        const float yb = -2.0;
        const float yt = 1.5;
        
        float tb = (yb - ro.y) / rd.y;
        float tt = (yt - ro.y) / rd.y;
        
        float tmin = max(0.0, min(tb, tt));
        float tmax = max(tb, tt);
        if(tmax < 0.0) return vec4(0.0);
        
        vec4 sum = vec4(0.0);
        float t = tmin;
        
        const vec3 sundir = normalize(vec3(1.0, 0.0, -1.0));
        
        for(int i = 0; i < 80; i++) {
          if(t > tmax || sum.a > 0.99) break;
          
          vec3 pos = ro + t * rd;
          float den = cloudMap(pos);
          
          if(den > 0.01) {
            // Simple lighting
            float dif = clamp((den - cloudMap(pos + 0.3 * sundir)) / 0.25, 0.0, 1.0);
            
            // Base cloud color with user hue
            float baseHue = u_hue / 360.0;
            float sat = u_saturation / 100.0 * 0.3;
            vec3 cloudBase = hsv2rgb(vec3(baseHue, sat, 0.9));
            vec3 cloudDark = hsv2rgb(vec3(baseHue, sat * 1.5, 0.4));
            
            vec3 lin = vec3(0.65, 0.65, 0.75) * 1.1 + 0.8 * vec3(1.0, 0.6, 0.3) * dif;
            vec4 col = vec4(mix(cloudBase, cloudDark, den), den);
            col.xyz *= lin;
            
            // Atmospheric perspective
            col.xyz = mix(col.xyz, bgcol, 1.0 - exp(-0.1 * t));
            
            // Composite
            col.w = min(col.w * 0.15, 1.0);
            col.rgb *= col.a;
            sum += col * (1.0 - sum.a);
          }
          
          t += max(0.05, 0.02 * t);
        }
        
        return clamp(sum, 0.0, 1.0);
      }

      // Camera setup
      mat3 setCamera(vec3 ro, vec3 ta, float cr) {
        vec3 cw = normalize(ta - ro);
        vec3 cp = vec3(sin(cr), cos(cr), 0.0);
        vec3 cu = normalize(cross(cw, cp));
        vec3 cv = normalize(cross(cu, cw));
        return mat3(cu, cv, cw);
      }

      void main() {
        vec2 p = (2.0 * gl_FragCoord.xy - u_resolution.xy) / u_resolution.y;
        
        // Animated camera
        float camTime = u_time * u_speed * 0.2;
        vec3 ro = vec3(4.0 * cos(camTime * 0.3), 1.0 + 0.5 * sin(camTime * 0.4), 4.0 * sin(camTime * 0.3));
        vec3 ta = vec3(0.0, -0.5, 0.0);
        mat3 ca = setCamera(ro, ta, 0.07 * cos(0.25 * u_time * u_speed));
        
        vec3 rd = ca * normalize(vec3(p.xy, 1.8));
        
        // Sun direction
        const vec3 sundir = normalize(vec3(1.0, 0.0, -1.0));
        float sun = clamp(dot(sundir, rd), 0.0, 1.0);
        
        // Sky gradient with user colors
        float skyHue = u_hue / 360.0;
        float skySat = u_saturation / 100.0 * 0.6;
        vec3 skyColor = hsv2rgb(vec3(skyHue, skySat, 0.8 + 0.2 * u_intensity));
        vec3 horizonColor = hsv2rgb(vec3(skyHue + 0.1, skySat * 0.7, 0.6));
        
        vec3 col = mix(skyColor, horizonColor, -rd.y * 0.6);
        col += 0.2 * vec3(1.0, 0.6, 0.1) * pow(sun, 8.0) * u_intensity;
        
        // Clouds
        vec4 clouds = raymarchClouds(ro, rd, col);
        col = col * (1.0 - clouds.w) + clouds.xyz;
        
        // Sun glare
        col += 0.2 * vec3(1.0, 0.4, 0.2) * pow(sun, 3.0) * u_intensity;
        
        // Tone mapping
        col = smoothstep(0.15, 1.1, col);
        
        // Atmospheric fade at edges
        float vignette = 1.0 - 0.3 * length(p);
        col *= vignette;
        
        gl_FragColor = vec4(col, 1.0);
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
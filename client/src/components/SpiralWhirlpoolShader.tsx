import React, { useEffect, useRef } from 'react';

// Renamed the interface to match the component and filename for consistency.
interface SpiralWhirlpoolShaderProps {
  className?: string;
  speed?: number;
  colorHue?: number;
  colorSaturation?: number;
  intensity?: number;
}

// Renamed the component to match the filename.
// The GLSL logic inside is what you provided (the "Cross Galactic Ocean" effect).
export default function SpiralWhirlpoolShader({
  className = "",
  speed = 1.0,
  colorHue = 0, // Defaulting to 0 for this shader's hue rotation logic
  colorSaturation = 1.0,
  intensity = 1.0
}: SpiralWhirlpoolShaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const startTimeRef = useRef<number>(Date.now()); // Using startTime for consistent animation

  const createShader = (gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null => {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(`Shader compilation error in ${type === gl.VERTEX_SHADER ? "Vertex" : "Fragment"} Shader:`, gl.getShaderInfoLog(shader));
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

    // The GLSL code you provided for the "Cross Galactic Ocean" effect
    const fragmentShaderSource = `
      precision highp float;
      uniform vec2 u_resolution;
      uniform float u_time;
      uniform float u_speed;
      uniform float u_hue;
      uniform float u_saturation;
      uniform float u_intensity;

      #define PI 3.1415926535
      #define STEPS 45 // PERFORMANCE: Reduced from 50 for better balance on most devices.

      mat2 rot(float a) {
        float c = cos(a);
        float s = sin(a);
        return mat2(c, s, -s, c);
      }

      float noise(vec2 p) {
        p *= rot(1.941611);
        return sin(p.x) * 0.25 + sin(p.y) * 0.25 + 0.50;
      }

      void grid(vec2 p, inout vec3 projClosest, inout vec3 projSecondClosest) {
        vec2 center = floor(p) + 0.5;
        vec2 secondBestCenter = center;
        float secondBestDist = 9e4; // Use scientific notation for large numbers
        vec2 bestCenter = center;
        float bestDist = 9e4;
        
        for (int y = -1; y <= 1; y++) {
        for (int x = -1; x <= 1; x++) {
          vec2 currentCenter = center + vec2(float(x), float(y));
            
            currentCenter.x += noise(u_time * u_speed * vec2(0.51, 0.58) + currentCenter * vec2(1.31, 1.78)) - 0.5;
            currentCenter.y += noise(u_time * u_speed * vec2(0.55, 0.55) - currentCenter * vec2(1.51, 1.60)) - 0.5;
            
            vec2 delta = p - currentCenter;
            float currentDist = dot(delta, delta) * 0.5;
            
            float if1 = step(currentDist, bestDist);
            float if1m = 1.0 - if1;
            secondBestCenter = if1 * bestCenter + if1m * secondBestCenter;
            secondBestDist = if1 * bestDist + if1m * secondBestDist;
            bestCenter = if1 * currentCenter + if1m * bestCenter;
            bestDist = if1 * currentDist + if1m * bestDist;
            
            float if2 = step(currentDist, secondBestDist) * if1m;
            float if2m = 1.0 - if2;
            secondBestCenter = if2 * currentCenter + if2m * secondBestCenter;
            secondBestDist = if2 * currentDist + if2m * secondBestDist;
        }
        }
        
        projClosest = vec3(bestCenter, bestDist);
        projSecondClosest = vec3(secondBestCenter, secondBestDist);
      }

      vec3 normal(vec3 p, vec3 proj) {
        vec2 dir = proj.xy - p.xy;
        vec3 tang = vec3(dir, proj.z * 0.12);
        vec3 nine = vec3(dir.y, -dir.x, 0.0);
        return normalize(cross(nine, tang));
      }

      float de(vec3 p, inout vec3 projClosest, inout vec3 projSecondClosest) {
        grid(p.xy, projClosest, projSecondClosest);
        float below = 0.0;
        below -= sin(dot(p.xy, vec2(0.005, 0.051)) * 4.0 + u_time * u_speed * 0.5) * 0.4 + 0.2;
        below -= 1.0 - projClosest.z;
        return max(0.0, p.z - below);
      }

      vec4 getSunColor(vec3 dir, inout float inside) {
        float dotp = dot(dir, vec3(-0.99, 0.0, 0.1));
        float sunHeight = smoothstep(0.01, 0.29, dir.z);
        inside = smoothstep(0.977, 0.979, dotp);
        float ytemp = abs(dir.y) * dir.y;
        float sunWave = sin(dir.z * 300.0 + u_time * u_speed * 1.846 + sin(ytemp * 190.0 + u_time * u_speed * 0.45) * 1.3) * 0.5 + 0.5;
        float sunHeight2 = smoothstep(-0.1, 0.2, dir.z);
        sunWave = (1.0 - smoothstep(sunHeight2, 1.0, sunWave)) * (1.0 - sunHeight2) + sunHeight2;
        float sun = inside * sunWave;
        return vec4(mix(vec3(0.998, 0.108, 0.47), vec3(0.988, 0.769, 0.176), sunHeight), sun);
      }

      vec3 getSpaceColor(vec3 dir) {
        float scanline = sin(dir.z * 700.0 - u_time * u_speed * 5.1) * 0.5 + 0.5;
        scanline *= scanline;
        vec3 color = mix(vec3(0.1, 0.16, 0.26), vec3(0.1), scanline);
        vec2 uv = vec2(atan(dir.y, dir.x) / (2.0 * PI) + 0.5, mod(dir.z, 1.0));
        uv.x = mod(uv.x + 2.0 * PI, 1.0);
        uv.x *= 100.0;
        uv.y *= 15.0;
        uv *= rot(1.941611 + u_time * u_speed * 0.00155);
        vec2 center = floor(uv) + 0.5;
        center.x += noise(center * 48.6613) * 0.8 - 0.4;
        center.y += noise(center * -31.1577) * 0.8 - 0.4;
        float radius = smoothstep(0.6, 1.0, noise(center * 42.487 + vec2(0.1514, 0.1355) * u_time * u_speed)) * 0.01;
        float dist = dot(uv - center, uv - center);
        float star = 1.0 - smoothstep(0.0, radius, dist);
        star = pow(star, 4.0);
        vec3 starColor = mix(vec3(0.988, 0.769, 0.176), vec3(0.988, 0.434, 0.875), noise(center * 74.487));
        return mix(color, starColor, star) + vec3(1.0) * pow(star, 8.0);
      }

      vec3 getBackgroundColor(vec3 dir) {
        float horizon = 1.0 - smoothstep(0.0, 0.02, dir.z);
        vec3 color = getSpaceColor(dir);
        float inside = 0.0;
        vec4 sun = getSunColor(dir, inside);
        color = mix(color, vec3(0.1, 0.16, 0.26), inside);
        color = mix(color, sun.rgb, sun.a);
        color = mix(color, vec3(0.43, 0.77, 0.85), horizon * (1.0 - sun.a * 0.19));
        return color;
      }

      vec3 getWaveColor(vec3 p, vec3 projClosest, vec3 projSecondClosest, vec3 dir, float dist, vec2 frag) {
        float distanceToEdge = abs(projClosest.z - projSecondClosest.z);
        float distanceFrac = pow(smoothstep(-10.0, 100.0, dist), 4.0);
        float frac = smoothstep(0.0, 0.1 + distanceFrac * 0.9, distanceToEdge);
        vec3 norm = normal(p, projClosest);
        vec3 color = getBackgroundColor(reflect(dir, norm));
        frac *= (sin(frag.y / u_resolution.y * 700.0) * 0.5 + 0.5) * (1.0 - distanceFrac);
        return mix(vec3(0.43, 0.77, 0.85), color, frac);
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
        
        vec3 ro = vec3(0.0, 0.0, 0.2);
        vec3 rd = normalize(vec3(uv, 1.0));
        
        rd.yz *= rot(-PI / 2.0); // Point camera down
        
        float time = u_time * u_speed;
        rd.xz *= rot(sin(time * 0.15) * 0.2);
        rd.xy *= rot(cos(time * 0.1) * 0.1);
        
        vec3 color = vec3(0.0);
        
        if (rd.z < 0.0) { // Pointing down
          float totdist = -ro.z / rd.z;
          for (int i = 0; i < STEPS; i++) {
            vec3 p = ro + totdist * rd;
            p.x += time * 2.7;
            vec3 projClosest, projSecondClosest;
            float dist = de(p, projClosest, projSecondClosest);
            totdist += dist;
            if (dist < 0.01) {
              color = getWaveColor(p, projClosest, projSecondClosest, rd, totdist, gl_FragCoord.xy);
              break;
            }
          }
        } else { // Pointing up
          color = getBackgroundColor(rd);
        }
        
        color *= u_intensity;
        
        float hueAngle = u_hue * 6.283185;
        vec3 k = vec3(0.57735); // Axis for hue rotation
        color = color * cos(hueAngle) + cross(k, color) * sin(hueAngle) + k * dot(k, color) * (1.0 - cos(hueAngle));
        
        float luma = dot(color, vec3(0.299, 0.587, 0.114));
        color = mix(vec3(luma), color, u_saturation);
        
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
    if (!gl) { console.error('WebGL not supported'); return; }
    const program = createProgram(gl);
    if (!program) return;

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
    const timeLocation = gl.getUniformLocation(program, 'u_time');
    const speedLocation = gl.getUniformLocation(program, 'u_speed');
    const hueLocation = gl.getUniformLocation(program, 'u_hue');
    const saturationLocation = gl.getUniformLocation(program, 'u_saturation');
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
      gl.enableVertexAttribArray(positionLocation);
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
      gl.uniform1f(timeLocation, (Date.now() - startTimeRef.current) / 1000);
      gl.uniform1f(speedLocation, speed);
      gl.uniform1f(hueLocation, colorHue);
      gl.uniform1f(saturationLocation, colorSaturation);
      gl.uniform1f(intensityLocation, intensity);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();
    return () => { if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current); };
  }, [speed, colorHue, colorSaturation, intensity]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full ${className} transition-opacity duration-1000 animate-fade-in`}
    />
  );
}
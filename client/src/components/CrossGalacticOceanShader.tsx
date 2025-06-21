import React, { useEffect, useRef } from 'react';

interface CrossGalacticOceanShaderProps {
  className?: string;
  speed?: number;
  colorHue?: number;
  colorSaturation?: number;
  intensity?: number;
}

export default function CrossGalacticOceanShader({ 
  className = "", 
  speed = 1.0,
  colorHue = 0,
  colorSaturation = 1.0,
  intensity = 1.0
}: CrossGalacticOceanShaderProps) {
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

      #define PI 3.1415926535
      #define STEPS 50

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
        float secondBestDist = 99999.9;
        vec2 bestCenter = center;
        float bestDist = 99999.9;
        
        for (int y = -1; y <= 1; y++) {
        for (int x = -1; x <= 1; x++) {
          vec2 currentCenter = center + vec2(float(x), float(y));
            
            currentCenter.x += noise(
              u_time * u_speed * vec2(0.5124, 0.5894) + 
              currentCenter * vec2(1.3124, 1.7894)) * 1.0 - 0.5;
            currentCenter.y += noise(
              u_time * u_speed * vec2(0.5565, 0.5561) - 
              currentCenter * vec2(1.5124, 1.6053)) * 1.0 - 0.5;
            
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
        vec3 nine = vec3(dir, 0.0).yxz;
        nine.x = -nine.x;
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
        float sunWave = sin(dir.z * 300.0 + u_time * u_speed * 1.846 +
                           sin(ytemp * 190.0 + u_time * u_speed * 0.45) * 1.3) * 0.5 + 0.5;
        float sunHeight2 = smoothstep(-0.1, 0.2, dir.z);
        sunWave = sunWave * sunHeight2 + 1.0 - sunHeight2;
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
        float radius = smoothstep(0.6, 1.0, noise(center * 42.487 +
                                                  vec2(0.1514, 0.1355) * u_time * u_speed));
        radius *= 0.01;
        vec2 delta = uv - center;
        float dist = dot(delta, delta);
        float frac = 1.0 - smoothstep(0.0, radius, dist);
        float frac2 = frac;
        frac2 *= frac2; frac2 *= frac2; frac2 *= frac2;
        vec3 lightColor = mix(vec3(0.988, 0.769, 0.176), 
                             vec3(0.988, 0.434, 0.875), noise(center * 74.487));
        return mix(color, lightColor, frac) + vec3(1.0) * frac2;
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

      vec3 getWaveColor(vec3 p, vec3 projClosest, vec3 projSecondClosest,
                       vec3 dir, float dist, vec2 frag) {
        float distanceToEdge = abs(projClosest.z - projSecondClosest.z);
        float distanceFrac = smoothstep(-10.0, 100.0, dist);
        distanceFrac *= distanceFrac; distanceFrac *= distanceFrac;
        float frac = smoothstep(0.0, 0.1 + distanceFrac * 0.9, distanceToEdge);
        vec3 norm = normal(p, projClosest);
        vec3 color = getBackgroundColor(reflect(dir, norm));
        frac *= (sin(frag.y / u_resolution.y * 700.0) * 0.5 + 0.5) * (1.0 - distanceFrac);
        return mix(vec3(0.43, 0.77, 0.85), color, frac);
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution.xy * 2.0 - 1.0;
        uv.y *= u_resolution.y / u_resolution.x;
        
        vec3 from = vec3(0.0, 0.0, 0.2);
        vec3 dir = normalize(vec3(uv.x * 0.6, 1.0, uv.y * -0.6));
        
        dir.xy *= rot(PI * 0.5);
        vec2 mouse = vec2(0.0, 0.0); // Default mouse position
        dir.xz *= rot(3.16 - (-mouse.y * 1.5) + sin(u_time * u_speed * 0.785) * 0.008);
        dir.xy *= rot(-mouse.x * 4.0 + sin(u_time * u_speed * 0.416) * 0.01);
        dir.yz *= rot(sin(u_time * u_speed * 0.287) * 0.009);
        
        vec3 color = vec3(0.0);
        
        if (dir.z > 0.0) {
          color = getBackgroundColor(dir);
        } else {
          float totdist = from.z / -dir.z;
          for (int steps = 0; steps < 50; steps++) {
            vec3 p = from + totdist * dir;
            vec3 projClosest;
            vec3 projSecondClosest;
            p.x -= u_time * u_speed * 2.7;
            float dist = de(p, projClosest, projSecondClosest);
            totdist += dist;
            if (dist < 0.01 || steps == 49) {
              color = getWaveColor(p, projClosest, projSecondClosest,
                                 dir, totdist, gl_FragCoord.xy);
              break;
            }
          }
        }
        
        // Apply user controls
        color *= u_intensity;
        
        // Apply hue shift using rotation
        float hueShift = u_hue * 0.0174533; // degrees to radians
        vec3 k = vec3(0.57735, 0.57735, 0.57735); // normalized (1,1,1)
        color = color * cos(hueShift) + cross(k, color) * sin(hueShift) + k * dot(k, color) * (1.0 - cos(hueShift));
        
        // Apply saturation
        float gray = dot(color, vec3(0.299, 0.587, 0.114));
        color = mix(vec3(gray), color, u_saturation);
        
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
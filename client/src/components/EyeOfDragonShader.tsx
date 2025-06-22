// client/src/components/EyeOfDragonShader.tsx
import { useEffect, useRef } from 'react';

interface EyeOfDragonShaderProps {
  className?: string;
  speed?: number;
  colorHue?: number;
  colorSaturation?: number;
  intensity?: number;
}

export default function EyeOfDragonShader({
  className = "",
  speed = 1.0,
  colorHue = 0.05, // Default to a fiery orange/red
  colorSaturation = 0.9,
  intensity = 1.0
}: EyeOfDragonShaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const startTimeRef = useRef<number>(Date.now());

  const createShader = (gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null => {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(`Shader compilation error:`, gl.getShaderInfoLog(shader));
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
      
      // Uniforms from React
      uniform vec2 u_resolution;
      uniform float u_time;
      uniform float u_speed;
      uniform float u_colorHue;
      uniform float u_colorSaturation;
      uniform float u_intensity;

      // --- Performance & Quality Controls ---
      #define VOLUMETRIC_STEPS 28
      #define FRACTAL_ITERATIONS 10

      // --- Scene Constants ---
      #define PI 3.1415926535
      #define EYE_RADIUS 0.8
      #define PUPIL_WIDTH 0.1
      #define IRIS_RADIUS 0.7

      // --- Helper Functions ---
      vec3 hsv2rgb(vec3 c) {
        vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
        vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
        return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
      }

      mat2 rotate(float a) {
        float s = sin(a); float c = cos(a);
        return mat2(c, -s, s, c);
      }
      
      // ACES Filmic Tonemapping for cinematic colors
      vec3 aces(vec3 x) {
        float a = 2.51; float b = 0.03; float c = 2.43; float d = 0.59; float e = 0.14;
        return clamp((x*(a*x+b))/(x*(c*x+d)+e), 0.0, 1.0);
      }
      
      // 3D Hashing and Noise
      vec3 hash33(vec3 p) {
        p = vec3(dot(p, vec3(127.1, 311.7, 74.7)),
                 dot(p, vec3(269.5, 183.3, 246.1)),
                 dot(p, vec3(113.5, 271.9, 124.6)));
        return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
      }
      
      float fbm(vec3 p) {
        float f = 0.0;
        mat3 m = mat3(0.00, 0.80, 0.60, -0.80, 0.36, -0.48, -0.60, -0.48, 0.64);
        f += 0.5000 * dot(hash33(p), vec3(1.0)); p = m * p * 2.02;
        f += 0.2500 * dot(hash33(p), vec3(1.0)); p = m * p * 2.03;
        f += 0.1250 * dot(hash33(p), vec3(1.0));
        return f / 0.875;
      }
      
      // --- Signed Distance Functions (SDFs) ---
      float sdSphere(vec3 p, float r) { return length(p) - r; }
      
      // This function defines the entire 3D scene
      float map(vec3 p, float time) {
        // The Eye
        float eye_dist = sdSphere(p, EYE_RADIUS);
        
        // The Fractal "Smoke" around the eye (modified Star Nest)
        vec3 fp = p * 1.5;
        float fractal_dist = 0.0;
        float pa = 0.0;
        float formuparam = 0.53 + sin(time * 0.1) * 0.05;
        for (int i=0; i < FRACTAL_ITERATIONS; i++) { 
            fp = abs(fp) / dot(fp, fp) - formuparam;
            fractal_dist += abs(length(fp) - pa);
            pa = length(fp);
        }
        fractal_dist = pow(fractal_dist * 0.05, 3.0);
        
        // Smoothly blend the eye and the smoke
        float blend_factor = smoothstep(0.0, 1.5, length(p));
        return mix(eye_dist, fractal_dist, blend_factor);
      }
      
      // --- Shading & Coloring ---
      vec3 shade(vec3 p, float time) {
          // --- Eye Coloring ---
          // Normalize position on the sphere for UV mapping
          vec3 eye_uvw = normalize(p);
          float eye_dist = sdSphere(p, EYE_RADIUS);
          vec3 eye_color = vec3(0.0);

          if (eye_dist < 0.05) { // We are on or inside the eye
              // --- Blinking eyelid ---
              float blink_cycle = mod(time * 0.2, 5.0);
              float blink = smoothstep(4.8, 4.75, blink_cycle) - smoothstep(4.95, 5.0, blink_cycle);
              float eyelid_pos = -0.5 + blink * 1.5;
              if (eye_uvw.y > eyelid_pos) return vec3(0.02, 0.01, 0.01); // Eyelid color

              // --- Pupil ---
              float pupil_width = PUPIL_WIDTH * (0.6 + 0.4 * sin(time * 0.5)); // Dilating pupil
              float pupil = smoothstep(pupil_width, pupil_width + 0.01, abs(eye_uvw.x));
              float pupil_height = smoothstep(IRIS_RADIUS, IRIS_RADIUS - 0.1, abs(eye_uvw.y));
              float pupil_mask = 1.0 - (1.0 - pupil) * pupil_height;

              // --- Iris ---
              float angle = atan(eye_uvw.x, eye_uvw.z);
              float iris_pattern = fbm(vec3(angle*2.0, length(eye_uvw.xz)*5.0, time*0.2));
              iris_pattern = pow(iris_pattern, 2.0);
              vec3 iris_color = hsv2rgb(vec3(u_colorHue, u_colorSaturation, 0.5 + iris_pattern * 0.5));
              
              // --- Sclera (veins) ---
              float veins = pow(fbm(eye_uvw * 8.0 + time * 0.1), 5.0) * 0.8;
              vec3 sclera_color = vec3(0.8, 0.6, 0.6) + veins * vec3(1.0, 0.2, 0.2);

              // Layer the eye parts
              eye_color = mix(vec3(0.01), iris_color, pupil_mask); // Pupil is black
              eye_color = mix(eye_color, sclera_color, smoothstep(IRIS_RADIUS, IRIS_RADIUS + 0.05, length(eye_uvw.xz)));
              eye_color *= (1.0 - smoothstep(EYE_RADIUS-0.1, EYE_RADIUS, length(p))); // Fade at the edge
          }
          
          // --- Volumetric Smoke/Nebula coloring ---
          float smoke_pattern = fbm(p * 2.0 + time * 0.1);
          vec3 smoke_color = hsv2rgb(vec3(u_colorHue + 0.5, 0.6, smoke_pattern));
          smoke_color = mix(smoke_color, vec3(1.0, 0.2, 0.1), pow(fbm(p*4.0 + time * 0.5), 3.0)); // Fiery embers

          float blend = smoothstep(EYE_RADIUS, EYE_RADIUS + 0.5, length(p));
          
          return mix(eye_color, smoke_color, blend) * u_intensity;
      }


      void main() {
        // --- Camera Setup ---
        vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
        float time = u_time * u_speed;
        
        vec3 ro = vec3(0.0, 0.0, -4.0); // Ray origin (camera position)
        vec3 rd = normalize(vec3(uv, 1.0)); // Ray direction

        // Animate camera rotation to make the eye "look around"
        ro.xy += vec2(sin(time * 0.2), cos(time * 0.3)) * 0.5;
        
        // --- Raymarching ---
        float d = 0.0; // distance traveled
        vec3 col = vec3(0.0);
        float alpha = 1.0;

        for(int i=0; i < VOLUMETRIC_STEPS; i++) {
          vec3 p = ro + rd * d;
          float dist = map(p, time);
          
          vec3 shaded_color = shade(p, time);
          col += alpha * shaded_color * 0.2; // Accumulate color
          alpha *= 0.9; // Volumetric absorption

          d += max(0.05, dist * 0.5); // Step forward
          if (alpha < 0.01 || d > 8.0) break;
        }

        // --- Post-processing ---
        col = aces(col); // Apply filmic tonemapping
        col = pow(col, vec3(0.8)); // Gamma correction

        // Vignette
        col *= 1.0 - dot(uv, uv) * 0.3;

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
      gl.enableVertexAttribArray(positionLocation);
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

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
    return () => { if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current); };
  }, [speed, colorHue, colorSaturation, intensity]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full ${className} transition-opacity duration-1000 animate-fade-in`}
    />
  );
}
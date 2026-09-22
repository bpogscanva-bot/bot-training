import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import '../../styles/Orb.css';

const DEFAULT_ORB_COLORS = ['#CADCFC', '#A0B9D1'];

// Generador de textura de ruido suave y orgánico (evita ruido blanco estático que produce parpadeo)
function createSmoothNoiseTexture() {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  const imgData = ctx.createImageData(size, size);
  const data = imgData.data;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const nx = (x / size) * Math.PI * 2;
      const ny = (y / size) * Math.PI * 2;
      const v1 = Math.sin(nx) * Math.cos(ny);
      const v2 = Math.sin(nx * 2 + 1.2) * Math.cos(ny * 2 + 0.8) * 0.5;
      const v3 = Math.sin(nx * 4 - ny * 2) * 0.25;
      const normalized = Math.floor(((v1 + v2 + v3) / 1.75 * 0.5 + 0.5) * 255);

      const idx = (y * size + x) * 4;
      data[idx] = normalized;
      data[idx + 1] = normalized;
      data[idx + 2] = normalized;
      data[idx + 3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}

const vertexShader = /* glsl */ `
uniform float uTime;
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = /* glsl */ `
uniform float uTime;
uniform float uAnimation;
uniform float uInverted;
uniform float uOffsets[7];
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform float uInputVolume;
uniform float uOutputVolume;
uniform float uOpacity;
uniform sampler2D uPerlinTexture;
varying vec2 vUv;

const float PI = 3.14159265358979323846;

bool drawOval(vec2 polarUv, vec2 polarCenter, float a, float b, bool reverseGradient, float softness, out vec4 color) {
    vec2 p = polarUv - polarCenter;
    float oval = (p.x * p.x) / (a * a) + (p.y * p.y) / (b * b);
    float edge = smoothstep(1.0, 1.0 - softness, oval);

    if (edge > 0.0) {
        float gradient = reverseGradient ? (1.0 - (p.x / a + 1.0) / 2.0) : ((p.x / a + 1.0) / 2.0);
        gradient = mix(0.5, gradient, 0.1);
        color = vec4(vec3(gradient), 0.85 * edge);
        return true;
    }
    return false;
}

vec3 colorRamp(float grayscale, vec3 color1, vec3 color2, vec3 color3, vec3 color4) {
    if (grayscale < 0.33) {
        return mix(color1, color2, grayscale * 3.0);
    } else if (grayscale < 0.66) {
        return mix(color2, color3, (grayscale - 0.33) * 3.0);
    } else {
        return mix(color3, color4, (grayscale - 0.66) * 3.0);
    }
}

vec2 hash2(vec2 p) {
    return fract(sin(vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)))) * 43758.5453);
}

float noise2D(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    float n = mix(
        mix(dot(hash2(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)),
            dot(hash2(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
        mix(dot(hash2(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
            dot(hash2(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x),
        u.y
    );
    return 0.5 + 0.5 * n;
}

float sharpRing(vec3 decomposed, float time) {
    float ringStart = 1.0;
    float ringWidth = 0.3;
    float noiseScale = 4.0;
    float noise = mix(
        noise2D(vec2(decomposed.x, time) * noiseScale),
        noise2D(vec2(decomposed.y, time) * noiseScale),
        decomposed.z
    );
    noise = (noise - 0.5) * 2.0;
    return ringStart + noise * ringWidth * 1.2;
}

float smoothRing(vec3 decomposed, float time) {
    float ringStart = 0.9;
    float ringWidth = 0.2;
    float noiseScale = 5.0;
    float noise = mix(
        noise2D(vec2(decomposed.x, time) * noiseScale),
        noise2D(vec2(decomposed.y, time) * noiseScale),
        decomposed.z
    );
    noise = (noise - 0.5) * 4.0;
    return ringStart + noise * ringWidth;
}

float flow(vec3 decomposed, float time) {
    return mix(
        texture2D(uPerlinTexture, vec2(time, decomposed.x / 2.0)).r,
        texture2D(uPerlinTexture, vec2(time, decomposed.y / 2.0)).r,
        decomposed.z
    );
}

void main() {
    vec2 uv = vUv * 2.0 - 1.0;
    float radius = length(uv);
    float theta = atan(uv.y, uv.x);
    if (theta < 0.0) theta += 2.0 * PI;

    vec3 decomposed = vec3(
        theta / (2.0 * PI),
        mod(theta / (2.0 * PI) + 0.5, 1.0) + 1.0,
        abs(theta / PI - 1.0)
    );

    float noise = flow(decomposed, radius * 0.03 - uAnimation * 0.15) - 0.5;
    theta += noise * mix(0.06, 0.20, uOutputVolume);

    vec4 color = vec4(1.0, 1.0, 1.0, 1.0);
    float originalCenters[7];
    originalCenters[0] = 0.0;
    originalCenters[1] = 0.5 * PI;
    originalCenters[2] = 1.0 * PI;
    originalCenters[3] = 1.5 * PI;
    originalCenters[4] = 2.0 * PI;
    originalCenters[5] = 2.5 * PI;
    originalCenters[6] = 3.0 * PI;

    float centers[7];
    for (int i = 0; i < 7; i++) {
        centers[i] = originalCenters[i] + 0.5 * sin(uTime / 20.0 + uOffsets[i]);
    }

    float a, b;
    vec4 ovalColor;

    for (int i = 0; i < 7; i++) {
        float n = texture2D(uPerlinTexture, vec2(mod(centers[i] + uTime * 0.04, 1.0), 0.5)).r;
        a = 0.5 + n * 0.3;
        b = n * mix(3.5, 2.5, uInputVolume);
        bool reverseGradient = (i % 2 == 1);

        float distTheta = min(
            abs(theta - centers[i]),
            min(
                abs(theta + 2.0 * PI - centers[i]),
                abs(theta - 2.0 * PI - centers[i])
            )
        );
        float distRadius = radius;
        float softness = 0.6;

        if (drawOval(vec2(distTheta, distRadius), vec2(0.0, 0.0), a, b, reverseGradient, softness, ovalColor)) {
            color.rgb = mix(color.rgb, ovalColor.rgb, ovalColor.a);
            color.a = max(color.a, ovalColor.a);
        }
    }

    float ringRadius1 = sharpRing(decomposed, uTime * 0.08);
    float ringRadius2 = smoothRing(decomposed, uTime * 0.08);
    
    float inputRadius1 = radius + uInputVolume * 0.18;
    float inputRadius2 = radius + uInputVolume * 0.14;
    float opacity1 = mix(0.15, 0.5, uInputVolume);
    float opacity2 = mix(0.12, 0.38, uInputVolume);

    // Suavizado continuo de anillos: elimina el parpadeo abrupto del ternario binario
    float ringAlpha1 = smoothstep(ringRadius1 - 0.04, ringRadius1 + 0.04, inputRadius2) * opacity1;
    float ringAlpha2 = smoothstep(ringRadius2 - 0.05, ringRadius2 + 0.05, inputRadius1) * opacity2;
    float totalRingAlpha = max(ringAlpha1, ringAlpha2);
    
    vec3 ringColor = vec3(1.0);
    color.rgb = 1.0 - (1.0 - color.rgb) * (1.0 - ringColor * totalRingAlpha);

    // Sombreado metálico cromo perla de alto rango dinámico
    vec3 color1 = vec3(0.18, 0.22, 0.30);
    vec3 color2 = uColor1;
    vec3 color3 = uColor2;
    vec3 color4 = vec3(1.0, 1.0, 1.0);

    float luminance = mix(color.r, 1.0 - color.r, uInverted);
    color.rgb = colorRamp(luminance, color1, color2, color3, color4);

    // Bisel exterior nítido para contraste contra fondo blanco
    float edgeContrast = 1.0 - smoothstep(0.94, 0.99, radius) * 0.32;
    color.rgb *= edgeContrast;

    color.a *= uOpacity;

    gl_FragColor = color;
}
`;

export function Orb({
  colors = DEFAULT_ORB_COLORS,
  agentState = null, // null | 'listening' | 'talking' | 'thinking'
  className = '',
}) {
  const containerRef = useRef(null);
  const stateRef = useRef(agentState);
  const materialRef = useRef(null);

  // Mantener actualizado el estado del agente sin re-montar Three.js
  useEffect(() => {
    stateRef.current = agentState;
  }, [agentState]);

  const color1 = colors[0] || DEFAULT_ORB_COLORS[0];
  const color2 = colors[1] || DEFAULT_ORB_COLORS[1];

  // Actualizar colores dinámicamente si cambian sin destruir el canvas
  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uColor1.value.set(color1);
      materialRef.current.uniforms.uColor2.value.set(color2);
    }
  }, [color1, color2]);

  // Montar el renderer de Three.js UNA SOLA VEZ para toda la vida del componente (evita parpadeos de desmontaje)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 320;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-3.5, 3.5, 3.5, -3.5, 0.1, 10);
    camera.position.z = 1;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Textura de ruido orgánica continua (sin jitter de ruido blanco)
    const smoothNoise = createSmoothNoiseTexture();

    const offsets = new Float32Array(Array.from({ length: 7 }, () => Math.random() * Math.PI * 2));

    const uniforms = {
      uColor1: { value: new THREE.Color(colors[0] || DEFAULT_ORB_COLORS[0]) },
      uColor2: { value: new THREE.Color(colors[1] || DEFAULT_ORB_COLORS[1]) },
      uOffsets: { value: offsets },
      uPerlinTexture: { value: smoothNoise },
      uTime: { value: 0 },
      uAnimation: { value: 0.1 },
      uInverted: { value: 0 },
      uInputVolume: { value: 0 },
      uOutputVolume: { value: 0 },
      uOpacity: { value: 0 },
    };

    const geometry = new THREE.CircleGeometry(3.2, 64);
    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      transparent: true,
    });
    materialRef.current = material;

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    let curIn = 0;
    let curOut = 0.3;
    let animSpeed = 0.1;
    let animationFrameId;
    let lastTime = performance.now();

    const animate = (currentTime) => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      uniforms.uTime.value += delta * 0.45;

      if (uniforms.uOpacity.value < 1) {
        uniforms.uOpacity.value = Math.min(1, uniforms.uOpacity.value + delta * 2.5);
      }

      const t = uniforms.uTime.value * 2;
      let targetIn;
      let targetOut;

      if (stateRef.current === 'listening') {
        // En escucha: pulsación suave y atenta
        targetIn = 0.35 + Math.sin(t * 1.8) * 0.15;
        targetOut = 0.38;
      } else if (stateRef.current === 'talking') {
        // Al hablar: ondas rítmicas fluidas continuas (sin sacudidas ni parpadeo)
        targetIn = 0.52 + Math.sin(t * 2.4) * 0.18 + Math.cos(t * 3.6) * 0.10;
        targetOut = 0.65 + Math.sin(t * 2.8) * 0.16;
      } else if (stateRef.current === 'thinking') {
        targetIn = 0.25 + Math.sin(t * 3.0) * 0.12;
        targetOut = 0.35;
      } else {
        // Reposo: respiración zen ultra-suave
        targetIn = 0.08 + Math.sin(t * 0.9) * 0.04;
        targetOut = 0.20;
      }

      // Amortiguación armónica sedosa
      curIn += (targetIn - curIn) * 0.08;
      curOut += (targetOut - curOut) * 0.08;

      const targetSpeed = 0.08 + curOut * 0.45;
      animSpeed += (targetSpeed - animSpeed) * 0.08;

      uniforms.uAnimation.value += delta * animSpeed;
      uniforms.uInputVolume.value = curIn;
      uniforms.uOutputVolume.value = curOut;

      renderer.render(scene, camera);
    };

    animationFrameId = requestAnimationFrame(animate);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 320;
      const h = container.clientHeight || 320;
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      smoothNoise.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Montado una sola vez: estabilidad absoluta

  return (
    <div className={`eleven-orb-wrapper ${className}`}>
      <div ref={containerRef} className="eleven-orb-canvas-container" />
    </div>
  );
}

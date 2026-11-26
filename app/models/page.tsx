'use client';
import { useEffect, useRef, useState } from 'react';

const MODELS = [
  {
    id: 'boxabl',
    name: 'Boxabl Casita',
    subtitle: 'Starting at $150,000 — 361 sqft — The Most Affordable',
    file: '/models/boxabl-casita-raw.glb',
    color: '#C9A84C',
    specs: [
      { label: 'Starting Price', value: '$150,000' },
      { label: 'Size', value: '361 sq ft' },
      { label: 'On-Site Assembly', value: '1 Day' },
      { label: 'Structure', value: 'Steel frame, foam core panels' },
      { label: 'R-Value', value: 'R-33 walls, R-50 ceiling' },
      { label: 'Status', value: 'Waitlist — 175K+ signups' },
      { label: 'Ships As', value: 'Folds flat, unfolds on-site' },
      { label: 'States', value: 'CA, NV, AZ, TX, NM, SC' },
    ],
    facts: [
      'Folds to 8.5ft wide for transport — unfolds in hours',
      'Steel chassis designed for 500-year lifespan',
      'Factory in Las Vegas, NV — Nasdaq IPO July 2026 (BXBL)',
      'Elon Musk reportedly owns one at SpaceX facility',
    ],
  },
  {
    id: 'icon',
    name: 'ICON 3D Printed Home',
    subtitle: 'From $150,000 (ADU) — Wolf Ranch community fully sold',
    file: '/models/icon-home-raw.glb',
    color: '#102A43',
    specs: [
      { label: 'Starting Price', value: '$150,000 (ADU)' },
      { label: 'Size', value: '400–3,000 sq ft' },
      { label: 'Factory Time', value: '8–24 weeks' },
      { label: 'Structure', value: 'Lavacrete 3D printed concrete' },
      { label: 'Wall Strength', value: '5,000 PSI compressive' },
      { label: 'Status', value: 'Available — TX primary' },
      { label: 'Funding', value: '$583M — BlackRock Series D' },
      { label: 'Certifications', value: 'ASTM, ICC, Austin permitted' },
    ],
    facts: [
      'Vulcan construction system prints a home in 24 hours',
      'Wolf Ranch: world\'s first 3D-printed community — 100 homes',
      'Monthly electricity bills as low as $35 at Wolf Ranch',
      'NASA contract to develop lunar habitat printing tech',
    ],
  },
];

export default function ModelsPage() {
  const [activeModel, setActiveModel] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [viewerError, setViewerError] = useState(false);
  const [rotating, setRotating] = useState(true);
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<any>(null);
  const animRef = useRef<number>(0);
  const modelRef = useRef<any>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    setIsLoading(true);
    setViewerError(false);

    let THREE: any, renderer: any, scene: any, camera: any;

    const init = async () => {
      try {
        THREE = await import('three');
        const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
        const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js');

        const W = mountRef.current!.clientWidth;
        const H = mountRef.current!.clientHeight;

        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(W, H);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.4;
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        mountRef.current!.appendChild(renderer.domElement);

        scene = new THREE.Scene();
        scene.background = new THREE.Color('#FBF7F0');

        // iOS-safe lighting (no PMREMGenerator)
        scene.add(new THREE.HemisphereLight(0xffffff, 0xf0ede8, 0.6));
        const sun = new THREE.DirectionalLight(0xfff5e0, 1.8);
        sun.position.set(5, 10, 7);
        sun.castShadow = true;
        scene.add(sun);
        const fill = new THREE.DirectionalLight(0xe8f4ff, 0.4);
        fill.position.set(-5, 3, -5);
        scene.add(fill);

        // Ground plane
        const ground = new THREE.Mesh(
          new THREE.CircleGeometry(4, 64),
          new THREE.MeshLambertMaterial({ color: 0xE8E0D4 })
        );
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -1.2;
        ground.receiveShadow = true;
        scene.add(ground);

        camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100);
        camera.position.set(3, 2, 4);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.minDistance = 1.5;
        controls.maxDistance = 10;
        controls.maxPolarAngle = Math.PI / 2;

        sceneRef.current = { THREE, renderer, scene, camera, controls };

        const loader = new GLTFLoader();
        loader.load(
          MODELS[activeModel].file,
          (gltf: any) => {
            if (modelRef.current) scene.remove(modelRef.current);

            const box = new THREE.Box3().setFromObject(gltf.scene);
            const size = new THREE.Vector3();
            box.getSize(size);
            const maxDim = Math.max(size.x, size.y, size.z);
            const targetSize = 2.4;
            if (maxDim > 0) gltf.scene.scale.setScalar(targetSize / maxDim);

            const center = new THREE.Vector3();
            box.getCenter(center);
            gltf.scene.position.sub(center.multiplyScalar(targetSize / maxDim));
            gltf.scene.position.y += 0;

            gltf.scene.traverse((child: any) => {
              if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
              }
            });

            scene.add(gltf.scene);
            modelRef.current = gltf.scene;
            setIsLoading(false);
          },
          undefined,
          () => { setViewerError(true); setIsLoading(false); }
        );

        const animate = () => {
          animRef.current = requestAnimationFrame(animate);
          if (rotating && modelRef.current) {
            modelRef.current.rotation.y += 0.004;
          }
          controls.update();
          renderer.render(scene, camera);
        };
        animate();

        const handleResize = () => {
          if (!mountRef.current) return;
          const W2 = mountRef.current.clientWidth;
          const H2 = mountRef.current.clientHeight;
          camera.aspect = W2 / H2;
          camera.updateProjectionMatrix();
          renderer.setSize(W2, H2);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
      } catch {
        setViewerError(true);
        setIsLoading(false);
      }
    };

    init();

    return () => {
      cancelAnimationFrame(animRef.current);
      if (sceneRef.current?.renderer) {
        sceneRef.current.renderer.dispose();
        mountRef.current?.removeChild(sceneRef.current.renderer.domElement);
      }
      sceneRef.current = null;
      modelRef.current = null;
    };
  }, [activeModel]);

  const model = MODELS[activeModel];

  return (
    <div style={{ minHeight: '100vh', background: '#FBF7F0', paddingBottom: 80 }}>
      {/* Header */}
      <div style={{
        background: '#fff',
        borderBottom: '1px solid rgba(16,42,67,0.1)',
        padding: '24px 32px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
      }}>
        <a href="/" style={{ color: '#C9A84C', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>← Rankings</a>
        <span style={{ color: '#D1C9BE' }}>|</span>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#102A43' }}>
            3D Virtual Tours
          </h1>
          <p style={{ margin: 0, fontSize: 13, color: '#6B7280' }}>
            AI-generated models via Meshy — rotate, zoom, explore
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        {/* Model selector */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          {MODELS.map((m, i) => (
            <button key={m.id} onClick={() => setActiveModel(i)} style={{
              background: activeModel === i ? '#102A43' : '#fff',
              color: activeModel === i ? '#fff' : '#102A43',
              border: `2px solid ${activeModel === i ? '#102A43' : 'rgba(16,42,67,0.15)'}`,
              borderRadius: 10,
              padding: '10px 20px',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: 14,
              transition: 'all 0.15s',
            }}>
              {m.name}
            </button>
          ))}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button onClick={() => setRotating(!rotating)} style={{
              background: rotating ? '#C9A84C' : '#fff',
              color: rotating ? '#fff' : '#6B7280',
              border: `1px solid ${rotating ? '#C9A84C' : 'rgba(16,42,67,0.15)'}`,
              borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 600,
            }}>
              {rotating ? '⏸ Pause' : '▶ Rotate'}
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24, alignItems: 'start' }}>
          {/* 3D Viewer */}
          <div style={{
            background: '#fff',
            borderRadius: 20,
            overflow: 'hidden',
            boxShadow: '0 4px 40px rgba(16,42,67,0.1)',
            border: '1px solid rgba(16,42,67,0.08)',
            position: 'relative',
          }}>
            <div ref={mountRef} style={{ width: '100%', height: 520, background: '#FBF7F0' }}>
              {isLoading && (
                <div style={{
                  position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', background: '#FBF7F0',
                }}>
                  <div style={{
                    width: 48, height: 48, border: '3px solid rgba(201,168,76,0.2)',
                    borderTop: '3px solid #C9A84C', borderRadius: '50%',
                    animation: 'spin 1s linear infinite', marginBottom: 16,
                  }} />
                  <p style={{ color: '#6B7280', fontSize: 14 }}>Loading 3D model...</p>
                </div>
              )}
              {viewerError && (
                <div style={{
                  position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', background: '#FBF7F0',
                }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>🏠</div>
                  <p style={{ color: '#6B7280', fontSize: 14 }}>3D viewer unavailable — WebGL not supported</p>
                </div>
              )}
            </div>
            <div style={{
              padding: '16px 20px',
              borderTop: '1px solid rgba(16,42,67,0.08)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <div style={{ fontWeight: 800, color: '#102A43', fontSize: 16 }}>{model.name}</div>
                <div style={{ color: '#6B7280', fontSize: 13 }}>{model.subtitle}</div>
              </div>
              <span style={{
                background: 'rgba(201,168,76,0.12)',
                border: '1px solid rgba(201,168,76,0.3)',
                color: '#C9A84C', fontSize: 11, padding: '4px 10px', borderRadius: 6,
                fontWeight: 700, letterSpacing: '0.08em',
              }}>AI GENERATED · MESHY</span>
            </div>
            <div style={{ padding: '0 20px 16px', color: '#9CA3AF', fontSize: 11, textAlign: 'center' }}>
              Drag to rotate · Scroll to zoom · AI-generated architectural visualization
            </div>
          </div>

          {/* Specs panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Tech specs */}
            <div style={{
              background: '#fff',
              borderRadius: 16,
              padding: '20px',
              boxShadow: '0 4px 24px rgba(16,42,67,0.08)',
              border: '1px solid rgba(16,42,67,0.08)',
            }}>
              <h3 style={{ margin: '0 0 16px', color: '#102A43', fontSize: 15, fontWeight: 700 }}>
                Technical Specifications
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {model.specs.map(s => (
                  <div key={s.label} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                    paddingBottom: 10, borderBottom: '1px solid rgba(16,42,67,0.06)',
                  }}>
                    <span style={{ color: '#6B7280', fontSize: 12, flex: 1 }}>{s.label}</span>
                    <span style={{ color: '#102A43', fontSize: 12, fontWeight: 600, textAlign: 'right', flex: 1 }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Key facts */}
            <div style={{
              background: '#102A43',
              borderRadius: 16,
              padding: '20px',
            }}>
              <h3 style={{ margin: '0 0 14px', color: '#C9A84C', fontSize: 14, fontWeight: 700, letterSpacing: '0.06em' }}>
                KEY FACTS
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {model.facts.map((f, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ color: '#C9A84C', fontSize: 14, flexShrink: 0 }}>→</span>
                    <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, lineHeight: 1.5 }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <a href={activeModel === 0 ? 'https://boxabl.com' : 'https://iconbuild.com'} target="_blank" rel="noopener" style={{
              background: '#C9A84C',
              color: '#fff',
              textDecoration: 'none',
              padding: '14px 20px',
              borderRadius: 12,
              textAlign: 'center',
              fontWeight: 700,
              fontSize: 15,
              display: 'block',
            }}>
              Visit {model.name} →
            </a>
          </div>
        </div>

        {/* Coming soon note */}
        <div style={{
          marginTop: 32, padding: '16px 20px',
          background: 'rgba(201,168,76,0.08)',
          border: '1px solid rgba(201,168,76,0.2)',
          borderRadius: 12, textAlign: 'center',
        }}>
          <span style={{ color: '#C9A84C', fontWeight: 700, fontSize: 13 }}>
            More models coming — Dvele, Method Homes, and Fading West in production
          </span>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

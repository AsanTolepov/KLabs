import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface MoleculeViewerProps {
  modelType: string | null;
  colors?: string[];
}

interface LegendItem {
  name: string;
  color: string;
}

const MoleculeViewer: React.FC<MoleculeViewerProps> = ({ modelType, colors }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const frameIdRef = useRef<number>(0);
  const moleculeGroupRef = useRef<THREE.Group | null>(null);
  
  // YANGI: Tarkibni saqlash uchun state
  const [legendItems, setLegendItems] = useState<LegendItem[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    // 1. SAHNA SOZLAMALARI
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    const scene = new THREE.Scene();
    
    // Kamera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 7;
    camera.position.y = 1;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;

    // Tozalash
    if (containerRef.current.firstChild) {
      // Eski canvasni topib o'chirish (faqat canvasni, legend divni emas)
      const oldCanvas = containerRef.current.querySelector('canvas');
      if (oldCanvas) containerRef.current.removeChild(oldCanvas);
    }
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 2. YORUG'LIK
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const mainLight = new THREE.DirectionalLight(0xffffff, 2.0);
    mainLight.position.set(5, 10, 7);
    mainLight.castShadow = true;
    scene.add(mainLight);

    const rimLight = new THREE.PointLight(0x0068FF, 1.0);
    rimLight.position.set(-5, 5, -5);
    scene.add(rimLight);

    // 3. MOLEKULA GURUHI
    const group = new THREE.Group();
    moleculeGroupRef.current = group;

    // --- YORDAMCHI FUNKSIYALAR ---
    const createAtom = (radius: number, color: string, x: number, y: number, z: number) => {
      const geometry = new THREE.SphereGeometry(radius, 64, 64);
      const material = new THREE.MeshPhysicalMaterial({ 
        color: color, 
        roughness: 0.2, metalness: 0.1, clearcoat: 0.8, clearcoatRoughness: 0.1, transmission: 0
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      group.add(mesh);
      return mesh;
    };

    const createBond = (start: THREE.Vector3, end: THREE.Vector3, radius: number = 0.15) => {
        const direction = new THREE.Vector3().subVectors(end, start);
        const length = direction.length();
        const geometry = new THREE.CylinderGeometry(radius, radius, length, 16, 1);
        const material = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.3 });
        const bond = new THREE.Mesh(geometry, material);
        const center = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
        bond.position.copy(center);
        bond.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
        bond.castShadow = true;
        group.add(bond);
    };

    const type = modelType?.toLowerCase() || '';
    let currentLegend: LegendItem[] = [];

    // ================= 3D MODELLAR VA LEGEND MANTIQI =================

    if (type.includes('h2o') || type.includes('suv')) {
      // H2O
      const oPos = new THREE.Vector3(0, 0, 0);
      const h1Pos = new THREE.Vector3(0.8, -0.6, 0);
      const h2Pos = new THREE.Vector3(-0.8, -0.6, 0);

      createAtom(0.7, '#ff0000', oPos.x, oPos.y, oPos.z);
      createAtom(0.4, '#ffffff', h1Pos.x, h1Pos.y, h1Pos.z);
      createAtom(0.4, '#ffffff', h2Pos.x, h2Pos.y, h2Pos.z);
      createBond(oPos, h1Pos);
      createBond(oPos, h2Pos);
      
      // Legend
      currentLegend = [
        { name: 'Kislorod', color: '#ff0000' },
        { name: 'Vodorod', color: '#ffffff' }
      ];

    } else if (type.includes('cs2') || (type.includes('carbon') && type.includes('sulfide'))) {
      // CS2 (Uglerod Disulfid) - SIZ SO'RAGAN MODEL
      const cPos = new THREE.Vector3(0, 0, 0);
      const s1Pos = new THREE.Vector3(1.4, 0, 0);
      const s2Pos = new THREE.Vector3(-1.4, 0, 0);

      createAtom(0.65, '#333333', cPos.x, cPos.y, cPos.z); // Uglerod (Qora)
      createAtom(0.7, '#ffff00', s1Pos.x, s1Pos.y, s1Pos.z); // Oltingugurt (Sariq)
      createAtom(0.7, '#ffff00', s2Pos.x, s2Pos.y, s2Pos.z); // Oltingugurt (Sariq)

      createBond(cPos, s1Pos, 0.2);
      createBond(cPos, s2Pos, 0.2);

      // Legend
      currentLegend = [
        { name: 'Uglerod', color: '#333333' },
        { name: 'Oltingugurt', color: '#ffff00' }
      ];

    } else if (type.includes('co2')) {
      // CO2
      const cPos = new THREE.Vector3(0, 0, 0);
      const o1Pos = new THREE.Vector3(1.3, 0, 0);
      const o2Pos = new THREE.Vector3(-1.3, 0, 0);

      createAtom(0.65, '#333333', cPos.x, cPos.y, cPos.z);
      createAtom(0.6, '#ff0000', o1Pos.x, o1Pos.y, o1Pos.z);
      createAtom(0.6, '#ff0000', o2Pos.x, o2Pos.y, o2Pos.z);
      createBond(cPos, o1Pos, 0.2);
      createBond(cPos, o2Pos, 0.2);

      currentLegend = [
        { name: 'Uglerod', color: '#333333' },
        { name: 'Kislorod', color: '#ff0000' }
      ];

    } else if (type.includes('nacl') || type.includes('crystal')) {
      // NaCl
      const spacing = 0.9;
      for(let x = -0.5; x <= 0.5; x+=1) {
        for(let y = -0.5; y <= 0.5; y+=1) {
           for(let z = -0.5; z <= 0.5; z+=1) {
              const isNa = (x + y + z) % 2 !== 0;
              createAtom(0.35, isNa ? '#9333ea' : '#22c55e', x*spacing*2, y*spacing*2, z*spacing*2);
              if (x < 0.5) createBond(new THREE.Vector3(x*spacing*2, y*spacing*2, z*spacing*2), new THREE.Vector3((x+1)*spacing*2, y*spacing*2, z*spacing*2), 0.05);
              if (y < 0.5) createBond(new THREE.Vector3(x*spacing*2, y*spacing*2, z*spacing*2), new THREE.Vector3(x*spacing*2, (y+1)*spacing*2, z*spacing*2), 0.05);
              if (z < 0.5) createBond(new THREE.Vector3(x*spacing*2, y*spacing*2, z*spacing*2), new THREE.Vector3(x*spacing*2, y*spacing*2, (z+1)*spacing*2), 0.05);
           }
        }
      }
      currentLegend = [
        { name: 'Natriy', color: '#9333ea' },
        { name: 'Xlor', color: '#22c55e' }
      ];

    } else if (type.includes('ch4') || type.includes('metan')) {
      // CH4
      const cPos = new THREE.Vector3(0, 0, 0);
      const h1 = new THREE.Vector3(0.8, 0.8, 0.8);
      const h2 = new THREE.Vector3(-0.8, -0.8, 0.8);
      const h3 = new THREE.Vector3(-0.8, 0.8, -0.8);
      const h4 = new THREE.Vector3(0.8, -0.8, -0.8);

      createAtom(0.7, '#333333', 0, 0, 0);
      [h1, h2, h3, h4].forEach(h => {
          createAtom(0.35, '#ffffff', h.x, h.y, h.z);
          createBond(cPos, h);
      });
      currentLegend = [
        { name: 'Uglerod', color: '#333333' },
        { name: 'Vodorod', color: '#ffffff' }
      ];

    } else if (type.includes('nh3') || type.includes('ammiak')) {
      // NH3
      const nPos = new THREE.Vector3(0, 0.3, 0);
      const h1 = new THREE.Vector3(0.9, -0.3, 0);
      const h2 = new THREE.Vector3(-0.45, -0.3, 0.8);
      const h3 = new THREE.Vector3(-0.45, -0.3, -0.8);

      createAtom(0.75, '#3b82f6', nPos.x, nPos.y, nPos.z);
      [h1, h2, h3].forEach(h => {
        createAtom(0.35, '#ffffff', h.x, h.y, h.z);
        createBond(nPos, h);
      });
      currentLegend = [
        { name: 'Azot', color: '#3b82f6' },
        { name: 'Vodorod', color: '#ffffff' }
      ];

    } else if (type.includes('hcl')) {
      // HCl
      createAtom(0.4, '#ffffff', -0.8, 0, 0);
      createAtom(0.95, '#22c55e', 0.6, 0, 0);
      createBond(new THREE.Vector3(-0.8, 0, 0), new THREE.Vector3(0.6, 0, 0));
      currentLegend = [
        { name: 'Vodorod', color: '#ffffff' },
        { name: 'Xlor', color: '#22c55e' }
      ];

    } else if (type.includes('fe2o3') || type.includes('rust')) {
      // Zang
      createAtom(0.8, '#8B4513', -0.5, 0, 0);
      createAtom(0.8, '#8B4513', 0.5, 0.4, 0);
      createAtom(0.6, '#ff4444', 0, -0.5, 0.5);
      createAtom(0.6, '#ff4444', 0.8, -0.2, -0.5);
      createAtom(0.6, '#ff4444', -0.8, 0.2, -0.5);
      currentLegend = [
        { name: 'Temir', color: '#8B4513' },
        { name: 'Kislorod', color: '#ff4444' }
      ];

    } else if (type.includes('h2s')) {
       // H2S
       const sPos = new THREE.Vector3(0, 0, 0);
       const h1Pos = new THREE.Vector3(0.8, -0.6, 0);
       const h2Pos = new THREE.Vector3(-0.8, -0.6, 0);
 
       createAtom(0.7, '#ffff00', sPos.x, sPos.y, sPos.z); 
       createAtom(0.4, '#ffffff', h1Pos.x, h1Pos.y, h1Pos.z); 
       createAtom(0.4, '#ffffff', h2Pos.x, h2Pos.y, h2Pos.z); 
       
       createBond(sPos, h1Pos);
       createBond(sPos, h2Pos);

       currentLegend = [
        { name: 'Oltingugurt', color: '#ffff00' },
        { name: 'Vodorod', color: '#ffffff' }
      ];

    } else if (type.includes('so2')) {
      // SO2
      const sPos = new THREE.Vector3(0, 0, 0);
      const o1Pos = new THREE.Vector3(1.0, 0.5, 0);
      const o2Pos = new THREE.Vector3(-1.0, 0.5, 0);

      createAtom(0.7, '#ffff00', sPos.x, sPos.y, sPos.z);
      createAtom(0.6, '#ff0000', o1Pos.x, o1Pos.y, o1Pos.z);
      createAtom(0.6, '#ff0000', o2Pos.x, o2Pos.y, o2Pos.z);
      createBond(sPos, o1Pos, 0.2);
      createBond(sPos, o2Pos, 0.2);

      currentLegend = [
        { name: 'Oltingugurt', color: '#ffff00' },
        { name: 'Kislorod', color: '#ff0000' }
      ];

    } else if (type.includes('c2h2') || type.includes('asetilen')) {
      // C2H2
      createAtom(0.65, '#333333', -0.6, 0, 0);
      createAtom(0.65, '#333333', 0.6, 0, 0);
      createAtom(0.4, '#ffffff', -1.6, 0, 0);
      createAtom(0.4, '#ffffff', 1.6, 0, 0);
      
      createBond(new THREE.Vector3(-0.6,0,0), new THREE.Vector3(0.6,0,0), 0.25);
      createBond(new THREE.Vector3(-0.6,0,0), new THREE.Vector3(-1.6,0,0));
      createBond(new THREE.Vector3(0.6,0,0), new THREE.Vector3(1.6,0,0));

      currentLegend = [
        { name: 'Uglerod', color: '#333333' },
        { name: 'Vodorod', color: '#ffffff' }
      ];

    } else {
      // DEFAULT
      const color1 = colors && colors[0] ? colors[0] : '#cccccc';
      const color2 = colors && colors[1] ? colors[1] : '#888888';
      createAtom(0.8, color1, -0.6, 0, 0);
      createAtom(0.8, color2, 0.6, 0, 0);
      
      currentLegend = [
        { name: 'Atom 1', color: color1 },
        { name: 'Atom 2', color: color2 }
      ];
    }

    setLegendItems(currentLegend);
    scene.add(group);

    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);
      if (moleculeGroupRef.current) {
        moleculeGroupRef.current.rotation.y += 0.005;
        moleculeGroupRef.current.rotation.x = Math.sin(Date.now() * 0.001) * 0.1;
        moleculeGroupRef.current.position.y = Math.cos(Date.now() * 0.001) * 0.1;
      }
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameIdRef.current);
      renderer.dispose();
      if (containerRef.current && renderer.domElement) {
        // Xavfsiz o'chirish
        const canvas = containerRef.current.querySelector('canvas');
        if (canvas) containerRef.current.removeChild(canvas);
      }
    };
  }, [modelType, colors]);

  return (
    <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing relative rounded-lg overflow-hidden">
      {/* Bu yerda Three.js Canvas avtomatik qo'shiladi */}

      {/* YANGI: TARKIBI (LEGEND) QUTISI */}
      <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-slate-200 z-10 max-w-[180px]">
        <p className="text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">Tarkibi</p>
        <div className="flex flex-col gap-2">
          {legendItems.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded-full shadow-sm border border-black/10" 
                style={{ backgroundColor: item.color }}
              ></div>
              <span className="text-sm font-medium text-slate-700">{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MoleculeViewer;
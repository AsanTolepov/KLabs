import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface MoleculeViewerProps {
  modelType: string | null;
  colors: string[];
}

const MoleculeViewer: React.FC<MoleculeViewerProps> = ({ modelType, colors }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const frameIdRef = useRef<number>(0);
  const moleculeGroupRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    // Orqa fon shaffof
    
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.z = 5.5; // Kamerani joylashtirish

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Yorug'likni kuchaytiramiz
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);
    
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(5, 5, 7);
    scene.add(dirLight);
    
    const backLight = new THREE.DirectionalLight(0xffffff, 0.8); // Orqadan ham yorug'lik
    backLight.position.set(-5, -2, -5);
    scene.add(backLight);

    const group = new THREE.Group();
    moleculeGroupRef.current = group;

    const type = modelType?.toLowerCase() || '';

    // --- LOGIKA: Agar suv yoki h2o bo'lsa ---
    if (type.includes('water') || type === 'h2o' || type.includes('suv')) {
      
      // 1. Kislorod (Markaziy Qizil)
      const oxygenGeo = new THREE.SphereGeometry(0.85, 32, 32);
      const oxygenMat = new THREE.MeshPhysicalMaterial({ 
        color: '#ef4444', // Yorqin qizil
        roughness: 0.3, 
        metalness: 0.1,
        clearcoat: 0.8
      });
      const oxygen = new THREE.Mesh(oxygenGeo, oxygenMat);
      group.add(oxygen);

      // Vodorod materiali
      const hGeo = new THREE.SphereGeometry(0.5, 32, 32);
      const hMat = new THREE.MeshPhysicalMaterial({ 
        color: '#ffffff', // Oq
        roughness: 0.2, 
        metalness: 0.0 
      });
      
      // 2. Vodorod (Chap) - Joylashuvini to'g'irladik
      const h1 = new THREE.Mesh(hGeo, hMat);
      h1.position.set(0.8, 0.7, 0); 
      group.add(h1);

      // 3. Vodorod (O'ng) - Joylashuvini to'g'irladik
      const h2 = new THREE.Mesh(hGeo, hMat);
      h2.position.set(-0.8, 0.7, 0); 
      group.add(h2);

    } else {
      // --- DEFAULT (Ko'k Shar) ---
      const sphereGeo = new THREE.SphereGeometry(1.1, 32, 32);
      // Default ko'k rang
      const primaryColor = '#3b82f6'; 
      const mat = new THREE.MeshPhysicalMaterial({ 
        color: primaryColor, 
        roughness: 0.4, 
        metalness: 0.2 
      });
      const sphere = new THREE.Mesh(sphereGeo, mat);
      group.add(sphere);
    }
    
    scene.add(group);

    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);
      if (moleculeGroupRef.current) {
        // Sekin aylanadi
        moleculeGroupRef.current.rotation.y += 0.008;
        // Salgina yuqori-pastga tebranadi (jonliroq effekt uchun)
        moleculeGroupRef.current.rotation.z = Math.sin(Date.now() * 0.001) * 0.05;
      }
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameIdRef.current);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [modelType, colors]);

  return <div ref={containerRef} className="w-full h-full cursor-move" />;
};

export default MoleculeViewer;
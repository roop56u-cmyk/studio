
"use client";

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

type Theme = 'abstract-tech' | 'cosmic-voyage' | 'digital-matrix' | 'organic-growth';

export function WelcomeAnimation() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState<Theme>('abstract-tech');

  useEffect(() => {
    // This runs on the client and reads the theme from localStorage
    const savedTheme = localStorage.getItem('landing_theme') as Theme;
    if (savedTheme && ['abstract-tech', 'cosmic-voyage', 'digital-matrix', 'organic-growth'].includes(savedTheme)) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    if (!mountRef.current) return;

    const currentMount = mountRef.current;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
    camera.position.z = 5;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    currentMount.appendChild(renderer.domElement);

    // Lighting and Objects based on theme
    const shapes: THREE.Mesh[] = [];
    let animationLogic = () => {};

    switch (theme) {
      case 'cosmic-voyage':
        scene.add(new THREE.AmbientLight(0x4040ff, 0.5));
        const pLight1 = new THREE.PointLight(0xaa40ff, 3, 100);
        pLight1.position.set(5, 5, 5);
        scene.add(pLight1);
        const pLight2 = new THREE.PointLight(0x40aaff, 2, 100);
        pLight2.position.set(-5, -5, -2);
        scene.add(pLight2);
        
        // Planets
        for (let i = 0; i < 20; i++) {
          const geometry = new THREE.SphereGeometry(Math.random() * 0.5 + 0.1, 32, 32);
          const material = new THREE.MeshPhongMaterial({ color: new THREE.Color(Math.random(), Math.random(), Math.random()) });
          const mesh = new THREE.Mesh(geometry, material);
          mesh.position.set((Math.random() - 0.5) * 15, (Math.random() - 0.5) * 15, (Math.random() - 0.5) * 15);
          scene.add(mesh);
          shapes.push(mesh);
        }
        animationLogic = () => {
            shapes.forEach(shape => {
                shape.rotation.y += 0.002;
            });
        };
        break;

      case 'digital-matrix':
        scene.add(new THREE.AmbientLight(0x00ff00, 0.2));
        const pLight3 = new THREE.PointLight(0x00ff00, 2, 100);
        pLight3.position.set(0, 5, 5);
        scene.add(pLight3);
        
        // Cubes
        const cubeGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        const cubeMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00, emissive: 0x003300 });
        for (let i = 0; i < 100; i++) {
          const mesh = new THREE.Mesh(cubeGeometry, cubeMaterial);
          mesh.position.set((Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20);
          scene.add(mesh);
          shapes.push(mesh);
        }
        animationLogic = () => {
             shapes.forEach(shape => {
                shape.rotation.x += 0.001;
                shape.rotation.y += 0.001;
            });
        };
        break;
        
      case 'organic-growth':
        scene.add(new THREE.AmbientLight(0x4CAF50, 0.3));
        const pLight4 = new THREE.PointLight(0xFFC107, 3, 100);
        pLight4.position.set(3, 5, 3);
        scene.add(pLight4);

        const leafShape = new THREE.Shape();
        leafShape.moveTo(0, 0);
        leafShape.bezierCurveTo(0, 0, 0, 1, 0.5, 1.5);
        leafShape.bezierCurveTo(1, 1, 1.5, 0, 0, 0);
        const leafGeometry = new THREE.ShapeGeometry(leafShape);
        const leafMaterial = new THREE.MeshStandardMaterial({ color: 0x4CAF50, side: THREE.DoubleSide });

         for (let i = 0; i < 50; i++) {
            const mesh = new THREE.Mesh(leafGeometry, leafMaterial);
            mesh.position.set((Math.random() - 0.5) * 15, (Math.random() - 0.5) * 15, (Math.random() - 0.5) * 15);
            mesh.scale.setScalar(Math.random() * 0.3 + 0.1);
            mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
            scene.add(mesh);
            shapes.push(mesh);
        }
        animationLogic = () => {
            shapes.forEach(shape => {
                shape.rotation.z += 0.005;
            });
        };
        break;

      case 'abstract-tech':
      default:
        scene.add(new THREE.AmbientLight(0xffffff, 0.2));
        const pointLight1 = new THREE.PointLight(0x673AB7, 5, 100);
        pointLight1.position.set(5, 5, 5);
        scene.add(pointLight1);
        const pointLight2 = new THREE.PointLight(0x009688, 5, 100);
        pointLight2.position.set(-5, -5, -2);
        scene.add(pointLight2);
        
        const geometry = new THREE.IcosahedronGeometry(1, 0);
        const material = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1, metalness: 0.9 });
        for (let i = 0; i < 20; i++) {
          const mesh = new THREE.Mesh(geometry, material);
          mesh.position.set((Math.random() - 0.5) * 15, (Math.random() - 0.5) * 15, (Math.random() - 0.5) * 15);
          mesh.scale.setScalar(Math.random() * 0.5 + 0.1);
          mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
          scene.add(mesh);
          shapes.push(mesh);
        }
        animationLogic = () => {
            shapes.forEach(shape => {
                shape.rotation.x += 0.001;
                shape.rotation.y += 0.002;
            });
        };
        break;
    }
    
    // Handle Resize
    const handleResize = () => {
      camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      animationLogic();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (currentMount) {
        currentMount.removeChild(renderer.domElement);
      }
      renderer.dispose();
      scene.children.forEach(child => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          child.material.dispose();
        }
      });
    };
  }, [theme]); // Rerun effect if theme changes

  return <div ref={mountRef} className="absolute inset-0 z-0" />;
}

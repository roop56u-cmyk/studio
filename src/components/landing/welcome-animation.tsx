
"use client";

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

type Theme = 'abstract-tech' | 'cosmic-voyage' | 'digital-matrix' | 'organic-growth' | 'floating-crystals' | 'cosmic-nebula' | 'abstract-particles' | 'synthwave-sunset';

export function WelcomeAnimation() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState<Theme>('abstract-tech');

  useEffect(() => {
    // This runs on the client and reads the theme from localStorage
    const savedTheme = localStorage.getItem('landing_theme') as Theme;
    if (savedTheme && ['abstract-tech', 'cosmic-voyage', 'digital-matrix', 'organic-growth', 'floating-crystals', 'cosmic-nebula', 'abstract-particles', 'synthwave-sunset'].includes(savedTheme)) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    if (!mountRef.current) return;

    const currentMount = mountRef.current;
    let renderer: THREE.WebGLRenderer;
    let animationFrameId: number;

    try {
        // Scene
        const scene = new THREE.Scene();

        // Camera
        const camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
        camera.position.z = 5;

        // Renderer
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        currentMount.appendChild(renderer.domElement);

        // Lighting and Objects based on theme
        const shapes: (THREE.Mesh | THREE.Points | THREE.GridHelper)[] = [];
        let animationLogic = () => {};

        switch (theme) {
          case 'floating-crystals':
            scene.add(new THREE.AmbientLight(0xffffff, 0.5));
            const crystalLight1 = new THREE.DirectionalLight(0xffd700, 2);
            crystalLight1.position.set(1, 1, 1);
            scene.add(crystalLight1);
            const crystalLight2 = new THREE.DirectionalLight(0x8a2be2, 1);
            crystalLight2.position.set(-1, -1, -1);
            scene.add(crystalLight2);

            const crystalGeometry = new THREE.IcosahedronGeometry(1, 0);
            const crystalMaterial = new THREE.MeshPhysicalMaterial({
                metalness: 0.1,
                roughness: 0.2,
                transmission: 1,
                thickness: 1.5,
                color: 0xADD8E6
            });
            for (let i = 0; i < 30; i++) {
              const mesh = new THREE.Mesh(crystalGeometry, crystalMaterial);
              mesh.position.set((Math.random() - 0.5) * 15, (Math.random() - 0.5) * 15, (Math.random() - 0.5) * 15);
              mesh.scale.setScalar(Math.random() * 0.4 + 0.2);
              mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
              scene.add(mesh);
              shapes.push(mesh);
            }
            animationLogic = () => {
                shapes.forEach(shape => {
                    shape.rotation.y += 0.003;
                });
            };
            break;

          case 'cosmic-nebula':
            const nebulaGeometry = new THREE.BufferGeometry();
            const nebulaVertices = [];
            for ( let i = 0; i < 10000; i ++ ) {
                const x = THREE.MathUtils.randFloatSpread( 20 );
                const y = THREE.MathUtils.randFloatSpread( 20 );
                const z = THREE.MathUtils.randFloatSpread( 20 );
                nebulaVertices.push( x, y, z );
            }
            nebulaGeometry.setAttribute('position', new THREE.Float32BufferAttribute(nebulaVertices, 3));
            const nebulaMaterial = new THREE.PointsMaterial({
                color: 0x89CFF0,
                size: 0.05,
                blending: THREE.AdditiveBlending,
                transparent: true,
                opacity: 0.7
            });
            const nebula = new THREE.Points(nebulaGeometry, nebulaMaterial);
            scene.add(nebula);
            shapes.push(nebula);
            animationLogic = () => {
                 shapes.forEach(shape => {
                    shape.rotation.y += 0.0005;
                });
            };
            break;

          case 'abstract-particles':
             const particleGeometry = new THREE.BufferGeometry();
            const particleVertices = [];
            for (let i = 0; i < 5000; i++) {
                particleVertices.push(THREE.MathUtils.randFloatSpread(10)); // x
                particleVertices.push(THREE.MathUtils.randFloatSpread(10)); // y
                particleVertices.push(THREE.MathUtils.randFloatSpread(10)); // z
            }
            particleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(particleVertices, 3));
            const particleMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.02 });
            const particles = new THREE.Points(particleGeometry, particleMaterial);
            scene.add(particles);
            shapes.push(particles);
            animationLogic = () => {
                particles.rotation.x += 0.0005;
                particles.rotation.y += 0.0005;
            };
            break;

          case 'synthwave-sunset':
            scene.fog = new THREE.Fog(0x000000, 1, 15);
            const gridHelper = new THREE.GridHelper(30, 30, 0xff00ff, 0x00ffff);
            gridHelper.position.y = -2;
            scene.add(gridHelper);
            shapes.push(gridHelper);

            const sunGeometry = new THREE.SphereGeometry(1.5, 32, 32);
            const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffd700, emissive: 0xffa500 });
            const sun = new THREE.Mesh(sunGeometry, sunMaterial);
            sun.position.set(0, 0, -10);
            scene.add(sun);
            shapes.push(sun);

            animationLogic = () => {
                gridHelper.position.z = (gridHelper.position.z + 0.01) % 1;
            };
            break;

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
          animationFrameId = requestAnimationFrame(animate);
          animationLogic();
          renderer.render(scene, camera);
        };
        animate();

        return () => {
          window.removeEventListener('resize', handleResize);
          cancelAnimationFrame(animationFrameId);
          if (currentMount && renderer.domElement) {
              try {
                currentMount.removeChild(renderer.domElement);
              } catch (e) {
                // Ignore errors on cleanup if element is already gone
              }
          }
          renderer.dispose();
          scene.children.forEach(child => {
            if (child instanceof THREE.Mesh || child instanceof THREE.Points || child instanceof THREE.GridHelper) {
              if (child.geometry) child.geometry.dispose();
              if ((child as THREE.Mesh).material) {
                const material = (child as THREE.Mesh).material;
                 if (Array.isArray(material)) {
                    material.forEach(m => m.dispose());
                } else {
                    material.dispose();
                }
              }
            }
          });
        };
    } catch (error) {
        console.error("Failed to initialize WebGL for animation:", error);
        // If renderer creation fails, do nothing further to prevent crash.
        return;
    }
  }, [theme]);

  return <div ref={mountRef} className="absolute inset-0 z-0" />;
}

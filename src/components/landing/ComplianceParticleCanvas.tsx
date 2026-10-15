import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ComplianceParticleCanvas() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let animationFrameId: number;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.z = 85;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Particle nodes setup (representing global compliance nodes)
    const particleCount = 140;
    const positions = new Float32Array(particleCount * 3);
    const velocities: { x: number; y: number; z: number; originalX: number; originalY: number; originalZ: number }[] = [];
    const colors = new Float32Array(particleCount * 3);

    // Color palette: Paperloo Neon Accent (#c8f135), Emerald (#10b981), Cyan (#00f2fe), White
    const colorChoices = [
      new THREE.Color('#c8f135'),
      new THREE.Color('#10b981'),
      new THREE.Color('#00f2fe'),
      new THREE.Color('#ffffff')
    ];

    const radius = 42;
    for (let i = 0; i < particleCount; i++) {
      // Sphere distribution with slight inner scatter
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = radius * (0.4 + 0.6 * Math.cbrt(Math.random()));

      const sinPhi = Math.sin(phi);
      const x = r * sinPhi * Math.cos(theta);
      const y = r * sinPhi * Math.sin(theta);
      const z = r * Math.cos(phi);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      velocities.push({
        x: (Math.random() - 0.5) * 0.04,
        y: (Math.random() - 0.5) * 0.04,
        z: (Math.random() - 0.5) * 0.04,
        originalX: x,
        originalY: y,
        originalZ: z
      });

      const chosenColor = colorChoices[Math.floor(Math.random() * colorChoices.length)];
      colors[i * 3] = chosenColor.r;
      colors[i * 3 + 1] = chosenColor.g;
      colors[i * 3 + 2] = chosenColor.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Particle texture
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.3, 'rgba(200, 241, 53, 0.8)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 32, 32);
    }
    const texture = new THREE.CanvasTexture(canvas);

    const material = new THREE.PointsMaterial({
      size: 2.8,
      vertexColors: true,
      map: texture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Connecting Network Lines
    const maxLineConnections = 240;
    const linePositions = new Float32Array(maxLineConnections * 6);
    const lineColors = new Float32Array(maxLineConnections * 6);
    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    lineGeometry.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));

    const lineMaterial = new THREE.LineSegments(
      lineGeometry,
      new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending
      })
    );
    scene.add(lineMaterial);

    // Outer faint wireframe ring
    const ringGeo = new THREE.RingGeometry(46, 46.4, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xc8f135,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.12,
      wireframe: true
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    scene.add(ringMesh);

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const normY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetX = normX * 25;
      targetY = normY * 25;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Resize handling
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    const resizeObserver = new ResizeObserver(() => handleResize());
    resizeObserver.observe(container);

    // Render loop
    let clock = new THREE.Clock();
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth camera / node tracking
      mouseX += (targetX - mouseX) * 0.04;
      mouseY += (targetY - mouseY) * 0.04;

      particles.rotation.y = elapsedTime * 0.08 + mouseX * 0.015;
      particles.rotation.x = Math.sin(elapsedTime * 0.05) * 0.15 - mouseY * 0.015;

      ringMesh.rotation.z = -elapsedTime * 0.04;
      ringMesh.rotation.y = particles.rotation.y;
      ringMesh.rotation.x = particles.rotation.x;

      const posAttr = geometry.attributes.position as THREE.BufferAttribute;
      const posArray = posAttr.array as Float32Array;

      // Pulse and slight drift
      for (let i = 0; i < particleCount; i++) {
        const vel = velocities[i];
        posArray[i * 3] += vel.x;
        posArray[i * 3 + 1] += vel.y;
        posArray[i * 3 + 2] += vel.z;

        // Soft elastic bounce towards origin position
        const dx = posArray[i * 3] - vel.originalX;
        const dy = posArray[i * 3 + 1] - vel.originalY;
        const dz = posArray[i * 3 + 2] - vel.originalZ;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist > 5) {
          vel.x -= dx * 0.005;
          vel.y -= dy * 0.005;
          vel.z -= dz * 0.005;
        }
      }
      posAttr.needsUpdate = true;

      // Update dynamic lines between nearest nodes
      let lineIndex = 0;
      const maxDistance = 16;
      for (let i = 0; i < particleCount && lineIndex < maxLineConnections; i++) {
        for (let j = i + 1; j < particleCount && lineIndex < maxLineConnections; j++) {
          const dx = posArray[i * 3] - posArray[j * 3];
          const dy = posArray[i * 3 + 1] - posArray[j * 3 + 1];
          const dz = posArray[i * 3 + 2] - posArray[j * 3 + 2];
          const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (distance < maxDistance) {
            const alpha = 1 - distance / maxDistance;

            linePositions[lineIndex * 6] = posArray[i * 3];
            linePositions[lineIndex * 6 + 1] = posArray[i * 3 + 1];
            linePositions[lineIndex * 6 + 2] = posArray[i * 3 + 2];

            linePositions[lineIndex * 6 + 3] = posArray[j * 3];
            linePositions[lineIndex * 6 + 4] = posArray[j * 3 + 1];
            linePositions[lineIndex * 6 + 5] = posArray[j * 3 + 2];

            // Neon accent color for lines
            lineColors[lineIndex * 6] = 0.78 * alpha;
            lineColors[lineIndex * 6 + 1] = 0.94 * alpha;
            lineColors[lineIndex * 6 + 2] = 0.21 * alpha;

            lineColors[lineIndex * 6 + 3] = 0.06 * alpha;
            lineColors[lineIndex * 6 + 4] = 0.72 * alpha;
            lineColors[lineIndex * 6 + 5] = 0.50 * alpha;

            lineIndex++;
          }
        }
      }

      lineGeometry.setDrawRange(0, lineIndex * 2);
      (lineGeometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
      (lineGeometry.attributes.color as THREE.BufferAttribute).needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      resizeObserver.disconnect();
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      lineGeometry.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={mountRef} 
      className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden"
      style={{ opacity: 0.85 }}
    />
  );
}

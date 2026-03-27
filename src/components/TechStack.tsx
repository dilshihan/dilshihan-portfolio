import * as THREE from "three";
import { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { 
  Environment, 
  RoundedBox, 
  PerspectiveCamera, 
  Float, 
  ContactShadows,
} from "@react-three/drei";
import {
  Physics,
  RigidBody,
  BallCollider,
  CuboidCollider,
  RapierRigidBody,
} from "@react-three/rapier";
import { EffectComposer, Bloom, Noise, Vignette } from "@react-three/postprocessing";

const textureLoader = new THREE.TextureLoader();
const imageUrls = [
  "/images/react2.webp",
  "/images/node2.webp",
  "/images/express.webp",
  "/images/mongo.webp",
  "/images/mysql.webp",
  "/images/typescript.webp",
  "/images/javascript.webp",
];

// Pre-load textures
const textures = imageUrls.map((url) => {
  const t = textureLoader.load(url);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
});

type IconProps = {
  texture: THREE.Texture;
  index: number;
  isActive: boolean;
};

function TechIcon({ texture, index, isActive }: IconProps) {
  const api = useRef<RapierRigidBody>(null);
  const [hovered, setHovered] = useState(false);
  const [randomShift] = useState(() => Math.random() * Math.PI * 2);

  // Random start position
  const pos = useMemo(() => [
    (Math.random() - 0.5) * 12,
    (Math.random() - 0.5) * 12,
    (Math.random() - 0.5) * 10
  ], []);

  useFrame((state, delta) => {
    if (!isActive || !api.current) return;
    
    const time = state.clock.getElapsedTime();
    const currentPos = api.current.translation();
    
    // Normalize index to handle the gap between base and extra icons
    const layoutIndex = index > 9 ? index - 3 : index;
    const totalCount = 12; // 7 base + 5 extra
    const spacing = 1.8;
    
    // Calculate target position in a line
    const targetX = (layoutIndex - (totalCount - 1) / 2) * spacing;
    const targetY = 0;
    const targetZ = 0;

    const vecToTarget = new THREE.Vector3().set(
      targetX - currentPos.x, 
      targetY - currentPos.y, 
      targetZ - currentPos.z
    );
    
    // Stronger attraction force to stabilize in the line
    api.current.applyImpulse({
      x: vecToTarget.x * delta * 3,
      y: vecToTarget.y * delta * 3,
      z: vecToTarget.z * delta * 1.5
    }, true);
    
    // Minimal rotation to keep icons readable and "lined up"
    api.current.applyTorqueImpulse({
      x: Math.sin(time * 0.4 + randomShift) * 0.001,
      y: Math.cos(time * 0.3 + randomShift) * 0.001,
      z: Math.sin(time * 0.6 + randomShift) * 0.0005
    }, true);
  });

  return (
    <RigidBody
      ref={api}
      position={pos as [number, number, number]}
      colliders={false}
      linearDamping={0.6}
      angularDamping={0.6}
      friction={0.2}
      restitution={0.8}
    >
      <CuboidCollider args={[0.7, 0.7, 0.25]} />
      <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
        <group
          onPointerOver={() => setHovered(true)} 
          onPointerOut={() => setHovered(false)}
        >
          <RoundedBox args={[1.4, 1.4, 0.5]} radius={0.2} smoothness={8}>
            <meshPhysicalMaterial 
              color={hovered ? "#ffffff" : "#f1f5f9"}
              transmission={0.7}
              thickness={1.2}
              roughness={0.1}
              metalness={0.02}
              envMapIntensity={1.5}
              clearcoat={1}
              clearcoatRoughness={0.1}
              ior={1.4}
              transparent
              opacity={0.8}
            />
          </RoundedBox>
          


          {/* Logo plane - Made larger and clearer */}
          <mesh position={[0, 0, 0.26]}>
            <planeGeometry args={[1.05, 1.05]} />
            <meshStandardMaterial 
              map={texture} 
              transparent 
              alphaTest={0.05}
              emissive={hovered ? "#5eead4" : "#ffffff"}
              emissiveIntensity={hovered ? 0.4 : 0.05}
              roughness={0.2}
              metalness={0.4}
            />
          </mesh>

          {/* Back logo */}
          <mesh position={[0, 0, -0.26]} rotation={[0, Math.PI, 0]}>
            <planeGeometry args={[1.05, 1.05]} />
            <meshStandardMaterial 
              map={texture} 
              transparent 
              alphaTest={0.05}
              emissive={hovered ? "#5eead4" : "#ffffff"}
              emissiveIntensity={hovered ? 0.4 : 0.05}
              roughness={0.2}
              metalness={0.4}
            />
          </mesh>
        </group>
      </Float>
    </RigidBody>
  );
}

function BackgroundParticles() {
  const points = useMemo(() => {
    const p = new Float32Array(2000 * 3);
    for (let i = 0; i < 2000; i++) {
      p[i * 3] = (Math.random() - 0.5) * 50;
      p[i * 3 + 1] = (Math.random() - 0.5) * 50;
      p[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return p;
  }, []);

  const ref = useRef<THREE.Points>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.getElapsedTime() * 0.05;
      ref.current.rotation.x = state.clock.getElapsedTime() * 0.02;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length / 3}
          array={points}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#5eead4" transparent opacity={0.3} sizeAttenuation />
    </points>
  );
}

function Pointer({ isActive }: { isActive: boolean }) {
  const ref = useRef<RapierRigidBody>(null);
  const vec = new THREE.Vector3();

  useFrame(({ pointer, viewport }) => {
    if (!isActive || !ref.current) return;
    vec.set((pointer.x * viewport.width) / 2, (pointer.y * viewport.height) / 2, 0);
    ref.current.setNextKinematicTranslation(vec);
  });

  return (
    <RigidBody
      position={[0, 0, 0]}
      type="kinematicPosition"
      colliders={false}
      ref={ref}
    >
      <BallCollider args={[3.2]} />
      <pointLight intensity={25} distance={12} color="#5eead4" />
      <pointLight position={[1, 1, 1]} intensity={15} distance={5} color="#ffffff" />
    </RigidBody>
  );
}

const TechStack = () => {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const section = document.getElementById("techstack");
      if (section) {
        const rect = section.getBoundingClientRect();
        const isInView = rect.top < window.innerHeight && rect.bottom > 0;
        setIsActive(isInView);
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="techstack" id="techstack">
      <h2 style={{ zIndex: 1, pointerEvents: "none" }}> My Techstack</h2>

      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 0, 15], fov: 35 }}
        gl={{ antialias: true, alpha: true }}
        className="tech-canvas"
        style={{ height: "calc(100vh - 100px)", background: "transparent" }}
      >
        <color attach="background" args={["#03050a"]} />
        <PerspectiveCamera makeDefault position={[0, 0, 18]} fov={35} />
        
        <ambientLight intensity={0.5} />
        <spotLight 
          position={[15, 20, 15]} 
          angle={0.3} 
          penumbra={1} 
          intensity={2.5} 
          castShadow 
          color="#ffffff"
        />
        <pointLight position={[-15, -15, -10]} intensity={1.5} color="#5eead4" />
        <pointLight position={[15, -15, 5]} intensity={0.5} color="#ffffff" />

        <Physics gravity={[0, 0, 0]}>
          <Pointer isActive={isActive} />
          <BackgroundParticles />
          {textures.map((texture, i) => (
            <TechIcon 
              key={i} 
              texture={texture} 
              index={i} 
              isActive={isActive} 
            />
          ))}
          {/* Add a few doubles for density */}
          {textures.slice(0, 5).map((texture, i) => (
            <TechIcon 
              key={`extra-${i}`} 
              texture={texture} 
              index={i + 10} 
              isActive={isActive} 
            />
          ))}
        </Physics>

        <Environment preset="studio" />
        
        <ContactShadows 
          position={[0, -12, 0]} 
          opacity={0.2} 
          scale={30} 
          blur={3} 
          far={20} 
        />

        <EffectComposer multisampling={8}>
          <Bloom 
            luminanceThreshold={0.6} 
            luminanceSmoothing={1.2} 
            height={400} 
            intensity={0.4} 
          />
          <Noise opacity={0.03} />
          <Vignette eskil={false} offset={0.05} darkness={1.2} />
        </EffectComposer>
      </Canvas>
    </div>
  );
};

export default TechStack;

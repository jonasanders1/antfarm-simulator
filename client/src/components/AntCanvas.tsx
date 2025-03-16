import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { SimulationState, Ant, AntState } from '../utils/antTypes';

interface AntCanvasProps {
  simulationState: SimulationState;
}

// New Terrain component
const Terrain = ({ size = 100 }) => {
  return (
    <mesh 
      rotation={[-Math.PI / 2, 0, 0]} 
      position={[0, -0.1, 0]} 
      receiveShadow
    >
      <planeGeometry args={[size, size]} />
      <meshStandardMaterial 
        color="#f6d8b3"
        roughness={0.8} 
        metalness={0.2}
      />
    </mesh>
  );
};

// Ant component
const AntMesh = ({ ant }: { ant: Ant }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Determine ant color based on state
  let color = '#000000'; // Default black
  
  if (ant.carryingFood) {
    color = '#ff9900'; // Orange when carrying food
  } else if (ant.state === AntState.EXPLORING) {
    color = '#000000'; // Black for exploring
  } else if (ant.state === AntState.GATHERING) {
    color = '#006600'; // Green for gathering
  } else if (ant.state === AntState.RETURNING) {
    color = '#0000ff'; // Blue for returning
  }

  return (
    <mesh
      ref={meshRef}
      position={[ant.position.x, ant.position.y + 0.4, ant.position.z]}
      rotation={[0, ant.rotation.y, 0]}
      castShadow
    >
      <coneGeometry args={[0.2, 0.8, 8]} />
      <meshStandardMaterial color={color} roughness={0.7} />
    </mesh>
  );
};

// Resource component
const ResourceMesh = ({ resource }) => {
  const scale = Math.pow(resource.amount / 50, 1/3);
  
  return (
    <mesh 
      position={[resource.position.x, resource.position.y + 0.5, resource.position.z]}
      scale={[scale, scale, scale]}
    >
      <sphereGeometry args={[0.5, 8, 8]} />
      <meshStandardMaterial 
        color={resource.type === 'food' ? '#8BC34A' : '#03A9F4'} 
        roughness={0.3} 
        metalness={0.2} 
      />
    </mesh>
  );
};

// Fixed PheromoneMesh component - removed emissive property from MeshBasicMaterial
const PheromoneMesh = ({ pheromone }) => {
  // Color based on type with enhanced visibility
  let color;
  switch (pheromone.type) {
    case 'food':
      color = '#00ff00'; // Bright green for food
      break;
    case 'home':
      color = '#3498db'; // Bright blue for home
      break;
    case 'danger':
      color = '#ff0000'; // Red for danger
      break;
    default:
      color = '#ffff00'; // Yellow fallback
  }

  // Size based on strength
  const size = 0.15 + pheromone.strength * 0.15;

  return (
    <mesh position={[pheromone.position.x, pheromone.position.y + 0.05, pheromone.position.z]}>
      <sphereGeometry args={[size, 8, 8]} />
      <meshBasicMaterial 
        color={color} 
        transparent={true} 
        opacity={Math.min(0.7, pheromone.strength * 0.8)} 
      />
    </mesh>
  );
};

// Colony component
const ColonyMesh = ({ colony }) => {
  return (
    <mesh 
      position={[colony.position.x, colony.position.y, colony.position.z]}
      // rotation={[Math.PI, 0, 0]} // Flip to make it a mound
    >
      <coneGeometry args={[3, 2, 16]} />
      <meshStandardMaterial color="#8B4513" roughness={0.9} />
    </mesh>
  );
};

// Scene component
const SimulationScene = ({ simulationState }) => {
  const { ants, resources, pheromones, colonies, terrainSeed } = simulationState;
  
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight 
        position={[50, 200, 100]} 
        intensity={0.8} 
        castShadow 
        shadow-mapSize-width={1024} 
        shadow-mapSize-height={1024} 
      />
      
      {/* Terrain */}
      <Terrain size={100} />
      
      {/* Pheromones - render before other entities so they appear underneath */}
      {pheromones.map(pheromone => pheromone.strength > 0.1 && (
        <PheromoneMesh key={pheromone.id} pheromone={pheromone} />
      ))}
      
      {/* Entities */}
      {ants.map(ant => ant.state !== AntState.DEAD && (
        <AntMesh key={ant.id} ant={ant} />
      ))}
      
      {resources.map(resource => resource.amount > 0 && (
        <ResourceMesh key={resource.id} resource={resource} />
      ))}
      
      {colonies.map(colony => (
        <ColonyMesh key={colony.id} colony={colony} />
      ))}
    </>
  );
};

const AntCanvas: React.FC<AntCanvasProps> = ({ simulationState }) => {
  return (
    <Canvas 
      shadows 
      camera={{ position: [20, 20, 20], fov: 75, near: 0.1, far: 1000 }}
      className="w-full h-full"
    >
      <OrbitControls 
        enableDamping 
        dampingFactor={0.05} 
        minDistance={5}
        maxDistance={100}
      />
      <SimulationScene simulationState={simulationState} />
    </Canvas>
  );
};

export default AntCanvas;
import { useState, useEffect, useRef } from 'react';
import { 
  SimulationState, Ant, Colony, Resource, Pheromone, 
  Vector3D, AntState, ResourceType, PheromoneType
} from '../utils/antTypes';
import { 
  updateAntPosition, updateAntState, leavePheromone, 
  getRandomPosition, createOffspring
} from '../utils/antBehaviors';

const SIMULATION_STEP = 1/60; // 60 FPS
const TERRAIN_SIZE = 100;

const createInitialColony = (): Colony => {
  return {
    id: 'colony-1',
    position: { x: 0, y: 0, z: 0 },
    foodStored: 200, // Increased initial food
    population: 20,
    queens: 1,
    workers: 15,
    soldiers: 4
  };
};

const createInitialAnts = (colony: Colony, count: number): Ant[] => {
  const ants: Ant[] = [];
  
  for (let i = 0; i < count; i++) {
    const isWorker = i < colony.workers;
    const isSoldier = !isWorker && i < (colony.workers + colony.soldiers);
    const isQueen = !isWorker && !isSoldier;
    
    // Basic gene configuration
    const genes = {
      speed: isWorker ? 1 + Math.random() * 0.5 : 
             isSoldier ? 1.5 + Math.random() * 0.5 : 0.5,
      strength: isWorker ? 1 : 
                isSoldier ? 3 + Math.random() : 1,
      senseRange: isWorker ? 5 + Math.random() * 2 : 
                  isSoldier ? 7 + Math.random() * 2 : 3,
      maxHealth: isWorker ? 100 : 
                 isSoldier ? 200 : 300,
      maxFoodCapacity: isWorker ? 100 : // Increased from 50 to 100
                        isSoldier ? 60 : // Increased from 30 to 60
                        150 // Increased from 100 to 150
    };
    
    ants.push({
      id: `ant-${i}`,
      position: getRandomPosition(colony.position, 5),
      rotation: { x: 0, y: Math.random() * Math.PI * 2, z: 0 },
      speed: genes.speed,
      health: genes.maxHealth,
      foodLevel: genes.maxFoodCapacity * 0.8, // Increased initial food level
      colony: colony.id,
      state: AntState.EXPLORING,
      target: getRandomPosition({ x: 0, y: 0, z: 0 }, TERRAIN_SIZE / 3),
      carryingFood: false,
      genes,
      generation: 1,
      age: 0,
      maxAge: 150 + Math.random() * 100 // Increased lifespan
    });
  }
  
  return ants;
};

const createInitialResources = (count: number): Resource[] => {
  const resources: Resource[] = [];
  
  // Create clusters of food instead of randomly spread resources
  const numClusters = 5; // Create 5 clusters
  const resourcesPerCluster = Math.floor(count * 0.8 / numClusters); // 80% of resources in clusters
  const remainingResources = count - (resourcesPerCluster * numClusters); // 20% randomly scattered
  
  // Create food clusters
  for (let cluster = 0; cluster < numClusters; cluster++) {
    // Generate a random cluster center point
    const clusterCenter = getRandomPosition({ x: 0, y: 0, z: 0 }, TERRAIN_SIZE / 2.5);
    
    // Create resources around this cluster center
    for (let i = 0; i < resourcesPerCluster; i++) {
      // Resources are placed closer together within a cluster (smaller range)
      const clusterPosition = getRandomPosition(clusterCenter, 4 + Math.random() * 3);
      
      resources.push({
        id: `resource-cluster-${cluster}-${i}`,
        position: clusterPosition,
        type: Math.random() > 0.2 ? ResourceType.FOOD : ResourceType.WATER, // 80% food, 20% water
        amount: 100 + Math.random() * 150 // Increased resource amount
      });
    }
  }
  
  // Add remaining random resources
  for (let i = 0; i < remainingResources; i++) {
    resources.push({
      id: `resource-random-${i}`,
      position: getRandomPosition({ x: 0, y: 0, z: 0 }, TERRAIN_SIZE / 2),
      type: Math.random() > 0.3 ? ResourceType.FOOD : ResourceType.WATER,
      amount: 50 + Math.random() * 50 // Smaller amounts for scattered resources
    });
  }
  
  return resources;
};

const useSimulation = () => {
  const [state, setState] = useState<SimulationState>(() => {
    const initialColony = createInitialColony();
    return {
      time: 0,
      speed: 1,
      isPaused: false,
      ants: createInitialAnts(initialColony, initialColony.population),
      colonies: [initialColony],
      resources: createInitialResources(50), // Increased from 30 to 50
      pheromones: [],
      predators: [],
      terrainSeed: Math.random() * 1000
    };
  });
  
  const lastUpdateTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number>(0);
  
  const setSimulationSpeed = (speed: number) => {
    setState(prev => ({ ...prev, speed }));
  };
  
  const togglePause = () => {
    setState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  };
  
  const resetSimulation = () => {
    const initialColony = createInitialColony();
    setState({
      time: 0,
      speed: 1,
      isPaused: true,
      ants: createInitialAnts(initialColony, initialColony.population),
      colonies: [initialColony],
      resources: createInitialResources(50), // Increased from 30 to 50
      pheromones: [],
      predators: [],
      terrainSeed: Math.random() * 1000
    });
  };
  
  const updateSimulation = (timestamp: number) => {
    if (!lastUpdateTimeRef.current) {
      lastUpdateTimeRef.current = timestamp;
      animationFrameRef.current = requestAnimationFrame(updateSimulation);
      return;
    }
    
    const deltaTime = (timestamp - lastUpdateTimeRef.current) / 1000;
    lastUpdateTimeRef.current = timestamp;
    
    if (!state.isPaused) {
      setState(prevState => {
        const simulationDelta = deltaTime * prevState.speed;
        const simulationTime = prevState.time + simulationDelta;
        
        const updatedAnts = prevState.ants.map(ant => {
          const stateUpdatedAnt = updateAntState(ant, prevState);
          return updateAntPosition(stateUpdatedAnt, simulationDelta);
        });
        
        const currentTime = Date.now();
        
        const updatedPheromones = [
          // Keep existing pheromones that haven't faded away
          ...prevState.pheromones.filter(p => {
            const age = (currentTime - p.createdAt) / 1000;
            return age < 30 && p.strength > 0.1;
          }).map(p => {
            const age = (currentTime - p.createdAt) / 1000;
            return {
              ...p,
              strength: p.strength * (1 - age / 30)
            };
          }),
          
          // Generate new pheromones with FIXED logic
          ...updatedAnts
            .filter(ant => {
              if (ant.state === AntState.DEAD) return false;
              
              // Ants carrying food leave a food trail more often
              if (ant.carryingFood) return Math.random() < 0.3;
              
              // Returning ants leave a home trail more often
              if (ant.state === AntState.RETURNING) return Math.random() < 0.25;
              
              // Ants in other states occasionally leave a trail
              return Math.random() < 0.08;
            })
            .map(ant => {
              // FIXED: Ants carrying food should leave FOOD pheromones, not home
              if (ant.carryingFood) {
                return leavePheromone(ant, PheromoneType.FOOD, 1.0);
              } 
              // FIXED: Returning ants should leave HOME pheromones
              else if (ant.state === AntState.RETURNING) {
                return leavePheromone(ant, PheromoneType.HOME, 0.8);
              } 
              // Other ants leave appropriate pheromones based on state
              else {
                return leavePheromone(
                  ant, 
                  ant.state === AntState.GATHERING ? PheromoneType.FOOD : PheromoneType.HOME, 
                  0.4
                );
              }
            })
        ];
        
        const updatedResources = prevState.resources.map(resource => {
          const antsGathering = updatedAnts.filter(
            ant => ant.state === AntState.GATHERING && 
            ant.target && 
            Math.abs(ant.target.x - resource.position.x) < 0.5 &&
            Math.abs(ant.target.y - resource.position.y) < 0.5 &&
            Math.abs(ant.target.z - resource.position.z) < 0.5
          );
          
          if (antsGathering.length > 0) {
            return {
              ...resource,
              amount: Math.max(0, resource.amount - antsGathering.length * 0.1)
            };
          }
          
          return resource;
        });
        
        const updatedColonies = prevState.colonies.map(colony => {
          const returningAnts = updatedAnts.filter(
            ant => ant.state === AntState.RETURNING && 
            ant.colony === colony.id &&
            ant.carryingFood && 
            Math.abs(ant.position.x - colony.position.x) < 1 &&
            Math.abs(ant.position.y - colony.position.y) < 1 &&
            Math.abs(ant.position.z - colony.position.z) < 1
          );
          
          // Only add 1 food unit per ant that has actually returned with food
          const foodDelivered = returningAnts.length;
          
          // Mark these ants as no longer carrying food to prevent counting the same food multiple times
          returningAnts.forEach(ant => {
            const antIndex = updatedAnts.findIndex(a => a.id === ant.id);
            if (antIndex !== -1) {
              updatedAnts[antIndex] = {
                ...updatedAnts[antIndex],
                carryingFood: false,
                state: AntState.EXPLORING,
                target: getRandomPosition(updatedAnts[antIndex].position, 10)
              };
            }
          });
          
          return {
            ...colony,
            foodStored: colony.foodStored + foodDelivered
          };
        });
        
        return {
          ...prevState,
          time: simulationTime,
          ants: updatedAnts,
          pheromones: updatedPheromones,
          resources: updatedResources,
          colonies: updatedColonies
        };
      });
    }
    
    animationFrameRef.current = requestAnimationFrame(updateSimulation);
  };
  
  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(updateSimulation);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);
  
  return {
    state,
    setSimulationSpeed,
    togglePause,
    resetSimulation
  };
};

export default useSimulation;
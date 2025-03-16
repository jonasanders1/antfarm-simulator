import { Ant, AntState, Vector3D, Pheromone, Resource, PheromoneType, SimulationState } from './antTypes';

// Helper to calculate distance between two 3D points
export const distance = (a: Vector3D, b: Vector3D): number => {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
};

// Helper to normalize a vector
export const normalize = (v: Vector3D): Vector3D => {
  const mag = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
  if (mag === 0) return { x: 0, y: 0, z: 0 };
  return { x: v.x / mag, y: v.y / mag, z: v.z / mag };
};

// Get a random position within range
export const getRandomPosition = (center: Vector3D, range: number): Vector3D => {
  return {
    x: center.x + (Math.random() * range * 2 - range),
    y: 0, // Keep ants on the ground
    z: center.z + (Math.random() * range * 2 - range),
  };
};

// Enhanced version to find the strongest pheromone trail
export const findStrongestPheromone = (
  position: Vector3D,
  pheromones: Pheromone[],
  type: PheromoneType,
  range: number
): Pheromone | null => {
  let strongest: Pheromone | null = null;
  let maxStrength = 0;
  
  for (const pheromone of pheromones) {
    if (pheromone.type === type && pheromone.strength > 0.15) { // Lower threshold to detect more pheromones
      const dist = distance(position, pheromone.position);
      if (dist <= range) {
        // Weight by both strength and proximity
        const effectiveStrength = pheromone.strength * (1 - dist / range);
        if (effectiveStrength > maxStrength) {
          maxStrength = effectiveStrength;
          strongest = pheromone;
        }
      }
    }
  }
  
  return strongest;
};

// Update ant position based on its current state and targets
export const updateAntPosition = (ant: Ant, deltaTime: number): Ant => {
  if (ant.state === AntState.DEAD) return ant;
  
  // Move towards target if it exists
  if (ant.target) {
    // Calculate direction vector to target
    const direction = normalize({
      x: ant.target.x - ant.position.x,
      y: 0, // Keep y movement flat (on the ground)
      z: ant.target.z - ant.position.z
    });
    
    // Calculate movement this frame
    const movement = {
      x: direction.x * ant.speed * deltaTime,
      y: 0, // Keep y movement flat
      z: direction.z * ant.speed * deltaTime
    };
    
    // Update position
    const newPosition = {
      x: ant.position.x + movement.x,
      y: 0, // Keep ants on the ground
      z: ant.position.z + movement.z
    };
    
    // Calculate rotation (ants face their movement direction)
    const newRotation = {
      x: 0, 
      y: Math.atan2(movement.x, movement.z), // Yaw rotation based on movement
      z: 0
    };
    
    // Check if ant has reached its target (within 0.5 units)
    const distanceToTarget = distance(newPosition, ant.target);
    
    if (distanceToTarget < 0.5) {
      // If the ant reached its target, get a new target
      // But keep the same state - state transitions are handled in updateAntState
      return {
        ...ant,
        position: newPosition,
        rotation: newRotation,
        target: ant.state === AntState.EXPLORING 
          ? getRandomPosition(newPosition, 10) // New random target if exploring
          : ant.target // Keep same target otherwise
      };
    }
    
    return {
      ...ant,
      position: newPosition,
      rotation: newRotation
    };
  }
  
  // If ant has no target, give it one
  if (!ant.target && ant.state === AntState.EXPLORING) {
    return {
      ...ant,
      target: getRandomPosition(ant.position, 10)
    };
  }
  
  return ant;
};

// Determine state transitions based on ant's current situation
export const updateAntState = (
  ant: Ant, 
  state: SimulationState
): Ant => {
  let nearbyResources;
  let colony;
  let home;
  let foodAtLocation;

  // This is a simplified version - real implementation would be more complex
  
  switch (ant.state) {
    case AntState.IDLE:
      // Transition to exploring after idle
      if (Math.random() < 0.05) {
        return {
          ...ant,
          state: AntState.EXPLORING,
          target: getRandomPosition(ant.position, 10)
        };
      }
      break;
      
    case AntState.EXPLORING:
      nearbyResources = state.resources.filter(r => 
        r.type === 'food' && distance(ant.position, r.position) < ant.genes.senseRange && r.amount > 0
      );
      
      if (nearbyResources.length > 0) {
        // Found food directly - go gather it
        return {
          ...ant,
          state: AntState.GATHERING,
          target: nearbyResources[0].position
        };
      }
      
      // If no direct food found, check for food pheromones to follow
      if (!ant.carryingFood && Math.random() < 0.85) {  // Increased chance to follow pheromones
        // FIXED: Exploring ants should follow FOOD pheromones, not HOME pheromones
        const foodPheromone = findStrongestPheromone(
          ant.position, 
          state.pheromones, 
          PheromoneType.FOOD, 
          ant.genes.senseRange * 1.5
        );
        
        if (foodPheromone) {
          // Follow the food pheromone trail
          return {
            ...ant,
            target: foodPheromone.position,
            // Briefly switch to gathering state when following strong food pheromones
            state: foodPheromone.strength > 0.6 ? AntState.GATHERING : AntState.EXPLORING
          };
        }
      }
      
      // If reached target, set new exploration target
      if (ant.target && distance(ant.position, ant.target) < 0.5) {
        return {
          ...ant,
          target: getRandomPosition(ant.position, 10)
        };
      }
      break;
      
    case AntState.GATHERING:
      colony = state.colonies.find(c => c.id === ant.colony);
      // If reached food, pick it up and head home
      if (colony && ant.target && distance(ant.position, ant.target) < 0.5) {
        // Check if there's actually any food resource at this location
        foodAtLocation = state.resources.find(r => 
          r.type === 'food' && 
          distance(r.position, ant.position) < 1 && 
          r.amount > 0
        );
        
        // Only carry food back if there's actually food here
        if (foodAtLocation) {
          return {
            ...ant,
            state: AntState.RETURNING,
            target: colony.position,
            carryingFood: true
          };
        } else {
          // No food here, go back to exploring
          return {
            ...ant,
            state: AntState.EXPLORING,
            target: getRandomPosition(ant.position, 10),
            carryingFood: false
          };
        }
      }
      break;
      
    case AntState.RETURNING:
      home = state.colonies.find(c => c.id === ant.colony);
      // If reached colony, drop food and go exploring again
      if (home && distance(ant.position, home.position) < 1) {
        // Only increase food level and transfer colony food if actually carrying food
        if (ant.carryingFood) {
          return {
            ...ant,
            state: AntState.EXPLORING,
            target: getRandomPosition(ant.position, 10),
            carryingFood: false,
            foodLevel: Math.min(ant.foodLevel + 40, ant.genes.maxFoodCapacity)
          };
        } else {
          // Not carrying food, just go exploring
          return {
            ...ant,
            state: AntState.EXPLORING,
            target: getRandomPosition(ant.position, 10)
          };
        }
      }
      
      // Check for home pheromones to follow while returning
      if (Math.random() < 0.7) {
        // FIXED: Returning ants should follow HOME pheromones, not FOOD pheromones
        const homePheromone = findStrongestPheromone(
          ant.position, 
          state.pheromones, 
          PheromoneType.HOME, 
          ant.genes.senseRange
        );
        
        if (homePheromone) {
          // Adjust course towards home pheromone, but still head generally homeward
          const homeDirection = normalize({
            x: home?.position.x || 0 - ant.position.x,
            y: 0,
            z: home?.position.z || 0 - ant.position.z
          });
          
          const pheromoneDirection = normalize({
            x: homePheromone.position.x - ant.position.x,
            y: 0,
            z: homePheromone.position.z - ant.position.z
          });
          
          // Blend the directions (70% towards home, 30% towards pheromone)
          const blendedTarget = {
            x: ant.position.x + (homeDirection.x * 0.7 + pheromoneDirection.x * 0.3) * 5,
            y: 0,
            z: ant.position.z + (homeDirection.z * 0.7 + pheromoneDirection.z * 0.3) * 5
          };
          
          return {
            ...ant,
            target: blendedTarget
          };
        }
      }
      break;
      
    default:
      break;
  }
  
  // If food level too low, ant dies
  if (ant.foodLevel <= 0) {
    return { ...ant, state: AntState.DEAD };
  }
  
  // Age and consume food - reduce food consumption rate
  const newFoodLevel = Math.max(0, ant.foodLevel - 0.005); // Reduced from 0.01 to 0.005
  const newAge = ant.age + 0.01;
  
  if (newAge > ant.maxAge) {
    return { ...ant, state: AntState.DEAD };
  }
  
  return { 
    ...ant, 
    foodLevel: newFoodLevel,
    age: newAge
  };
};

// Create a new pheromone at the ant's location with improved strength calculation
export const leavePheromone = (
  ant: Ant, 
  type: PheromoneType, 
  strength: number
): Pheromone => {
  // Calculate final strength based on ant state and type
  let finalStrength = strength;
  
  // FIXED: Ants carrying food should leave stronger FOOD pheromones, not HOME
  if (type === PheromoneType.FOOD && ant.carryingFood) {
    finalStrength *= 1.5; // 50% stronger
  }
  
  // Ants returning to colony leave stronger home pheromones
  if (type === PheromoneType.HOME && ant.state === AntState.RETURNING) {
    finalStrength *= 1.3; // 30% stronger
  }
  
  return {
    id: `pheromone-${Date.now()}-${Math.random()}`,
    position: { ...ant.position },
    type,
    strength: finalStrength,
    createdAt: Date.now()
  };
};

// Create a new ant (offspring) from a parent ant
export const createOffspring = (parent: Ant, mutationRate: number = 0.1): Ant => {
  // Clone parent genes with potential mutations
  const genes = { ...parent.genes };
  
  // Apply random mutations
  Object.keys(genes).forEach(key => {
    if (Math.random() < mutationRate) {
      const gene = key as keyof typeof genes;
      genes[gene] = genes[gene] * (0.9 + Math.random() * 0.2); // +/- 10%
    }
  });
  
  return {
    id: `ant-${Date.now()}-${Math.random()}`,
    position: { ...parent.position },
    rotation: { x: 0, y: 0, z: 0 },
    speed: genes.speed,
    health: genes.maxHealth,
    foodLevel: genes.maxFoodCapacity / 2,
    colony: parent.colony,
    state: AntState.EXPLORING,
    carryingFood: false,
    genes,
    generation: parent.generation + 1,
    age: 0,
    maxAge: parent.maxAge * (0.9 + Math.random() * 0.2) // Slight variation in lifespan
  };
};
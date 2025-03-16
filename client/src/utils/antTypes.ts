export interface Ant {
  id: string;
  position: Vector3D;
  rotation: Vector3D;
  speed: number;
  health: number;
  foodLevel: number;
  colony: string;
  state: AntState;
  target?: Vector3D;
  carryingFood: boolean;
  genes: AntGenes;
  generation: number;
  age: number;
  maxAge: number;
}

export interface AntGenes {
  speed: number;
  strength: number;
  senseRange: number;
  maxHealth: number;
  maxFoodCapacity: number;
}

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface Pheromone {
  id: string;
  position: Vector3D;
  type: PheromoneType;
  strength: number;
  createdAt: number;
}

export interface Resource {
  id: string;
  position: Vector3D;
  type: ResourceType;
  amount: number;
}

export interface Colony {
  id: string;
  position: Vector3D;
  foodStored: number;
  population: number;
  queens: number;
  workers: number;
  soldiers: number;
}

export interface Predator {
  id: string;
  position: Vector3D;
  rotation: Vector3D;
  speed: number;
  health: number;
  state: PredatorState;
  target?: Ant;
}

export interface SimulationState {
  time: number;
  speed: number;
  isPaused: boolean;
  ants: Ant[];
  colonies: Colony[];
  resources: Resource[];
  pheromones: Pheromone[];
  predators: Predator[];
  terrainSeed: number;
}

export enum AntState {
  IDLE = 'idle',
  EXPLORING = 'exploring',
  GATHERING = 'gathering',
  RETURNING = 'returning',
  REPRODUCING = 'reproducing',
  FLEEING = 'fleeing',
  FIGHTING = 'fighting',
  DEAD = 'dead'
}

export enum PheromoneType {
  FOOD = 'food',
  HOME = 'home',
  DANGER = 'danger'
}

export enum ResourceType {
  FOOD = 'food',
  WATER = 'water'
}

export enum PredatorState {
  IDLE = 'idle',
  HUNTING = 'hunting',
  EATING = 'eating',
  RESTING = 'resting'
}
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { SimulationState, AntState } from '../utils/antTypes';

interface ColonyStatsProps {
  simulationState: SimulationState;
}

const ColonyStats: React.FC<ColonyStatsProps> = ({ simulationState }) => {
  const { ants, colonies, resources } = simulationState;
  
  // Calculate stats
  const totalAnts = ants.filter(ant => ant.state !== AntState.DEAD).length;
  const totalFood = resources.reduce((sum, r) => r.type === 'food' ? sum + r.amount : sum, 0);
  const totalWater = resources.reduce((sum, r) => r.type === 'water' ? sum + r.amount : sum, 0);
  
  // State statistics
  const antsByState = ants.reduce((acc, ant) => {
    if (ant.state === AntState.DEAD) return acc;
    acc[ant.state] = (acc[ant.state] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Age statistics
  const generations = ants.reduce((acc, ant) => {
    if (ant.state === AntState.DEAD) return acc;
    acc[ant.generation] = (acc[ant.generation] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);
  
  const averageAge = ants.length > 0 
    ? ants.reduce((sum, ant) => sum + ant.age, 0) / ants.length 
    : 0;
  
  // Get all colonies
  const colonyDetails = colonies.map(colony => {
    const colonyAnts = ants.filter(
      ant => ant.colony === colony.id && ant.state !== AntState.DEAD
    );
    
    return {
      id: colony.id,
      population: colonyAnts.length,
      foodStored: colony.foodStored,
      exploring: colonyAnts.filter(ant => ant.state === AntState.EXPLORING).length,
      gathering: colonyAnts.filter(ant => ant.state === AntState.GATHERING).length,
      returning: colonyAnts.filter(ant => ant.state === AntState.RETURNING).length,
    };
  });
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>World Statistics</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Ants</p>
            <p className="text-2xl font-bold">{totalAnts}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Resources</p>
            <div className="flex gap-2">
              <p className="text-sm">
                <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-1"></span>
                Food: {Math.floor(totalFood)}
              </p>
              <p className="text-sm">
                <span className="inline-block w-3 h-3 rounded-full bg-blue-500 mr-1"></span>
                Water: {Math.floor(totalWater)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {colonyDetails.map(colony => (
        <Card key={colony.id}>
          <CardHeader className="pb-2">
            <CardTitle>Colony {colony.id.replace('colony-', '')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Population</p>
                <p className="text-2xl font-bold">{colony.population}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Food Stored</p>
                <p className="text-2xl font-bold">{Math.floor(colony.foodStored)}</p>
              </div>
            </div>
            
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Activity</p>
              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col items-center">
                  <div className="text-sm font-semibold">{colony.exploring}</div>
                  <div className="text-xs text-muted-foreground">Exploring</div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="text-sm font-semibold">{colony.gathering}</div>
                  <div className="text-xs text-muted-foreground">Gathering</div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="text-sm font-semibold">{colony.returning}</div>
                  <div className="text-xs text-muted-foreground">Returning</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Ant Demographics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">States</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {Object.entries(antsByState).map(([state, count]) => (
                <div key={state} className="flex flex-col items-center">
                  <div className="text-sm font-semibold">{count}</div>
                  <div className="text-xs text-muted-foreground capitalize">{state}</div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Generations</p>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(generations)
                .sort((a, b) => Number(a[0]) - Number(b[0]))
                .slice(0, 4)
                .map(([gen, count]) => (
                  <div key={gen} className="flex flex-col items-center">
                    <div className="text-sm font-semibold">{count}</div>
                    <div className="text-xs text-muted-foreground">Gen {gen}</div>
                  </div>
                ))}
            </div>
          </div>
          
          <div>
            <p className="text-sm font-medium text-muted-foreground">Average Age</p>
            <p className="text-lg font-semibold">{averageAge.toFixed(1)} units</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ColonyStats;
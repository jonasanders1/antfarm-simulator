import React from 'react';
import AntCanvas from './AntCanvas';
import SimulationControls from './SimulationControls';
import ColonyStats from './ColonyStats';
import useSimulation from '../hooks/useSimulation';

const AntSimulation: React.FC = () => {
  const { 
    state, 
    setSimulationSpeed, 
    togglePause, 
    resetSimulation 
  } = useSimulation();
  
  return (
    <div className="flex flex-col h-full">
      
      
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 p-4">
        <div className="lg:col-span-3 flex flex-col gap-4">
          {/* 3D Canvas */}
          <div className="flex-1 min-h-[500px] bg-neutral-100 rounded-md overflow-hidden border">
            <AntCanvas simulationState={state} />
          </div>
          
          {/* Controls */}
          <SimulationControls
            isPaused={state.isPaused}
            speed={state.speed}
            onTogglePause={togglePause}
            onSpeedChange={setSimulationSpeed}
            onReset={resetSimulation}
            simulationTime={state.time}
          />
        </div>
        
        {/* Stats Panel */}
        <div className="lg:col-span-1">
          <ColonyStats simulationState={state} />
        </div>
      </div>
    </div>
  );
};

export default AntSimulation;
import React from 'react';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { PlayCircle, PauseCircle, RotateCcw, FastForward, Clock } from 'lucide-react';

interface SimulationControlsProps {
  isPaused: boolean;
  speed: number;
  onTogglePause: () => void;
  onSpeedChange: (speed: number) => void;
  onReset: () => void;
  simulationTime: number;
}

const SimulationControls: React.FC<SimulationControlsProps> = ({
  isPaused,
  speed,
  onTogglePause,
  onSpeedChange,
  onReset,
  simulationTime
}) => {
  // Format simulation time as hh:mm:ss
  const formatTime = (time: number) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="bg-white border rounded-md shadow-sm p-4 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-medium">Simulation Controls</h3>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-neutral-500" />
          <span className="text-sm font-mono">{formatTime(simulationTime)}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onTogglePause}
          className="flex-1"
        >
          {isPaused ? (
            <>
              <PlayCircle className="mr-1 h-4 w-4" />
              Play
            </>
          ) : (
            <>
              <PauseCircle className="mr-1 h-4 w-4" />
              Pause
            </>
          )}
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          className="flex-1"
        >
          <RotateCcw className="mr-1 h-4 w-4" />
          Reset
        </Button>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">
            <FastForward className="inline h-4 w-4 mr-1" />
            Simulation Speed: {speed.toFixed(1)}x
          </label>
        </div>
        
        <Slider
          value={[speed]}
          min={0.1}
          max={10}
          step={0.1}
          onValueChange={(values) => onSpeedChange(values[0])}
          className="w-full"
        />
      </div>
    </div>
  );
};

export default SimulationControls;
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PlayCircle } from "lucide-react";

const Index: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="text-center p-4 max-w-2xl">
        <h1 className="text-3xl font-bold mb-2">3D Ant Colony Simulation</h1>
        <p className="text-neutral-500 mb-8">
          Watch as ants explore, gather resources, and develop their colony
          using realistic behaviors and pheromone communication.
        </p>
        <Button 
          onClick={() => navigate('/ant-simulation')}
          size="lg"
          className="gap-2"
          variant="default"
        >
          <PlayCircle className="w-5 h-5" />
          Watch Simulation
        </Button>
      </div>
    </div>
  );
};

export default Index;

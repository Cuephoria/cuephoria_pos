
import React from 'react';
import { Gamepad2 } from 'lucide-react';

interface ControllerManagementProps {
  totalControllers: number;
  availableControllers: number;
}

const ControllerManagement = ({
  totalControllers,
  availableControllers
}: ControllerManagementProps) => {
  const controllers = Array.from({ length: totalControllers }).map((_, index) => {
    const isAvailable = index < availableControllers;
    return (
      <div 
        key={index} 
        className={`w-8 h-8 flex items-center justify-center rounded-full ${
          isAvailable ? 'bg-green-500/20 text-green-500' : 'bg-gray-700/50 text-gray-500'
        }`}
        title={isAvailable ? "Available controller" : "In use"}
      >
        <Gamepad2 className="h-4 w-4" />
      </div>
    );
  });

  return (
    <div className="mt-4">
      <h4 className="text-sm font-medium text-gray-400 flex items-center mb-2">
        <Gamepad2 className="mr-2 h-4 w-4 text-cuephoria-purple" />
        Controller Availability
      </h4>
      <div className="flex space-x-2">
        {controllers}
      </div>
      <p className="text-xs text-gray-400 mt-1">
        {availableControllers} of {totalControllers} controllers available
      </p>
    </div>
  );
};

export default ControllerManagement;

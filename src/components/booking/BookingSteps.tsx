
import React from 'react';
import { Check } from 'lucide-react';

interface BookingStepsProps {
  currentStep: 1 | 2 | 3 | 4 | 5;
}

const BookingSteps = ({ currentStep }: BookingStepsProps) => {
  const steps = [
    { id: 1, name: 'Date & Time' },
    { id: 2, name: 'Select Station' },
    { id: 3, name: 'Customer Info' },
    { id: 4, name: 'Summary' },
    { id: 5, name: 'Confirmation' }
  ];

  return (
    <div className="px-4 py-5 sm:px-6">
      <div className="flex flex-wrap justify-between gap-y-4">
        {steps.map((step, index) => {
          const isCompleted = step.id < currentStep;
          const isActive = step.id === currentStep;
          
          return (
            <div key={step.id} className={`flex items-center ${index < steps.length - 1 ? 'md:w-auto' : ''}`}>
              {/* Step circle */}
              <div 
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${
                  isCompleted ? 'bg-cuephoria-purple border-cuephoria-purple' : 
                  isActive ? 'border-cuephoria-purple text-cuephoria-purple' : 
                  'border-gray-700 text-gray-500'
                }`}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4 text-white" />
                ) : (
                  <span className="text-sm font-medium">{step.id}</span>
                )}
              </div>
              
              {/* Step name */}
              <span 
                className={`ml-2 text-sm font-medium ${
                  isCompleted ? 'text-cuephoria-lightpurple' : 
                  isActive ? 'text-white' : 
                  'text-gray-500'
                }`}
              >
                {step.name}
              </span>
              
              {/* Divider line between steps */}
              {index < steps.length - 1 && (
                <div className="hidden md:block mx-4 h-0.5 w-12 bg-gray-700">
                  <span className="sr-only">divider</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BookingSteps;

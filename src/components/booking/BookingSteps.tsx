
import React from 'react';
import { Check } from 'lucide-react';

interface BookingStepsProps {
  currentStep: 1|2|3|4|5;
}

const BookingSteps = ({ currentStep }: BookingStepsProps) => {
  const steps = [
    { id: 1, name: 'Date & Time' },
    { id: 2, name: 'Station' },
    { id: 3, name: 'Your Info' },
    { id: 4, name: 'Summary' },
    { id: 5, name: 'Confirmed' }
  ];

  return (
    <div className="hidden sm:flex items-center justify-center max-w-4xl mx-auto">
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          {/* Step indicator */}
          <div className="relative flex items-center">
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                currentStep > step.id
                  ? 'bg-cuephoria-purple border-cuephoria-purple text-white'
                  : currentStep === step.id
                  ? 'border-cuephoria-lightpurple bg-transparent text-cuephoria-lightpurple'
                  : 'border-gray-600 bg-transparent text-gray-500'
              }`}
            >
              {currentStep > step.id ? (
                <Check className="h-4 w-4" />
              ) : (
                <span className="text-sm">{step.id}</span>
              )}
            </div>
            <span
              className={`absolute -bottom-6 whitespace-nowrap text-sm 
                ${
                  currentStep >= step.id
                    ? 'text-cuephoria-lightpurple'
                    : 'text-gray-500'
                }`}
            >
              {step.name}
            </span>
          </div>
          
          {/* Connector line (except after last step) */}
          {index < steps.length - 1 && (
            <div 
              className={`h-[2px] w-16 mx-1 ${
                currentStep > step.id + 1
                  ? 'bg-cuephoria-purple'
                  : currentStep > step.id
                  ? 'bg-gradient-to-r from-cuephoria-purple to-gray-600'
                  : 'bg-gray-600'
              }`}
            />
          )}
        </React.Fragment>
      ))}
      
      {/* Mobile alternative (visible on small screens) */}
      <div className="sm:hidden text-center mt-4 text-lg font-medium">
        Step {currentStep} of 5: {steps.find(s => s.id === currentStep)?.name}
      </div>
    </div>
  );
};

export default BookingSteps;

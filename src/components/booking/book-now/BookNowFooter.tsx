
import React from 'react';
import { Button } from '@/components/ui/button';
import { CardFooter } from '@/components/ui/card';
import { ChevronRight } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface BookNowFooterProps {
  currentStep: 1 | 2 | 3 | 4 | 5;
  isSubmitting: boolean;
  onPreviousStep: () => void;
  onNextStep: () => void;
  onBookAnother: () => void;
}

const BookNowFooter: React.FC<BookNowFooterProps> = ({
  currentStep,
  isSubmitting,
  onPreviousStep,
  onNextStep,
  onBookAnother
}) => {
  // Scroll to top function
  const handleNextWithScroll = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    onNextStep();
  };

  const handlePreviousWithScroll = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    onPreviousStep();
  };

  return (
    <CardFooter className="flex flex-col sm:flex-row justify-between gap-4">
      {currentStep < 5 && (
        <>
          <Button 
            variant="outline" 
            onClick={handlePreviousWithScroll}
            disabled={currentStep === 1 || isSubmitting}
            className="w-full sm:w-auto"
          >
            Back
          </Button>
          
          <Button 
            onClick={handleNextWithScroll}
            disabled={isSubmitting}
            className="w-full sm:w-auto bg-cuephoria-purple hover:bg-cuephoria-purple/90"
          >
            {isSubmitting ? (
              <>
                <LoadingSpinner className="mr-2" /> Processing...
              </>
            ) : currentStep === 4 ? (
              'Confirm Booking'
            ) : (
              <>
                Continue <ChevronRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </>
      )}
      
      {currentStep === 5 && (
        <>
          <Button 
            onClick={() => window.location.href = '/'}
            className="w-full sm:w-auto"
            variant="outline"
          >
            Return to Home
          </Button>
          
          <Button 
            onClick={onBookAnother}
            className="w-full sm:w-auto bg-cuephoria-purple hover:bg-cuephoria-purple/90"
          >
            Book Another Session
          </Button>
        </>
      )}
    </CardFooter>
  );
};

export default BookNowFooter;

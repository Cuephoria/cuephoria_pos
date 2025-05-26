
import React from 'react';

const BookNowHeader = () => {
  return (
    <header className="pt-8 pb-6 px-4 sm:px-6 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col items-center text-center">
          <img 
            src="/lovable-uploads/61f60a38-12c2-4710-b1c8-0000eb74593c.png" 
            alt="Cuephoria Logo" 
            className="h-16 mb-4" 
          />
          <h1 className="text-3xl md:text-4xl font-bold text-white font-heading bg-clip-text text-transparent bg-gradient-to-r from-cuephoria-purple via-cuephoria-lightpurple to-cuephoria-blue">
            Book Your Gaming Experience
          </h1>
          <p className="mt-2 text-lg text-gray-300 max-w-2xl">
            Reserve your favorite gaming stations or pool tables in advance
          </p>
        </div>
      </div>
    </header>
  );
};

export default BookNowHeader;

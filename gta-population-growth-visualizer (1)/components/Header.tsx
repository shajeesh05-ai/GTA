
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="text-center">
      <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
        GTA Population Growth
      </h1>
      <p className="mt-3 text-lg md:text-xl text-gray-400 max-w-3xl mx-auto">
        Visualizing the rapid expansion of the Greater Toronto Area, from historical trends to future projections.
      </p>
    </header>
  );
};

export default Header;

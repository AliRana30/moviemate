import React from 'react';

const BlurCircle = ({ position }) => {
  return (
    <div
      className={`absolute ${position} w-36 h-36 bg-red-500 opacity-30 blur-3xl rounded-full z-0`}
    ></div>
  );
};

export default BlurCircle;

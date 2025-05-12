import React from 'react';

const Loader = () => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '70vh',
      fontSize: '2rem'
    }}>
      🔄 Laddar...
    </div>
  );
};

export default Loader;

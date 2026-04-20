import React from 'react';

const SolarSystemExplorer = () => {
  return (
    <div style={{ width: '100%', borderRadius: '1.5rem', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.35)', minHeight: '700px' }}>
      <iframe
        src="/solar-system-explorer.html"
        title="Solar System Explorer"
        style={{
          width: '100%',
          height: '700px',
          border: 'none',
          display: 'block'
        }}
        allowFullScreen
      />
    </div>
  );
};

export default SolarSystemExplorer;

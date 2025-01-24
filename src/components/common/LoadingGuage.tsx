import React from 'react';

const LoadingGauge: React.FC = () => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#005b61">
        <circle cx="25" cy="25" r="20" strokeWidth="4" strokeOpacity="0.5" />
        <circle
          cx="25"
          cy="25"
          r="20"
          strokeWidth="4"
          strokeDasharray="31.4 31.4"
          strokeDashoffset="0"
          strokeLinecap="round"
          transform="rotate(-90 25 25)"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 25 25"
            to="360 25 25"
            dur="1s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>
    </div>
  );
};

export default LoadingGauge;

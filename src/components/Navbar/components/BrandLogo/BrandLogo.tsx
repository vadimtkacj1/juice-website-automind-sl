import React from 'react';

function BrandLogo({ compact = false }: { compact?: boolean }) {
  const size = compact ? 38 : 48;
  
  return (
    <div className="brand-logo" style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 60 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        aria-hidden="true"
      >
        {/* Background circle with gradient */}
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF8C00" />
            <stop offset="100%" stopColor="#FF6B00" />
          </linearGradient>
          <linearGradient id="leafGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4CAF50" />
            <stop offset="100%" stopColor="#2E7D32" />
          </linearGradient>
        </defs>
        
        {/* Orange circle (representing orange/citrus) */}
        <circle cx="30" cy="32" r="24" fill="url(#logoGradient)" />
        
        {/* Orange segments pattern */}
        <path
          d="M30 32 L30 8 A24 24 0 0 1 54 32 Z"
          fill="rgba(255,255,255,0.15)"
        />
        <path
          d="M30 32 L54 32 A24 24 0 0 1 30 56 Z"
          fill="rgba(255,255,255,0.1)"
        />
        <path
          d="M30 32 L30 56 A24 24 0 0 1 6 32 Z"
          fill="rgba(255,255,255,0.05)"
        />
        
        {/* Center highlight */}
        <circle cx="30" cy="32" r="6" fill="rgba(255,255,255,0.3)" />
        
        {/* Leaf on top */}
        <path
          d="M30 8 Q35 2 42 4 Q38 8 35 12 Q32 8 30 8 Z"
          fill="url(#leafGradient)"
        />
        <path
          d="M36 6 Q38 4 40 5"
          stroke="#2E7D32"
          strokeWidth="1"
          fill="none"
        />
        
        {/* Hebrew letter נ (Nun) stylized in center */}
        <text
          x="30"
          y="38"
          textAnchor="middle"
          fill="white"
          fontSize="20"
          fontWeight="900"
          fontFamily="'Heebo', sans-serif"
          style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.2)' }}
        >
          נמ
        </text>
      </svg>
      
    </div>
  );
}

export default BrandLogo;

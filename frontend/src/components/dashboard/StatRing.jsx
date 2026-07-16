import React from 'react';

function StatRing({ value, max = 100, label, color = '#006876', size = 88, strokeWidth = 7 }) {
  var radius = (size - strokeWidth) / 2;
  var circumference = radius * 2 * Math.PI;
  var percentage = Math.min(100, Math.max(0, (value / (max || 1)) * 100));
  var strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}>
          {/* Background Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="var(--border-color)"
            strokeWidth={strokeWidth}
            opacity="0.5"
          />
          {/* Progress Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }}
          />
        </svg>
        {/* Center Number */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: size,
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.45rem',
          fontWeight: '800',
          color: 'var(--text-primary)',
          letterSpacing: '-0.02em',
          fontFamily: "'Hanken Grotesk', sans-serif"
        }}>
          {value}
        </div>
      </div>
      <div style={{
        fontSize: '0.8rem',
        fontWeight: '600',
        color: 'var(--text-muted)',
        textAlign: 'center',
        fontFamily: "'Hanken Grotesk', sans-serif"
      }}>
        {label}
      </div>
    </div>
  );
}

export default StatRing;

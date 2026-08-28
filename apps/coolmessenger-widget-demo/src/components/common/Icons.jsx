import React from 'react';

export function PenguinIcon({ size = 32, className = '', variant = 'logo' }) {
  const r = variant === 'avatar' ? 'av' : 'lg';
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={`shrink-0 ${className}`}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={`${r}-belly`} cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor="#fff" />
          <stop offset="100%" stopColor="#e8eef3" />
        </radialGradient>
      </defs>
      {variant === 'avatar' && <circle cx="32" cy="32" r="32" fill="#4aa8dc" />}
      <ellipse cx="32" cy="40" rx="16" ry="18" fill="#1c1c1c" />
      <ellipse cx="32" cy="44" rx="11" ry="13" fill={`url(#${r}-belly)`} />
      <circle cx="32" cy="22" r="14" fill="#1c1c1c" />
      <ellipse cx="25.5" cy="23" rx="6.2" ry="8" fill="#f4f6f8" />
      <ellipse cx="38.5" cy="23" rx="6.2" ry="8" fill="#f4f6f8" />
      <circle cx="25.5" cy="23.5" r="2.15" fill="#1a1a1a" />
      <circle cx="38.5" cy="23.5" r="2.15" fill="#1a1a1a" />
      <circle cx="26.2" cy="22.8" r="0.7" fill="#fff" />
      <circle cx="39.2" cy="22.8" r="0.7" fill="#fff" />
      <path d="M28.2 27.2c1.4 6 3.8 7.6 3.8 7.6s2.4-1.6 3.8-7.6c-2.2 1.2-5.4 1.2-7.6 0z" fill="#f5a623" />
      <path d="M30.2 28.4h3.6c0 0-1.2 3.2-1.8 3.2s-1.8-3.2-1.8-3.2z" fill="#e8891a" />
      <ellipse cx="24" cy="58" rx="6" ry="2.6" fill="#f5a623" />
      <ellipse cx="40" cy="58" rx="6" ry="2.6" fill="#f5a623" />
    </svg>
  );
}

export function UserStatusIcon({ status, size = 16 }) {
  if (status === 'pc') {
    return (
      <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true">
        <rect x="2" y="3" width="12" height="8" rx="1" fill="#6b8cae" />
        <rect x="3" y="4.2" width="10" height="5.5" fill="#d9e6f2" />
        <rect x="6" y="11" width="4" height="1.2" fill="#6b8cae" />
        <rect x="4.5" y="12.2" width="7" height="1.2" fill="#6b8cae" />
      </svg>
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="8" cy="5" r="3.1" fill={status === 'offline' ? '#94a3b8' : '#3d8eda'} />
      <path d="M3 14c.4-3.2 2.4-4.6 5-4.6S12.6 10.8 13 14" fill={status === 'offline' ? '#94a3b8' : '#3d8eda'} />
      {status === 'offline' && (
        <>
          <circle cx="12" cy="12" r="3.4" fill="#fff" />
          <path d="M10.4 10.4l3.2 3.2M13.6 10.4l-3.2 3.2" stroke="#d45454" strokeWidth="1.4" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

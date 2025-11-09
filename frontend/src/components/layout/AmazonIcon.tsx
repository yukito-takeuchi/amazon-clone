import React from 'react';

interface AmazonIconProps {
  className?: string;
  width?: number;
  height?: number;
}

export const AmazonIcon: React.FC<AmazonIconProps> = ({ 
  className = '', 
  width = 32, 
  height = 32 
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width={width}
      height={height}
      className={className}
    >
      {/* Amazon logo: lowercase 'a' with orange smile arrow */}
      {/* Letter 'a' */}
      <path
        d="M50 15 C38 15, 28 20, 28 30 C28 40, 36 48, 46 48 C49 48, 52 47, 54 46 L58 58 L68 58 L62 42 C64 40, 65 37, 65 34 C65 30, 63 27, 60 25 C62 21, 63 16, 63 11 C63 5, 58 1, 52 1 C49 1, 47 2, 45 3 C43 2, 41 1, 39 1 C33 1, 28 5, 28 11 C28 16, 30 21, 32 25 C29 27, 27 30, 27 34 C27 37, 28 40, 30 42 L24 58 L34 58 L38 46 C40 47, 43 48, 46 48 C56 48, 72 40, 72 30 C72 20, 62 15, 50 15 Z M50 25 C55 25, 58 28, 58 33 C58 38, 55 41, 50 41 C45 41, 42 38, 42 33 C42 28, 45 25, 50 25 Z"
        fill="#232F3E"
      />
      {/* Orange smile arrow from A to Z - curved upward */}
      <path
        d="M28 65 Q38 60, 48 59 Q58 58, 68 60 Q73 61, 78 64 L81 60 Q76 58, 71 57 Q61 55, 51 57 Q41 59, 31 63 Z"
        fill="#FF9900"
      />
    </svg>
  );
};

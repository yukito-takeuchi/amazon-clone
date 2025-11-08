import React from 'react';

interface AmazonIconProps {
  className?: string;
  width?: number;
  height?: number;
}

export const AmazonIcon: React.FC<AmazonIconProps> = ({ 
  className = '', 
  width = 28, 
  height = 28 
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={width}
      height={height}
      className={className}
    >
      {/* Shopping cart icon */}
      <path 
        d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" 
        fill="currentColor"
      />
      {/* Arrow from A to Z (Amazon's signature smile) */}
      <path 
        d="M18 2l-2 2-2-2h4z" 
        fill="#FF9900"
      />
      <path 
        d="M14 4l2 2 2-2h-4z" 
        fill="#FF9900"
      />
    </svg>
  );
};


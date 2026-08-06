import React from 'react';

interface EvaForgeIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

export const EvaForgeIcon: React.FC<EvaForgeIconProps> = ({
  size = 24,
  className = '',
  ...props
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`lucide lucide-evaforge-circular ${className}`}
      {...props}
    >
      {/* 3 circular loop segments with arrowheads */}
      <path d="M12 3a9 9 0 0 1 9 9" />
      <path d="M17 12h4v-4" />
      
      <path d="M21 12a9 9 0 0 1-9 9" />
      <path d="M12 17v4h4" />
      
      <path d="M12 21a9 9 0 0 1-9-9 9 9 0 0 1 9-9" />
      <path d="M12 7V3H8" />
      
      {/* Central code status node */}
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
};

export default EvaForgeIcon;

import React from "react";

interface EditaiLogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: { icon: 20, text: "text-sm" },
  md: { icon: 24, text: "text-base" },
  lg: { icon: 32, text: "text-lg" },
};

export function EditaiLogo({ 
  className = "", 
  showText = true,
  size = "md" 
}: EditaiLogoProps) {
  const { icon: iconSize, text: textSize } = sizeMap[size];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Balão de fala azul com três pontos brancos */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
        style={{ transform: 'rotate(5deg)' }}
      >
        {/* Balão de fala principal (oval) */}
        <ellipse
          cx="12"
          cy="10"
          rx="8"
          ry="7"
          fill="#2B9CFC"
        />
        {/* Três pontos brancos horizontais */}
        <circle cx="9" cy="10" r="1.2" fill="white" />
        <circle cx="12" cy="10" r="1.2" fill="white" />
        <circle cx="15" cy="10" r="1.2" fill="white" />
        {/* Cauda do balão apontando para baixo à esquerda */}
        <path
          d="M5 14 L3 18 L7 17 Z"
          fill="#2B9CFC"
        />
      </svg>
      {showText && (
        <span className={`font-bold text-black ${textSize}`}>editai</span>
      )}
    </div>
  );
}


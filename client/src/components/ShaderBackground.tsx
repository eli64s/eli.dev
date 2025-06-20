import { useState, useEffect } from 'react';

interface ShaderBackgroundProps {
  variant?: 'blue' | 'animated' | 'radial';
  children: React.ReactNode;
  className?: string;
}

export default function ShaderBackground({ 
  variant = 'blue', 
  children, 
  className = '' 
}: ShaderBackgroundProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const getBackgroundClass = () => {
    switch (variant) {
      case 'animated':
        return 'shader-gradient-animated';
      case 'radial':
        return 'shader-gradient-radial';
      default:
        return 'shader-gradient-blue';
    }
  };

  const dynamicStyle = variant === 'radial' ? {
    background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, 
      hsl(223, 100%, 45%) 0%,
      hsl(271, 100%, 35%) 30%,
      hsl(225, 25%, 8%) 70%,
      hsl(225, 25%, 5%) 100%
    )`
  } : {};

  return (
    <div 
      className={`${getBackgroundClass()} ${className}`}
      style={dynamicStyle}
    >
      {children}
    </div>
  );
}
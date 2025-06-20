import { useState } from 'react';
import ShaderBackground from './ShaderBackground';

interface ColorPaletteProps {
  onColorChange?: (variant: 'blue' | 'animated' | 'radial' | 'orange' | 'stringtheory' | 'waveform' | 'plasma' | 'cybergrid' | 'voronoi' | 'kaleidoscope' | 'mandala' | 'sdfmorph' | 'fractalnoise' | 'fluiddynamics' | 'quantumfield' | 'zippyzaps' | 'mandelbrot' | 'juliaset' | 'burningship' | 'turbulence' | 'clouds') => void;
}

interface ColorPaletteInternalProps extends ColorPaletteProps {
  currentVariant?: 'blue' | 'animated' | 'radial' | 'orange' | 'stringtheory' | 'waveform' | 'plasma' | 'cybergrid' | 'voronoi' | 'kaleidoscope' | 'mandala' | 'sdfmorph' | 'fractalnoise' | 'fluiddynamics' | 'quantumfield' | 'zippyzaps' | 'mandelbrot' | 'juliaset' | 'burningship' | 'turbulence' | 'clouds';
}

export default function ColorPalette({ onColorChange, currentVariant = 'radial' }: ColorPaletteInternalProps) {
  const handleColorSelect = (variant: 'blue' | 'animated' | 'radial' | 'orange' | 'stringtheory' | 'waveform' | 'plasma' | 'cybergrid' | 'voronoi' | 'kaleidoscope' | 'mandala' | 'sdfmorph' | 'fractalnoise' | 'fluiddynamics' | 'quantumfield' | 'zippyzaps' | 'mandelbrot' | 'juliaset' | 'burningship' | 'turbulence' | 'clouds') => {
    onColorChange?.(variant);
  };

  const colorOptions = [
    {
      variant: 'blue' as const,
      name: 'Deep Blue',
      preview: 'linear-gradient(135deg, hsl(223, 100%, 45%) 0%, hsl(271, 100%, 35%) 50%, hsl(225, 25%, 8%) 100%)'
    },
    {
      variant: 'animated' as const,
      name: 'Dynamic Flow',
      preview: 'linear-gradient(-45deg, hsl(223, 100%, 45%), hsl(271, 100%, 35%), hsl(195, 100%, 65%), hsl(321, 100%, 55%))'
    },
    {
      variant: 'radial' as const,
      name: 'Interactive Radial',
      preview: 'radial-gradient(circle at 30% 20%, hsl(223, 100%, 45%) 0%, hsl(271, 100%, 35%) 30%, hsl(225, 25%, 8%) 70%, hsl(225, 25%, 5%) 100%)'
    },
    {
      variant: 'stringtheory' as const,
      name: 'String Theory',
      preview: 'radial-gradient(circle at 50% 50%, hsl(280, 100%, 50%) 0%, hsl(320, 100%, 40%) 30%, hsl(220, 100%, 20%) 70%, hsl(0, 0%, 0%) 100%)'
    },
    {
      variant: 'waveform' as const,
      name: 'Synthwave',
      preview: 'linear-gradient(135deg, hsl(320, 100%, 40%) 0%, hsl(280, 100%, 50%) 30%, hsl(240, 100%, 30%) 70%, hsl(200, 100%, 20%) 100%)'
    },
    {
      variant: 'plasma' as const,
      name: 'Plasma Field',
      preview: 'radial-gradient(circle at 20% 80%, hsl(300, 100%, 60%) 0%, hsl(260, 100%, 50%) 40%, hsl(220, 100%, 40%) 100%)'
    },
    {
      variant: 'cybergrid' as const,
      name: 'Cyber Grid',
      preview: 'linear-gradient(45deg, hsl(180, 100%, 30%) 0%, hsl(200, 100%, 40%) 50%, hsl(220, 100%, 50%) 100%)'
    },
    {
      variant: 'voronoi' as const,
      name: 'Crystal Cells',
      preview: 'radial-gradient(circle at 30% 70%, hsl(270, 100%, 60%) 0%, hsl(320, 100%, 50%) 40%, hsl(200, 100%, 30%) 100%)'
    },
    {
      variant: 'kaleidoscope' as const,
      name: 'Kaleidoscope',
      preview: 'conic-gradient(from 0deg at 50% 50%, hsl(300, 100%, 60%), hsl(240, 100%, 50%), hsl(180, 100%, 40%), hsl(120, 100%, 50%), hsl(60, 100%, 60%), hsl(300, 100%, 60%))'
    },
    {
      variant: 'mandala' as const,
      name: 'Sacred Mandala',
      preview: 'radial-gradient(circle at 50% 50%, hsl(45, 100%, 70%) 0%, hsl(30, 100%, 60%) 30%, hsl(320, 100%, 50%) 60%, hsl(240, 100%, 30%) 100%)'
    },
    {
      variant: 'sdfmorph' as const,
      name: 'SDF Morph',
      preview: 'radial-gradient(circle at 40% 60%, hsl(320, 100%, 60%) 0%, hsl(280, 100%, 50%) 30%, hsl(240, 100%, 40%) 70%, hsl(200, 100%, 30%) 100%)'
    },
    {
      variant: 'fractalnoise' as const,
      name: 'Fractal Noise',
      preview: 'linear-gradient(45deg, hsl(260, 100%, 40%) 0%, hsl(300, 100%, 50%) 25%, hsl(340, 100%, 60%) 50%, hsl(20, 100%, 50%) 75%, hsl(60, 100%, 60%) 100%)'
    },
    {
      variant: 'fluiddynamics' as const,
      name: 'Fluid Flow',
      preview: 'radial-gradient(ellipse at 30% 20%, hsl(200, 100%, 50%) 0%, hsl(220, 100%, 40%) 40%, hsl(280, 100%, 50%) 70%, hsl(320, 100%, 40%) 100%)'
    },
    {
      variant: 'quantumfield' as const,
      name: 'Quantum Field',
      preview: 'conic-gradient(from 45deg at 50% 50%, hsl(240, 100%, 60%) 0deg, hsl(280, 100%, 70%) 72deg, hsl(200, 100%, 50%) 144deg, hsl(160, 100%, 40%) 216deg, hsl(240, 100%, 60%) 288deg, hsl(280, 100%, 70%) 360deg)'
    },
    {
      variant: 'zippyzaps' as const,
      name: 'Zippy Zaps',
      preview: 'radial-gradient(circle at 30% 40%, hsl(240, 100%, 80%) 0%, hsl(280, 100%, 60%) 25%, hsl(180, 100%, 70%) 50%, hsl(60, 100%, 80%) 75%, hsl(300, 100%, 90%) 100%)'
    },
    {
      variant: 'mandelbrot' as const,
      name: 'Mandelbrot',
      preview: 'radial-gradient(circle at 60% 40%, hsl(280, 100%, 40%) 0%, hsl(320, 100%, 60%) 25%, hsl(200, 100%, 30%) 50%, hsl(40, 100%, 50%) 75%, hsl(300, 100%, 70%) 100%)'
    },
    {
      variant: 'juliaset' as const,
      name: 'Julia Set',
      preview: 'conic-gradient(from 90deg at 30% 70%, hsl(200, 100%, 70%) 0deg, hsl(260, 100%, 50%) 90deg, hsl(320, 100%, 60%) 180deg, hsl(40, 100%, 60%) 270deg, hsl(200, 100%, 70%) 360deg)'
    },
    {
      variant: 'burningship' as const,
      name: 'Burning Ship',
      preview: 'linear-gradient(135deg, hsl(20, 100%, 60%) 0%, hsl(350, 100%, 50%) 25%, hsl(280, 100%, 40%) 50%, hsl(200, 100%, 30%) 75%, hsl(40, 100%, 70%) 100%)'
    },
    {
      variant: 'turbulence' as const,
      name: 'Turbulence',
      preview: 'radial-gradient(ellipse at 30% 60%, hsl(200, 90%, 60%) 0%, hsl(240, 80%, 50%) 30%, hsl(180, 70%, 40%) 60%, hsl(220, 85%, 65%) 100%)'
    },
    {
      variant: 'clouds' as const,
      name: 'Clouds',
      preview: 'linear-gradient(135deg, hsl(220, 40%, 85%) 0%, hsl(210, 50%, 70%) 30%, hsl(230, 30%, 90%) 60%, hsl(200, 45%, 75%) 100%)'
    },
    {
      variant: 'orange' as const,
      name: 'Classic Orange',
      preview: 'linear-gradient(135deg, #FF6B35 0%, #FF5722 100%)'
    }
  ];

  const handleShuffle = () => {
    const allVariants = colorOptions.map(option => option.variant);
    const currentIndex = allVariants.indexOf(currentVariant);
    let randomIndex;
    
    // Ensure we don't select the same theme
    do {
      randomIndex = Math.floor(Math.random() * allVariants.length);
    } while (randomIndex === currentIndex && allVariants.length > 1);
    
    handleColorSelect(allVariants[randomIndex] as any);
  };

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 glass-effect rounded-lg p-4 space-y-2">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white text-sm font-medium">Visual Themes</h3>
        <button
          onClick={handleShuffle}
          className="text-white/70 hover:text-white transition-colors duration-200 p-2 rounded-md hover:bg-white/10"
          title="Shuffle themes"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 3h5v5"></path>
            <path d="M4 20L21 3"></path>
            <path d="M21 16v5h-5"></path>
            <path d="M15 15l6 6"></path>
            <path d="M4 4l5 5"></path>
          </svg>
        </button>
      </div>
      <div className="flex gap-2 overflow-x-auto max-w-screen-lg">
        {colorOptions.map((option) => (
          <button
            key={option.variant}
            onClick={() => handleColorSelect(option.variant as any)}
            className={`
              w-16 h-16 rounded-lg border-2 transition-all duration-200 relative overflow-hidden flex-shrink-0
              ${currentVariant === option.variant 
                ? 'border-white scale-110 shadow-lg shadow-white/20' 
                : 'border-white/30 hover:border-white/60 hover:scale-105'
              }
            `}
            style={{ background: option.preview }}
            title={option.name}
          >
            {currentVariant === option.variant && (
              <div className="absolute inset-0 bg-white/20 flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
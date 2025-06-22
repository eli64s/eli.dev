// client/src/components/ColorPalette.tsx

import { useState } from 'react';

// Shader Configuration - All shaders are now enabled.
// Set any to 'false' if you wish to temporarily hide them from the UI.
const SHADER_CONFIG = {

  // WebGL Shaders
  stringtheory: true,
  spiralwhirlpool: false,
  waveform: true,
  plasma: true,
  cybergrid: true,
  voronoi: true,
  kaleidoscope: false,
  sdfmorph: true,
  fluiddynamics: true,
  quantumfield: true,
  zippyzaps: false,
  juliaset: false,
  fractalmandala: false,
  burningship: true,
  turbulence: true,
  crossgalacticocean: true,
  galaxy: true,
  tunnelvision: true,
  eyeofdragon: false,

  // Basic CSS Gradients
  blue: false,
  animated: false,
  radial: false,
  orange: true,
} as const;

export type ShaderVariant = keyof typeof SHADER_CONFIG;

interface ColorPaletteProps {
  onColorChange?: (variant: ShaderVariant) => void;
  currentVariant?: ShaderVariant;
}

export default function ColorPalette({ onColorChange, currentVariant }: ColorPaletteProps) {
  const handleColorSelect = (variant: ShaderVariant) => {
    onColorChange?.(variant);
  };

  const colorOptions = [
    { variant: 'eyeofdragon' as const, name: 'Dragon\'s Eye', preview: 'radial-gradient(circle at 50% 50%, hsl(20, 100%, 50%) 0%, hsl(340, 90%, 40%) 40%, hsl(280, 85%, 25%) 80%, hsl(0,0%,5%) 100%)' },
    { variant: 'burningship' as const, name: 'Burning Ship', preview: 'linear-gradient(135deg, hsl(20, 100%, 60%) 0%, hsl(350, 100%, 50%) 25%, hsl(280, 100%, 40%) 50%, hsl(200, 100%, 30%) 100%)' },
    { variant: 'crossgalacticocean' as const, name: 'Galactic Ocean', preview: 'linear-gradient(180deg, hsl(215, 70%, 15%) 0%, hsl(180, 100%, 60%) 40%, hsl(300, 100%, 70%) 100%)' },
    { variant: 'galaxy' as const, name: 'Galaxy of Universes', preview: 'radial-gradient(circle at 30% 30%, hsl(280, 100%, 60%) 0%, hsl(240, 100%, 40%) 30%, hsl(320, 100%, 50%) 100%)' },
    { variant: 'tunnelvision' as const, name: 'Neon Tunnel', preview: 'radial-gradient(circle at 50% 50%, hsl(290, 100%, 70%) 0%, hsl(240, 100%, 40%) 40%, hsl(0, 0%, 5%) 80%)' },
    { variant: 'spiralwhirlpool' as const, name: 'Spiral Whirlpool', preview: 'conic-gradient(from 180deg, hsl(240, 100%, 70%), hsl(300, 100%, 60%), hsl(20, 100%, 60%), hsl(280, 100%, 70%), hsl(240, 100%, 70%))' },
    { variant: 'turbulence' as const, name: 'Turbulent Flow', preview: 'radial-gradient(ellipse at 70% 30%, hsl(200, 90%, 60%), hsl(240, 80%, 50%), hsl(280, 85%, 35%))' },
    { variant: 'stringtheory' as const, name: 'String Theory', preview: 'radial-gradient(circle, hsl(280, 100%, 50%), hsl(320, 100%, 40%), hsl(220, 100%, 20%), #000)' },
    { variant: 'cybergrid' as const, name: 'Cyber Grid', preview: 'linear-gradient(45deg, hsl(180, 100%, 30%), hsl(200, 100%, 40%), hsl(220, 100%, 50%))' },
    { variant: 'quantumfield' as const, name: 'Quantum Field', preview: 'conic-gradient(hsl(240, 100%, 60%), hsl(280, 100%, 70%), hsl(200, 100%, 50%), hsl(160, 100%, 40%), hsl(240, 100%, 60%))' },
    { variant: 'fluiddynamics' as const, name: 'Fluid Dynamics', preview: 'radial-gradient(ellipse, hsl(200, 100%, 50%), hsl(220, 100%, 40%), hsl(280, 100%, 50%))' },
    { variant: 'kaleidoscope' as const, name: 'Kaleidoscope', preview: 'conic-gradient(hsl(300, 100%, 60%), hsl(240, 100%, 50%), hsl(180, 100%, 40%), hsl(120, 100%, 50%), hsl(300, 100%, 60%))' },
    { variant: 'sdfmorph' as const, name: 'SDF Morph', preview: 'radial-gradient(circle, hsl(320, 100%, 60%), hsl(280, 100%, 50%), hsl(240, 100%, 40%))' },
    { variant: 'voronoi' as const, name: 'Crystal Cells', preview: 'radial-gradient(circle, hsl(270, 100%, 60%), hsl(320, 100%, 50%), hsl(200, 100%, 30%))' },
    { variant: 'plasma' as const, name: 'Plasma Field', preview: 'radial-gradient(circle, hsl(300, 100%, 60%), hsl(260, 100%, 50%), hsl(220, 100%, 40%))' },
    { variant: 'waveform' as const, name: 'Synthwave', preview: 'linear-gradient(135deg, hsl(320, 100%, 40%), hsl(280, 100%, 50%), hsl(240, 100%, 30%))' },
    { variant: 'fractalmandala' as const, name: 'Fractal Mandala', preview: 'radial-gradient(circle, hsl(45, 100%, 70%), hsl(30, 100%, 60%), hsl(320, 100%, 50%))' },
    { variant: 'juliaset' as const, name: 'Julia Set', preview: 'conic-gradient(hsl(200, 100%, 70%), hsl(260, 100%, 50%), hsl(320, 100%, 60%), hsl(40, 100%, 60%), hsl(200, 100%, 70%))' },
    { variant: 'zippyzaps' as const, name: 'Zippy Zaps', preview: 'radial-gradient(circle, hsl(240, 100%, 80%), hsl(280, 100%, 60%), hsl(180, 100%, 70%))' },
    { variant: 'animated' as const, name: 'Dynamic Flow', preview: 'linear-gradient(-45deg, hsl(223, 100%, 45%), hsl(271, 100%, 35%), hsl(195, 100%, 65%), hsl(321, 100%, 55%))' },
    { variant: 'blue' as const, name: 'Deep Blue', preview: 'linear-gradient(135deg, hsl(223, 100%, 45%), hsl(271, 100%, 35%), #000)' },
    { variant: 'orange' as const, name: 'Classic Orange', preview: 'linear-gradient(135deg, #FF6B35, #FF5722)' },
  ];

  const enabledColorOptions = colorOptions.filter(option => SHADER_CONFIG[option.variant]);

  const handleShuffle = () => {
    const enabledVariants = enabledColorOptions.map(option => option.variant);
    const currentIndex = enabledVariants.indexOf(currentVariant ?? 'stringtheory');
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * enabledVariants.length);
    } while (randomIndex === currentIndex && enabledVariants.length > 1);
    handleColorSelect(enabledVariants[randomIndex]);
  };

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 glass-effect rounded-lg p-4 space-y-2 animate-slide-up-fade-in">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white text-sm font-medium">Visual Themes</h3>
        <button
          onClick={handleShuffle}
          className="text-white/70 hover:text-white transition-colors duration-200 p-2 rounded-md hover:bg-white/10"
          title="Shuffle themes"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/>
          </svg>
        </button>
      </div>
      <div className="flex gap-2 overflow-x-auto max-w-screen-lg pb-2">
        {enabledColorOptions.map((option) => (
          <button
            key={option.variant}
            onClick={() => handleColorSelect(option.variant)}
            className={`w-16 h-16 rounded-lg border-2 transition-all duration-200 relative overflow-hidden flex-shrink-0
              ${currentVariant === option.variant ? 'border-white scale-110 shadow-lg shadow-white/20' : 'border-white/30 hover:border-white/60 hover:scale-105'}`
            }
            style={{ background: option.preview, backgroundSize: '400% 400%' }}
            title={option.name}
          >
            {currentVariant === option.variant && (
              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm flex items-center justify-center border-2 border-white/40 rounded-lg">
                <div className="w-3 h-3 bg-white rounded-full shadow-lg animate-pulse"></div>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
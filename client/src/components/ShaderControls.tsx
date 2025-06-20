import { useState } from 'react';
import { Slider } from '@/components/ui/slider';

interface ShaderControlsProps {
  onSpeedChange?: (speed: number) => void;
  onColorChange?: (hue: number, saturation: number) => void;
  onIntensityChange?: (intensity: number) => void;
}

export default function ShaderControls({ 
  onSpeedChange, 
  onColorChange, 
  onIntensityChange 
}: ShaderControlsProps) {
  const [speed, setSpeed] = useState(1.0);
  const [hue, setHue] = useState(0.5);
  const [saturation, setSaturation] = useState(0.8);
  const [intensity, setIntensity] = useState(1.0);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSpeedChange = (value: number[]) => {
    const newSpeed = value[0];
    setSpeed(newSpeed);
    onSpeedChange?.(newSpeed);
  };

  const handleHueChange = (value: number[]) => {
    const newHue = value[0];
    setHue(newHue);
    onColorChange?.(newHue, saturation);
  };

  const handleSaturationChange = (value: number[]) => {
    const newSaturation = value[0];
    setSaturation(newSaturation);
    onColorChange?.(hue, newSaturation);
  };

  const handleIntensityChange = (value: number[]) => {
    const newIntensity = value[0];
    setIntensity(newIntensity);
    onIntensityChange?.(newIntensity);
  };

  return (
    <div className="fixed bottom-4 left-4 z-50 glass-effect rounded-lg p-4 min-w-[280px]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white text-sm font-medium">Shader Controls</h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-white/70 hover:text-white transition-colors"
        >
          {isExpanded ? '−' : '+'}
        </button>
      </div>
      
      {isExpanded && (
        <div className="space-y-4">
          {/* Speed Control */}
          <div>
            <label className="text-white/90 text-xs mb-2 block">
              Speed: {speed.toFixed(1)}x
            </label>
            <Slider
              value={[speed]}
              onValueChange={handleSpeedChange}
              min={0.1}
              max={3.0}
              step={0.1}
              className="w-full"
            />
          </div>

          {/* Color Hue Control */}
          <div>
            <label className="text-white/90 text-xs mb-2 block">
              Color Hue: {Math.round(hue * 360)}°
            </label>
            <Slider
              value={[hue]}
              onValueChange={handleHueChange}
              min={0}
              max={1}
              step={0.01}
              className="w-full"
            />
          </div>

          {/* Color Saturation Control */}
          <div>
            <label className="text-white/90 text-xs mb-2 block">
              Saturation: {Math.round(saturation * 100)}%
            </label>
            <Slider
              value={[saturation]}
              onValueChange={handleSaturationChange}
              min={0}
              max={1}
              step={0.01}
              className="w-full"
            />
          </div>

          {/* Intensity Control */}
          <div>
            <label className="text-white/90 text-xs mb-2 block">
              Intensity: {intensity.toFixed(1)}x
            </label>
            <Slider
              value={[intensity]}
              onValueChange={handleIntensityChange}
              min={0.1}
              max={2.0}
              step={0.1}
              className="w-full"
            />
          </div>

          {/* Preset Buttons */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => {
                setSpeed(0.5);
                setHue(0.7);
                setSaturation(0.8);
                setIntensity(0.8);
                onSpeedChange?.(0.5);
                onColorChange?.(0.7, 0.8);
                onIntensityChange?.(0.8);
              }}
              className="flex-1 px-3 py-1 text-xs bg-blue-500/20 text-blue-200 rounded hover:bg-blue-500/30 transition-colors"
            >
              Calm
            </button>
            <button
              onClick={() => {
                setSpeed(2.0);
                setHue(0.05);
                setSaturation(1.0);
                setIntensity(1.5);
                onSpeedChange?.(2.0);
                onColorChange?.(0.05, 1.0);
                onIntensityChange?.(1.5);
              }}
              className="flex-1 px-3 py-1 text-xs bg-red-500/20 text-red-200 rounded hover:bg-red-500/30 transition-colors"
            >
              Energy
            </button>
            <button
              onClick={() => {
                setSpeed(1.0);
                setHue(0.5);
                setSaturation(0.8);
                setIntensity(1.0);
                onSpeedChange?.(1.0);
                onColorChange?.(0.5, 0.8);
                onIntensityChange?.(1.0);
              }}
              className="flex-1 px-3 py-1 text-xs bg-white/20 text-white rounded hover:bg-white/30 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
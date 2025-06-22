// client/src/components/ShaderBackground.tsx

import { type ShaderVariant } from './ColorPalette';
import BurningShipShader from './BurningShipShader';
import CrossGalacticOceanShader from './CrossGalacticOceanShader';
import CyberGridShader from './CyberGridShader';
import EyeOfDragonShader from './EyeOfDragonShader';
import FluidDynamicsShader from './FluidDynamicsShader';
import FractalMandalaShader from './FractalMandalaShader';
import GalaxyShader from './GalaxyShader';
import JuliaSetShader from './JuliaSetShader';
import KaleidoscopeShader from './KaleidoscopeShader';
import PlasmaShader from './PlasmaShader';
import QuantumFieldShader from './QuantumFieldShader';
import SDFMorphShader from './SDFMorphShader';
import SpiralWhirlpoolShader from './SpiralWhirlpoolShader';
import StringTheoryShader from './StringTheoryShader';
import TunnelVisionShader from './TunnelVisionShader';
import TurbulenceShader from './TurbulenceShader';
import VoronoiShader from './VoronoiShader';
import WaveformShader from './WaveformShader';
import ZippyZapsShader from './ZippyZapsShader';

interface ShaderBackgroundProps {
  variant: ShaderVariant;
  speed?: number;
  intensity?: number;
  colorHue?: number;
  colorSaturation?: number;
  children?: React.ReactNode;
  className?: string;
}

export default function ShaderBackground({ variant, children, className, ...props }: ShaderBackgroundProps) {
  const shaderClass = "absolute inset-0 w-full h-full -z-10 transition-opacity duration-1000 animate-fade-in";
  const containerClass = className || "relative min-h-screen";
  
  // Filter out className from props to avoid passing it to shader components that might not accept it
  const shaderProps = { ...props };

  const renderShaderBackground = () => {
    switch (variant) {
      case 'eyeofdragon':
        return <EyeOfDragonShader {...shaderProps} />;
      case 'burningship':
        return <BurningShipShader {...shaderProps} />;
      case 'crossgalacticocean':
        return <CrossGalacticOceanShader {...shaderProps} />;
      case 'cybergrid':
        return <CyberGridShader {...shaderProps} />;
      case 'fluiddynamics':
        return <FluidDynamicsShader {...shaderProps} />;
      case 'fractalmandala':
        return <FractalMandalaShader {...shaderProps} />;
      case 'galaxy':
        return <GalaxyShader {...shaderProps} />;
      case 'juliaset':
        return <JuliaSetShader {...shaderProps} />;
      case 'kaleidoscope':
        return <KaleidoscopeShader {...shaderProps} />;
      case 'plasma':
        return <PlasmaShader {...shaderProps} />;
      case 'quantumfield':
        return <QuantumFieldShader {...shaderProps} />;
      case 'sdfmorph':
        return <SDFMorphShader {...shaderProps} />;
      case 'spiralwhirlpool':
        return <SpiralWhirlpoolShader {...shaderProps} />;
      case 'stringtheory':
        return <StringTheoryShader {...shaderProps} />;
      case 'tunnelvision':
        return <TunnelVisionShader {...shaderProps} />;
      case 'turbulence':
        return <TurbulenceShader {...shaderProps} />;
      case 'voronoi':
        return <VoronoiShader {...shaderProps} />;
      case 'waveform':
        return <WaveformShader {...shaderProps} />;
      case 'zippyzaps':
        return <ZippyZapsShader {...shaderProps} />;
      default:
        return <StringTheoryShader {...shaderProps} />;
    }
  };

  // For WebGL shaders, wrap them in a container
  if (variant !== 'blue' && variant !== 'animated' && variant !== 'radial' && variant !== 'orange') {
    return (
      <div className={containerClass}>
        {renderShaderBackground()}
        {children}
      </div>
    );
  }

  // For CSS gradients, render them directly
  switch (variant) {

    // CSS Gradients (Fallbacks)
    case 'blue':
      return (
        <div className={containerClass}>
          <div className={`shader-gradient-blue ${shaderClass}`} />
          {children}
        </div>
      );
    case 'animated':
      return (
        <div className={containerClass}>
          <div className={`shader-gradient-animated ${shaderClass}`} />
          {children}
        </div>
      );
    case 'radial':
      return (
        <div className={containerClass}>
          <div className={`shader-gradient-radial ${shaderClass}`} />
          {children}
        </div>
      );
    case 'orange':
      return (
        <div className={containerClass}>
          <div className={`vibrant-orange ${shaderClass}`} />
          {children}
        </div>
      );

    default:
      // Fallback to a default shader if the variant is unknown
      return (
        <div className={containerClass}>
          <StringTheoryShader className={shaderClass} {...props} />
          {children}
        </div>
      );
  }
}
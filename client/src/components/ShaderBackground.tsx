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
  speed: number;
  intensity: number;
  colorHue: number;
  colorSaturation: number;
}

export default function ShaderBackground({ variant, ...props }: ShaderBackgroundProps) {
  const shaderClass = "absolute inset-0 w-full h-full -z-10 transition-opacity duration-1000 animate-fade-in";

  switch (variant) {
    case 'eyeofdragon':
      return <EyeOfDragonShader className={shaderClass} {...props} />;
    case 'burningship':
      return <BurningShipShader className={shaderClass} {...props} />;
    case 'crossgalacticocean':
      return <CrossGalacticOceanShader className={shaderClass} {...props} />;
    case 'cybergrid':
      return <CyberGridShader className={shaderClass} {...props} />;
    case 'fluiddynamics':
      return <FluidDynamicsShader className={shaderClass} {...props} />;
    case 'fractalmandala':
      return <FractalMandalaShader className={shaderClass} {...props} />;
    case 'galaxy':
      return <GalaxyShader className={shaderClass} {...props} />;
    case 'juliaset':
      return <JuliaSetShader className={shaderClass} {...props} />;
    case 'kaleidoscope':
      return <KaleidoscopeShader className={shaderClass} {...props} />;
    case 'plasma':
      return <PlasmaShader className={shaderClass} {...props} />;
    case 'quantumfield':
      return <QuantumFieldShader className={shaderClass} {...props} />;
    case 'sdfmorph':
      return <SDFMorphShader className={shaderClass} {...props} />;
    case 'spiralwhirlpool':
      return <SpiralWhirlpoolShader className={shaderClass} {...props} />;
    case 'stringtheory':
      return <StringTheoryShader className={shaderClass} {...props} />;
    case 'tunnelvision':
      return <TunnelVisionShader className={shaderClass} {...props} />;
    case 'turbulence':
      return <TurbulenceShader className={shaderClass} {...props} />;
    case 'voronoi':
      return <VoronoiShader className={shaderClass} {...props} />;
    case 'waveform':
      return <WaveformShader className={shaderClass} {...props} />;
    case 'zippyzaps':
      return <ZippyZapsShader className={shaderClass} {...props} />;

    // CSS Gradients (Fallbacks)
    case 'blue':
      return <div className={`shader-gradient-blue ${shaderClass}`} />;
    case 'animated':
      return <div className={`shader-gradient-animated ${shaderClass}`} />;
    case 'radial':
      return <div className={`shader-gradient-radial ${shaderClass}`} />;
    case 'orange':
      return <div className={`vibrant-orange ${shaderClass}`} />;

    default:
      // Fallback to a default shader if the variant is unknown
      return <StringTheoryShader className={shaderClass} {...props} />;
  }
}
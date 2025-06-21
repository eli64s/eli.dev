import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { 
  FaGithub, 
  FaLinkedin, 
  FaTwitter, 
  FaInstagram,
} from "react-icons/fa";
import type { Profile, SocialLink, NavigationSection } from "@shared/schema";
import ShaderBackground from "@/components/ShaderBackground";
import ColorPalette from "@/components/ColorPalette";
import StringTheoryShader from "@/components/StringTheoryShader";
import WaveformShader from "@/components/WaveformShader";
import PlasmaShader from "@/components/PlasmaShader";
import CyberGridShader from "@/components/CyberGridShader";
import VoronoiShader from "@/components/VoronoiShader";
import KaleidoscopeShader from "@/components/KaleidoscopeShader";
import FractalMandalaShader from "@/components/FractalMandalaShader";
import SDFMorphShader from "@/components/SDFMorphShader";
import FractalNoiseShader from "@/components/FractalNoiseShader";
import FluidDynamicsShader from "@/components/FluidDynamicsShader";
import QuantumFieldShader from "@/components/QuantumFieldShader";
import ZippyZapsShader from "@/components/ZippyZapsShader";
import MandelbrotShader from "@/components/MandelbrotShader";
import JuliaSetShader from "@/components/JuliaSetShader";
import BurningShipShader from "@/components/BurningShipShader";
import TurbulenceShader from "@/components/TurbulenceShader";
import CloudsShader from "@/components/CloudsShader";
import BubbleColorsShader from "@/components/BubbleColorsShader";
import SpiralWhirlpoolShader from "@/components/SpiralWhirlpoolShader";
import CrossGalacticOceanShader from "@/components/CrossGalacticOceanShader";

import ShaderControls from "@/components/ShaderControls";
import ProjectShowcase from "@/components/ProjectShowcase";

interface PortfolioData {
  profile: Profile;
  socialLinks: SocialLink[];
  navigationSections: NavigationSection[];
}

const iconMap = {
  github: FaGithub,
  linkedin: FaLinkedin,
  twitter: FaTwitter,
  instagram: FaInstagram,
};

export default function Home() {
  const [keyboardNavigation, setKeyboardNavigation] = useState(false);
  const [currentVariant, setCurrentVariant] = useState<'blue' | 'animated' | 'radial' | 'orange' | 'stringtheory' | 'waveform' | 'plasma' | 'cybergrid' | 'voronoi' | 'kaleidoscope' | 'mandala' | 'sdfmorph' | 'fractalnoise' | 'fluiddynamics' | 'quantumfield' | 'zippyzaps' | 'mandelbrot' | 'juliaset' | 'burningship' | 'turbulence' | 'clouds' | 'bubblecolors' | 'spiralwhirlpool' | 'crossgalacticocean'>('radial');
  
  // Shader controls state
  const [shaderSpeed, setShaderSpeed] = useState(1.0);
  const [shaderColorHue, setShaderColorHue] = useState(0.5);
  const [shaderColorSaturation, setShaderColorSaturation] = useState(0.8);
  const [shaderIntensity, setShaderIntensity] = useState(1.0);

  const { data, isLoading, error } = useQuery<PortfolioData>({
    queryKey: ["/api/portfolio"],
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        setKeyboardNavigation(true);
      }
    };

    const handleMouseDown = () => {
      setKeyboardNavigation(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  if (isLoading) {
    return (
      <ShaderBackground variant="animated" className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl glow-effect">Loading...</div>
      </ShaderBackground>
    );
  }

  if (error || !data) {
    return (
      <ShaderBackground variant="blue" className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl glow-effect">Failed to load profile data</div>
      </ShaderBackground>
    );
  }

  const handleSocialClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleNavigationClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleShaderColorChange = (hue: number, saturation: number) => {
    setShaderColorHue(hue);
    setShaderColorSaturation(saturation);
  };

  const getBackgroundVariant = () => {
    if (['orange', 'stringtheory', 'waveform', 'plasma', 'cybergrid', 'voronoi', 'kaleidoscope', 'mandala', 'sdfmorph', 'fractalnoise', 'fluiddynamics', 'quantumfield', 'zippyzaps', 'mandelbrot', 'juliaset', 'burningship', 'turbulence', 'clouds', 'bubblecolors', 'spiralwhirlpool', 'crossgalacticocean'].includes(currentVariant)) return null;
    return currentVariant;
  };

  const getContainerClass = () => {
    if (currentVariant === 'orange') {
      return `min-h-screen vibrant-orange text-white flex flex-col font-sans ${keyboardNavigation ? 'keyboard-navigation' : ''}`;
    }
    if (['stringtheory', 'waveform', 'plasma', 'cybergrid', 'voronoi', 'kaleidoscope', 'mandala', 'sdfmorph', 'fractalnoise', 'fluiddynamics', 'quantumfield', 'zippyzaps', 'mandelbrot', 'juliaset', 'burningship', 'turbulence', 'clouds', 'bubblecolors', 'spiralwhirlpool', 'crossgalacticocean'].includes(currentVariant)) {
      return `min-h-screen text-white flex flex-col font-sans relative overflow-hidden ${keyboardNavigation ? 'keyboard-navigation' : ''}`;
    }
    return `min-h-screen text-white flex flex-col font-sans ${keyboardNavigation ? 'keyboard-navigation' : ''}`;
  };

  const renderShaderBackground = () => {
    const shaderProps = {
      speed: shaderSpeed,
      colorHue: shaderColorHue,
      colorSaturation: shaderColorSaturation,
      intensity: shaderIntensity,
    };

    switch (currentVariant) {
      case 'stringtheory':
        return <StringTheoryShader {...shaderProps} />;
      case 'waveform':
        return <WaveformShader {...shaderProps} />;
      case 'plasma':
        return <PlasmaShader {...shaderProps} />;
      case 'cybergrid':
        return <CyberGridShader {...shaderProps} />;
      case 'voronoi':
        return <VoronoiShader {...shaderProps} />;
      case 'kaleidoscope':
        return <KaleidoscopeShader {...shaderProps} />;
      case 'mandala':
        return <FractalMandalaShader {...shaderProps} />;
      case 'sdfmorph':
        return <SDFMorphShader {...shaderProps} />;
      case 'fractalnoise':
        return <FractalNoiseShader {...shaderProps} />;
      case 'fluiddynamics':
        return <FluidDynamicsShader {...shaderProps} />;
      case 'quantumfield':
        return <QuantumFieldShader {...shaderProps} />;
      case 'zippyzaps':
        return <ZippyZapsShader {...shaderProps} />;
      case 'mandelbrot':
        return <MandelbrotShader {...shaderProps} />;
      case 'juliaset':
        return <JuliaSetShader {...shaderProps} />;
      case 'burningship':
        return <BurningShipShader {...shaderProps} />;
      case 'turbulence':
        return <TurbulenceShader {...shaderProps} />;
      case 'clouds':
        return <CloudsShader {...shaderProps} />;
      case 'bubblecolors':
        return <BubbleColorsShader {...shaderProps} />;
      case 'spiralwhirlpool':
        return <SpiralWhirlpoolShader {...shaderProps} />;
      case 'crossgalacticocean':
        return <CrossGalacticOceanShader {...shaderProps} />;
      default:
        return null;
    }
  };

  const showShaderControls = ['stringtheory', 'waveform', 'plasma', 'cybergrid', 'voronoi', 'kaleidoscope', 'mandala', 'sdfmorph', 'fractalnoise', 'fluiddynamics', 'quantumfield', 'zippyzaps', 'mandelbrot', 'juliaset', 'burningship', 'turbulence', 'clouds', 'bubblecolors', 'spiralwhirlpool', 'crossgalacticocean'].includes(currentVariant);

  const content = (
    <>
      {['stringtheory', 'waveform', 'plasma', 'cybergrid', 'voronoi', 'kaleidoscope', 'mandala', 'sdfmorph', 'fractalnoise', 'fluiddynamics', 'quantumfield', 'zippyzaps', 'mandelbrot', 'juliaset', 'burningship', 'turbulence', 'clouds', 'bubblecolors', 'spiralwhirlpool', 'crossgalacticocean'].includes(currentVariant) && (
        <div className="absolute inset-0 z-0">
          {renderShaderBackground()}
        </div>
      )}
      {/* Shader controls temporarily disabled for better visual themes access
      {showShaderControls && (
        <ShaderControls
          onSpeedChange={setShaderSpeed}
          onColorChange={handleShaderColorChange}
          onIntensityChange={setShaderIntensity}
        />
      )}
      */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="text-center animate-fade-in">
            {/* Profile Image */}
            <div className="mb-8">
              <img
                src={data.profile.profileImage}
                alt={`Profile picture of ${data.profile.name}`}
                className="w-32 h-32 md:w-40 md:h-40 rounded-full mx-auto shadow-2xl hover:scale-105 transition-transform duration-300 border-4 border-white/20 glass-effect"
              />
            </div>

            {/* Name */}
            <h1 className={`text-4xl md:text-5xl font-bold mb-8 tracking-tight ${
              currentVariant === 'orange' ? '' : 'text-gradient-blue'
            } glow-effect`}>
              {data.profile.name}
            </h1>

            {/* Social Media Links */}
            <div className="flex justify-center items-center space-x-6 mb-12 flex-wrap">
              {data.socialLinks
                .sort((a, b) => a.order - b.order)
                .map((link) => {
                  const IconComponent = iconMap[link.icon as keyof typeof iconMap] || FaGlobe;
                  return (
                    <button
                      key={link.id}
                      onClick={() => handleSocialClick(link.url)}
                      className={`text-white transition-all duration-300 transform hover:scale-110 p-3 rounded-full glow-effect hover:shadow-lg ${
                        currentVariant === 'orange' 
                          ? 'hover:text-orange-hover hover:shadow-orange-500/20' 
                          : 'hover:text-cyan-300 glass-effect hover:shadow-cyan-500/20'
                      }`}
                      aria-label={`${link.platform} Profile`}
                    >
                      <IconComponent className="text-2xl md:text-3xl" />
                    </button>
                  );
                })}
            </div>

            {/* Project Showcase */}
            <div className="mb-16">
              <ProjectShowcase />
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <footer className={currentVariant === 'orange' ? 'bg-black/10 backdrop-blur-sm' : 'glass-effect'}>
          <div className="container mx-auto px-4 py-6">
            <nav className="flex justify-center items-center space-x-4 md:space-x-8 flex-wrap" role="navigation" aria-label="Footer navigation">
              {data.navigationSections
                .sort((a, b) => a.order - b.order)
                .map((section, index) => (
                  <div key={section.id} className="flex items-center">
                    <button
                      onClick={() => handleNavigationClick(section.url)}
                      className={`text-white/90 text-sm md:text-base font-medium transition-all duration-200 hover:underline underline-offset-4 px-2 py-1 rounded hover:bg-white/10 ${
                        currentVariant === 'orange' ? 'hover:text-white' : 'hover:text-cyan-300'
                      }`}
                    >
                      {section.name}
                    </button>
                    {index < data.navigationSections.length - 1 && (
                      <span className="text-white/50 ml-4 md:ml-8 hidden md:inline">•</span>
                    )}
                  </div>
                ))}
            </nav>
          </div>
        </footer>
        
        {/* Color Palette - Fixed Position */}
        <ColorPalette 
          currentVariant={currentVariant} 
          onColorChange={setCurrentVariant} 
        />
      </div>
    </>
  );

  if (['orange', 'stringtheory', 'waveform', 'plasma', 'cybergrid', 'voronoi', 'kaleidoscope', 'mandala', 'sdfmorph', 'fractalnoise', 'fluiddynamics', 'quantumfield', 'zippyzaps', 'mandelbrot', 'juliaset', 'burningship', 'turbulence', 'clouds', 'bubblecolors', 'spiralwhirlpool', 'crossgalacticocean'].includes(currentVariant)) {
    return <div className={getContainerClass()}>{content}</div>;
  }

  return (
    <ShaderBackground 
      variant={getBackgroundVariant() as 'blue' | 'animated' | 'radial'} 
      className={getContainerClass()}
    >
      {content}
    </ShaderBackground>
  );
}

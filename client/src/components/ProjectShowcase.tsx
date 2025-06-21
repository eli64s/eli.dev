import React from 'react';

interface ProjectShowcaseProps {
  className?: string;
}

export default function ProjectShowcase({ className = "" }: ProjectShowcaseProps) {
  const projects = [
    {
      name: "README-AI",
      description: "AI-powered README generator",
      url: "https://github.com/eli64s/readme-ai",
      icon: (
        <svg width="48" height="48" viewBox="0 0 256 256" className="drop-shadow-lg">
          <defs>
            <linearGradient id="readme-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{stopColor: "#4169E1"}} />
              <stop offset="50%" style={{stopColor: "#7B3DE3"}} />
              <stop offset="100%" style={{stopColor: "#8A2BE2"}} />
            </linearGradient>
            <radialGradient id="readme-bg" cx="50%" cy="30%" r="70%">
              <stop offset="0%" style={{stopColor: "#1f1f23"}} />
              <stop offset="100%" style={{stopColor: "#0f0f11"}} />
            </radialGradient>
          </defs>
          <rect width="256" height="256" rx="58" fill="url(#readme-bg)"/>
          <g transform="translate(128, 128)">
            <rect x="-60" y="-60" width="120" height="120" rx="20" fill="url(#readme-gradient)"/>
            <path d="M -30 -40 L -30 40 L -8 40 L 0 24 L 8 40 L 30 40 L 30 -40 Z" fill="#FFFFFF" opacity="0.95"/>
          </g>
        </svg>
      )
    },
    {
      name: "Markitect",
      description: "Marketing architecture tool",
      url: "https://github.com/eli64s/markitecture",
      icon: (
        <svg width="48" height="48" viewBox="0 0 256 256" className="drop-shadow-lg">
          <defs>
            <linearGradient id="markitect-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="20%" style={{stopColor: "#FFD700"}} />
              <stop offset="40%" style={{stopColor: "#00E5FF"}} />
              <stop offset="60%" style={{stopColor: "#7934C5"}} />
              <stop offset="80%" style={{stopColor: "#FF00FF"}} />
            </linearGradient>
            <linearGradient id="markitect-bg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{stopColor: "#0A0218"}} />
              <stop offset="50%" style={{stopColor: "#1A0C2E"}} />
              <stop offset="100%" style={{stopColor: "#0A0218"}} />
            </linearGradient>
          </defs>
          <rect width="256" height="256" rx="58" fill="url(#markitect-bg)"/>
          <g transform="translate(128, 128) scale(3.2)">
            <path d="M-18,-11 L-11,-11 L-11,6 L-6,-7 L0,6 L6,-7 L11,6 L11,-11 L18,-11 L18,11 L11,11 L0,-6 L-11,11 L-18,11 Z" 
                  fill="none" stroke="url(#markitect-gradient)" strokeWidth="1.2" strokeLinejoin="round"/>
          </g>
        </svg>
      )
    },
    {
      name: "OpenAI Cookbook",
      description: "Code search using embeddings",
      url: "https://cookbook.openai.com/examples/code_search_using_embeddings",
      icon: (
        <svg width="48" height="48" viewBox="0 0 256 256" className="drop-shadow-lg">
          <defs>
            <radialGradient id="openai-bg" cx="50%" cy="50%" r="75%">
              <stop offset="0%" style={{stopColor: "#1A1A1A"}} />
              <stop offset="100%" style={{stopColor: "#0A0A0A"}} />
            </radialGradient>
            <linearGradient id="openai-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{stopColor: "#ff0080"}} />
              <stop offset="100%" style={{stopColor: "#0080ff"}} />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="256" height="256" rx="48" ry="48" fill="url(#openai-bg)"/>
          <g transform="translate(128,128)">
            <g transform="translate(-24,-24) scale(0.16)">
              <path fill="url(#openai-gradient)"
                    d="M294.93 130.971a79.712 79.712 0 00-6.85-65.48c-17.46-30.4-52.56-46.04-86.84-38.68A79.747 79.747 0 00141.11.001c-35.04-.08-66.13 22.48-76.91 55.82a79.754 79.754 0 00-53.31 38.67c-17.59 30.32-13.58 68.54 9.92 94.54a79.712 79.712 0 006.85 65.48c17.46 30.4 52.56 46.04 86.84 38.68a79.687 79.687 0 0060.13 26.8c35.06.09 66.16-22.49 76.94-55.86a79.754 79.754 0 0053.31-38.67c17.57-30.32 13.55-68.51-9.94-94.51zm-120.28 168.11a59.77 59.77 0 01-38.39-13.88c.49-.26 1.34-.73 1.89-1.07l63.72-36.8a10.36 10.36 0 005.24-9.07v-89.83l26.93 15.55c.29.14.48.42.52.74v74.39c-.04 33.08-26.83 59.9-59.91 59.97zm-128.84-55.03a59.71 59.71 0 01-7.15-40.18c.47.28 1.3.79 1.89 1.13l63.72 36.8c3.23 1.89 7.23 1.89 10.47 0l77.79-44.92v31.1c.02.32-.13.63-.38.83l-64.41 37.19c-28.69 16.52-65.33 6.7-81.92-21.95zm-16.77-139.09c7-12.16 18.05-21.46 31.21-26.29 0 .55-.03 1.52-.03 2.2v73.61c-.02 3.74 1.98 7.21 5.23 9.06l77.79 44.91-26.93 15.55c-.27.18-.61.21-.91.08l-64.42-37.22c-28.63-16.58-38.45-53.21-21.95-81.89zm221.26 51.49l-77.79-44.92 26.93-15.54c.27-.18.61-.21.91-.08l64.42 37.19c28.68 16.57 38.51 53.26 21.94 81.94a59.94 59.94 0 01-31.2 26.28v-75.81c.03-3.74-1.96-7.2-5.2-9.06zm26.8-40.34c-.47-.29-1.3-.79-1.89-1.13l-63.72-36.8a10.375 10.375 0 00-10.47 0l-77.79 44.92v-31.1c-.02-.32.13-.63.38-.83l64.41-37.16c28.69-16.55 65.37-6.7 81.91 22a59.95 59.95 0 017.15 40.1zm-168.51 55.43l-26.94-15.55a.943.943 0 01-.52-.74v-74.39c.02-33.12 26.89-59.96 60.01-59.94 14.01 0 27.57 4.92 38.34 13.88-.49.26-1.33.73-1.89 1.07l-63.72 36.8a10.344 10.344 0 00-5.24 9.06l-.04 89.79zm14.63-31.54l34.65-20.01 34.65 20v40.01l-34.65 20-34.65-20z"/>
            </g>
          </g>
        </svg>
      )
    }
  ];

  return (
    <div className={`flex flex-col items-center space-y-6 ${className}`}>
      <h3 className="text-xl font-semibold text-white/90 mb-2">Open Source Projects</h3>
      <div className="flex items-center justify-center space-x-8">
        {projects.map((project, index) => (
          <a
            key={project.name}
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-center space-y-3 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105 cursor-pointer"
          >
            <div className="relative transform group-hover:rotate-3 transition-transform duration-300">
              {project.icon}
              <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div className="text-center">
              <h4 className="text-sm font-medium text-white/90 group-hover:text-white transition-colors duration-300">
                {project.name}
              </h4>
              <p className="text-xs text-white/60 group-hover:text-white/80 transition-colors duration-300 mt-1">
                {project.description}
              </p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
## Portfolio Site

Experimenting with various shaders and visual themes for my portfolio site. Cheers (⌐■_■)ノ☕︎

---

<!-- #
Portfolio Application

## Overview

This is a full-stack portfolio application built with React, Express, and PostgreSQL. The application displays personal profile information, social media links, and navigation sections in a clean, responsive design. It uses a modern tech stack with TypeScript throughout and implements a RESTful API architecture.

## System Architecture

The application follows a monorepo structure with clear separation between client and server code:

- **Frontend**: React with TypeScript, using Vite as the build tool
- **Backend**: Express.js server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack Query for server state management

## Key Components

### Frontend Architecture
- **React 18** with TypeScript for type safety
- **Vite** for fast development and optimized builds
- **Wouter** for lightweight client-side routing
- **TanStack Query** for efficient data fetching and caching
- **shadcn/ui** component library built on Radix UI primitives
- **Tailwind CSS** for responsive styling with custom design tokens

### Backend Architecture
- **Express.js** server with TypeScript
- **RESTful API** design with a single endpoint for portfolio data
- **Drizzle ORM** for type-safe database operations
- **Neon Database** (@neondatabase/serverless) for PostgreSQL hosting
- **Memory storage fallback** for development/testing

### Database Schema
The application uses four main tables:
- `users`: Authentication (username, password)
- `profiles`: Profile information (name, profile image, active status)
- `social_links`: Social media links with platform icons and ordering
- `navigation_sections`: Navigation menu items with URLs and ordering

### UI Components
- Modern card-based layout with responsive design
- Accessible components using Radix UI primitives
- Icon support for social platforms (GitHub, LinkedIn, Twitter, etc.)
- Keyboard navigation support
- Loading states and error handling

## Data Flow

1. **Client Request**: React component triggers API call via TanStack Query
2. **API Handler**: Express route `/api/portfolio` fetches data from storage layer
3. **Data Aggregation**: Server combines profile, social links, and navigation data
4. **Response**: JSON response sent back to client
5. **Client Update**: React component renders updated data with optimistic updates

## External Dependencies

### Core Framework Dependencies
- React ecosystem (react, react-dom, react-query)
- Express.js for server framework
- TypeScript for type safety across the stack

### Database & ORM
- Drizzle ORM for database operations
- @neondatabase/serverless for PostgreSQL connection
- Drizzle-zod for schema validation

### UI & Styling
- Tailwind CSS for styling
- Radix UI primitives for accessible components
- React Icons for social media icons
- Lucide React for additional icons

### Development Tools
- Vite for build tooling and development server
- ESBuild for server-side bundling
- TSX for TypeScript execution in development

## Deployment Strategy

The application is configured for deployment with the following setup:

- **Development**: `npm run dev` starts both client and server with hot reload
- **Build**: `npm run build` creates optimized production builds
- **Production**: `npm run start` serves the built application
- **Database**: Uses Neon Database for PostgreSQL hosting
- **Port Configuration**: Server runs on port 5000, mapped to external port 80

### Build Process
1. Vite builds the React client to `dist/public`
2. ESBuild bundles the Express server to `dist/index.js`
3. Static files are served from the public directory
4. API routes are handled by the Express server

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `NODE_ENV`: Environment mode (development/production)

## Changelog

- June 20, 2025: Removed RetrowaveShader from codebase per user request - cleaned up all references and dependencies
- June 20, 2025: Portfolio now features 21 total visual themes spanning fractal mathematics, physics simulations, fluid dynamics, and atmospheric effects
- June 20, 2025: Added Volumetric Clouds shader inspired by Inigo Quilez's raymarching techniques featuring fractal noise, atmospheric perspective, and dynamic camera movement
- June 20, 2025: Added Turbulence shader based on advanced fluid dynamics simulation using layered sine waves and rotational matrices for realistic turbulent motion patterns without fire effects
- June 20, 2025: Developed three advanced fractal pattern shaders with complex mathematical formulations:
  - **Mandelbrot Set**: Dynamic Mandelbrot with morphing parameters, multi-layered Julia blending, edge detection, and smooth coloring algorithms
  - **Julia Set**: Multi-variation Julia sets with Newton fractals, orbital traps, dynamic power functions, and complex conjugate transformations  
  - **Burning Ship**: Burning ship fractal with tricorn, multicorn, and feather variations using absolute value transformations and weighted mixing
- June 20, 2025: Added shuffle button for random theme exploration across the complete shader collection
- June 20, 2025: Integrated Zippy Zaps shader from Shadertoy - a stunning electric lightning effect with 399 character golf optimization
- June 20, 2025: Implemented four cutting-edge mathematical shader themes:
  - **SDF Morph**: Complex morphing shapes using Signed Distance Fields with smooth minimum operations
  - **Fractal Noise**: Multi-scale domain warping with turbulence, ridged noise, and atmospheric effects
  - **Fluid Dynamics**: Real-time fluid simulation with vortex fields, pressure visualization, and particle advection
  - **Quantum Field**: Quantum mechanics visualization featuring wave functions, entanglement, and uncertainty principles
- June 20, 2025: Created three innovative geometric shader themes:
  - **Crystal Cells (Voronoi)**: Animated crystalline cell patterns with pulsing glow effects
  - **Kaleidoscope**: Symmetrical mandala patterns with rotating geometric elements
  - **Sacred Mandala**: Fractal mandala with flower of life geometry and golden highlights
- June 20, 2025: Moved visual theme selector to bottom center for better accessibility
- June 20, 2025: Added three new WebGL shader themes:
  - **Synthwave (Waveform)**: Retro-style audio waveform visualization with neon colors
  - **Plasma Field**: Dynamic plasma effect with multi-layered ripples and glow
  - **Cyber Grid**: Futuristic grid patterns with tunnel effects and data streams
- June 20, 2025: Enhanced color palette with 8 total visual themes
- June 20, 2025: Updated shader controls to work with all advanced shader variants
- June 20, 2025: Initial setup with portfolio application and String Theory shader

## User Preferences

Preferred communication style: Simple, everyday language.
-->
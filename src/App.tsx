import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Code2, Palette, Cpu, Globe, Sparkles, Zap,
  Github, Linkedin, Mail, ArrowDown, Layers,
  Brain, Rocket, Terminal, Database, Cloud,
  GitBranch, Box, Command, Briefcase, GraduationCap, Award,
  Triangle, Circle, Square, Hexagon, ArrowRight, MapPin, Calendar, Send, ArrowUp, PenTool, Menu, X
} from "lucide-react";

// Type definitions
interface MousePosition {
  x: number;
  y: number;
}

interface Project {
  id: number;
  title: string;
  subtitle: string;
  description: string; // Changed to string for dangerouslySetInnerHTML
  icon: React.ReactNode;
  tech: string[];
  themeColor: string;
  link: string; // Typically the primary link (e.g., GitHub)
  githubRepo?: string; // Optional, for fetching stars
  blogPostLink?: string; // Optional, for the blog post link
}

interface ProfileCardProps {
  avatarUrl?: string;
  name?: string;
  title?: string;
  handle?: string;
  contactText?: string;
  onContactClick?: () => void;
  className?: string;
  socialLinks?: { icon: React.ReactNode; url: string; label: string }[];
}

interface ProjectPanelProps {
  project: Project;
  isExpanded: boolean;
  onMouseEnter?: () => void;
}

// Profile Card Component
const ProfileCard: React.FC<ProfileCardProps> = ({
  avatarUrl = "/imgs/banff.jpg",
  name = "Eli Salamie",
  title = "AI Engineer, Researcher, & Creator",
  handle = "eli64s",
  contactText = "Send Email",
  onContactClick,
  className = "profile-card",
  socialLinks,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      ref={cardRef}
      className={`modern-profile-card ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="profile-glow"></div>
      <div className="profile-header">
        <div className="profile-avatar-container">
          <img
            className="profile-avatar"
            src={avatarUrl}
            alt={`${name} portrait`}
          />
          <div className="profile-status-indicator"></div>
        </div>
      </div>

      <div className="profile-info">
        <h1 className="profile-name">{name}</h1>
        <p className="profile-title">{title}</p>
        
        <div className="profile-location">
          <MapPin size={14} />
          <span>Dallas, TX</span>
        </div>
        
        {socialLinks && socialLinks.length > 0 && (
          <div className="profile-social-links">
            {socialLinks.map((link, index) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.label}
                className="profile-social-link"
              >
                {link.icon}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Lanyard Section
const LanyardSection: React.FC = () => {
  const [activeCard, setActiveCard] = useState('work');

  const cards = [
    { id: 'work', icon: <Square size={20} />, label: 'Experience', color: '#E74C3C' },
    { id: 'education', icon: <Triangle size={20} />, label: 'Education', color: '#3498DB' },
    { id: 'skills', icon: <Circle size={20} />, label: 'Technical Skills', color: '#F1C40F' }
  ];

  return (
    <div className="lanyard-section">
      <div className="lanyard-nav">
        {cards.map(card => (
          <button
            key={card.id}
            className={`lanyard-nav-btn ${activeCard === card.id ? 'active' : ''}`}
            onClick={() => setActiveCard(card.id)}
            style={{ '--accent-color': card.color } as React.CSSProperties}
          >
            {card.icon}
            <span>{card.label}</span>
          </button>
        ))}
      </div>

      <div className="lanyard-display">
        <div className="lanyard-card">
          <div className="lanyard-geometric-accent">
            <svg viewBox="0 0 100 100" width="100" height="100">
              {activeCard === 'work' && (
                <rect x="10" y="10" width="80" height="80" fill="#E74C3C" opacity="0.2" />
              )}
              {activeCard === 'education' && (
                <polygon points="50,10 90,90 10,90" fill="#3498DB" opacity="0.2" />
              )}
              {activeCard === 'skills' && (
                <circle cx="50" cy="50" r="40" fill="#F1C40F" opacity="0.2" />
              )}
            </svg>
          </div>

          {activeCard === 'work' && (
            <div className="lanyard-content">
              <h3 className="lanyard-title">Career Timeline</h3>
              <div className="lanyard-items">
                <div className="lanyard-item">
                  <h4>Senior Software Engineer, <em>AI-Powered Developer Experience</em></h4>
                  <p className="lanyard-meta">Capital One • August 2022 - Present</p>
                  <span className="lanyard-desc">
                    Led the development of internal AI/ML systems, including a RAG backend API serving 15,000+ users and a Python SDK for 500+ developers.
                    Designed an adaptive document chunking framework that improved LLM recall by 23.5%.
                    Additionally, specialized in automating data workflows, delivering an NLP voice analytics model that saved 320+ hours monthly for QA agents.
                  </span>
                </div>
                <div className="lanyard-item">
                  <h4>Software Engineer, <em>Employee Technology & Enablement</em></h4>
                  <p className="lanyard-meta">GM Financial • May 2020 - August 2022</p>
                  <span className="lanyard-desc">
                    Led the development of 24 low-code applications generating $330K annual savings,
                    streamlining workflows for 25+ business teams. Co-led global an up-skilling
                    initiative that trained over 200 non-technical employees in low-code development.
                  </span>
                </div>
                <div className="lanyard-item">
                  <h4>Senior Data Analyst, <em>Revenue Strategy</em></h4>
                  <p className="lanyard-meta">United Airlines • January 2018 - April 2020</p>
                  <span className="lanyard-desc">
                    Discovered a $2.3M+ revenue opportunity by detecting a demand anomaly
                    (<a href="https://en.wikipedia.org/wiki/ELCA_Youth_Gathering" target="_blank" rel="noopener noreferrer">the 2018 ELCA Youth Conference</a>)
                    that included 30,000+ attendees traveling to Houston that United's seasonality engine missed. This led to fare increases over 50% for 200+ flights.
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeCard === 'education' && (
            <div className="lanyard-content">
              <h3 className="lanyard-title">Academic Background</h3>
              <div className="lanyard-items">
                <div className="lanyard-item">
                  <h4>Master of Science, Computer & Information Science</h4>
                  <p className="lanyard-meta">University of Pennsylvania • December 2022</p>
                  <span className="lanyard-desc">Focus on Artificial Intelligence</span>
                </div>
                <div className="lanyard-item">
                  <h4>Bachelor of Science, Industrial Engineering</h4>
                  <p className="lanyard-meta">Purdue University • December 2017</p>
                </div>
              </div>
            </div>
          )}

          {activeCard === 'skills' && (
            <div className="lanyard-content">
              <h3 className="lanyard-title">Technical Proficiencies</h3>
              <div className="lanyard-items">
                <div className="lanyard-item">
                  <h4>Programming Languages</h4>
                  <span className="lanyard-desc">Python, Bash, C, TypeScript, SQL</span>
                </div>
                <div className="lanyard-item">
                  <h4>AI & ML</h4>
                  <span className="lanyard-desc">Anthropic, Google Gemini, Hugging Face, Ollama, OpenAI API</span>
                </div>
                <div className="lanyard-item">
                  <h4>Backend Development</h4>
                  <span className="lanyard-desc">AWS Lambda, FastAPI, Open Telemetry, Pydantic, Pytest, RESTful APIs</span>
                </div>
                <div className="lanyard-item">
                  <h4>Cloud & DevOps</h4>
                  <span className="lanyard-desc">Argo CD, AWS, Docker, Git, GitHub Actions, Jenkins, Kubernetes, Linux</span>
                </div>
                <div className="lanyard-item">
                  <h4>Databases</h4>
                  <span className="lanyard-desc">MongoDB, OpenSearch, PostgreSQL</span>
                </div>
                <div className="lanyard-item">
                  <h4>Markup</h4>
                  <span className="lanyard-desc">HTML, Markdown, SVG, TOML, YAML</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Project Panel Component
const ProjectPanel: React.FC<ProjectPanelProps> = ({ project, isExpanded, onMouseEnter }) => {
  const [stars, setStars] = useState<number | null>(null);

  // Effect to fetch GitHub stars if githubRepo is provided AND it's not InnerAura Labs
  useEffect(() => {
    if (project.githubRepo && project.title !== "InnerAura Labs") { // Added condition to hide stars for InnerAura
      const fetchStars = async () => {
        try {
          const response = await fetch(`https://api.github.com/repos/${project.githubRepo}`, {
            headers: {
              'Accept': 'application/vnd.github.v3+json',
            }
          });
          if (!response.ok) {
            throw new Error(`GitHub API error: ${response.statusText}`);
          }
          const data = await response.json();
          if (data.stargazers_count !== undefined) {
            setStars(data.stargazers_count);
          }
        } catch (error) {
          console.error(`Error fetching GitHub stars for ${project.githubRepo}:`, error);
        }
      };
      fetchStars();
    } else {
      setStars(null); // Explicitly set stars to null if it's InnerAura or no githubRepo
    }
  }, [project.githubRepo, project.title]); // Depend on title as well for the condition

  return (
    <div
      className={`project-panel ${isExpanded ? 'panel-expanded' : 'panel-collapsed'}`}
      style={{ '--theme-color': project.themeColor } as React.CSSProperties}
      onMouseEnter={onMouseEnter}
    >
      {!isExpanded && (
        <div className="panel-geometric-badge">
          {project.icon}
        </div>
      )}
      {!isExpanded && <div className="panel-title-vertical">{project.title}</div>}

      <div className="panel-content">
        <div className="panel-header">
          {isExpanded && (
            <div className="panel-geometric-badge">
              {project.icon}
            </div>
          )}
          <div>
            <h3 className="panel-title">{project.title}</h3>
            <p className="panel-subtitle">{project.subtitle}</p>
            {/* Stars are only displayed if githubRepo exists, stars are fetched, AND it's not InnerAura Labs */}
            {project.githubRepo && stars !== null && project.title !== "InnerAura Labs" && (
              <p className="github-stars">
                <Github size={14} style={{ marginRight: '5px' }} />
                {stars.toLocaleString()} Stars
              </p>
            )}
          </div>
        </div>
        {/* Using dangerouslySetInnerHTML for HTML in description */}
        <p className="panel-description" dangerouslySetInnerHTML={{ __html: project.description }} />
        <div className="tech-stack">
          {project.tech.map((tech, i) => (
            <span key={i} className="tech-chip">{tech}</span>
          ))}
        </div>
        <div className="project-actions"> {/* Container for buttons */}
          <a href={project.link} target="_blank" rel="noopener noreferrer" className="panel-link btn-github">
            {project.link.includes('github.com') ? 'View on GitHub' : 'Visit Site'}
            <ArrowRight size={14} />
          </a>
          {/* Conditionally render the blog post link */}
          {project.blogPostLink && (
            <a
              href={project.blogPostLink}
              target="_blank"
              rel="noopener noreferrer"
              className="panel-link btn-blog"
            >
              Read Blog Post
              <ArrowRight size={14} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

// Main Portfolio Component
const ByrnePortfolio: React.FC = () => {
  const [scrollY, setScrollY] = useState(0);
  const [expandedProject, setExpandedProject] = useState(0);
  const [activeSection, setActiveSection] = useState('hero');
  const [isMobile, setIsMobile] = useState(false);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);

      const sections = ['hero', 'about', 'projects'];
      const scrollPosition = window.scrollY + window.innerHeight / 2;

      sections.forEach(section => {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();

    // Intersection Observer for scroll animations
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setVisibleSections(prev => new Set(prev).add(entry.target.id));
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    
    // Observe all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => observer.observe(section));

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    setExpandedProject(0);
  }, [isMobile]);

  const projects: Project[] = [
    {
      id: 8,
      title: "InnerAura Labs",
      subtitle: "Innovation & Research",
      description: "Building systems for true human-AI collaboration", // No HTML in description here
      icon: <img src="/icons/inneraura.svg" alt="InnerAura Labs logo" />,
      tech: ["AI Research", "Agentic Systems", "Creative Coding", "Generative Tools", "Human-Computer Interaction"],
      themeColor: "#9B59B6",
      link: "https://github.com/InnerAura",
      githubRepo: "InnerAura/.github" // Still include repo for consistency, but stars won't show
    },
    {
      id: 5,
      title: "ReadmeAI",
      subtitle: "AI-Powered README Generator",
      description: "A powerful AI-powered tool that automatically generates detailed and customizable README files for your projects.",
      icon: <img src="/icons/readme-ai.svg" alt="ReadmeAI logo" />,
      tech: ["AI-Powered", "Developer Tools", "Documentation"],
      themeColor: "#4169E1",
      link: "https://github.com/eli64s/readme-ai",
      githubRepo: "eli64s/readme-ai"
    },
    {
      id: 6,
      title: "Markitect",
      subtitle: "Modern Markdown Tooling",
      description: "Markdown tools for modular workflows and content management.",
      icon: <img src="/icons/markitect.svg" alt="Markitect logo" />,
      tech: ["Markdown", "Developer Tools", "Link Management"],
      themeColor: "#FFD700",
      link: "https://github.com/eli64s/markitecture",
      githubRepo: "eli64s/markitecture"
    },
    {
      id: 7,
      title: "OpenAI Cookbook",
      subtitle: "Code Search using Embeddings",
      description: 'Contributor to the OpenAI Cookbook. Optimized Python code extraction methods that improved embedding model accuracy and search relevance.',
      icon: <img src="/icons/openai.svg" alt="OpenAI logo" />,
      tech: ["OpenAI", "Embeddings", "Context Engineering"],
      themeColor: "#ff0080",
      link: "https://github.com/openai/openai-cookbook/pull/467",
      githubRepo: "openai/openai-cookbook",
      blogPostLink: "https://cookbook.openai.com/examples/code_search_using_embeddings"
    },
  ];

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false); // Close mobile menu after navigation
  };

  const handleEmailClick = () => {
    window.location.href = 'mailto:egsalamie@gmail.com';
  };

  return (
    <div className="portfolio-container">
      <style>{`
        /* Import fonts */
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700&display=swap');

        :root {
          /* Modern Color Palette */
          --bg-cream: #FAFAF8;
          --bg-white: #FFFFFF;
          --bg-off-white: #FCFCFA;
          --bg-gray-50: #F8F9FA;
          --bg-gray-100: #F1F3F4;
          --text-dark: #1A1A1A;
          --text-muted: #6B7280;
          --text-light: #9CA3AF;
          --accent-red: #DC2626;
          --accent-blue: #2563EB;
          --accent-purple: #7C3AED;
          --blue-light: #EBF3FD;
          --yellow-primary: #F59E0B;
          --green-primary: #10B981;
          --black-accent: #111827;
          --border-light: #E5E7EB;
          --border-gray: #D1D5DB;
          --shadow-soft: rgba(0, 0, 0, 0.05);
          --shadow-medium: rgba(0, 0, 0, 0.08);
          --shadow-strong: rgba(0, 0, 0, 0.12);
          --shadow-glow: rgba(37, 99, 235, 0.1);
          
          /* Typography */
          --font-serif: 'Crimson Text', serif;
          --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          
          /* Transitions */
          --transition-base: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          --transition-slow: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        html, body {
          width: 100%;
          overflow-x: hidden;
        }

        body {
          font-family: var(--font-sans);
          background-color: var(--bg-cream);
          color: var(--text-dark);
          line-height: 1.7;
          font-size: 16px;
          font-weight: 400;
          letter-spacing: -0.011em;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        .portfolio-container {
          width: 100%;
          min-height: 100vh;
          overflow-x: hidden;
          position: relative;
        }

        /* Background Pattern */
        .portfolio-bg {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: -2;
          background: var(--bg-cream);
          background-image: 
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 100px,
              var(--border-light) 100px,
              var(--border-light) 101px
            ),
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 100px,
              var(--border-light) 100px,
              var(--border-light) 101px
            );
          opacity: 0.3;
        }

        /* Navigation */
        .nav-bar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          width: 100%;
          padding: 1.5rem 2rem;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
          transition: var(--transition-base);
        }

        .nav-scrolled {
          padding: 1rem 2rem;
          background: rgba(255, 255, 255, 0.95);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }

        .nav-content {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .nav-logo {
          font-family: var(--font-sans);
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-dark);
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .nav-links {
          display: flex;
          gap: 2.5rem;
          list-style: none;
        }

        .nav-link {
          font-family: var(--font-sans);
          color: var(--text-muted);
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 500;
          transition: var(--transition-base);
          position: relative;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -8px;
          left: 0;
          right: 0;
          height: 2px;
          background: var(--accent-red);
          transform: scaleX(0);
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          transform-origin: center;
        }

        .nav-link:hover {
          color: var(--text-dark);
        }

        .nav-link:hover::after {
          transform: scaleX(0.8);
        }

        .nav-link.active {
          color: var(--accent-red);
        }

        .nav-link.active::after {
          transform: scaleX(1);
        }
        
        /* Hero Section */
        .hero-section {
          width: 100%;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          padding: 2rem;
          background: 
            radial-gradient(ellipse at top left, rgba(37, 99, 235, 0.03) 0%, transparent 50%),
            radial-gradient(ellipse at bottom right, rgba(124, 58, 237, 0.03) 0%, transparent 50%),
            linear-gradient(135deg, var(--bg-off-white) 0%, var(--bg-white) 100%);
          overflow: hidden;
        }

        /* Particle Animation */
        .hero-particles {
          position: absolute;
          inset: 0;
          overflow: hidden;
        }

        .particle {
          position: absolute;
          width: 3px;
          height: 3px;
          background: var(--accent-blue);
          border-radius: 50%;
          opacity: 0.2;
          animation: float linear infinite;
          filter: blur(0.5px);
        }

        @keyframes float {
          from {
            transform: translateY(100vh) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.3;
          }
          90% {
            opacity: 0.3;
          }
          to {
            transform: translateY(-100vh) rotate(360deg);
            opacity: 0;
          }
        }

        .hero-content {
          width: 100%;
          max-width: 450px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
          position: relative;
        }

        .hero-profile-wrapper {
          animation: fadeInScale 1s ease-out;
        }

        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        /* Navigation Hint */
        .hero-nav-hint {
          position: absolute;
          bottom: 3rem;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10;
        }

        .nav-hint-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 0.5rem 1rem;
          transition: all 0.3s ease;
          font-family: var(--font-sans);
        }

        .nav-hint-text {
          font-size: 0.875rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          opacity: 0.6;
          transition: opacity 0.3s ease;
        }

        .nav-hint-arrow {
          animation: bounce 2s infinite;
          opacity: 0.4;
          transition: opacity 0.3s ease;
        }

        .nav-hint-btn:hover .nav-hint-text,
        .nav-hint-btn:hover .nav-hint-arrow {
          opacity: 1;
        }

        .nav-hint-btn:hover .nav-hint-arrow {
          transform: translateY(3px);
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(5px); }
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-family: var(--font-sans);
          font-size: 0.75rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 2rem;
          padding: 0.5rem 1rem;
          background: var(--bg-gray-50);
          border-radius: 2rem;
          border: 1px solid var(--border-gray);
        }

        /* Enhanced Profile Card Styling */
        .hero-profile-wrapper .modern-profile-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          box-shadow: 
            0 10px 40px rgba(0, 0, 0, 0.08),
            0 0 0 1px rgba(255, 255, 255, 0.7) inset;
          transform: translateY(0);
          transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
        }

        .hero-profile-wrapper .modern-profile-card:hover {
          transform: translateY(-5px);
          box-shadow: 
            0 20px 60px rgba(0, 0, 0, 0.12),
            0 0 0 1px rgba(255, 255, 255, 0.7) inset;
        }

        .hero-profile-wrapper .profile-avatar {
          transition: transform 0.4s ease;
        }

        .hero-profile-wrapper .modern-profile-card:hover .profile-avatar {
          transform: scale(1.05);
        }

        .hero-cta-group {
          display: flex;
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        .hero-cta {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 2rem;
          font-family: var(--font-sans);
          font-size: 0.875rem;
          font-weight: 500;
          background: var(--red-primary);
          border: 2px solid var(--red-primary);
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-radius: 0.5rem;
        }

        .hero-cta:hover {
          background: transparent;
          color: var(--red-primary);
          transform: translateY(-2px);
        }

        .hero-cta-secondary {
          background: transparent;
          border: 2px solid var(--text-dark);
          color: var(--text-dark);
        }

        .hero-cta-secondary:hover {
          background: var(--text-dark);
          color: white;
        }

        /* Remove old hero styles */
        .hero-badge,
        .hero-cta-group,
        .hero-cta,
        .hero-cta-secondary {
          display: none;
        }

        /* Modern Profile Card */
        .modern-profile-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 1.5rem;
          padding: 3rem;
          box-shadow: 
            0 4px 6px -1px rgba(0, 0, 0, 0.1),
            0 2px 4px -1px rgba(0, 0, 0, 0.06),
            0 20px 25px -5px rgba(0, 0, 0, 0.1),
            0 10px 10px -5px rgba(0, 0, 0, 0.04),
            0 0 0 1px rgba(0, 0, 0, 0.02);
          transition: var(--transition-slow);
          position: relative;
          overflow: hidden;
          transform: translateY(0);
        }

        .profile-glow {
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(
            circle at center,
            rgba(59, 130, 246, 0.1) 0%,
            transparent 70%
          );
          opacity: 0;
          transition: opacity 0.4s ease;
          pointer-events: none;
        }

        .modern-profile-card:hover .profile-glow {
          opacity: 1;
        }

        .modern-profile-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 
            0 10px 15px -3px rgba(0, 0, 0, 0.1),
            0 4px 6px -2px rgba(0, 0, 0, 0.05),
            0 30px 40px -10px rgba(0, 0, 0, 0.15),
            0 0 0 1px rgba(0, 0, 0, 0.02),
            0 0 40px rgba(37, 99, 235, 0.08);
        }

        .profile-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 2.5rem;
        }

        .profile-avatar-container {
          position: relative;
          margin-bottom: 1rem;
        }

        .profile-avatar {
          width: 140px;
          height: 140px;
          border-radius: 50%;
          object-fit: cover;
          border: 5px solid rgba(255, 255, 255, 0.9);
          box-shadow: 
            0 10px 30px rgba(0, 0, 0, 0.15),
            0 0 0 1px rgba(0, 0, 0, 0.05);
          transition: transform 0.4s cubic-bezier(0.23, 1, 0.32, 1);
        }

        @media (max-width: 768px) {
          .profile-avatar {
            width: 120px;
            height: 120px;
          }
        }

        .profile-status-indicator {
          position: absolute;
          bottom: 8px;
          right: 8px;
          width: 20px;
          height: 20px;
          background: var(--green-primary);
          border-radius: 50%;
          border: 3px solid var(--bg-white);
          box-shadow: 0 2px 8px var(--shadow-soft);
        }

        .profile-location {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-family: var(--font-sans);
          font-size: 0.875rem;
          color: var(--text-light);
          margin-top: 1rem;
          margin-bottom: 1.5rem;
        }

        .profile-info {
          text-align: center;
        }

        .profile-name {
          font-family: var(--font-serif);
          font-size: 2.25rem;
          font-weight: 800;
          color: var(--text-dark);
          margin-bottom: 0.5rem;
          letter-spacing: -0.03em;
          line-height: 1.1;
        }

        .profile-title {
          font-family: var(--font-sans);
          font-size: 1.125rem;
          font-weight: 400;
          color: var(--text-muted);
          margin-bottom: 1.5rem;
          line-height: 1.5;
          letter-spacing: -0.01em;
        }

        .profile-social-links {
          display: flex;
          justify-content: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .profile-social-link {
          width: 42px;
          height: 42px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-off-white);
          border: 1px solid var(--border-light);
          color: var(--text-muted);
          transition: var(--transition-base);
          border-radius: 0.75rem;
          text-decoration: none;
          position: relative;
          overflow: hidden;
        }

        .profile-social-link::before {
          content: '';
          position: absolute;
          inset: 0;
          background: var(--text-dark);
          transform: scale(0);
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border-radius: 0.75rem;
        }

        .profile-social-link:hover {
          transform: translateY(-3px);
          border-color: var(--text-dark);
          box-shadow: 0 10px 20px -5px rgba(0, 0, 0, 0.15);
        }

        .profile-social-link:hover::before {
          transform: scale(1);
        }

        .profile-social-link:hover svg {
          color: white;
          z-index: 1;
          position: relative;
        }

        /* Remove contact button styles as we're not using it */

        /* Sections */
        .section {
          width: 100%;
          padding: 5rem 2rem;
          position: relative;
          background: var(--bg-white);
          border-top: 1px solid rgba(0, 0, 0, 0.05);
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .section.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .section:nth-child(even) {
          background: var(--bg-off-white);
        }

        .section-header {
          text-align: center;
          margin-bottom: 4rem;
          position: relative;
        }

        .section-badge {
          display: inline-block;
          font-family: var(--font-sans);
          font-size: 0.75rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 1rem;
          padding: 0.5rem 1rem;
          background: var(--bg-gray-50);
          border-radius: 2rem;
          border: 1px solid var(--border-gray);
        }

        .section-title {
          font-family: var(--font-serif);
          font-size: 2.75rem;
          font-weight: 800;
          color: var(--text-dark);
          letter-spacing: -0.03em;
          line-height: 1.1;
        }

        /* About Section */
        .about-content {
          width: 100%;
          max-width: 1000px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        .about-intro {
          text-align: center;
          max-width: 700px;
          margin: 0 auto 4rem;
        }

        .about-description {
          font-size: 1.125rem;
          line-height: 1.9;
          color: var(--text-muted);
          font-weight: 400;
          letter-spacing: -0.01em;
        }

        /* Lanyard Section */
        .lanyard-section {
          margin-top: 3rem;
        }

        .lanyard-nav {
          display: flex;
          justify-content: center;
          gap: 2rem;
          margin-bottom: 3rem;
          flex-wrap: wrap;
        }

        .lanyard-nav-btn {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 2rem;
          background: transparent;
          border: 2px solid var(--border-light);
          font-family: var(--font-sans);
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-radius: 0.5rem;
        }

        .lanyard-nav-btn:hover {
          border-color: var(--accent-color, var(--text-dark));
          color: var(--accent-color, var(--text-dark));
        }

        .lanyard-nav-btn.active {
          background: var(--accent-color);
          border-color: var(--accent-color);
          color: white;
        }

        .lanyard-display {
          display: flex;
          justify-content: center;
        }

        .lanyard-card {
          position: relative;
          background: var(--bg-white);
          border: 2px solid var(--border-light);
          border-radius: 1rem;
          padding: 3rem;
          max-width: 700px;
          width: 100%;
          box-shadow: 0 5px 20px var(--shadow-soft);
        }

        .lanyard-geometric-accent {
          position: absolute;
          top: -50px;
          right: -50px;
          pointer-events: none;
        }

        .lanyard-title {
          font-family: var(--font-serif);
          font-size: 2rem;
          font-weight: 700;
          color: var(--text-dark);
          margin-bottom: 2rem;
        }

        .lanyard-items {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .lanyard-item {
          padding-left: 1.5rem;
          border-left: 3px solid var(--border-light);
        }

        .lanyard-item h4 {
          font-family: var(--font-serif);
          font-size: 1.25rem;
          color: var(--text-dark);
          margin-bottom: 0.25rem;
        }

        .lanyard-meta {
          font-family: var(--font-sans);
          font-size: 0.875rem;
          color: var(--red-primary);
          margin-bottom: 0.5rem;
        }

        .lanyard-desc {
          font-size: 1rem;
          color: var(--text-muted);
          line-height: 1.6;
        }

        /* Projects Section */
        .projects-section {
          width: 100%;
          overflow: hidden;
        }

        /* Blog Section */
        .blog-section {
          width: 100%;
          min-height: 500px;
        }

        .blog-coming-soon {
          text-align: center;
          padding: 4rem 2rem;
          max-width: 600px;
          margin: 0 auto;
        }

        .blog-icon {
          color: var(--accent-blue);
          margin-bottom: 1.5rem;
        }

        .blog-coming-title {
          font-size: 2rem;
          font-weight: 600;
          margin-bottom: 1rem;
          color: var(--text-dark);
        }

        .blog-coming-description {
          font-size: 1.125rem;
          color: var(--text-muted);
          line-height: 1.6;
          margin-bottom: 2rem;
        }

        .blog-coming-subtitle {
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin-bottom: 1.5rem;
        }

        .blog-subscribe-form {
          display: flex;
          gap: 0.75rem;
          max-width: 400px;
          margin: 0 auto;
        }

        .blog-email-input {
          flex: 1;
          padding: 0.75rem 1rem;
          border: 1px solid var(--border-light);
          border-radius: 8px;
          font-size: 0.875rem;
          transition: all 0.2s ease;
          background: var(--bg-gray-50);
          color: var(--text-muted);
        }

        .blog-email-input:disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }

        .blog-subscribe-button {
          padding: 0.75rem 1.5rem;
          background: var(--accent-blue);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          opacity: 0.6;
        }

        .blog-subscribe-button:disabled {
          cursor: not-allowed;
        }

        .projects-container {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem;
          display: flex;
          gap: 1rem;
          min-height: 500px;
          overflow-x: auto;
          scroll-behavior: smooth;
          justify-content: center;
        }

        .projects-container::-webkit-scrollbar {
          height: 8px;
        }

        .projects-container::-webkit-scrollbar-track {
          background: var(--border-light);
        }

        .projects-container::-webkit-scrollbar-thumb {
          background: var(--text-muted);
          border-radius: 4px;
        }

        /* Project Panels */
        .project-panel {
          position: relative;
          background: var(--bg-white);
          border: 1px solid var(--border-light);
          border-radius: 1rem;
          overflow: hidden;
          cursor: pointer;
          transition: var(--transition-slow);
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          box-shadow: 
            0 1px 3px 0 rgba(0, 0, 0, 0.1),
            0 1px 2px 0 rgba(0, 0, 0, 0.06);
        }

        .panel-collapsed { 
          width: clamp(100px, 15vw, 150px);
          min-height: 480px;
        }

        .panel-expanded { 
          width: 600px; 
          border-color: transparent;
          box-shadow: 
            0 10px 15px -3px rgba(0, 0, 0, 0.1),
            0 4px 6px -2px rgba(0, 0, 0, 0.05),
            0 0 0 1px var(--theme-color);
          transform: translateY(-5px);
        }

        .panel-geometric-badge {
          position: absolute;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--theme-color);
          color: white;
          z-index: 2;
          border-radius: 20%;
        }

        .panel-geometric-badge img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .panel-expanded .panel-geometric-badge {
          position: relative;
          top: unset;
          left: unset;
          transform: unset;
          margin-right: 1.5rem;
        }

        .panel-title-vertical {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-90deg);
          font-family: var(--font-sans);
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-muted);
          white-space: nowrap;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          transition: opacity 0.3s ease;
        }

        .panel-expanded .panel-title-vertical {
          display: none;
        }

        .panel-content {
          padding: 2.5rem;
          height: 100%;
          display: flex;
          flex-direction: column;
          opacity: 0;
          transition: opacity 0.6s ease 0.2s;
        }
        
        .panel-collapsed .panel-content {
          display: none;
        }

        .panel-expanded .panel-content { 
          opacity: 1; 
          display: flex;
        }

        .panel-header {
          margin-bottom: 2rem;
          display: flex;
          align-items: center;
          padding-left: 0;
        }

        .panel-title { 
          font-family: var(--font-serif);
          font-size: 1.75rem; 
          font-weight: 700;
          color: var(--text-dark);
          margin-bottom: 0.25rem;
        }

        .panel-subtitle {
          font-family: var(--font-sans);
          font-size: 0.875rem;
          color: var(--theme-color);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .panel-description { 
          font-size: 1rem; 
          line-height: 1.7; 
          color: var(--text-muted);
          margin-bottom: 2rem; 
        }

        .tech-stack { 
          display: flex; 
          gap: 0.5rem; 
          margin-bottom: 2rem; 
          flex-wrap: wrap; 
        }

        .tech-chip { 
          padding: 0.375rem 0.75rem; 
          background: var(--bg-cream);
          font-family: var(--font-sans);
          font-size: 0.75rem; 
          color: var(--text-muted);
          border-radius: 0.375rem;
          border: 1px solid var(--border-light);
        }

        .panel-link {
          margin-top: auto;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: transparent;
          border: 2px solid var(--theme-color);
          color: var(--theme-color);
          font-family: var(--font-sans);
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          align-self: flex-start;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-radius: 0.5rem;
          text-decoration: none;
        }

        .panel-link:hover { 
          background: var(--theme-color);
          color: white;
          gap: 1rem;
        }

        .github-stars {
          font-family: var(--font-sans);
          font-size: 0.8rem;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          margin-top: 0.5rem;
        }
        
        .project-actions {
          display: flex;
          gap: 10px; /* Space between the buttons */
          margin-top: 15px; /* Space above the buttons */
          flex-wrap: wrap; /* Allow buttons to wrap on smaller screens */
          align-items: center; /* Align items vertically */
        }

        .btn-github {
          /* Existing panel-link styles are sufficient for basic styling */
        }

        .btn-blog {
          /* Specific styling for blog post link if needed, e.g., different border color */
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .hero-content {
            gap: 2rem;
          }

          .hero-profile-card {
            transform: scale(1);
          }

          .modern-profile-card {
            max-width: 380px;
          }
        }

        @media (max-width: 768px) {
          body {
            font-size: 16px;
          }

          .nav-bar {
            padding: 1rem;
          }

          .nav-links {
            display: none;
          }

          .mobile-menu-toggle {
            display: none;
          }
          
          @media (max-width: 768px) {
            .mobile-menu-toggle {
              display: block;
              background: none;
              border: none;
              color: var(--text-dark);
              cursor: pointer;
              padding: 0.5rem;
              z-index: 1002;
              position: relative;
            }
          }
          
          /* Mobile Menu */
          .mobile-menu {
            display: none;
          }
          
          @media (max-width: 768px) {
            .mobile-menu {
              display: block;
              position: fixed;
              top: 0;
              right: -100%;
              width: 80%;
              max-width: 300px;
              height: 100vh;
              background: var(--bg-white);
              box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
              transition: right 0.3s ease;
              z-index: 1001;
              padding: 5rem 2rem 2rem;
            }
            
            .mobile-menu.open {
              right: 0;
            }
            
            .mobile-menu-overlay {
              display: none;
              position: fixed;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background: rgba(0, 0, 0, 0.5);
              z-index: 1000;
              opacity: 0;
              transition: opacity 0.3s ease;
            }
            
            .mobile-menu-overlay.visible {
              display: block;
              opacity: 1;
            }
            
            .mobile-nav-links {
              display: flex;
              flex-direction: column;
              gap: 2rem;
              list-style: none;
              padding: 0;
              margin: 0;
            }
            
            .mobile-nav-link {
              font-family: var(--font-sans);
              font-size: 1.125rem;
              color: var(--text-muted);
              text-decoration: none;
              transition: color 0.2s ease;
              display: block;
              padding: 0.5rem 0;
            }
            
            .mobile-nav-link.active {
              color: var(--accent-red);
              font-weight: 600;
            }
            
            .mobile-nav-link:hover {
              color: var(--text-dark);
            }
          }

          .nav-content {
            padding: 0 1rem;
          }

          .hero-section {
            padding: 2rem 1rem;
            min-height: 100vh;
          }

          .hero-content {
            max-width: 380px;
          }

          .hero-nav-hint {
            bottom: 2rem;
          }

          .particle {
            width: 3px;
            height: 3px;
          }

          .modern-profile-card {
            padding: 2rem 1.5rem;
          }

          .lanyard-nav {
            flex-direction: column;
            gap: 1rem;
          }

          .lanyard-nav-btn {
            width: 100%;
            justify-content: center;
          }

          .lanyard-card {
            padding: 2rem;
          }

          .projects-container {
            flex-direction: column;
            height: auto;
            overflow-x: visible;
            padding: 0 1rem;
          }

          .project-panel {
            width: 100%;
            height: auto;
            min-height: unset;
            cursor: default;
            overflow: visible;
          }

          .panel-collapsed, .panel-expanded {
            width: 100%;
            height: auto;
            min-height: unset;
          }

          .panel-title-vertical {
            display: none;
          }

          .panel-geometric-badge {
            position: relative;
            margin-bottom: 1rem;
            top: unset;
            left: unset;
            transform: unset;
            width: 50px;
            height: 50px;
          }

          .panel-content {
            opacity: 1;
            display: flex;
            padding: 1.5rem;
          }

          .panel-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .section {
            padding: 3rem 1rem;
          }

          .about-content {
            padding: 0 1rem;
          }
        }

        /* Return to Top Button */
        .return-button {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          width: 48px;
          height: 48px;
          background: var(--accent-blue); /* This sets the background color */
          color: var(--text-color-light); /* This sets the color for text/icons *inside* the button */
          /* If you want white, you can directly use #fff or var(--white) if you have a variable for it */
          /* Example: color: #fff; */

          border: none;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); /* This shadow uses a specific blue, likely related to --accent-blue */
          z-index: 1000;
        }

        .return-button.visible {
          opacity: 1;
          visibility: visible;
        }

        .return-button:hover {
          transform: translateY(-2px);
          /* The shadow on hover also uses the accent blue */
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
        }

        .return-button:active {
          transform: translateY(0);
        }

        /* Section Return Buttons */
        .section-return-container {
          display: none;
        }

        .section-return {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: var(--bg-white);
          border: 1px solid var(--border-light);
          border-radius: 12px;
          color: var(--text-secondary);
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .section-return:hover {
          border-color: var(--accent-blue);
          color: var(--accent-blue);
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        @media (max-width: 768px) {
          .return-button {
            bottom: 1.5rem;
            right: 1.5rem;
            width: 40px;
            height: 40px;
          }

          .blog-coming-soon {
            padding: 3rem 1rem;
          }

          .blog-coming-title {
            font-size: 1.5rem;
          }

          .blog-coming-description {
            font-size: 1rem;
          }

          .blog-subscribe-form {
            flex-direction: column;
          }

          .blog-email-input,
          .blog-subscribe-button {
            width: 100%;
          }
        }
      `}</style>

      <div className="portfolio-bg"></div>

      <nav className={`nav-bar ${scrollY > 50 ? 'nav-scrolled' : ''}`}>
        <div className="nav-content">
          <div className="nav-logo" onClick={() => scrollToSection('hero')}>
            <Square size={20} />
            <span>Eli Salamie</span>
          </div>
          <ul className="nav-links">
            <li className={`nav-link ${activeSection === 'hero' ? 'active' : ''}`}
              onClick={() => scrollToSection('hero')}>Home</li>
            <li className={`nav-link ${activeSection === 'about' ? 'active' : ''}`}
              onClick={() => scrollToSection('about')}>About</li>
            <li className={`nav-link ${activeSection === 'projects' ? 'active' : ''}`}
              onClick={() => scrollToSection('projects')}>Projects</li>
            <li className={`nav-link ${activeSection === 'blog' ? 'active' : ''}`}
              onClick={() => scrollToSection('blog')}>Blog</li>
          </ul>
          <button 
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div 
        className={`mobile-menu-overlay ${mobileMenuOpen ? 'visible' : ''}`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Mobile Menu */}
      <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <ul className="mobile-nav-links">
          <li>
            <a 
              className={`mobile-nav-link ${activeSection === 'hero' ? 'active' : ''}`}
              onClick={() => scrollToSection('hero')}
            >
              Home
            </a>
          </li>
          <li>
            <a 
              className={`mobile-nav-link ${activeSection === 'about' ? 'active' : ''}`}
              onClick={() => scrollToSection('about')}
            >
              About
            </a>
          </li>
          <li>
            <a 
              className={`mobile-nav-link ${activeSection === 'projects' ? 'active' : ''}`}
              onClick={() => scrollToSection('projects')}
            >
              Projects
            </a>
          </li>
          <li>
            <a 
              className={`mobile-nav-link ${activeSection === 'blog' ? 'active' : ''}`}
              onClick={() => scrollToSection('blog')}
            >
              Blog
            </a>
          </li>
        </ul>
      </div>

      <section id="hero" className="hero-section">
        <div className="hero-particles">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="particle" style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${15 + Math.random() * 20}s`
            }} />
          ))}
        </div>
        <div className="hero-content">
          <div className="hero-profile-wrapper">
            <ProfileCard
              avatarUrl="/imgs/banff.jpg"
              name="Eli Salamie"
              title="AI Engineer & Researcher"
              handle="eli64s"
              contactText="Send Email"
              onContactClick={handleEmailClick}
              socialLinks={[
                { icon: <Github size={20} />, url: "https://github.com/eli64s", label: "Github profile" },
                { icon: <Linkedin size={20} />, url: "https://www.linkedin.com/in/elisalamie/", label: "LinkedIn profile" },
                { icon: <Mail size={20} />, url: "mailto:egsalamie@gmail.com", label: "Email me" }
              ]}
            />
          </div>
        </div>
        <div className="hero-nav-hint">
          <button 
            className="nav-hint-btn"
            onClick={() => scrollToSection('projects')}
            aria-label="View projects"
          >
            <span className="nav-hint-text">Projects</span>
            <ArrowDown size={20} className="nav-hint-arrow" />
          </button>
        </div>
      </section>

      <section id="about" className={`section about-section ${visibleSections.has('about') ? 'visible' : ''}`}>
        <div className="section-header">
          <div className="section-badge">About</div>
          <h2 className="section-title">Professional Journey</h2>
        </div>
        <div className="about-content">
          <div className="about-intro">
            <p className="about-description">
              As an AI engineer and open-source builder with an academic journey from Industrial Engineering (Purdue) to Computer Science (UPenn), I'm exploring the intersection of technology, art, and cognition.
              My current focus is on creating AI systems that act as responsible creative partners, enhancing human abilities and adapting to individual workflows.
            </p>
          </div>
          <LanyardSection />
        </div>
      </section>

      <section id="projects" className={`section projects-section ${visibleSections.has('projects') ? 'visible' : ''}`}>
        <div className="section-header">
          <div className="section-badge">Projects</div>
          <h2 className="section-title">Selected Works</h2>
        </div>
        <div className="projects-container">
          {projects.map((project) => (
            <ProjectPanel
              key={project.id}
              project={project}
              isExpanded={isMobile ? true : expandedProject === project.id}
              onMouseEnter={isMobile ? undefined : () => setExpandedProject(project.id)}
            />
          ))}
        </div>
      </section>

      <section id="blog" className={`section blog-section ${visibleSections.has('blog') ? 'visible' : ''}`}>
        <div className="section-header">
          <div className="section-badge">Blog</div>
          <h2 className="section-title">Thoughts & Insights</h2>
          <p className="section-subtitle">
            Coming soon! Stay tuned for articles on AI engineering, creative technology, and more.
          </p>
        </div>
      </section>

      {/* Floating Return to Top Button */}
      <button 
        className={`return-button ${scrollY > 300 ? 'visible' : ''}`}
        onClick={() => scrollToSection('hero')}
        aria-label="Return to top"
      >
        <ArrowUp size={24} />
      </button>
    </div>
  );
};

export default ByrnePortfolio;
import React from 'react';

interface HeroSectionProps {
  children: React.ReactNode;
  backgroundImage?: string;
}

export default function HeroSection({ children, backgroundImage }: HeroSectionProps) {
  return (
    <section 
      className="hero relative pt-[120px] pb-[80px]" 
      id="hero"
      style={backgroundImage ? {
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      } : undefined}
    >
      {/* Animated background gradient overlay */}
      <div className="hero-gradient-overlay"></div>
      
      <div className="title-container relative z-10">
        {children}
      </div>
      
      {/* Decorative animated elements */}
      <div className="hero-decoration hero-decoration-1 parallax" data-speed="0.3"></div>
      <div className="hero-decoration hero-decoration-2 parallax" data-speed="0.5"></div>
   </section>
  );
}

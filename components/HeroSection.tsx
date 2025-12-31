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
      <div className="title-container relative z-10">
        {children}
      </div>
   </section>
  );
}

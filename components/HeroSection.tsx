import React from 'react';

interface HeroSectionProps {
  children: React.ReactNode;
}

export default function HeroSection({ children }: HeroSectionProps) {
  return (
    <section className="hero relative pt-[120px] pb-[80px]" id="hero">
      <div className="title-container relative z-10">
        {children}
      </div>
   </section>
  );
}

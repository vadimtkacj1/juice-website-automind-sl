'use client';

export default function HeroSection() {
  const letters = 'REVIVA'.split('');

  return (
    <section className="hero" id="hero">
      <div className="title-container">
        <h1 className="hero-title">
          {letters.map((letter, idx) => (
            <span key={letter + idx} className="letter" style={{ ['--d' as string]: `${0.1 * (idx + 1)}s` }}>
              {letter}
            </span>
          ))}
        </h1>
      </div>
   </section>
  );
}

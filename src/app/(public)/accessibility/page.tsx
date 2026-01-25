'use client';

import HeroSection from '@/components/HeroSection';
import { translateToHebrew } from '@/lib/translations';
import styles from './accessibility.module.css';

export default function AccessibilityPage() {
  return (
    <div className={styles['legal-page']}>
      <HeroSection backgroundImage="https://images.unsplash.com/photo-1628178652615-3974c5d63f03?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1ODc1M3wxfDB8c2VhcjI2Mnx8anVpY2UlMjBiYXJ8ZW58MHx8fHwxNzA5NDc0NDcxfDA&ixlib=rb-4.0.3&q=80&w=1080">
        <h1 className="hero-title">{translateToHebrew('Accessibility Statement')}</h1>
      </HeroSection>

      <div className={styles['legal-content']} dir="rtl">
        <div className={styles.container}>
          <div className={styles['legal-section']}>
            <p className={styles['last-updated']}>{translateToHebrew('Last Updated:')} {new Date().toLocaleDateString('he-IL', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

            <section>
              <h2>1. {translateToHebrew('Our Commitment to Accessibility')}</h2>
              <p>
                {translateToHebrew('REVIVA is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards.')}
              </p>
            </section>

            <section>
              <h2>2. {translateToHebrew('Conformance Status')}</h2>
              <p>
                {translateToHebrew('The Web Content Accessibility Guidelines (WCAG) defines requirements for designers and developers to improve accessibility for people with disabilities. It defines three levels of conformance: Level A, Level AA, and Level AAA. This website is partially conformant with WCAG 2.1 level AA.')}
              </p>
              <p>
                {translateToHebrew('Partially conformant means that some parts of the content do not fully conform to the accessibility standard.')}
              </p>
            </section>

            <section>
              <h2>3. {translateToHebrew('Accessibility Features')}</h2>
              <p>{translateToHebrew('Our website includes the following accessibility features:')}</p>
              <ul>
                <li><strong>{translateToHebrew('Keyboard Navigation:')}</strong> {translateToHebrew('All interactive elements can be accessed using keyboard')}</li>
                <li><strong>{translateToHebrew('Screen Reader Support:')}</strong> {translateToHebrew('Proper semantic HTML and ARIA labels for assistive technologies')}</li>
                <li><strong>{translateToHebrew('Text Alternatives:')}</strong> {translateToHebrew('Alternative text for images and non-text content')}</li>
                <li><strong>{translateToHebrew('Color Contrast:')}</strong> {translateToHebrew('Sufficient color contrast ratios for readability')}</li>
                <li><strong>{translateToHebrew('Resizable Text:')}</strong> {translateToHebrew('Text can be resized up to 200% without loss of functionality')}</li>
                <li><strong>{translateToHebrew('Focus Indicators:')}</strong> {translateToHebrew('Visible focus indicators for keyboard navigation')}</li>
                <li><strong>{translateToHebrew('Accessible Forms:')}</strong> {translateToHebrew('Properly labeled form fields with error identification')}</li>
                <li><strong>{translateToHebrew('Skip Navigation:')}</strong> {translateToHebrew('Skip to main content links for screen reader users')}</li>
              </ul>
            </section>

            <section>
              <h2>4. {translateToHebrew('Assistive Technologies')}</h2>
              <p>{translateToHebrew('This website is designed to be compatible with the following assistive technologies:')}</p>
              <ul>
                <li>{translateToHebrew('Screen readers (NVDA, JAWS, VoiceOver)')}</li>
                <li>{translateToHebrew('Screen magnification software')}</li>
                <li>{translateToHebrew('Speech recognition software')}</li>
                <li>{translateToHebrew('Keyboard-only navigation')}</li>
                <li>{translateToHebrew('Alternative input devices')}</li>
              </ul>
            </section>

            <section>
              <h2>5. {translateToHebrew('Known Limitations')}</h2>
              <p>{translateToHebrew('Despite our best efforts to ensure accessibility, there may be some limitations. Below are known issues:')}</p>
              <ul>
                <li>{translateToHebrew('Some third-party content may not be fully accessible')}</li>
                <li>{translateToHebrew('Older PDF documents may not meet current accessibility standards')}</li>
                <li>{translateToHebrew('Some embedded videos may lack captions or transcripts')}</li>
              </ul>
              <p>{translateToHebrew('We are working to address these issues and improve accessibility across our entire website.')}</p>
            </section>

            <section>
              <h2>6. {translateToHebrew('Technical Specifications')}</h2>
              <p>{translateToHebrew('Accessibility of this website relies on the following technologies:')}</p>
              <ul>
                <li>HTML5</li>
                <li>CSS3</li>
                <li>JavaScript</li>
                <li>WAI-ARIA</li>
              </ul>
              <p>{translateToHebrew('These technologies are relied upon for conformance with the accessibility standards used.')}</p>
            </section>

            <section>
              <h2>7. {translateToHebrew('Testing and Evaluation')}</h2>
              <p>{translateToHebrew('Our website has been tested using the following methods:')}</p>
              <ul>
                <li>{translateToHebrew('Automated accessibility testing tools')}</li>
                <li>{translateToHebrew('Manual testing with keyboard navigation')}</li>
                <li>{translateToHebrew('Screen reader testing')}</li>
                <li>{translateToHebrew('Color contrast analysis')}</li>
                <li>{translateToHebrew('User testing with people with disabilities')}</li>
              </ul>
            </section>

            <section>
              <h2>8. {translateToHebrew('Accessibility Tools')}</h2>
              <p>{translateToHebrew('We provide an accessibility widget on our website that allows you to:')}</p>
              <ul>
                <li>{translateToHebrew('Adjust text size')}</li>
                <li>{translateToHebrew('Increase contrast')}</li>
                <li>{translateToHebrew('Enable text-to-speech')}</li>
                <li>{translateToHebrew('Highlight links')}</li>
                <li>{translateToHebrew('Use a reading guide')}</li>
                <li>{translateToHebrew('Adjust letter and line spacing')}</li>
              </ul>
            </section>

            <section>
              <h2>9. {translateToHebrew('Feedback and Complaints')}</h2>
              <p>
                {translateToHebrew('We welcome your feedback on the accessibility of this website. If you encounter any accessibility barriers, please let us know:')}
              </p>
              <ul>
                <li><strong>{translateToHebrew('Email:')}</strong> accessibility@reviva.com</li>
                <li><strong>{translateToHebrew('Phone:')}</strong> +972 50-123-4567</li>
              </ul>
              <p>
                {translateToHebrew('We aim to respond to accessibility feedback within 5 business days and to propose a solution within 10 business days.')}
              </p>
            </section>

            <section>
              <h2>10. {translateToHebrew('Ongoing Efforts')}</h2>
              <p>{translateToHebrew('We are committed to continuous improvement of our website accessibility:')}</p>
              <ul>
                <li>{translateToHebrew('Regular accessibility audits and testing')}</li>
                <li>{translateToHebrew('Staff training on accessibility best practices')}</li>
                <li>{translateToHebrew('Including accessibility in our design and development process')}</li>
                <li>{translateToHebrew('Monitoring and updating accessibility features')}</li>
                <li>{translateToHebrew('Engaging with the disability community for feedback')}</li>
              </ul>
            </section>

            <section>
              <h2>11. {translateToHebrew('Legal Requirements')}</h2>
              <p>
                {translateToHebrew('This accessibility statement is in accordance with the Israeli Equal Rights for Persons with Disabilities Regulations (Accessibility Adjustments to Service), 5773-2013, and the Web Content Accessibility Guidelines (WCAG) 2.1.')}
              </p>
            </section>

            <section>
              <h2>12. {translateToHebrew('Date of Statement')}</h2>
              <p>
                {translateToHebrew('This accessibility statement was created on')} {new Date().toLocaleDateString('he-IL', { year: 'numeric', month: 'long', day: 'numeric' })} {translateToHebrew('and last reviewed on the same date.')}
              </p>
            </section>

            <section>
              <h2>13. {translateToHebrew('Contact Information')}</h2>
              <p>{translateToHebrew('If you have questions or need assistance with accessibility, please contact us:')}</p>
              <ul>
                <li><strong>{translateToHebrew('Accessibility Coordinator:')}</strong> [Name]</li>
                <li><strong>{translateToHebrew('Email:')}</strong> accessibility@reviva.com</li>
                <li><strong>{translateToHebrew('Phone:')}</strong> +972 50-123-4567</li>
                <li><strong>{translateToHebrew('Address:')}</strong> [Your Business Address]</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

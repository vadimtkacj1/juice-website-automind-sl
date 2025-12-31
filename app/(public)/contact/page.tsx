'use client';

import { useState, useEffect } from 'react';
import { Mail, Phone, MessageSquare, Send, Clock, MapPin, ArrowRight } from 'lucide-react';
import HeroSection from '@/components/HeroSection';

interface Contact {
  id: number;
  type: string;
  value: string;
}

// Demo contact info
const contactInfo = [
  { 
    id: 1, 
    type: 'email', 
    value: 'hello@juicefresh.com',
    label: 'Email Us',
    description: 'We\'ll respond within 24 hours'
  },
  { 
    id: 2, 
    type: 'phone', 
    value: '+972 50-123-4567',
    label: 'Call Us',
    description: 'Mon-Fri, 8AM-6PM'
  },
  { 
    id: 3, 
    type: 'whatsapp', 
    value: '+972501234567',
    label: 'WhatsApp',
    description: 'Chat with us anytime'
  },
];

const businessHours = [
  { day: 'Monday - Friday', hours: '7:00 AM - 9:00 PM' },
  { day: 'Saturday', hours: '8:00 AM - 10:00 PM' },
  { day: 'Sunday', hours: '9:00 AM - 8:00 PM' },
];

export default function ContactPage() {
  const [contacts] = useState(contactInfo);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const revealElements = document.querySelectorAll('.reveal');
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
          }
        });
      },
      { threshold: 0.1 }
    );

    revealElements.forEach((el) => observer.observe(el));

    setTimeout(() => {
      revealElements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight) {
          el.classList.add('active');
        }
      });
    }, 100);

    return () => observer.disconnect();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setSubmitted(true);
    setSubmitting(false);
    setFormData({ name: '', email: '', subject: '', message: '' });

    setTimeout(() => setSubmitted(false), 5000);
  };

  const getContactIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'email':
        return <Mail size={24} />;
      case 'phone':
        return <Phone size={24} />;
      case 'whatsapp':
        return <MessageSquare size={24} />;
      default:
        return <MessageSquare size={24} />;
    }
  };

  const getContactLink = (type: string, value: string) => {
    switch (type.toLowerCase()) {
      case 'email':
        return `mailto:${value}`;
      case 'phone':
        return `tel:${value.replace(/\D/g, '')}`;
      case 'whatsapp':
        return `https://wa.me/${value.replace(/\D/g, '')}`;
      default:
        return '#';
    }
  };

  return (
    <div className="contact-page">
      <HeroSection backgroundImage="https://images.unsplash.com/photo-1556742526-778844872147?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1ODc1M3wxfDB8c2VhcmNofDE3NXx8anVpY2UlMjBiYXJ8ZW58MHx8fHwxNzA5NDc1NDY0fDA&ixlib=rb-4.0.3&q=80&w=1080" >
        <h1 className="hero-title">CONTACT US</h1>
        <p className="hero-subtitle">Have a question or feedback? We'd love to hear from you!</p>
      </HeroSection>

      {/* Main Content */}
      <div className="contact-content">
        {/* Contact Cards */}
        <section className="contact-cards reveal">
          {contacts.map((contact, index) => (
            <a
              key={contact.id}
              href={getContactLink(contact.type, contact.value)}
              target={contact.type === 'whatsapp' ? '_blank' : undefined}
              rel={contact.type === 'whatsapp' ? 'noopener noreferrer' : undefined}
              className="contact-card"
              style={{ ['--delay' as string]: `${0.1 * (index + 1)}s` }}
            >
              <div className="contact-card-icon">
                {getContactIcon(contact.type)}
              </div>
              <div className="contact-card-info">
                <h3>{contact.label}</h3>
                <p className="contact-card-value">{contact.value}</p>
                <p className="contact-card-desc">{contact.description}</p>
              </div>
              <ArrowRight size={20} className="contact-card-arrow" />
            </a>
          ))}
        </section>

        {/* Form and Info Grid */}
        <div className="contact-grid">
          {/* Contact Form */}
          <div className="contact-form-wrapper reveal" style={{ ['--delay' as string]: '0.2s' }}>
            {/* Removed the header here as per user request */}
            {submitted && (
              <div className="success-message">
                <div className="success-icon">✓</div>
                <div>
                  <p className="success-title">Message sent!</p>
                  <p className="success-desc">We'll get back to you soon.</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Your Name</label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@example.com"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="subject">Subject</label>
                <input
                  type="text"
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="How can we help?"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={5}
                  placeholder="Tell us what you're thinking..."
                  required
                />
              </div>

              <button type="submit" disabled={submitting} className="submit-btn">
                {submitting ? (
                  <>
                    <span className="spinner"></span>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Info Side */}
          <div className="contact-info-side">
            {/* Business Hours */}
            <div className="info-card reveal" style={{ ['--delay' as string]: '0.3s' }}>
              <div className="info-card-header">
                <Clock size={24} />
                <h3>Business Hours</h3>
              </div>
              <div className="hours-list">
                {businessHours.map((item, index) => (
                  <div key={index} className="hours-item">
                    <span className="hours-day">{item.day}</span>
                    <span className="hours-time">{item.hours}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Location Hint */}
            <div className="info-card reveal" style={{ ['--delay' as string]: '0.4s' }}>
              <div className="info-card-header">
                <MapPin size={24} />
                <h3>Visit Us</h3>
              </div>
              <p className="info-text">
                Find our juice bars across multiple locations. Fresh juices and smoothies await you!
              </p>
              <a href="/locations" className="info-link">
                View All Locations
                <ArrowRight size={16} />
              </a>
            </div>

            {/* Fun Fact */}
            <div className="fun-fact reveal" style={{ ['--delay' as string]: '0.5s' }}>
              <div className="fun-fact-content">
                <span className="fun-fact-emoji">🍊</span>
                <p>We squeeze over <strong>1000 oranges</strong> daily to bring you the freshest juice!</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .contact-page {
          padding-bottom: 60px;
        }

        /* Content */
        .contact-content {
          padding: 0 16px;
          max-width: 1400px;
          margin: 0 auto;
        }

        /* Contact Cards */
        .contact-cards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 48px;
        }

        .contact-card {
          display: flex;
          align-items: center;
          gap: 20px;
          background: white;
          padding: 28px;
          border-radius: 20px;
          text-decoration: none;
          box-shadow: 0 8px 32px rgba(29, 26, 64, 0.06);
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.15);
          border: 2px solid transparent;
        }

        .contact-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 48px rgba(29, 26, 64, 0.12);
          border-color: var(--primary, #7322ff);
        }

        .contact-card-icon {
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, var(--primary, #7322ff), #9b59ff);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
        }

        .contact-card-info {
          flex: 1;
          min-width: 0;
        }

        .contact-card-info h3 {
          font-family: "Archivo", sans-serif;
          font-weight: 800;
          font-size: 18px;
          color: var(--dark, #1d1a40);
          margin: 0 0 4px;
        }

        .contact-card-value {
          font-weight: 600;
          font-size: 15px;
          color: var(--primary, #7322ff);
          margin: 0;
        }

        .contact-card-desc {
          font-size: 13px;
          color: var(--text-gray, #70758c);
          margin: 4px 0 0;
        }

        .contact-card-arrow {
          color: var(--text-gray, #70758c);
          transition: all 0.3s ease;
        }

        .contact-card:hover .contact-card-arrow {
          color: var(--primary, #7322ff);
          transform: translateX(4px);
        }

        /* Grid */
        .contact-grid {
          display: grid;
          grid-template-columns: 1.3fr 1fr;
          gap: 32px;
        }

        /* Form */
        .contact-form-wrapper {
          background: white;
          border-radius: 24px;
          padding: 40px;
          box-shadow: 0 12px 40px rgba(29, 26, 64, 0.08);
        }

        .contact-form-header h2 {
          font-family: "Archivo", sans-serif;
          font-weight: 900;
          font-size: 32px;
          color: var(--dark, #1d1a40);
          margin: 0 0 8px;
        }

        .contact-form-header p {
          font-size: 16px;
          color: var(--text-gray, #70758c);
          margin: 0 0 32px;
        }

        .success-message {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          background: linear-gradient(135deg, #e8fdf0, #d4f8e4);
          border-radius: 16px;
          margin-bottom: 24px;
          animation: slideDown 0.4s ease-out;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .success-icon {
          width: 44px;
          height: 44px;
          background: var(--secondary, #93f3aa);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          font-weight: 700;
          color: var(--dark, #1d1a40);
        }

        .success-title {
          font-weight: 700;
          color: var(--dark, #1d1a40);
          margin: 0;
        }

        .success-desc {
          font-size: 14px;
          color: var(--text-gray, #70758c);
          margin: 4px 0 0;
        }

        .contact-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          font-weight: 700;
          font-size: 14px;
          color: var(--dark, #1d1a40);
        }

        .form-group input,
        .form-group textarea {
          padding: 16px 20px;
          border: 2px solid #eaedf6;
          border-radius: 14px;
          font-size: 16px;
          color: var(--dark, #1d1a40);
          transition: all 0.3s ease;
          background: #fafbfd;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: var(--primary, #7322ff);
          background: white;
          box-shadow: 0 0 0 4px rgba(115, 34, 255, 0.1);
        }

        .form-group input::placeholder,
        .form-group textarea::placeholder {
          color: #a0a3b1;
        }

        .form-group textarea {
          resize: none;
        }

        .submit-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: var(--primary, #7322ff);
          color: white;
          border: none;
          padding: 18px 32px;
          border-radius: 100px;
          font-weight: 700;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.15);
          margin-top: 8px;
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 12px 32px rgba(115, 34, 255, 0.35);
        }

        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Info Side */
        .contact-info-side {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .info-card {
          background: white;
          border-radius: 20px;
          padding: 28px;
          box-shadow: 0 8px 32px rgba(29, 26, 64, 0.06);
        }

        .info-card-header {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 20px;
        }

        .info-card-header h3 {
          font-family: "Archivo", sans-serif;
          font-weight: 800;
          font-size: 20px;
          color: var(--dark, #1d1a40);
          margin: 0;
        }

        .info-card-header :global(svg) {
          color: var(--primary, #7322ff);
        }

        .hours-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .hours-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 12px;
          border-bottom: 1px solid #eaedf6;
        }

        .hours-item:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .hours-day {
          font-weight: 600;
          color: var(--dark, #1d1a40);
        }

        .hours-time {
          color: var(--text-gray, #70758c);
        }

        .info-text {
          color: var(--text-gray, #70758c);
          line-height: 1.6;
          margin: 0 0 20px;
        }

        .info-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-weight: 700;
          color: var(--primary, #7322ff);
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .info-link:hover {
          gap: 12px;
        }

        .fun-fact {
          background: linear-gradient(135deg, #fff7e6, #ffe8c4);
          border-radius: 20px;
          padding: 28px;
        }

        .fun-fact-content {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .fun-fact-emoji {
          font-size: 40px;
        }

        .fun-fact-content p {
          margin: 0;
          color: var(--dark, #1d1a40);
          line-height: 1.5;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .contact-cards {
            grid-template-columns: 1fr;
          }

          .contact-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .contact-header {
            margin: 100px 12px 24px;
            padding: 60px 20px;
          }

          .contact-content {
            padding: 0 12px;
          }

          .contact-form-wrapper {
            padding: 28px 20px;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .contact-title {
            font-size: 56px;
          }
        }
      `}</style>
    </div>
  );
}
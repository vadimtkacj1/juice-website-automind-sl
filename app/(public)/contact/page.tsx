'use client';

import { useState, useEffect } from 'react';
import { Mail, Phone, MessageSquare, Send, Clock, MapPin, ArrowRight } from 'lucide-react';
import HeroSection from '@/components/HeroSection';
import { translateToHebrew } from '@/lib/translations';
import styles from './contact.module.css';

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
    <div className={styles['contact-page']}>
      <section className={styles['contact-hero']}>
        <div className={styles.container}>
          <h1 className={styles['contact-hero-title']}>{translateToHebrew('CONTACT US')}</h1>
          <p className={styles['contact-hero-subtitle']}>{translateToHebrew("Have a question or feedback? We'd love to hear from you!")}</p>
        </div>
      </section>

      {/* Main Content */}
      <div className={styles['contact-content']}>
        {/* Contact Cards */}
        <section className={`${styles['contact-cards']} reveal`}>
          {contacts.map((contact, index) => (
            <a
              key={contact.id}
              href={getContactLink(contact.type, contact.value)}
              target={contact.type === 'whatsapp' ? '_blank' : undefined}
              rel={contact.type === 'whatsapp' ? 'noopener noreferrer' : undefined}
              className={styles['contact-card']}
              style={{ ['--delay' as string]: `${0.1 * (index + 1)}s` }}
            >
              <div className={styles['contact-card-icon']}>
                {getContactIcon(contact.type)}
              </div>
              <div className={styles['contact-card-info']}>
                <h3>{translateToHebrew(contact.label)}</h3>
                <p className={styles['contact-card-value']}>{contact.value}</p>
                <p className={styles['contact-card-desc']}>{translateToHebrew(contact.description)}</p>
              </div>
              <ArrowRight size={20} className={styles['contact-card-arrow']} />
            </a>
          ))}
        </section>

        {/* Form and Info Grid */}
        <div className={styles['contact-grid']}>
          {/* Contact Form */}
          <div className={`${styles['contact-form-wrapper']} reveal`} style={{ ['--delay' as string]: '0.2s' }}>
            {/* Removed the header here as per user request */}
            {submitted && (
              <div className={styles['success-message']}>
                <div className={styles['success-icon']}>✓</div>
                <div>
                  <p className={styles['success-title']}>{translateToHebrew('Message sent!')}</p>
                  <p className={styles['success-desc']}>{translateToHebrew("We'll get back to you soon.")}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className={styles['contact-form']}>
              <div className={styles['form-row']}>
                <div className={styles['form-group']}>
                  <label htmlFor="name">{translateToHebrew('Your Name')}</label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={translateToHebrew('John Doe')}
                    required
                  />
                </div>
                <div className={styles['form-group']}>
                  <label htmlFor="email">{translateToHebrew('Email Address')}</label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder={translateToHebrew('john@example.com')}
                    required
                  />
                </div>
              </div>

              <div className={styles['form-group']}>
                <label htmlFor="subject">{translateToHebrew('Subject')}</label>
                <input
                  type="text"
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder={translateToHebrew('How can we help?')}
                  required
                />
              </div>

              <div className={styles['form-group']}>
                <label htmlFor="message">{translateToHebrew('Message')}</label>
                <textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={5}
                  placeholder={translateToHebrew("Tell us what you're thinking...")}
                  required
                />
              </div>

              <button type="submit" disabled={submitting} className={styles['submit-btn']}>
                {submitting ? (
                  <>
                    <span className={styles.spinner}></span>
                    {translateToHebrew('Sending')}...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    {translateToHebrew('Send Message')}
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Info Side */}
          <div className={styles['contact-info-side']}>
            {/* Business Hours */}
            <div className={`${styles['info-card']} reveal`} style={{ ['--delay' as string]: '0.3s' }}>
              <div className={styles['info-card-header']}>
                <Clock size={24} />
                <h3>{translateToHebrew('Business Hours')}</h3>
              </div>
              <div className={styles['hours-list']}>
                {businessHours.map((item, index) => (
                  <div key={index} className={styles['hours-item']}>
                    <span className={styles['hours-day']}>{item.day}</span>
                    <span className={styles['hours-time']}>{item.hours}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Location Hint */}
            <div className={`${styles['info-card']} reveal`} style={{ ['--delay' as string]: '0.4s' }}>
              <div className={styles['info-card-header']}>
                <MapPin size={24} />
                <h3>{translateToHebrew('Visit Us')}</h3>
              </div>
              <p className={styles['info-text']}>
                {translateToHebrew('Find our juice bars across multiple locations. Fresh juices and smoothies await you!')}
              </p>
              <a href="/locations" className={styles['info-link']}>
                {translateToHebrew('View All Locations')}
                <ArrowRight size={16} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
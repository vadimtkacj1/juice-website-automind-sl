'use client';

import { useState, useEffect } from 'react';
import { Mail, Phone, MessageSquare, Clock, MapPin, ArrowRight } from 'lucide-react';
import HeroSection from '@/components/HeroSection';
import { translateToHebrew } from '@/lib/translations';
import styles from './contact.module.css';

interface Contact {
  id: number;
  type: string;
  value: string;
  label?: string;
  description?: string;
}

interface BusinessHour {
  id: number;
  day_of_week: string;
  open_time: string;
  close_time: string;
  is_active: boolean;
}

interface BusinessHourDisplay {
  day: string;
  hours: string;
}

export default function ContactPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [businessHours, setBusinessHours] = useState<BusinessHourDisplay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      await Promise.all([fetchContacts(), fetchBusinessHours()]);
      if (!cancelled) setLoading(false);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (loading) return;

    const revealElements = document.querySelectorAll('.reveal');
    if (revealElements.length === 0) return;

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

    const timer = window.setTimeout(() => {
      revealElements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight) {
          el.classList.add('active');
        }
      });
    }, 100);

    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
    };
  }, [loading, contacts.length, businessHours.length]);

  async function fetchContacts() {
    try {
      const response = await fetch('/api/contacts');
      if (response.ok) {
        const data = await response.json();
        setContacts(data.contacts || []);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  }

  async function fetchBusinessHours() {
    try {
      const response = await fetch('/api/business-hours');
      if (response.ok) {
        const data = await response.json();
        // Filter only active hours and format them
        const activeHours = (data.businessHours || [])
          .filter((bh: BusinessHour) => bh.is_active)
          .map((bh: BusinessHour) => ({
            day: bh.day_of_week,
            hours: `${formatTime(bh.open_time)} - ${formatTime(bh.close_time)}`
          }));
        setBusinessHours(activeHours);
      }
    } catch (error) {
      console.error('Error fetching business hours:', error);
    }
  }

  function formatTime(time: string): string {
    // Convert 24h format to 12h format
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  }

  function getContactLabel(contact: Contact): string {
    if (contact.label) return contact.label;
    // Fallback to default labels
    switch (contact.type.toLowerCase()) {
      case 'email':
        return 'Email Us';
      case 'phone':
        return 'Call Us';
      case 'whatsapp':
        return 'WhatsApp';
      case 'address':
        return 'Visit Us';
      default:
        return 'Contact Us';
    }
  }

  function getContactDescription(contact: Contact): string {
    if (contact.description) return contact.description;
    // Fallback to default descriptions
    switch (contact.type.toLowerCase()) {
      case 'email':
        return "We'll respond within 24 hours";
      case 'phone':
        return 'Mon-Fri, 8AM-6PM';
      case 'whatsapp':
        return 'Chat with us anytime';
      case 'address':
        return 'Our location';
      default:
        return 'Get in touch with us';
    }
  }

  const getContactIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'email':
        return <Mail size={24} />;
      case 'phone':
        return <Phone size={24} />;
      case 'whatsapp':
        return <MessageSquare size={24} />;
      case 'address':
        return <MapPin size={24} />;
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
      case 'address':
        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(value)}`;
      default:
        return '#';
    }
  };

  // Разделим контакты по типам для особого отображения
  const phoneContact = contacts.find(c => c.type.toLowerCase() === 'phone');
  const addressContact = contacts.find(c => c.type.toLowerCase() === 'address');
  const otherContacts = contacts.filter(c => 
    c.type.toLowerCase() !== 'phone' && c.type.toLowerCase() !== 'address'
  );

  return (
    <div className={styles['contact-page']}>
      <HeroSection showFloatingOranges={true}>
        <h1 className="hero-title">{translateToHebrew('Contact Us')}</h1>
        <p className="hero-subtitle">{translateToHebrew("Have a question or feedback? We'd love to hear from you!")}</p>
      </HeroSection>

      {/* Main Content */}
      <div className={styles['contact-content']}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <p style={{ fontSize: '18px', color: '#70758c' }}>{translateToHebrew('Loading contacts...')}</p>
          </div>
        ) : (
          <>
            {/* Главные контакты: Телефон и Адрес */}
            {(phoneContact || addressContact) && (
              <section className={`${styles['main-contacts']} reveal`}>
                {phoneContact && (
                  <a
                    href={getContactLink(phoneContact.type, phoneContact.value)}
                    className={`${styles['main-contact-card']} ${styles['phone-card']}`}
                    style={{ ['--delay' as string]: '0.1s' }}
                  >
                    <div className={styles['main-contact-icon']}>
                      <Phone size={32} />
                    </div>
                    <div className={styles['main-contact-info']}>
                      <h2>{translateToHebrew(phoneContact.label || 'Call Us')}</h2>
                      <p className={styles['main-contact-value']}>{phoneContact.value}</p>
                      {phoneContact.description && (
                        <p className={styles['main-contact-desc']}>{translateToHebrew(phoneContact.description)}</p>
                      )}
                    </div>
                  </a>
                )}
                
                {addressContact && (
                  <a
                    href={getContactLink(addressContact.type, addressContact.value)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${styles['main-contact-card']} ${styles['address-card']}`}
                    style={{ ['--delay' as string]: '0.2s' }}
                  >
                    <div className={styles['main-contact-icon']}>
                      <MapPin size={32} />
                    </div>
                    <div className={styles['main-contact-info']}>
                      <h2>{translateToHebrew(addressContact.label || 'Visit Us')}</h2>
                      <p className={styles['main-contact-value']}>{addressContact.value}</p>
                      {addressContact.description && (
                        <p className={styles['main-contact-desc']}>{translateToHebrew(addressContact.description)}</p>
                      )}
                    </div>
                  </a>
                )}
              </section>
            )}

            {/* Остальные контакты */}
            {otherContacts.length > 0 && (
              <section className={`${styles['contact-cards']} reveal`} style={{ ['--delay' as string]: '0.3s' }}>
                {otherContacts.map((contact, index) => (
                  <a
                    key={contact.id}
                    href={getContactLink(contact.type, contact.value)}
                    target={contact.type === 'whatsapp' ? '_blank' : undefined}
                    rel={contact.type === 'whatsapp' ? 'noopener noreferrer' : undefined}
                    className={styles['contact-card']}
                    style={{ ['--delay' as string]: `${0.3 + 0.1 * (index + 1)}s` }}
                  >
                    <div className={styles['contact-card-icon']}>
                      {getContactIcon(contact.type)}
                    </div>
                    <div className={styles['contact-card-info']}>
                      <h3>{translateToHebrew(contact.label || getContactLabel(contact))}</h3>
                      <p className={styles['contact-card-value']}>{contact.value}</p>
                      {contact.description && (
                        <p className={styles['contact-card-desc']}>{translateToHebrew(contact.description)}</p>
                      )}
                    </div>
                    <ArrowRight size={20} className={styles['contact-card-arrow']} />
                  </a>
                ))}
              </section>
            )}

            {/* Info Cards Grid */}
            <div className={styles['info-cards-grid']}>
              {/* Business Hours */}
              {businessHours.length > 0 && (
                <div className={`${styles['info-card']} ${styles['info-card-large']} reveal`} style={{ ['--delay' as string]: '0.5s' }}>
                  <div className={styles['info-card-header']}>
                    <Clock size={24} />
                    <h3>{translateToHebrew('Business Hours')}</h3>
                  </div>
                  <div className={styles['hours-list']}>
                    {businessHours.map((item, index) => (
                      <div key={index} className={styles['hours-item']}>
                        <span className={styles['hours-day']}>{translateToHebrew(item.day)}</span>
                        <span className={styles['hours-time']}>{item.hours}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Location Hint */}
              <div className={`${styles['info-card']} ${styles['info-card-large']} reveal`} style={{ ['--delay' as string]: '0.6s' }}>
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
          </>
        )}
      </div>
    </div>
  );
}
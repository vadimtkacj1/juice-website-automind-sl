'use client';

import HeroSection from '@/components/HeroSection';
import { translateToHebrew } from '@/lib/translations';

export default function PrivacyPolicyPage() {
  return (
    <div className="legal-page">
      <HeroSection backgroundImage="https://images.unsplash.com/photo-1628178652615-3974c5d63f03?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1ODc1M3wxfDB8c2VhcjI2Mnx8anVpY2UlMjBiYXJ8ZW58MHx8fHwxNzA5NDc0NDcxfDA&ixlib=rb-4.0.3&q=80&w=1080">
        <h1 className="hero-title">{translateToHebrew('Privacy Policy')}</h1>
      </HeroSection>

      <div className="legal-content" dir="rtl">
        <div className="container">
          <div className="legal-section">
            <p className="last-updated">{translateToHebrew('Last Updated:')} {new Date().toLocaleDateString('he-IL', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

            <section>
              <h2>1. {translateToHebrew('Introduction')}</h2>
              <p>
                {translateToHebrew('Welcome to REVIVA ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.')}
              </p>
              <p>
                {translateToHebrew('Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.')}
              </p>
            </section>

            <section>
              <h2>2. {translateToHebrew('Information We Collect')}</h2>
              
              <h3>2.1 {translateToHebrew('Information You Provide to Us')}</h3>
              <p>{translateToHebrew('We collect information that you provide directly to us, including:')}</p>
              <ul>
                <li><strong>{translateToHebrew('Personal Information:')}</strong> {translateToHebrew('Name, email address, phone number, and shipping address when you place an order')}</li>
                <li><strong>{translateToHebrew('Payment Information:')}</strong> {translateToHebrew('Payment card details processed through our secure payment gateway (we do not store full card details)')}</li>
                <li><strong>{translateToHebrew('Account Information:')}</strong> {translateToHebrew('Username and password for admin accounts')}</li>
                <li><strong>{translateToHebrew('Communication Data:')}</strong> {translateToHebrew('Messages, feedback, and correspondence you send to us')}</li>
              </ul>

              <h3>2.2 {translateToHebrew('Information Automatically Collected')}</h3>
              <p>{translateToHebrew('When you visit our website, we automatically collect certain information, including:')}</p>
              <ul>
                <li><strong>{translateToHebrew('Usage Data:')}</strong> {translateToHebrew('Pages visited, time spent on pages, click patterns, and navigation paths')}</li>
                <li><strong>{translateToHebrew('Device Information:')}</strong> {translateToHebrew('IP address, browser type, device type, operating system, and screen resolution')}</li>
                <li><strong>{translateToHebrew('Cookies and Tracking Technologies:')}</strong> {translateToHebrew('We use cookies to enhance your experience and analyze site usage')}</li>
              </ul>
            </section>

            <section>
              <h2>3. {translateToHebrew('How We Use Your Information')}</h2>
              <p>{translateToHebrew('We use the information we collect for the following purposes:')}</p>
              <ul>
                <li>{translateToHebrew('To process and fulfill your orders')}</li>
                <li>{translateToHebrew('To communicate with you about your orders, account, and our services')}</li>
                <li>{translateToHebrew('To send you marketing communications (with your consent)')}</li>
                <li>{translateToHebrew('To improve our website, products, and services')}</li>
                <li>{translateToHebrew('To prevent fraud and ensure security')}</li>
                <li>{translateToHebrew('To comply with legal obligations')}</li>
                <li>{translateToHebrew('To respond to your inquiries and provide customer support')}</li>
              </ul>
            </section>

            <section>
              <h2>4. {translateToHebrew('Information Sharing and Disclosure')}</h2>
              <p>{translateToHebrew('We do not sell your personal information. We may share your information in the following circumstances:')}</p>
              <ul>
                <li><strong>{translateToHebrew('Service Providers:')}</strong> {translateToHebrew('With third-party service providers who perform services on our behalf (payment processing, shipping, analytics)')}</li>
                <li><strong>{translateToHebrew('Legal Requirements:')}</strong> {translateToHebrew('When required by law or to protect our rights and safety')}</li>
                <li><strong>{translateToHebrew('Business Transfers:')}</strong> {translateToHebrew('In connection with a merger, acquisition, or sale of assets')}</li>
                <li><strong>{translateToHebrew('With Your Consent:')}</strong> {translateToHebrew('When you have given us explicit permission to share your information')}</li>
              </ul>
            </section>

            <section>
              <h2>5. {translateToHebrew('Data Security')}</h2>
              <p>
                {translateToHebrew('We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.')}
              </p>
            </section>

            <section>
              <h2>6. {translateToHebrew('Your Rights and Choices')}</h2>
              <p>{translateToHebrew('You have the following rights regarding your personal information:')}</p>
              <ul>
                <li><strong>{translateToHebrew('Access:')}</strong> {translateToHebrew('Request access to your personal information')}</li>
                <li><strong>{translateToHebrew('Correction:')}</strong> {translateToHebrew('Request correction of inaccurate or incomplete information')}</li>
                <li><strong>{translateToHebrew('Deletion:')}</strong> {translateToHebrew('Request deletion of your personal information')}</li>
                <li><strong>{translateToHebrew('Opt-Out:')}</strong> {translateToHebrew('Unsubscribe from marketing communications')}</li>
                <li><strong>{translateToHebrew('Data Portability:')}</strong> {translateToHebrew('Request a copy of your data in a portable format')}</li>
              </ul>
              <p>{translateToHebrew('To exercise these rights, please contact us using the information provided in the "Contact Us" section.')}</p>
            </section>

            <section>
              <h2>7. {translateToHebrew('Cookies and Tracking Technologies')}</h2>
              <p>
                {translateToHebrew('We use cookies and similar tracking technologies to track activity on our website and store certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our website.')}
              </p>
            </section>

            <section>
              <h2>8. {translateToHebrew('Children\'s Privacy')}</h2>
              <p>
                {translateToHebrew('Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.')}
              </p>
            </section>

            <section>
              <h2>9. {translateToHebrew('International Data Transfers')}</h2>
              <p>
                {translateToHebrew('Your information may be transferred to and maintained on computers located outside of your state, province, country, or other governmental jurisdiction where data protection laws may differ. By using our services, you consent to the transfer of your information to these facilities.')}
              </p>
            </section>

            <section>
              <h2>10. {translateToHebrew('Changes to This Privacy Policy')}</h2>
              <p>
                {translateToHebrew('We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes.')}
              </p>
            </section>

            <section>
              <h2>11. {translateToHebrew('Contact Us')}</h2>
              <p>{translateToHebrew('If you have any questions about this Privacy Policy, please contact us:')}</p>
              <ul>
                <li><strong>{translateToHebrew('Email:')}</strong> privacy@reviva.com</li>
                <li><strong>{translateToHebrew('Phone:')}</strong> +972 50-123-4567</li>
                <li><strong>{translateToHebrew('Address:')}</strong> [Your Business Address]</li>
              </ul>
            </section>
          </div>
        </div>
      </div>

      <style jsx>{`
        .legal-page {
          min-height: 100vh;
        }

        .legal-content {
          padding: 80px 20px;
          background: #f8f9fa;
        }

        .container {
          max-width: 900px;
          margin: 0 auto;
        }

        .legal-section {
          background: white;
          padding: 60px;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
        }

        .last-updated {
          color: #70758c;
          font-size: 14px;
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 1px solid #eaedf6;
        }

        .legal-section section {
          margin-bottom: 40px;
        }

        .legal-section h2 {
          font-family: "Heebo", sans-serif;
          font-weight: 800;
          font-size: 28px;
          color: #1d1a40;
          margin: 0 0 20px 0;
          line-height: 1.3;
        }

        .legal-section h3 {
          font-family: "Heebo", sans-serif;
          font-weight: 700;
          font-size: 20px;
          color: #1d1a40;
          margin: 24px 0 12px 0;
        }

        .legal-section p {
          font-size: 16px;
          line-height: 1.8;
          color: #1d1a40;
          margin: 0 0 16px 0;
        }

        .legal-section ul {
          margin: 16px 0;
          padding-left: 24px;
        }

        .legal-section li {
          font-size: 16px;
          line-height: 1.8;
          color: #1d1a40;
          margin-bottom: 12px;
        }

        .legal-section strong {
          font-weight: 700;
          color: #7322ff;
        }

        @media (max-width: 768px) {
          .legal-content {
            padding: 40px 16px;
          }

          .legal-section {
            padding: 40px 24px;
          }

          .legal-section h2 {
            font-size: 24px;
          }

          .legal-section h3 {
            font-size: 18px;
          }

          .legal-section p,
          .legal-section li {
            font-size: 15px;
          }
        }
      `}</style>
    </div>
  );
}


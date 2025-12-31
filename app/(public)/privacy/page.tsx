'use client';

import HeroSection from '@/components/HeroSection';

export default function PrivacyPolicyPage() {
  return (
    <div className="legal-page">
      <HeroSection backgroundImage="https://images.unsplash.com/photo-1628178652615-3974c5d63f03?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1ODc1M3wxfDB8c2VhcjI2Mnx8anVpY2UlMjBiYXJ8ZW58MHx8fHwxNzA5NDc0NDcxfDA&ixlib=rb-4.0.3&q=80&w=1080">
        <h1 className="hero-title">Privacy Policy</h1>
      </HeroSection>

      <div className="legal-content">
        <div className="container">
          <div className="legal-section">
            <p className="last-updated">Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

            <section>
              <h2>1. Introduction</h2>
              <p>
                Welcome to REVIVA ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
              </p>
              <p>
                Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
              </p>
            </section>

            <section>
              <h2>2. Information We Collect</h2>
              
              <h3>2.1 Information You Provide to Us</h3>
              <p>We collect information that you provide directly to us, including:</p>
              <ul>
                <li><strong>Personal Information:</strong> Name, email address, phone number, and shipping address when you place an order</li>
                <li><strong>Payment Information:</strong> Payment card details processed through our secure payment gateway (we do not store full card details)</li>
                <li><strong>Account Information:</strong> Username and password for admin accounts</li>
                <li><strong>Communication Data:</strong> Messages, feedback, and correspondence you send to us</li>
              </ul>

              <h3>2.2 Information Automatically Collected</h3>
              <p>When you visit our website, we automatically collect certain information, including:</p>
              <ul>
                <li><strong>Usage Data:</strong> Pages visited, time spent on pages, click patterns, and navigation paths</li>
                <li><strong>Device Information:</strong> IP address, browser type, device type, operating system, and screen resolution</li>
                <li><strong>Cookies and Tracking Technologies:</strong> We use cookies to enhance your experience and analyze site usage</li>
              </ul>
            </section>

            <section>
              <h2>3. How We Use Your Information</h2>
              <p>We use the information we collect for the following purposes:</p>
              <ul>
                <li>To process and fulfill your orders</li>
                <li>To communicate with you about your orders, account, and our services</li>
                <li>To send you marketing communications (with your consent)</li>
                <li>To improve our website, products, and services</li>
                <li>To prevent fraud and ensure security</li>
                <li>To comply with legal obligations</li>
                <li>To respond to your inquiries and provide customer support</li>
              </ul>
            </section>

            <section>
              <h2>4. Information Sharing and Disclosure</h2>
              <p>We do not sell your personal information. We may share your information in the following circumstances:</p>
              <ul>
                <li><strong>Service Providers:</strong> With third-party service providers who perform services on our behalf (payment processing, shipping, analytics)</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
                <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                <li><strong>With Your Consent:</strong> When you have given us explicit permission to share your information</li>
              </ul>
            </section>

            <section>
              <h2>5. Data Security</h2>
              <p>
                We implement appropriate technical and organizational security measures to protect your personal information against 
                unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or 
                electronic storage is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2>6. Your Rights and Choices</h2>
              <p>You have the following rights regarding your personal information:</p>
              <ul>
                <li><strong>Access:</strong> Request access to your personal information</li>
                <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                <li><strong>Opt-Out:</strong> Unsubscribe from marketing communications</li>
                <li><strong>Data Portability:</strong> Request a copy of your data in a portable format</li>
              </ul>
              <p>To exercise these rights, please contact us using the information provided in the "Contact Us" section.</p>
            </section>

            <section>
              <h2>7. Cookies and Tracking Technologies</h2>
              <p>
                We use cookies and similar tracking technologies to track activity on our website and store certain information. 
                You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you 
                do not accept cookies, you may not be able to use some portions of our website.
              </p>
            </section>

            <section>
              <h2>8. Children's Privacy</h2>
              <p>
                Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information 
                from children. If you are a parent or guardian and believe your child has provided us with personal information, 
                please contact us immediately.
              </p>
            </section>

            <section>
              <h2>9. International Data Transfers</h2>
              <p>
                Your information may be transferred to and maintained on computers located outside of your state, province, country, 
                or other governmental jurisdiction where data protection laws may differ. By using our services, you consent to 
                the transfer of your information to these facilities.
              </p>
            </section>

            <section>
              <h2>10. Changes to This Privacy Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy 
                Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically 
                for any changes.
              </p>
            </section>

            <section>
              <h2>11. Contact Us</h2>
              <p>If you have any questions about this Privacy Policy, please contact us:</p>
              <ul>
                <li><strong>Email:</strong> privacy@reviva.com</li>
                <li><strong>Phone:</strong> +972 50-123-4567</li>
                <li><strong>Address:</strong> [Your Business Address]</li>
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
          font-family: "Archivo", sans-serif;
          font-weight: 800;
          font-size: 28px;
          color: #1d1a40;
          margin: 0 0 20px 0;
          line-height: 1.3;
        }

        .legal-section h3 {
          font-family: "Archivo", sans-serif;
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


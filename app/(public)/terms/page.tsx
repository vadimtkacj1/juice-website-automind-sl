'use client';

import HeroSection from '@/components/HeroSection';

export default function TermsAndConditionsPage() {
  return (
    <div className="legal-page">
      <HeroSection backgroundImage="https://images.unsplash.com/photo-1628178652615-3974c5d63f03?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1ODc1M3wxfDB8c2VhcjI2Mnx8anVpY2UlMjBiYXJ8ZW58MHx8fHwxNzA5NDc0NDcxfDA&ixlib=rb-4.0.3&q=80&w=1080">
        <h1 className="hero-title">Terms and Conditions</h1>
      </HeroSection>

      <div className="legal-content">
        <div className="container">
          <div className="legal-section">
            <p className="last-updated">Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

            <section>
              <h2>1. Acceptance of Terms</h2>
              <p>
                By accessing and using the REVIVA website and services, you accept and agree to be bound by the terms and provision 
                of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h2>2. Use License</h2>
              <p>
                Permission is granted to temporarily access the materials on REVIVA's website for personal, non-commercial transitory 
                viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul>
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose or for any public display</li>
                <li>Attempt to reverse engineer any software contained on the website</li>
                <li>Remove any copyright or other proprietary notations from the materials</li>
                <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
              </ul>
            </section>

            <section>
              <h2>3. Orders and Payment</h2>
              
              <h3>3.1 Order Acceptance</h3>
              <p>
                All orders are subject to acceptance by REVIVA. We reserve the right to refuse or cancel any order for any reason, 
                including but not limited to product availability, errors in pricing or product information, or suspected fraud.
              </p>

              <h3>3.2 Pricing</h3>
              <p>
                All prices are displayed in the currency specified on the website. Prices are subject to change without notice. 
                We reserve the right to correct any pricing errors, even after an order has been placed.
              </p>

              <h3>3.3 Payment</h3>
              <p>
                Payment must be made at the time of order. We accept payment through our secure payment gateway. By providing payment 
                information, you represent and warrant that you are authorized to use the payment method provided.
              </p>

              <h3>3.4 Order Confirmation</h3>
              <p>
                You will receive an order confirmation email once your order has been received. This confirmation does not constitute 
                acceptance of your order, but merely confirms that we have received it.
              </p>
            </section>

            <section>
              <h2>4. Products and Services</h2>
              
              <h3>4.1 Product Availability</h3>
              <p>
                We strive to maintain accurate inventory information, but we cannot guarantee that all products will be available at 
                all times. If a product becomes unavailable after you place an order, we will notify you and provide a refund or alternative.
              </p>

              <h3>4.2 Product Descriptions</h3>
              <p>
                We attempt to be as accurate as possible in product descriptions. However, we do not warrant that product descriptions 
                or other content on this site is accurate, complete, reliable, current, or error-free.
              </p>

              <h3>4.3 Customization</h3>
              <p>
                Customized products (including ingredients, volumes, and addons) are prepared according to your specifications. 
                Once an order is placed, changes may not be possible. Please review your order carefully before confirming.
              </p>
            </section>

            <section>
              <h2>5. Delivery and Shipping</h2>
              
              <h3>5.1 Delivery Areas</h3>
              <p>
                We deliver to the areas specified on our website. Delivery times are estimates and not guaranteed. We are not liable 
                for delays caused by circumstances beyond our control.
              </p>

              <h3>5.2 Delivery Charges</h3>
              <p>
                Delivery charges, if applicable, will be displayed at checkout. These charges are in addition to the product price.
              </p>

              <h3>5.3 Risk of Loss</h3>
              <p>
                All items purchased from REVIVA are made pursuant to a shipment contract. The risk of loss and title for such items 
                pass to you upon delivery to the carrier.
              </p>
            </section>

            <section>
              <h2>6. Returns and Refunds</h2>
              
              <h3>6.1 Return Policy</h3>
              <p>
                Due to the perishable nature of our products, returns are generally not accepted. However, if you receive a damaged 
                or incorrect item, please contact us within 24 hours of delivery.
              </p>

              <h3>6.2 Refunds</h3>
              <p>
                Refunds will be processed to the original payment method within 5-10 business days. We reserve the right to refuse 
                refunds if we determine that the product was not defective or incorrectly delivered.
              </p>

              <h3>6.3 Cancellations</h3>
              <p>
                Orders may be cancelled before preparation begins. Once preparation has started, cancellations may not be possible. 
                Contact us immediately if you need to cancel an order.
              </p>
            </section>

            <section>
              <h2>7. User Accounts</h2>
              <p>
                If you create an account on our website, you are responsible for maintaining the confidentiality of your account 
                and password. You agree to accept responsibility for all activities that occur under your account.
              </p>
            </section>

            <section>
              <h2>8. Prohibited Uses</h2>
              <p>You may not use our website:</p>
              <ul>
                <li>In any way that violates any applicable law or regulation</li>
                <li>To transmit any malicious code or viruses</li>
                <li>To impersonate or attempt to impersonate the company or any employee</li>
                <li>To engage in any automated use of the system</li>
                <li>To interfere with or disrupt the website or servers</li>
                <li>To collect or track personal information of others</li>
              </ul>
            </section>

            <section>
              <h2>9. Intellectual Property</h2>
              <p>
                All content on this website, including text, graphics, logos, images, and software, is the property of REVIVA or its 
                content suppliers and is protected by copyright, trademark, and other intellectual property laws.
              </p>
            </section>

            <section>
              <h2>10. Limitation of Liability</h2>
              <p>
                To the fullest extent permitted by law, REVIVA shall not be liable for any indirect, incidental, special, consequential, 
                or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, 
                use, goodwill, or other intangible losses resulting from your use of our services.
              </p>
            </section>

            <section>
              <h2>11. Indemnification</h2>
              <p>
                You agree to defend, indemnify, and hold harmless REVIVA and its officers, directors, employees, and agents from and 
                against any claims, liabilities, damages, losses, and expenses, including reasonable attorney's fees, arising out of 
                or in any way connected with your use of our services or violation of these Terms.
              </p>
            </section>

            <section>
              <h2>12. Governing Law</h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction], without regard to 
                its conflict of law provisions. Any disputes arising under or in connection with these Terms shall be subject to the 
                exclusive jurisdiction of the courts of [Your Jurisdiction].
              </p>
            </section>

            <section>
              <h2>13. Changes to Terms</h2>
              <p>
                We reserve the right to modify these Terms at any time. We will notify users of any material changes by posting the 
                new Terms on this page and updating the "Last Updated" date. Your continued use of our services after such changes 
                constitutes acceptance of the new Terms.
              </p>
            </section>

            <section>
              <h2>14. Contact Information</h2>
              <p>If you have any questions about these Terms and Conditions, please contact us:</p>
              <ul>
                <li><strong>Email:</strong> legal@reviva.com</li>
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


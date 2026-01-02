'use client';

import HeroSection from '@/components/HeroSection';
import { translateToHebrew } from '@/lib/translations';
import styles from './terms.module.css';

export default function TermsAndConditionsPage() {
  return (
    <div className={styles['legal-page']}>
      <HeroSection backgroundImage="https://images.unsplash.com/photo-1628178652615-3974c5d63f03?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1ODc1M3wxfDB8c2VhcjI2Mnx8anVpY2UlMjBiYXJ8ZW58MHx8fHwxNzA5NDc0NDcxfDA&ixlib=rb-4.0.3&q=80&w=1080">
        <h1 className="hero-title">{translateToHebrew('Terms and Conditions')}</h1>
      </HeroSection>

      <div className={styles['legal-content']} dir="rtl">
        <div className={styles.container}>
          <div className={styles['legal-section']}>
            <p className={styles['last-updated']}>{translateToHebrew('Last Updated:')} {new Date().toLocaleDateString('he-IL', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

            <section>
              <h2>1. {translateToHebrew('Acceptance of Terms')}</h2>
              <p>
                {translateToHebrew('By accessing and using the REVIVA website and services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.')}
              </p>
            </section>

            <section>
              <h2>2. {translateToHebrew('Use License')}</h2>
              <p>
                {translateToHebrew('Permission is granted to temporarily access the materials on REVIVA\'s website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:')}
              </p>
              <ul>
                <li>{translateToHebrew('Modify or copy the materials')}</li>
                <li>{translateToHebrew('Use the materials for any commercial purpose or for any public display')}</li>
                <li>{translateToHebrew('Attempt to reverse engineer any software contained on the website')}</li>
                <li>{translateToHebrew('Remove any copyright or other proprietary notations from the materials')}</li>
                <li>{translateToHebrew('Transfer the materials to another person or "mirror" the materials on any other server')}</li>
              </ul>
            </section>

            <section>
              <h2>3. {translateToHebrew('Orders and Payment')}</h2>
              
              <h3>3.1 {translateToHebrew('Order Acceptance')}</h3>
              <p>
                {translateToHebrew('All orders are subject to acceptance by REVIVA. We reserve the right to refuse or cancel any order for any reason, including but not limited to product availability, errors in pricing or product information, or suspected fraud.')}
              </p>

              <h3>3.2 {translateToHebrew('Pricing')}</h3>
              <p>
                {translateToHebrew('All prices are displayed in the currency specified on the website. Prices are subject to change without notice. We reserve the right to correct any pricing errors, even after an order has been placed.')}
              </p>

              <h3>3.3 {translateToHebrew('Payment')}</h3>
              <p>
                {translateToHebrew('Payment must be made at the time of order. We accept payment through our secure payment gateway. By providing payment information, you represent and warrant that you are authorized to use the payment method provided.')}
              </p>

              <h3>3.4 {translateToHebrew('Order Confirmation')}</h3>
              <p>
                {translateToHebrew('You will receive an order confirmation email once your order has been received. This confirmation does not constitute acceptance of your order, but merely confirms that we have received it.')}
              </p>
            </section>

            <section>
              <h2>4. {translateToHebrew('Products and Services')}</h2>
              
              <h3>4.1 {translateToHebrew('Product Availability')}</h3>
              <p>
                {translateToHebrew('We strive to maintain accurate inventory information, but we cannot guarantee that all products will be available at all times. If a product becomes unavailable after you place an order, we will notify you and provide a refund or alternative.')}
              </p>

              <h3>4.2 {translateToHebrew('Product Descriptions')}</h3>
              <p>
                {translateToHebrew('We attempt to be as accurate as possible in product descriptions. However, we do not warrant that product descriptions or other content on this site is accurate, complete, reliable, current, or error-free.')}
              </p>

              <h3>4.3 {translateToHebrew('Customization')}</h3>
              <p>
                {translateToHebrew('Customized products (including ingredients, volumes, and addons) are prepared according to your specifications. Once an order is placed, changes may not be possible. Please review your order carefully before confirming.')}
              </p>
            </section>

            <section>
              <h2>5. {translateToHebrew('Delivery and Shipping')}</h2>
              
              <h3>5.1 {translateToHebrew('Delivery Areas')}</h3>
              <p>
                {translateToHebrew('We deliver to the areas specified on our website. Delivery times are estimates and not guaranteed. We are not liable for delays caused by circumstances beyond our control.')}
              </p>

              <h3>5.2 {translateToHebrew('Delivery Charges')}</h3>
              <p>
                {translateToHebrew('Delivery charges, if applicable, will be displayed at checkout. These charges are in addition to the product price.')}
              </p>

              <h3>5.3 {translateToHebrew('Risk of Loss')}</h3>
              <p>
                {translateToHebrew('All items purchased from REVIVA are made pursuant to a shipment contract. The risk of loss and title for such items pass to you upon delivery to the carrier.')}
              </p>
            </section>

            <section>
              <h2>6. {translateToHebrew('Returns and Refunds')}</h2>
              
              <h3>6.1 {translateToHebrew('Return Policy')}</h3>
              <p>
                {translateToHebrew('Due to the perishable nature of our products, returns are generally not accepted. However, if you receive a damaged or incorrect item, please contact us within 24 hours of delivery.')}
              </p>

              <h3>6.2 {translateToHebrew('Refunds')}</h3>
              <p>
                {translateToHebrew('Refunds will be processed to the original payment method within 5-10 business days. We reserve the right to refuse refunds if we determine that the product was not defective or incorrectly delivered.')}
              </p>

              <h3>6.3 {translateToHebrew('Cancellations')}</h3>
              <p>
                {translateToHebrew('Orders may be cancelled before preparation begins. Once preparation has started, cancellations may not be possible. Contact us immediately if you need to cancel an order.')}
              </p>
            </section>

            <section>
              <h2>7. {translateToHebrew('User Accounts')}</h2>
              <p>
                {translateToHebrew('If you create an account on our website, you are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.')}
              </p>
            </section>

            <section>
              <h2>8. {translateToHebrew('Prohibited Uses')}</h2>
              <p>{translateToHebrew('You may not use our website:')}</p>
              <ul>
                <li>{translateToHebrew('In any way that violates any applicable law or regulation')}</li>
                <li>{translateToHebrew('To transmit any malicious code or viruses')}</li>
                <li>{translateToHebrew('To impersonate or attempt to impersonate the company or any employee')}</li>
                <li>{translateToHebrew('To engage in any automated use of the system')}</li>
                <li>{translateToHebrew('To interfere with or disrupt the website or servers')}</li>
                <li>{translateToHebrew('To collect or track personal information of others')}</li>
              </ul>
            </section>

            <section>
              <h2>9. {translateToHebrew('Intellectual Property')}</h2>
              <p>
                {translateToHebrew('All content on this website, including text, graphics, logos, images, and software, is the property of REVIVA or its content suppliers and is protected by copyright, trademark, and other intellectual property laws.')}
              </p>
            </section>

            <section>
              <h2>10. {translateToHebrew('Limitation of Liability')}</h2>
              <p>
                {translateToHebrew('To the fullest extent permitted by law, REVIVA shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from your use of our services.')}
              </p>
            </section>

            <section>
              <h2>11. {translateToHebrew('Indemnification')}</h2>
              <p>
                {translateToHebrew('You agree to defend, indemnify, and hold harmless REVIVA and its officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses, including reasonable attorney\'s fees, arising out of or in any way connected with your use of our services or violation of these Terms.')}
              </p>
            </section>

            <section>
              <h2>12. {translateToHebrew('Governing Law')}</h2>
              <p>
                {translateToHebrew('These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction], without regard to its conflict of law provisions. Any disputes arising under or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts of [Your Jurisdiction].')}
              </p>
            </section>

            <section>
              <h2>13. {translateToHebrew('Changes to Terms')}</h2>
              <p>
                {translateToHebrew('We reserve the right to modify these Terms at any time. We will notify users of any material changes by posting the new Terms on this page and updating the "Last Updated" date. Your continued use of our services after such changes constitutes acceptance of the new Terms.')}
              </p>
            </section>

            <section>
              <h2>14. {translateToHebrew('Contact Information')}</h2>
              <p>{translateToHebrew('If you have any questions about these Terms and Conditions, please contact us:')}</p>
              <ul>
                <li><strong>{translateToHebrew('Email:')}</strong> legal@reviva.com</li>
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


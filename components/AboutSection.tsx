'use client';

import React from 'react';
import { Heart, Leaf, Users, Award } from 'lucide-react';

const AboutSection = () => {
  return (
    <section className="about-section">
      <div className="container">
        {/* Who We Are Section */}
        <div className="about-block">
          <div className="about-content">
            <div className="about-text">
              <h2 className="about-title">Who We Are</h2>
              <p className="about-description">
                At Reviva, we are passionate about bringing you the freshest, most nutritious 
                juices crafted from the finest ingredients. Our journey began with a simple 
                mission: to make healthy living accessible and delicious for everyone.
              </p>
              <p className="about-description">
                We source our fruits and vegetables from trusted local farms, ensuring that 
                every bottle of juice is packed with natural vitamins, minerals, and 
                antioxidants. Our team of expert juicemakers carefully blend each recipe to 
                perfection, creating flavors that delight your taste buds while nourishing 
                your body.
              </p>
            </div>
            <div className="about-image-wrapper">
              <div className="about-image-placeholder">
                <Leaf size={64} className="about-icon" />
              </div>
            </div>
          </div>
        </div>

        {/* What We Do Section */}
        <div className="about-block">
          <div className="about-content reverse">
            <div className="about-text">
              <h2 className="about-title">What We Do</h2>
              <p className="about-description">
                We specialize in creating premium, cold-pressed juices that preserve the 
                maximum nutritional value of fresh produce. Our innovative extraction process 
                ensures that every sip delivers the full spectrum of vitamins and enzymes 
                your body needs.
              </p>
              <p className="about-description">
                From revitalizing morning blends to detoxifying green juices, we offer a 
                wide range of flavors to suit every palate and lifestyle. Whether you're 
                looking to boost your energy, support your immune system, or simply enjoy 
                a refreshing drink, we have the perfect juice for you.
              </p>
            </div>
            <div className="about-image-wrapper">
              <div className="about-image-placeholder">
                <Heart size={64} className="about-icon" />
              </div>
            </div>
          </div>
        </div>

        {/* Values Grid */}
        <div className="values-grid">
          <div className="value-card">
            <div className="value-icon-wrapper">
              <Leaf size={32} />
            </div>
            <h3 className="value-title">100% Natural</h3>
            <p className="value-description">
              We use only fresh, organic ingredients with no artificial additives or preservatives.
            </p>
          </div>

          <div className="value-card">
            <div className="value-icon-wrapper">
              <Heart size={32} />
            </div>
            <h3 className="value-title">Health First</h3>
            <p className="value-description">
              Every recipe is designed to support your wellness journey and nourish your body.
            </p>
          </div>

          <div className="value-card">
            <div className="value-icon-wrapper">
              <Users size={32} />
            </div>
            <h3 className="value-title">Community Focused</h3>
            <p className="value-description">
              We're committed to supporting local farmers and building a healthier community.
            </p>
          </div>

          <div className="value-card">
            <div className="value-icon-wrapper">
              <Award size={32} />
            </div>
            <h3 className="value-title">Premium Quality</h3>
            <p className="value-description">
              We maintain the highest standards in every step of our production process.
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .about-section {
          padding: 100px 20px;
          background: var(--white);
        }

        .about-block {
          margin-bottom: 120px;
        }

        .about-block:last-of-type {
          margin-bottom: 80px;
        }

        .about-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
          max-width: 1200px;
          margin: 0 auto;
        }

        .about-content.reverse {
          direction: rtl;
        }

        .about-content.reverse > * {
          direction: ltr;
        }

        .about-text {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .about-title {
          font-family: 'Archivo', sans-serif;
          font-size: clamp(42px, 6vw, 72px);
          font-weight: 900;
          color: var(--dark);
          margin: 0 0 24px 0;
          line-height: 1.1;
        }

        .about-description {
          font-size: 18px;
          line-height: 1.8;
          color: var(--text-gray);
          margin: 0;
        }

        .about-image-wrapper {
          position: relative;
        }

        .about-image-placeholder {
          width: 100%;
          aspect-ratio: 1;
          background: linear-gradient(135deg, var(--secondary) 0%, var(--primary) 100%);
          border-radius: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 20px 60px rgba(115, 34, 255, 0.2);
        }

        .about-icon {
          color: var(--white);
          opacity: 0.9;
        }

        .values-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 32px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .value-card {
          background: var(--gray-bg);
          border-radius: 24px;
          padding: 40px 32px;
          text-align: center;
          transition: all 0.3s var(--spring-ease);
        }

        .value-card:hover {
          transform: translateY(-8px);
          background: var(--secondary);
          box-shadow: 0 12px 40px rgba(29, 26, 64, 0.1);
        }

        .value-icon-wrapper {
          width: 80px;
          height: 80px;
          background: var(--white);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
          color: var(--primary);
          transition: all 0.3s ease;
        }

        .value-card:hover .value-icon-wrapper {
          background: var(--primary);
          color: var(--white);
          transform: scale(1.1);
        }

        .value-title {
          font-family: 'Archivo', sans-serif;
          font-size: 24px;
          font-weight: 900;
          color: var(--dark);
          margin: 0 0 16px 0;
        }

        .value-description {
          font-size: 16px;
          line-height: 1.6;
          color: var(--text-gray);
          margin: 0;
        }

        @media (max-width: 980px) {
          .about-section {
            padding: 80px 16px;
          }

          .about-block {
            margin-bottom: 80px;
          }

          .about-content {
            grid-template-columns: 1fr;
            gap: 40px;
          }

          .about-content.reverse {
            direction: ltr;
          }

          .about-image-placeholder {
            max-width: 400px;
            margin: 0 auto;
          }

          .values-grid {
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 24px;
          }
        }

        @media (max-width: 640px) {
          .about-section {
            padding: 60px 12px;
          }

          .about-block {
            margin-bottom: 60px;
          }

          .about-description {
            font-size: 16px;
          }

          .value-card {
            padding: 32px 24px;
          }
        }
      `}</style>
    </section>
  );
};

export default AboutSection;


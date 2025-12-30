'use client';

import React from 'react';

const NewsSection = () => {
  return (
    <section className="news-section bg-gray-bg rounded-[40px] m-4 md:m-16 py-16 md:py-24">
      <div className="container mx-auto px-4">
        <h2 className="section-title text-dark mb-16">Latest News</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Example News Item 1 */}
          <div className="news-card bg-white rounded-[30px] shadow-md overflow-hidden relative transition-all duration-300 ease-in-out hover:translate-y-[-10px] hover:shadow-lg">
            <img src="https://via.placeholder.com/400x250" alt="News Image" className="w-full h-48 object-cover" />
            <div className="p-6">
              <h3 className="font-bold text-xl mb-2 text-dark">Exciting New Flavors!</h3>
              <p className="text-text-gray text-base">Discover our latest seasonal juice blends, crafted with the freshest ingredients.</p>
            </div>
            <div className="absolute top-4 right-4 bg-primary text-white text-xs px-3 py-1 rounded-full font-bold">JAN 15</div>
          </div>

          {/* Example News Item 2 */}
          <div className="news-card bg-white rounded-[30px] shadow-md overflow-hidden relative transition-all duration-300 ease-in-out hover:translate-y-[-10px] hover:shadow-lg">
            <img src="https://via.placeholder.com/400x250" alt="News Image" className="w-full h-48 object-cover" />
            <div className="p-6">
              <h3 className="font-bold text-xl mb-2 text-dark">Juice Website Grand Opening</h3>
              <p className="text-text-gray text-base">Celebrate with us as we launch our brand new website, offering a seamless shopping experience.</p>
            </div>
            <div className="absolute top-4 right-4 bg-primary text-white text-xs px-3 py-1 rounded-full font-bold">FEB 01</div>
          </div>

          {/* Example News Item 3 */}
          <div className="news-card bg-white rounded-[30px] shadow-md overflow-hidden relative transition-all duration-300 ease-in-out hover:translate-y-[-10px] hover:shadow-lg">
            <img src="https://via.placeholder.com/400x250" alt="News Image" className="w-full h-48 object-cover" />
            <div className="p-6">
              <h3 className="font-bold text-xl mb-2 text-dark">Healthy Living Tips</h3>
              <p className="text-text-gray text-base">Check out our blog for expert advice on incorporating fresh juices into your healthy lifestyle.</p>
              <a href="#" className="text-primary hover:text-secondary mt-4 inline-block font-bold">Read More</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsSection;

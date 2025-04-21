// BenefitsSection.tsx
"use client"
import React, { useState } from 'react';

const BenefitsSection: React.FC = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  const benefits = [
    { 
      title: 'Save Time & Effort', 
      description: 'Get immediate self-care guidance without waiting for appointments for common issues.',
      icon: (
        <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    { 
      title: 'Informed Decisions', 
      description: 'Understand your symptoms and learn about appropriate OTC options.',
      icon: (
        <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      )
    },
    { 
      title: 'Personalized Care', 
      description: 'Receive tips and reminders tailored to your health profile.',
      icon: (
        <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ) 
    },
    { 
      title: 'Accessible Knowledge', 
      description: 'Empower yourself with reliable health information anytime, anywhere.',
      icon: (
        <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ) 
    },
  ];

  return (
    <div className="py-[180px] bg-gradient-to-br from-blue-50 via-white to-blue-50 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-full h-full">
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" className="opacity-5">
          <path d="M0,0 L100,0 L100,100 L0,100 Z" fill="none" stroke="#043CAA" strokeWidth="0.5"></path>
          <path d="M0,0 L100,100 M100,0 L0,100" stroke="#043CAA" strokeWidth="0.5"></path>
        </svg>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col items-center mb-16">
          <span className="text-blue-600 font-medium mb-3">ADVANTAGES</span>
          <h2 className="text-4xl md:text-5xl font-bold text-[#043CAA] text-center">
            Why Choose BSDOC?
          </h2>
          <div className="mt-4 w-24 h-1 bg-blue-600 rounded-full"></div>
          <p className="mt-6 text-lg text-gray-600 max-w-2xl text-center">
            Experience a new approach to managing your health with our comprehensive self-care platform.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <div 
              key={index} 
              className="relative overflow-hidden"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className={`h-full bg-white rounded-2xl shadow-lg border-b-4 border-blue-500 p-8 transition-all duration-300 ${hoveredIndex === index ? 'transform -translate-y-2' : ''}`}>
                <div className="mb-6 flex items-center justify-center">
                  <div className="p-3 rounded-full bg-blue-100">
                    {benefit.icon}
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
                  {benefit.title}
                </h3>
                
                <p className="text-gray-600 text-center">
                  {benefit.description}
                </p>
                
                <div className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600 transform transition-transform duration-500 ${hoveredIndex === index ? 'translate-y-0' : 'translate-y-full'}`}></div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-16 bg-blue-100 rounded-2xl p-8 md:p-12">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-8 md:mb-0 md:mr-8">
              <h3 className="text-2xl font-bold text-[#043CAA] mb-4">Ready to take control of your health?</h3>
              <p className="text-gray-700">Join thousands who are already using BSDOC to make better health decisions.</p>
            </div>
            <button className="px-8 py-4 bg-[#043CAA] hover:bg-blue-800 text-white font-medium rounded-full transition-colors duration-300 shadow-lg hover:shadow-xl whitespace-nowrap">
              Sign Up Free
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BenefitsSection;
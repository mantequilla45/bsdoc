// OurServicesSection.tsx
"use client"

import Image from 'next/image';
import React, { useState } from 'react';

interface ServiceItem {
  icon: string;
  title: string;
  description: string;
}

const OurServicesSection: React.FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  
  const services: ServiceItem[] = [
    {
      icon: "/graphics/symptom-checker-icon.svg",
      title: "Symptom Checker",
      description: "Input your symptoms to find the right cure, view search results filtered according to your symptoms, and access visual aids with explanations to better understand your condition."
    },
    {
      icon: "/graphics/personal-ht-icon.svg",
      title: "Personalized Health Tips",
      description: "Receive personalized health and wellness tips based on your profile and symptom history, save and track your health data over time, and get email or SMS notifications for self-care reminders."
    },
    {
      icon: "/graphics/otc-guide-icon.svg",
      title: "OTC Medication Guidance",
      description: "Find the right over-the-counter medications based on your symptoms, access detailed information on their uses, dosages, and precautions, and stay informed about potential drug interactions and contraindications."
    },
  ];

  return (
    <div className="relative bg-gradient-to-b from-blue-50 to-white py-24 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-blue-100 opacity-40 transform -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-blue-100 opacity-30 transform translate-x-1/2 translate-y-1/2"></div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col items-center mb-16">
          <span className="text-blue-600 font-medium mb-3">WHAT WE OFFER</span>
          <h2 className="text-4xl md:text-5xl font-bold text-[#043CAA] text-center">
            Our Services
          </h2>
          <div className="mt-4 w-24 h-1 bg-blue-600 rounded-full"></div>
          <p className="mt-6 text-lg text-gray-600 max-w-2xl text-center">
            Comprehensive health tools designed to guide your well-being journey with confidence and clarity.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="group relative"
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:-translate-y-2 h-full flex flex-col">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-bl-full opacity-20"></div>
                
                <div className="p-8 flex items-center justify-center">
                  <div className="relative w-32 h-32 flex items-center justify-center bg-blue-50 rounded-full">
                    <Image
                      src={service.icon}
                      alt={`${service.title} icon`}
                      width={80}
                      height={80}
                      style={{ objectFit: 'contain' }}
                      quality={100}
                      className="transform transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                </div>
                
                <div className="p-6 flex-grow flex flex-col">
                  <h3 className="text-xl font-bold text-[#043CAA] mb-3">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {service.description}
                  </p>
                  
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <button className="text-blue-600 font-medium flex items-center group-hover:text-blue-800 transition-colors">
                      Learn more
                      <svg className="ml-2 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default OurServicesSection;
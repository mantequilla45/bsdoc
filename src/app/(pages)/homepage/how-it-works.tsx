// HowItWorksSection.tsx
import React from 'react';

const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Describe Your Symptoms',
      description: 'Use our intuitive interface to input the symptoms you are experiencing.',
      color: 'bg-blue-100',
      icon: (
        <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      )
    },
    {
      step: '02',
      title: 'Get Guided Information',
      description: 'Receive potential causes, detailed self-care advice, and OTC medication guidance.',
      color: 'bg-green-100',
      icon: (
        <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      step: '03',
      title: 'Find Relief Safely',
      description: 'Follow personalized tips and instructions to manage your condition effectively at home.',
      color: 'bg-purple-100',
      icon: (
        <svg className="w-12 h-12 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    },
  ];

  return (
    <div className="py-[180px] bg-white relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-1/2 left-0 transform -translate-y-1/2">
        <svg width="320" height="560" viewBox="0 0 320 560" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-5">
          <circle cx="40" cy="280" r="280" fill="#043CAA" />
        </svg>
      </div>
      <div className="absolute top-0 right-0 rotate-90">
        <svg width="400" height="400" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-5">
          <path d="M400 0H0V400C110.457 400 200 310.457 200 200C200 89.543 289.543 0 400 0Z" fill="#043CAA" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col items-center mb-16">
          <span className="text-blue-600 font-medium mb-3">STEP BY STEP</span>
          <h2 className="text-4xl md:text-5xl font-bold text-[#043CAA] text-center">
            How BSDOC Helps You
          </h2>
          <div className="mt-4 w-24 h-1 bg-blue-600 rounded-full"></div>
        </div>

        <div className="relative">
          {/* Connection line */}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            {steps.map((item, index) => (
              <div
                key={index}
                className="relative flex flex-col items-center"
              >
                {/* Number circle */}
                <div className={`flex items-center justify-center w-20 h-20 rounded-full ${item.color} mb-6 relative z-10`}>
                  {item.icon}
                </div>

                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">
                    {item.title}
                  </h3>
                  <p className="text-gray-600">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center mt-16">
          <a href="/search-symptoms">

            <button className="px-8 py-4 bg-[#043CAA] hover:bg-blue-800 text-white font-medium rounded-full transition-colors duration-300 shadow-lg hover:shadow-xl flex items-center">
              Get Started Now
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </a>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksSection;
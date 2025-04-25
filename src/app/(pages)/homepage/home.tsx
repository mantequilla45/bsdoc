"use client"

import Image from 'next/image';
import { useEffect, useState } from 'react';

const HomePage = () => {
  const [offsetY, setOffsetY] = useState(0);
  // Adjust this factor for parallax speed
  const parallaxFactor = 0.3;

  const handleScroll = () => {
    setOffsetY(window.scrollY * parallaxFactor);
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <main className="relative min-h-screen md:px-0 px-[25px]">
      {/* Background wrapper with full coverage */}
      <div className="fixed inset-0 w-full h-screen overflow-hidden z-0">
        {/* Important: This ensures the background is tall enough even during scroll */}
        <div 
          className="absolute inset-0 w-full h-[120vh]" 
          style={{
            top: `-20vh`, // Start image above the viewport
          }}
        >
          <Image
            src="/Images/background/landing-background.png"
            alt="Parallax Landing Background"
            fill
            style={{
              objectFit: 'cover',
              objectPosition: 'center center',
              transform: `translateY(${offsetY}px) scale(1.15)`, // Scale slightly larger for better coverage
              transformOrigin: 'center center',
            }}
            quality={100}
            priority
          />
          {/* Overlay for text readability */}
          <div className="absolute inset-0 bg-black/40" />
        </div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 max-w-[1300px] mx-auto md:min-h-screen h-full flex items-center">
        <div className="flex flex-col md:flex-row gap-10 justify-center w-full md:pb-[30px] md:mt-0 mt-[180px]">
          {/* Left Side Content */}
          <div className="flex flex-col md:w-[60%] justify-center w-full gap-8 md:gap-[50px]">
            <div className="space-y-4 md:space-y-6">
              <h1 className="text-3xl md:text-6xl font-bold text-white text-left">
                Your Personal Guide to Self-Care for Common Ailments
              </h1>
              <p className="text-lg md:text-xl font-light text-white text-left">
                Take control of your health, save time, and find relief at home with BSDOC.
              </p>
            </div>
            <a
              className="bg-white/80 rounded-xl py-4 md:py-7 text-black text-lg md:text-xl flex justify-center items-center cursor-pointer text-center hover:bg-white transition-colors duration-300"
              href="/search-symptoms"
            >
              FIND A CURE
            </a>
          </div>
          
          {/* Doctor Image */}
          <div className="flex items-center justify-center md:w-[40%] ">
            <div className="md:w-[500px] w-[350px] md:h-auto h-[350px] md:max-w-[500px] max-h-[500px] relative rounded-full bg-white/20 backdrop-blur-lg overflow-hidden flex justify-center border-gray-500 border-[1px] pt-8 md:pt-16">
              <Image
                src="/Images/background/doctor.png"
                alt="Hero"
                width={400}
                height={400}
                style={{ objectFit: 'cover' }}
                quality={100}
                className="relative md:w-400px] md:h-[400px] w-[250px] "
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default HomePage;
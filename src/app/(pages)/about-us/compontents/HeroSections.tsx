import Image from "next/image";
import { motion } from "framer-motion";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden py-16 md:py-24 mt-16">
      <div className="container px-6 max-w-[1300px] mx-auto">
        <div className="flex flex-col md:flex-row items-center">
          {/* Left Content */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col w-full md:w-1/2 z-10 mb-12 md:mb-0"
          >
            <div className="w-36 md:w-40">
              <h3 className="border-b-2 border-[#62B6B8] text-xl text-[#62B6B8] pb-1 font-medium">
                About us
              </h3>
            </div>
            <h2 className="text-lg md:text-xl mt-4 text-gray-700">
              Where your Health Meets
            </h2>
            <h1 className="text-4xl md:text-5xl lg:text-6xl text-[#62B6B8] font-bold mt-2 mb-6">
              Innovation
            </h1>
            <div className="text-sm md:text-base text-[#575454] space-y-4 mt-4">
              <p className="leading-relaxed">
                At BSDOC, our mission is to create innovative solutions that simplify and enhance personal health management. We empower individuals with user-friendly tools to manage their health records and receive personalized suggestions for over-the-counter (OTC) medications.
              </p>
              <p className="leading-relaxed">
                We envision a world where everyone has access to efficient, reliable, and easy-to-use health management platforms, leading to better self-care and improved communication with healthcare providers.
              </p>
              <p className="leading-relaxed">
                Founded in 2024, VETT began with the development of the BSDOC project.
                Our initial goal was to create an efficient platform that allows users to input their medical records, document symptoms,
                and receive suggestions for OTC drugs based on their selected symptoms.
              </p>
            </div>
            <button className="mt-8 bg-[#62B6B8] hover:bg-[#4a9294] text-white font-medium py-3 px-8 rounded-lg shadow-md transition duration-300 w-fit">
              Learn More
            </button>
          </motion.div>
         
          {/* Right Image */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full md:w-1/2 relative z-10"
          >
            <div className="relative h-80 md:h-96 lg:h-[500px] w-full">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-[#FFD580] rounded-full opacity-50"></div>
              <Image
                alt="Health Innovation"
                src="/graphics/about.svg"
                fill
                className="object-contain drop-shadow-xl"
                priority
              />
              <div className="absolute -left-4 -bottom-4 w-16 h-16 bg-[#62B6B8] rounded-full opacity-40"></div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
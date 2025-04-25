import Image from "next/image";
import { motion } from "framer-motion";

const WhatWeDoSection = () => {
  const features = [
    {
      title: "Personalized Health Management",
      description: "We provide intuitive tools for users to manage their health records and track symptoms efficiently."
    },
    {
      title: "OTC Medication Suggestions",
      description: "Receive personalized recommendations for over-the-counter medications based on your symptoms and history."
    },
    {
      title: "Simplified Healthcare Process",
      description: "Our platform streamlines health management, making it easier to communicate with healthcare providers."
    }
  ];

  return (
    <section className="py-16 md:py-24 px-6 relative bg-gray-50">
      <div className="container max-w-[1300px] mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col-reverse md:flex-row items-center gap-12"
        >
          {/* Left Image */}
          <div className="w-full md:w-1/2 relative z-10">
            <div className="relative h-80 md:h-96 lg:h-[500px] w-full">
              <div className="absolute left-0 top-0 w-20 h-20 bg-[#62B6B8] rounded-full opacity-30"></div>
              <Image
                alt="What We Do"
                src="/graphics/about2.svg"
                fill
                className="object-contain drop-shadow-lg"
                priority
              />
              <div className="absolute right-4 bottom-4 w-32 h-32 bg-[#FFD580] rounded-full opacity-20"></div>
            </div>
          </div>
         
          {/* Right Content */}
          <div className="w-full md:w-1/2 z-10">
            <h2 className="text-4xl md:text-5xl lg:text-6xl text-[#62B6B8] font-bold mb-8">
              What We Do
            </h2>
            <div className="space-y-6">
              {features.map((feature, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.2 }}
                  className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300"
                >
                  <h3 className="text-xl font-semibold text-[#62B6B8] mb-2">{feature.title}</h3>
                  <p className="text-[#575454]">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default WhatWeDoSection;
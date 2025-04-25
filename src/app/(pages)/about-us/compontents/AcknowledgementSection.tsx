import { motion } from "framer-motion";

const AcknowledgementsSection = () => {
  return (
    <section className="py-16 px-6 md:py-24 bg-gray-50 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#62B6B8] rounded-full opacity-10"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#FFD580] rounded-full opacity-10"></div>
      
      <div className="container max-w-[1000px] mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl text-[#62B6B8] font-bold text-center mb-8">
            Acknowledgements
          </h2>
          
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
            <div className="text-sm md:text-base text-[#575454] space-y-4 leading-relaxed">
              <p>
                We extend our heartfelt gratitude to everyone who has contributed to the development and success of VETT.
              </p>
              <p>
                First and foremost, we thank our dedicated team whose relentless passion, creativity, and hard work have been the driving force behind our innovative health management solutions. Your commitment to excellence and user-centric design has been instrumental in bringing our vision to life.
              </p>
              <p>
                We are also deeply grateful to our early adopters and users. Your valuable feedback, trust, and support have been crucial in refining our platform and ensuring it meets the highest standards of usability and effectiveness.
              </p>
              <p>
                Special thanks go to our partners and advisors for their unwavering guidance and expertise. Your insights and collaboration have been invaluable in navigating the challenges and opportunities in the healthcare technology landscape.
              </p>
              <p className="font-medium text-[#62B6B8]">
                Our deepest gratitude to Jhana Marie for motivating, inspiring, being the root of this project, and for being the most beautiful girl in the world. BSDOC wouldn&apos;t exist without you.
              </p>
              <p>
                Lastly, we acknowledge the support of our families and friends. Your encouragement and understanding have been the foundation of our perseverance and success.
              </p>
              <p className="italic">
                Thank you to everyone who has been part of this journey. We look forward to continuing our mission of revolutionizing personal health management together.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
 
export default AcknowledgementsSection;
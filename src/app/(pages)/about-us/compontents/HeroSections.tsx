import Image from "next/image";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden py-24 mt-16">
      {/* Background Circle - hidden on mobile, positioned better on larger screens */}
      
      <div className="container px-6 max-w-[1300px] mx-auto">
        <div className="flex flex-col md:flex-row items-center">
          {/* Left Content */}
          <div className="flex flex-col w-full md:w-1/2 z-10 mb-12 md:mb-0">
            <div className="w-36 md:w-40">
              <h3 className="border-b-2 border-[#62B6B8] text-xl text-[#62B6B8] pb-1">
                About us
              </h3>
            </div>

            <h2 className="text-lg md:text-xl mt-4">
              Where your Health Meets
            </h2>
            <h1 className="text-4xl md:text-5xl lg:text-6xl text-[#62B6B8] font-bold mt-2">
              Innovation
            </h1>
            <div className="text-sm md:text-base text-[#575454] space-y-4 mt-6">
              <p>
                At BSDOC, our mission is to create innovative solutions that simplify and enhance personal health management. We aim to empower individuals with user-friendly tools to manage their health records and receive personalized suggestions for over-the-counter (OTC) medications. We envision a world where everyone has access to efficient, reliable, and easy-to-use health management platforms, leading to better self-care and improved communication with healthcare providers.
              </p>
              <p>
                Founded in 2024, VETT began with the development of the BSDOC project.
                Our initial goal was to create an efficient and user-friendly platform that allows users to input their medical records, document symptoms,
                and receive suggestions for OTC drugs and dosages based on their selected symptoms. Over time, we have expanded our offerings and improved
                our platform to better serve our users&apos; needs.
              </p>
            </div>
          </div>
          
          {/* Right Image */}
          <div className="w-full md:w-1/2 relative z-10">
            <div className="relative h-80 md:h-96 lg:h-[500px] w-full">
              <Image 
                alt="About"
                src="/graphics/about.svg"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
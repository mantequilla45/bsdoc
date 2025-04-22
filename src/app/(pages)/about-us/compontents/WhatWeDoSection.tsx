import Image from "next/image";

const WhatWeDoSection = () => {
  return (
    <section className="py-12 px-6 md:py-24 relative">
      <div className="container max-w-[1300px] mx-auto">
        <div className="flex flex-col-reverse md:flex-row items-center">
          {/* Left Image */}
          <div className="w-full md:w-1/2 relative z-10 mt-10 md:mt-0">
            <div className="relative h-80 md:h-96 lg:h-[500px] w-full">
              <Image 
                alt="What We Do"
                src="/graphics/about2.svg"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
          
          {/* Right Content */}
          <div className="w-full md:w-1/2 z-10">
            <h2 className="text-4xl md:text-5xl lg:text-6xl text-[#62B6B8] font-bold mb-6">
              What We Do
            </h2>
            <div className="text-sm md:text-base text-[#575454]">
              <ul className="list-disc list-outside pl-5 space-y-4">
                <li>Picture of Users Interacting with Technology: Show users engaging with your platform, such as using a mobile app or computer.</li>
                <li>Healthcare Tools: Display images of digital health tools or icons representing different features of your platform.</li>
                <li>Simplified Healthcare Process: Illustrate how your platform simplifies health management, maybe through a flowchart or infographics.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhatWeDoSection;
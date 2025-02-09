import Image from 'next/image';

const HeroSection = () => {
  return (
    <div className="relative min-h-screen px-4 md:px-[15%] md:pt-[0px] pt-[100px]">
      {/* Background image with darker overlay */}
      <Image
        src="/Images/background/landing-background.png"
        alt="Landing Background"
        fill
        style={{ objectFit: 'cover', objectPosition: 'center' }}
        quality={100}
        className="absolute top-0 left-0"
      />
      {/* Darker overlay */}
      <div className="absolute top-0 left-0 right-0 bottom-0 bg-black/30 z-0" />

      <div className="flex items-center justify-center min-h-screen relative z-10">
        <main className="flex flex-col md:flex-row gap-8 items-center pb-6 md:pb-10 border-b-[1px] border-gray-300 w-full">
          <div className="flex flex-col w-full md:w-[60%] gap-8 md:gap-[70px]">
            <div className="space-y-4 md:space-y-6">
              <h1 className="text-4xl md:text-7xl font-bold text-white text-center md:text-left">
                Your Personal Guide to Self-Care for Common Ailments
              </h1>
              <p className="text-lg md:text-xl font-light text-white text-center md:text-left">
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

          {/* Hero section with lighter background */}
          <div className="w-full md:w-[40%] relative rounded-full bg-white/20 backdrop-blur-lg overflow-hidden flex justify-center border border-gray-500 border-[1px] pt-8 md:pt-16">
            <Image
              src="/Images/background/doctor.png"
              alt="Hero"
              width={500}
              height={500}
              style={{ objectFit: 'cover' }}
              quality={100}
              className="relative z-20 w-[80%] md:w-full"
            />
          </div>
        </main>
      </div>
    </div>
  );
}

export default HeroSection;
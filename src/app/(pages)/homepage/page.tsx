import Image from 'next/image';
const HomePage = () => {
  return (
    <div className="max-w-[1300px] mx-auto h-[90vh] justify-start flex">
      <div>
        <Image
          src="/Images/background/landing-background.png"
          alt="Landing Background"
          fill
          style={{ objectFit: 'cover', objectPosition: 'center' }}
          quality={100}
          className=""
        />
        <div className="absolute top-0 left-0 right-0 bottom-0 bg-black/30 z-0 max-w-[1300px] min-w-[100vw] mx-auto" />
      </div>
      <div className="flex flex-col md:flex-row md:px-16 px-6 gap-10 justify-center pb-[10%]">
        <div className="flex flex-col md:w-[60%] justify-center w-full gap-8 md:gap-[70px] z-10">
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
        <div  className="flex items-center justify-center">
          <div className="md:w-[500px] w-full max-w-[500px] max-h-[600px] relative rounded-full bg-white/20 backdrop-blur-lg overflow-hidden flex justify-center border border-gray-500 border-[1px] pt-8 md:pt-16">
            <Image
              src="/Images/background/doctor.png"
              alt="Hero"
              width={400}
              height={400}
              style={{ objectFit: 'cover' }}
              quality={100}
              className="relative"
            />
          </div>
        </div>

      </div>

    </div>
  );
};

export default HomePage;
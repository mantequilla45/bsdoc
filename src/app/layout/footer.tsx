import { FaFacebook } from "react-icons/fa";
import { FaGithub } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-[#018487] to-[#014C4E] py-4 md:py-8">
      <div className="w-full max-w-[1300px] mx-auto px-4 sm:px-6 md:px-16">

        <div className="flex flex-col gap-3 md:gap-6 text-white">
          <h3 className="text-2xl sm:text-3xl md:text-5xl font-bold text-center md:text-left">
            Not a common ailment?
          </h3>
          <h3 className="text-2xl sm:text-3xl md:text-5xl font-bold text-center md:text-left">
            Book a doctor&apos;s appointment!
          </h3>
        </div>

        <div className="font-semibold text-black my-8 md:my-7 flex justify-center md:justify-start">
          <a 
            href="/appointment-page"
            className="py-3 md:py-5 px-6 sm:px-8 md:px-16 lg:px-[100px] rounded-xl bg-[#ED5050] text-white text-sm md:text-base hover:bg-[#d64646] transition-colors duration-200 cursor-pointer active:scale-95">
            BOOK
          </a>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-0 sm:justify-between mb-6 sm:mb-0">
          <div className="flex flex-col gap-3">
            <a
              href="/contact-us"
              className="text-white hover:underline text-sm md:text-base"
            >
              Contact Us
            </a>

            <a
              href="/about-us"
              className="text-white hover:underline text-sm md:text-base"
            >
              About Us
            </a>
          </div>

          <div className="flex flex-row gap-5 text-white">
            <FaFacebook className="w-6 h-6 md:w-[30px] md:h-[30px] hover:opacity-80 cursor-pointer" />
            <FaGithub className="w-6 h-6 md:w-[30px] md:h-[30px] hover:opacity-80 cursor-pointer" />
          </div>
        </div>

        <p className="font-light mt-4 md:mt-5 text-white text-xs md:text-base text-center sm:text-left">
          Disclaimer: This service is for informational purposes only. Consult a doctor for persistent or worsening symptoms.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
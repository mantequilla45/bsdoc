import { FaFacebook } from "react-icons/fa";
import { FaGithub } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-[#018487] to-[#014C4E] py-8 md:py-16 flex flex-col">
      <div className="min-w-[1300px] mx-auto">

        <div className="flex flex-col gap-3 md:gap-6 text-white">
          <h3 className="text-3xl md:text-5xl font-bold text-center md:text-left">
            Not a common ailment?
          </h3>
          <h3 className="text-3xl md:text-5xl font-bold text-center md:text-left">
            Book a doctor&apos;s appointment!
          </h3>
        </div>

        <div className="font-semibold text-black my-8 md:my-16 flex justify-center md:justify-start">
          <a className="py-3 md:py-5 px-8 md:px-[100px] rounded-xl bg-[#ED5050] text-white text-sm md:text-base hover:bg-[#d64646] transition-colors duration-200 cursor-pointer active:scale-95">
            BOOK
          </a>
        </div>

        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-0">
          <a
            href="/about-us"
            className="text-white hover:underline mb-4 md:mb-10 text-sm md:text-base"
          >
            About Us
          </a>

          <div className="flex flex-row gap-5 text-white md:ml-auto">
            <FaFacebook className="w-6 h-6 md:w-[30px] md:h-[30px] hover:opacity-80 cursor-pointer" />
            <FaGithub className="w-6 h-6 md:w-[30px] md:h-[30px] hover:opacity-80 cursor-pointer" />
          </div>
        </div>

        <p className="font-light mt-8 md:mt-5 text-white text-xs md:text-base text-center md:text-left">
          Disclaimer: This service is for informational purposes only. Consult a doctor for persistent or worsening symptoms.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
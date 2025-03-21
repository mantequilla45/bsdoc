import { FaFacebook } from "react-icons/fa";
import { FaGithub } from "react-icons/fa";


const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-[#018487] to-[#014C4E] py-[1%] px-[5%] flex flex-col">
      <div className="font-semibold text-black my-16">
      </div>
      <div className="flex flex-row gap-5 text-white">
        <FaFacebook className="w-[30px] h-[30px]" />
        <FaGithub className="w-[30px] h-[30px]" />
      </div>

      <p className="font-light mt-5">
        Disclaimer: This service is for informational purposes only. Consult a doctor for persistent or worsening symptoms.
      </p>
    </footer>
  );
}

export default Footer;

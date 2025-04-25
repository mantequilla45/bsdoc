/* eslint-disable @next/next/no-html-link-for-pages */
import { FaFacebook, FaGithub, FaTwitter, FaInstagram } from "react-icons/fa";
import { HiMail, HiPhone } from "react-icons/hi";
import Image from "next/image";
import { HiCalendarDateRange } from "react-icons/hi2";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-teal-400 opacity-10"></div>
        <div className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full bg-teal-400 opacity-10"></div>
      </div>
      
      {/* Call-to-action section */}
      <div className="relative z-10 bg-gradient-to-r from-[#018487] to-[#016668] py-16">
        <div className="max-w-[1300px] mx-auto px-6 md:px-16">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div className="flex-1">
              <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">
                Not a common <span className="text-yellow-300">ailment</span>?
                <br />
                Book a doctor&apos;s appointment!
              </h3>
              <p className="mt-4 text-white/80 max-w-lg">
                Connect with qualified healthcare professionals for personalized care and expert medical advice.
              </p>
            </div>
            
            <div className="flex flex-col items-center md:items-end">
              <a 
                href="/appointment-page"
                className="group relative py-4 px-8 md:px-16 rounded-xl bg-[#ED5050] text-white text-base md:text-lg font-semibold hover:bg-[#d64646] transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-3 active:scale-95"
              >
                <HiCalendarDateRange className="w-6 h-6" />
                BOOK APPOINTMENT
                <span className="absolute -bottom-1 left-1/2 w-0 h-1 bg-white rounded-full transform -translate-x-1/2 group-hover:w-2/3 transition-all duration-300"></span>
              </a>
              <p className="mt-4 text-white/70 text-sm">No waiting lines. Quick response.</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main footer content */}
      <div className="relative z-10 bg-gradient-to-b from-[#014C4E] to-[#013638] py-12 md:py-16">
        <div className="max-w-[1300px] mx-auto px-6 md:px-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            {/* Column 1: Logo and brief */}
            <div>
              <div className="flex items-center mb-4">
                <Image 
                  src="/logo/logo-white.svg" 
                  alt="BSDOC Logo" 
                  width={300} 
                  height={120}
                  className="h-24 w-auto"
                />
              </div>
              <p className="text-white/80 text-sm leading-relaxed">
                Your trusted resource for self-care guidance, symptom checking, and connecting with healthcare professionals.
              </p>
              <div className="flex items-center gap-4 mt-6">
                <a href="#" className="group flex items-center justify-center w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-300">
                  <FaFacebook className="w-4 h-4 text-white group-hover:text-blue-300 transition-colors duration-300" />
                </a>
                <a href="#" className="group flex items-center justify-center w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-300">
                  <FaTwitter className="w-4 h-4 text-white group-hover:text-blue-300 transition-colors duration-300" />
                </a>
                <a href="#" className="group flex items-center justify-center w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-300">
                  <FaInstagram className="w-4 h-4 text-white group-hover:text-pink-300 transition-colors duration-300" />
                </a>
                <a href="#" className="group flex items-center justify-center w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-300">
                  <FaGithub className="w-4 h-4 text-white group-hover:text-purple-300 transition-colors duration-300" />
                </a>
              </div>
            </div>
            
            {/* Column 2: Quick Links */}
            <div>
              <h4 className="text-white font-semibold text-lg mb-5">Quick Links</h4>
              <ul className="space-y-3">
                <li>
                  <a href="/search-symptoms" className="text-white/80 hover:text-white hover:pl-2 transition-all duration-300 block">
                    Symptom Checker
                  </a>
                </li>
                <li>
                  <a href="/search-symptoms" className="text-white/80 hover:text-white hover:pl-2 transition-all duration-300 block">
                    OTC Medications
                  </a>
                </li>
                <li>
                  <a href="/doctors" className="text-white/80 hover:text-white hover:pl-2 transition-all duration-300 block"> 
                    Find Doctors
                  </a>
                </li>
                <li>
                  <a href="/doctor-registration" className="text-white/80 hover:text-white hover:pl-2 transition-all duration-300 block">
                    Register as Doctor
                  </a>
                </li>
              </ul>
            </div>
            
            {/* Column 3: Support */}
            <div>
              <h4 className="text-white font-semibold text-lg mb-5">Support</h4>
              <ul className="space-y-3">
                <li>
                  <a href="/FAQ" className="text-white/80 hover:text-white hover:pl-2 transition-all duration-300 block">
                    FAQs
                  </a>
                </li>
                <li>
                  <a href="/privacy-policy" className="text-white/80 hover:text-white hover:pl-2 transition-all duration-300 block">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="/terms&conditon" className="text-white/80 hover:text-white hover:pl-2 transition-all duration-300 block">
                    Terms & Conditions
                  </a>
                </li>
                <li>
                  <a href="/about-us" className="text-white/80 hover:text-white hover:pl-2 transition-all duration-300 block">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="/contact-us" className="text-white/80 hover:text-white hover:pl-2 transition-all duration-300 block">
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>
            
            {/* Column 4: Contact Info */}
            <div>
              <h4 className="text-white font-semibold text-lg mb-5">Contact Us</h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <HiMail className="text-teal-400 w-5 h-5 mt-1 flex-shrink-0" />
                  <span className="text-white/80">
                    support@bsdoc.com
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <HiPhone className="text-teal-400 w-5 h-5 mt-1 flex-shrink-0" />
                  <span className="text-white/80">
                    +1 (800) 123-4567
                  </span>
                </li>
                <li className="mt-6">
                  <a 
                    href="/contact-us" 
                    className="inline-flex items-center px-4 py-2 bg-teal-700/30 hover:bg-teal-700/50 transition-colors duration-300 rounded-lg text-white text-sm"
                  >
                    Get Support
                    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Disclaimer and bottom info */}
          <div className="pt-8 mt-8 border-t border-white/10">
            <div className="flex flex-col md:flex-row md:justify-between gap-6 items-center">
              <p className="text-white/70 text-sm text-center md:text-left">
                Disclaimer: This service is for informational purposes only. Always consult a qualified healthcare professional for medical advice.
              </p>
              <p className="text-white/70 text-sm text-center md:text-right">
                © {currentYear} BSDOC. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
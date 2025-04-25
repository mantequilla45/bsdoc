"use client";
import { useState } from "react";
import Footer from "@/app/layout/footer";
import Header from "@/app/layout/header";
import { motion } from "framer-motion";

const TermsAndConditions = () => {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const sections = [
    {
      id: "use",
      title: "1. Use of the System",
      content: [
        "The BSDOC system is intended to provide guidance on minor health issues and over-the-counter medications.",
        "It is not a substitute for professional medical advice.",
        "Users are advised to consult a doctor for persistent or worsening symptoms."
      ]
    },
    {
      id: "data",
      title: "2. User Data and Privacy",
      content: [
        "The system will collect and store user data, including personal details and health records.",
        "The system shall ensure data security and privacy.",
        "The system shall comply with healthcare data protection regulations.",
        "Our procedures for managing your information are detailed in the privacy policy of the platform, which outlines how we collect, use, and protect your data."
      ]
    },
    {
      id: "account",
      title: "3. Account Management",
      content: [
        "Users are responsible for maintaining the confidentiality of their account credentials.",
        "Users must provide accurate and complete information during registration.",
        "Admins have the right to manage user accounts and roles."
      ]
    },
    {
      id: "ip",
      title: "4. Intellectual Property",
      content: [
        "All content and software within the BSDOC system are protected by intellectual property rights.",
        "Users may not reproduce, distribute, or modify any content without permission."
      ]
    },
    {
      id: "availability",
      title: "5. System Availability and Performance",
      content: [
        "The system aims for 99.99% uptime.",
        "The system should load within 3 seconds under standard internet conditions.",
        "The system should be able to handle up to 10,000 simultaneous users without performance degradation."
      ]
    },
    {
      id: "modifications",
      title: "6. Modifications to the System",
      content: [
        "The system may be modified or updated at any time.",
        "Users will be notified of significant changes."
      ]
    },
    {
      id: "liability",
      title: "7. Limitation of Liability",
      content: [
        "The system is provided as is without any warranties.",
        "The developers are not liable for any direct or indirect damages arising from the use of the system."
      ]
    },
    {
      id: "law",
      title: "8. Governing Law",
      content: [
        "The terms and conditions shall be governed by the laws of the jurisdiction."
      ]
    }
  ];

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(sectionId);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header background="white" title="Terms and Conditions" />
      
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[#018487] to-[#016668] py-20 flex flex-col justify-center items-center text-center mt-[100px] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-10 right-10 w-32 h-32 rounded-full bg-white"></div>
          <div className="absolute bottom-10 left-10 w-24 h-24 rounded-full bg-white"></div>
          <div className="absolute top-40 left-1/4 w-16 h-16 rounded-full bg-white"></div>
        </div>
        <motion.h2 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-bold text-white leading-tight mb-4"
        >
          Terms and Conditions
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-white text-lg max-w-2xl mx-auto px-4"
        >
          Please read these terms carefully before using the BSDOC platform.
        </motion.p>
      </div>

      <div className="container mx-auto py-12 px-[25px] md:px-6 flex-grow">
        {/* Quick Navigation */}
        <div className="mb-10 bg-gray-50 p-6 rounded-xl shadow-sm">
          <h3 className="text-xl font-semibold mb-4 text-[#018487]">Quick Navigation</h3>
          <div className="flex flex-wrap gap-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeSection === section.id 
                  ? "bg-[#018487] text-white" 
                  : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-100"
                }`}
              >
                {section.title.split(".")[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Last Updated */}
        <div className="mb-10 text-sm text-gray-500">
          <p>Last Updated: April 15, 2025</p>
        </div>

        {/* Introduction */}
        <div className="mb-10">
          <p className="text-gray-700 leading-relaxed">
            Welcome to BSDOC. By accessing or using our platform, you agree to be bound by these Terms and Conditions. 
            If you disagree with any part of these terms, you may not access our service.
          </p>
        </div>
        
        {/* Terms Sections */}
        <div className="space-y-10">
          {sections.map((section) => (
            <motion.section 
              key={section.id}
              id={section.id}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-white p-6 md:p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <h2 className="text-2xl font-semibold mb-4 text-[#018487]">{section.title}</h2>
              <ul className="space-y-3">
                {section.content.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2 mt-1 text-[#018487]">•</span>
                    <span className="text-gray-700 leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.section>
          ))}
        </div>

        {/* Contact Information */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-12 bg-gray-50 p-6 md:p-8 rounded-xl shadow-sm"
        >
          <h2 className="text-2xl font-semibold mb-4 text-[#018487]">Contact Us</h2>
          <p className="text-gray-700">
            If you have any questions about these Terms and Conditions, please contact us at:
          </p>
          <p className="text-[#018487] font-medium mt-2">support@bsdoc.com</p>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
};

export default TermsAndConditions;
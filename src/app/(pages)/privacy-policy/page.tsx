"use client";
import { useState, useEffect } from "react"; // Import useEffect
import Footer from "@/app/layout/footer";
import Header from "@/app/layout/header";
import { ChevronUp, ChevronDown, ArrowUp } from "lucide-react";

// 1. Define the type for the state object
type ExpandedSectionsType = {
  collection: boolean;
  use: boolean;
  security: boolean;
  sharing: boolean;
  rights: boolean;
  compliance: boolean;
  contact: boolean;
};

// 2. Define the type for the valid keys of the state object
type SectionKey = keyof ExpandedSectionsType;

// 3. Define the type for the items in the sections array
type SectionInfo = {
  id: SectionKey; // Use SectionKey here
  title: string;
};

const PrivacyPolicy = () => {
  // 4. Use the explicit type with useState
  const [expandedSections, setExpandedSections] = useState<ExpandedSectionsType>({
    collection: true,
    use: true,
    security: true,
    sharing: true,
    rights: true,
    compliance: true,
    contact: true
  });

  const [showScrollTop, setShowScrollTop] = useState(false);

  // 5. Fix toggleSection: use SectionKey and functional update
  const toggleSection = (section: SectionKey) => { // <-- Use SectionKey
    setExpandedSections(prevState => ({         // <-- Use functional update
      ...prevState,
      [section]: !prevState[section]             // <-- No error now
    }));
  };

  // Handle scroll (moved inside useEffect below)
  const handleScroll = () => {
    if (window.scrollY > 300) {
      setShowScrollTop(true);
    } else {
      setShowScrollTop(false);
    }
  };

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  // 6. Use useEffect for scroll event listener (Best Practice)
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    // Cleanup function to remove listener when component unmounts
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []); // Empty dependency array means this effect runs only once on mount

  // 7. Apply the SectionInfo type to the sections array
  const sections: SectionInfo[] = [ // <-- Use SectionInfo[] type
    { id: "collection", title: "Information Collection" },
    { id: "use", title: "Use of Information" },
    { id: "security", title: "Data Security" },
    { id: "sharing", title: "Data Sharing" },
    { id: "rights", title: "Your Rights" },
    { id: "compliance", title: "Compliance" },
    { id: "contact", title: "Contact Us" }
  ];

  // 8. Fix scrollToSection: use SectionKey and functional update
  const scrollToSection = (id: SectionKey) => { // <-- Use SectionKey
    const element = document.getElementById(id);
    if (element) {
      const offset = 120; // Account for fixed header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });

      // Ensure the section is expanded using functional update
      setExpandedSections(prevState => ({     // <-- Use functional update
        ...prevState,
        [id]: true                          // <-- No error now
      }));
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <Header background="white" title="Privacy Policy" />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-800 py-20 px-4 flex flex-col justify-center items-center text-center mt-[80px] relative overflow-hidden">
        {/* ... rest of hero ... */}
        <div className="relative z-10">
          <h1 className="sm:text-5xl md:text-6xl font-bold text-white leading-tight text-3xl">
            Privacy Policy
          </h1>
          <p className="mt-6 text-white/90 max-w-2xl text-lg">
            This Privacy Policy describes how the BSDOC system collects, uses, and protects your personal information.
          </p>
        </div>
      </div>

      <div className="container mx-auto py-12 px-[25px] md:px-6 flex-grow">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Table of Contents */}
          <div className="lg:w-1/4">
            <div className="lg:sticky lg:top-24 p-6 bg-gray-50 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold mb-4 text-teal-700">Contents</h3>
              <ul className="space-y-2">
                {sections.map((section) => ( // section is now of type SectionInfo
                  <li key={section.id}>
                    <button
                      onClick={() => scrollToSection(section.id)} // section.id is SectionKey, matches param type
                      className="text-left w-full py-1 px-2 rounded hover:bg-teal-50 hover:text-teal-700 transition-colors duration-200 text-gray-700"
                    >
                      {section.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            <div className="max-w-3xl">
              {/* Section 1: Information Collection */}
              <section id="collection" className="mb-10 border-b border-gray-200 pb-8">
                <div
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => toggleSection('collection')} // 'collection' is assignable to SectionKey
                >
                  <h2 className="text-2xl font-semibold text-gray-800">1. Information Collection</h2>
                  {/* Direct access using dot notation is always fine */}
                  {expandedSections.collection ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>

                {expandedSections.collection && (
                  <div className="mt-4 pl-0 md:pl-4 animate-fadeIn">
                    {/* ... content ... */}
                    <p className="text-gray-700 mb-4 leading-relaxed">
                      The BSDOC system collects the following types of information:
                    </p>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <div className="mr-2 mt-1 text-teal-600">•</div>
                        <div>
                          <span className="font-medium text-gray-800">Personal Information:</span>
                          <span className="text-gray-700"> This includes information you provide during registration,
                            such as your name, gender, email address, phone number, and profile picture.</span>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <div className="mr-2 mt-1 text-teal-600">•</div>
                        <div>
                          <span className="font-medium text-gray-800">Health Information:</span>
                          <span className="text-gray-700"> This includes symptoms you enter, search history,
                            medical records, and appointment details.</span>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <div className="mr-2 mt-1 text-teal-600">•</div>
                        <div>
                          <span className="font-medium text-gray-800">Technical Information:</span>
                          <span className="text-gray-700"> This may include information about your device,
                            browser, and IP address.</span>
                        </div>
                      </li>
                    </ul>
                  </div>
                )}
              </section>

              {/* Section 2: Use of Information */}
              <section id="use" className="mb-10 border-b border-gray-200 pb-8">
                <div
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => toggleSection('use')} // 'use' is assignable to SectionKey
                >
                  <h2 className="text-2xl font-semibold text-gray-800">2. Use of Information</h2>
                  {expandedSections.use ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
                {expandedSections.use && (<div className="mt-4 pl-0 md:pl-4 animate-fadeIn">
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    The information collected is used for the following purposes:
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <div className="mr-2 mt-1 text-teal-600">•</div>
                      <span className="text-gray-700">To provide the services of the BSDOC system, including symptom analysis,
                        medication recommendations, and appointment scheduling.</span>
                    </li>
                    <li className="flex items-start">
                      <div className="mr-2 mt-1 text-teal-600">•</div>
                      <span className="text-gray-700">To personalize your experience and provide tailored information.</span>
                    </li>
                    <li className="flex items-start">
                      <div className="mr-2 mt-1 text-teal-600">•</div>
                      <span className="text-gray-700">To manage your account and communicate with you.</span>
                    </li>
                    <li className="flex items-start">
                      <div className="mr-2 mt-1 text-teal-600">•</div>
                      <span className="text-gray-700">To improve the system and develop new features.</span>
                    </li>
                    <li className="flex items-start">
                      <div className="mr-2 mt-1 text-teal-600">•</div>
                      <span className="text-gray-700">To ensure the security and integrity of the system.</span>
                    </li>
                    <li className="flex items-start">
                      <div className="mr-2 mt-1 text-teal-600">•</div>
                      <span className="text-gray-700">To comply with healthcare regulations.</span>
                    </li>
                  </ul> </div>)}
              </section>

              {/* Section 3: Data Security */}
              <section id="security" className="mb-10 border-b border-gray-200 pb-8">
                <div
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => toggleSection('security')} // 'security' is assignable to SectionKey
                >
                  <h2 className="text-2xl font-semibold text-gray-800">3. Data Security</h2>
                  {expandedSections.security ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
                {expandedSections.security && (<div className="mt-4 pl-0 md:pl-4 animate-fadeIn">
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    The BSDOC system implements security measures to protect your information, including:
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <div className="mr-2 mt-1 text-teal-600">•</div>
                      <span className="text-gray-700">Secure Sockets Layer (SSL) for data transmission.</span>
                    </li>
                    <li className="flex items-start">
                      <div className="mr-2 mt-1 text-teal-600">•</div>
                      <span className="text-gray-700">Encryption of sensitive user data.</span>
                    </li>
                    <li className="flex items-start">
                      <div className="mr-2 mt-1 text-teal-600">•</div>
                      <span className="text-gray-700">Secure storage of medical records.</span>
                    </li>
                    <li className="flex items-start">
                      <div className="mr-2 mt-1 text-teal-600">•</div>
                      <span className="text-gray-700">Regular backups of data.</span>
                    </li>
                    <li className="flex items-start">
                      <div className="mr-2 mt-1 text-teal-600">•</div>
                      <span className="text-gray-700">Access controls to user data.</span>
                    </li>
                  </ul> </div>)}
              </section>

              {/* Section 4: Data Sharing */}
              <section id="sharing" className="mb-10 border-b border-gray-200 pb-8">
                <div
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => toggleSection('sharing')} // 'sharing' is assignable to SectionKey
                >
                  <h2 className="text-2xl font-semibold text-gray-800">4. Data Sharing</h2>
                  {expandedSections.sharing ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
                {expandedSections.sharing && (<div className="mt-4 pl-0 md:pl-4 animate-fadeIn">
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <div className="mr-2 mt-1 text-teal-600">•</div>
                      <span className="text-gray-700">Your personal and health information will not be shared with third parties except as necessary
                        to provide the services of the BSDOC system (e.g., with doctors for appointments) or as required by law.</span>
                    </li>
                    <li className="flex items-start">
                      <div className="mr-2 mt-1 text-teal-600">•</div>
                      <span className="text-gray-700">We may share anonymized or aggregated data for research or statistical purposes.</span>
                    </li>
                  </ul> </div>)}
              </section>

              {/* Section 5: Your Rights */}
              <section id="rights" className="mb-10 border-b border-gray-200 pb-8">
                <div
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => toggleSection('rights')} // 'rights' is assignable to SectionKey
                >
                  <h2 className="text-2xl font-semibold text-gray-800">5. Your Rights</h2>
                  {expandedSections.rights ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
                {expandedSections.rights && (<div className="mt-4 pl-0 md:pl-4 animate-fadeIn">
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    You have the right to:
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <div className="mr-2 mt-1 text-teal-600">•</div>
                      <span className="text-gray-700">Access your personal information.</span>
                    </li>
                    <li className="flex items-start">
                      <div className="mr-2 mt-1 text-teal-600">•</div>
                      <span className="text-gray-700">Update your personal information.</span>
                    </li>
                    <li className="flex items-start">
                      <div className="mr-2 mt-1 text-teal-600">•</div>
                      <span className="text-gray-700">Request deletion of your account (subject to legal and regulatory requirements).</span>
                    </li>
                  </ul> </div>)}
              </section>

              {/* Section 6: Compliance */}
              <section id="compliance" className="mb-10 border-b border-gray-200 pb-8">
                <div
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => toggleSection('compliance')} // 'compliance' is assignable to SectionKey
                >
                  <h2 className="text-2xl font-semibold text-gray-800">6. Compliance</h2>
                  {expandedSections.compliance ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
                {expandedSections.compliance && (<div className="mt-4 pl-0 md:pl-4 animate-fadeIn">
                  <p className="text-gray-700 leading-relaxed">
                    The BSDOC system complies with applicable healthcare data privacy regulations.
                  </p> </div>)}
              </section>

              {/* Section 7: Contact Us */}
              <section id="contact" className="mb-10">
                <div
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => toggleSection('contact')} // 'contact' is assignable to SectionKey
                >
                  <h2 className="text-2xl font-semibold text-gray-800">7. Contact Us</h2>
                  {expandedSections.contact ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
                {expandedSections.contact && (<div className="mt-4 pl-0 md:pl-4 animate-fadeIn">
                  <p className="text-gray-700 leading-relaxed">
                    If you have any questions or concerns about this Privacy Policy, please contact us through
                    the provided customer support channels.
                  </p>
                  <div className="mt-6 bg-teal-50 p-6 rounded-lg border border-teal-100">
                    <h4 className="text-lg font-medium text-teal-800 mb-2">Need help?</h4>
                    <p className="text-teal-700 mb-4">Our support team is available to assist you with any privacy-related concerns.</p>
                    <a href="/contact-us" className="inline-block px-5 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors duration-200">
                      Contact Support
                    </a>
                  </div></div>)}
              </section>

              {/* ... (Rest of the sections similarly updated) ... */}
            </div>
          </div>
        </div>
      </div>

      {/* Back to top button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 bg-teal-600 text-white p-3 rounded-full shadow-lg hover:bg-teal-700 transition-all duration-200 z-20"
          aria-label="Back to top"
        >
          <ArrowUp size={20} />
        </button>
      )}

      <Footer />

      {/* Animation styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default PrivacyPolicy;
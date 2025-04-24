"use client";
import Footer from "@/app/layout/footer";
import Header from "@/app/layout/header";

const TermsAndConditions = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header background="white" title="Terms and Conditions" />
      <div className="bg-gradient-to-r from-[#018487] to-[#016668] py-16 flex flex-col justify-center items-center text-center mt-[100px]">
        <h2 className="text-gray-700 sm:text-4xl md:text-5xl font-bold text-white leading-tight text-2xl mb-2">
          Terms and Condition
        </h2>
      </div>

      <div className="container mx-auto py-[20px] px-4 flex-grow">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">1. Use of the System</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li className="text-gray-700">
              The BSDOC system is intended to provide guidance on minor health
              issues and over-the-counter medications.
            </li>
            <li className="text-gray-700">
              It is not a substitute for professional medical advice. 
            </li>
            <li className="text-gray-700">
              Users are advised to consult a doctor for persistent or worsening
              symptoms. 
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">2. User Data and Privacy</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li className="text-gray-700">
              The system will collect and store user data, including personal details
              and health records. 
            </li>
            <li className="text-gray-700">
              The system shall ensure data security and privacy. 
            </li>
            <li className="text-gray-700">
              The system shall comply with healthcare data protection regulations.
              
            </li>
            <li className="text-gray-700">
            Our procedures for managing your information are detailed in the privacy policy of the platform, which outlines how we collect, use, and protect your data.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">3. Account Management</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li className="text-gray-700">
              Users are responsible for maintaining the confidentiality of their
              account credentials.
            </li>
            <li className="text-gray-700">
              Users must provide accurate and complete information during
              registration. 
            </li>
            <li className="text-gray-700">
              Admins have the right to manage user accounts and roles. 
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">4. Intellectual Property</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li className="text-gray-700">
              All content and software within the BSDOC system are protected by
              intellectual property rights.
            </li>
            <li className="text-gray-700">
              Users may not reproduce, distribute, or modify any content without
              permission.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">
            5. System Availability and Performance
          </h2>
          <ul className="list-disc pl-5 space-y-2">
            <li className="text-gray-700">
              The system aims for 99.99% uptime.
            </li>
            <li className="text-gray-700">
              The system should load within 3 seconds under standard internet
              conditions. 
            </li>
            <li className="text-gray-700">
              The system should be able to handle up to 10,000 simultaneous users
              without performance degradation.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">
            6. Modifications to the System
          </h2>
          <ul className="list-disc pl-5 space-y-2">
            <li className="text-gray-700">
              The system may be modified or updated at any time.
            </li>
            <li className="text-gray-700">
              Users will be notified of significant changes.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">7. Limitation of Liability</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li className="text-gray-700">
              The system is provided as is without any warranties.
            </li>
            <li className="text-gray-700">
              The developers are not liable for any direct or indirect damages
              arising from the use of the system.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">8. Governing Law</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li className="text-gray-700">
              The terms and conditions shall be governed by the laws of the
              jurisdiction.
            </li>
          </ul>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default TermsAndConditions;
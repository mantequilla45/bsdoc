"use client";
import Footer from "@/app/layout/footer";
import Header from "@/app/layout/header";

const PrivacyPolicy = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header remains fixed at the top */}
      <Header background="white" title="Privacy Policy" />

      {/* Full-width background section, moved below the header */}
      <div className="bg-gradient-to-r from-[#018487] to-[#016668] py-16 flex flex-col justify-center items-center text-center mt-[80px]">
        <h2 className="text-gray-700 sm:text-4xl md:text-5xl font-bold text-white leading-tight text-2xl mb-2">
          Privacy Policy
        </h2>
        <p className="mt-4 text-white/80 max-w-lg">
          This Privacy Policy describes how the BSDOC system collects, uses, and protects your personal information.
        </p>
      </div>

      <div className="container mx-auto py-8 px-4 flex-grow mt-0"> {/* Adjusted marginTop */}
        <div className="flex flex-col mx-auto">
          <section className="mb-8 gap-[90px]">
            <h2 className="text-2xl font-semibold mb-3">1. Information Collection</h2>
            <p className="text-gray-700 mb-3">
              The BSDOC system collects the following types of information:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li className="text-gray-700">
                <span className="font-medium">Personal Information:</span> This includes information you provide during registration,
                such as your name, gender, email address, phone number, and profile picture.
              </li>
              <li className="text-gray-700">
                <span className="font-medium">Health Information:</span> This includes symptoms you enter, search history,
                medical records, and appointment details.
              </li>
              <li className="text-gray-700">
                <span className="font-medium">Technical Information:</span> This may include information about your device,
                browser, and IP address.
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-3">2. Use of Information</h2>
            <p className="text-gray-700 mb-3">
              The information collected is used for the following purposes:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li className="text-gray-700">
                To provide the services of the BSDOC system, including symptom analysis,
                medication recommendations, and appointment scheduling.
              </li>
              <li className="text-gray-700">
                To personalize your experience and provide tailored information.
              </li>
              <li className="text-gray-700">
                To manage your account and communicate with you.
              </li>
              <li className="text-gray-700">
                To improve the system and develop new features.
              </li>
              <li className="text-gray-700">
                To ensure the security and integrity of the system.
              </li>
              <li className="text-gray-700">
                To comply with healthcare regulations.
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-3">3. Data Security</h2>
            <p className="text-gray-700 mb-3">
              The BSDOC system implements security measures to protect your information, including:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li className="text-gray-700">
                Secure Sockets Layer (SSL) for data transmission.
              </li>
              <li className="text-gray-700">
                Encryption of sensitive user data.
              </li>
              <li className="text-gray-700">
                Secure storage of medical records.
              </li>
              <li className="text-gray-700">
                Regular backups of data.
              </li>
              <li className="text-gray-700">
                Access controls to user data.
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-3">4. Data Sharing</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li className="text-gray-700">
                Your personal and health information will not be shared with third parties except as necessary
                to provide the services of the BSDOC system (e.g., with doctors for appointments) or as required by law.
              </li>
              <li className="text-gray-700">
                We may share anonymized or aggregated data for research or statistical purposes.
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-3">5. Your Rights</h2>
            <p className="text-gray-700 mb-3">
              You have the right to:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li className="text-gray-700">
                Access your personal information.
              </li>
              <li className="text-gray-700">
                Update your personal information.
              </li>
              <li className="text-gray-700">
                Request deletion of your account (subject to legal and regulatory requirements).
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-3">6. Compliance</h2>
            <p className="text-gray-700">
              The BSDOC system complies with applicable healthcare data privacy regulations.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-3">7. Contact Us</h2>
            <p className="text-gray-700">
              If you have any questions or concerns about this Privacy Policy, please contact us through
              the provided customer support channels.
            </p>
          </section>

          <section className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h2 className="text-2xl font-semibold mb-3">Important Considerations:</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li className="text-gray-700">
                This is a general outline. A complete privacy policy requires detailed legal review
                to ensure compliance with all relevant laws (e.g., HIPAA, GDPR, etc.).
              </li>
              <li className="text-gray-700">
                Specifically, it must address data retention periods, use of cookies or tracking technologies,
                and any international data transfers.
              </li>
              <li className="text-gray-700">
                It should also include information on how users can exercise their rights
                (access, correct, delete data).
              </li>
            </ul>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
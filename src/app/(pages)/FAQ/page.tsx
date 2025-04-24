'use client';

import React, { useState } from 'react';
import Header from "@/app/layout/header";
import Footer from "@/app/layout/footer";

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
}

// FAQ data (assuming it's the same as before)
const faqsData = [
  {
    question: "What is the purpose of the BSDOC system?",
    answer: "BSDOC (Basic Symptom Drug Obtaining Code) aims to help individuals manage minor health issues by providing a self-care solution. It offers expert guidance and uses user-friendly technology to handle common ailments from home, reducing unnecessary doctor visits. Its goal is to provide a comprehensive overview of the software product, detailing its parameters, objectives, target audience, user interface, and hardware/software requirements."
  },
  {
    question: "Who is the target audience for BSDOC?",
    answer: "The system targets individuals with basic digital literacy seeking recommendations for over-the-counter (OTC) medications for common symptoms like headaches, allergies, and upset stomachs. It also serves doctors who manage appointments and prescribe medication, and administrators who oversee the system."
  },
  {
    question: "What are the main features of BSDOC?",
    answer: "BSDOC features include an advanced symptom search, cure search results with details, a dosage calculator based on user details, management of search and health records, appointment scheduling with doctors, schedule filtering for appointments, doctor registration and scheduling management, user management by admins, dynamic symptom and cure management by admins, a bug reporting feature, profile management, and user authentication."
  },
  {
    question: "How does the symptom search work?",
    answer: "Users can input symptoms, personal details, and health conditions through basic or advanced search options to receive diagnostic suggestions. The system displays possible cures based on the input symptoms, with detailed descriptions and highlighted keywords. It interacts with medical databases for symptom analysis."
  },
  {
    question: "Can I book appointments with doctors through BSDOC?",
    answer: "Yes, the system allows users to book, manage, and reschedule appointments with available doctors. Users can filter doctors' availability based on specific days. Doctors have their own interface to manage schedules and view appointments."
  },
  {
    question: "How are doctors registered on the platform?",
    answer: "Doctors register similarly to normal users but must submit necessary documents for approval, agree to terms, and provide references for peer review."
  },
  {
    question: "How is user data handled?",
    answer: "The system emphasizes data security and privacy. It uses secure sockets (SSL) for data transactions and encrypts sensitive user data. It complies with healthcare data protection regulations and implements strong data security measures. User health records are securely stored."
  },
  {
    question: "What technology is BSDOC built on?",
    answer: "The front-end is built using Next.js. It uses Supabase for authentication, data storage, and real-time updates. The system architecture is modular, integrating front-end and back-end components."
  },
  {
    question: "Is there customer support available?",
    answer: "Yes, the system provides contact methods (email) for customer support and specifies response times and support ticketing systems."
  },
   {
    question: "What if my symptoms are not minor?",
    answer: "If symptoms are no longer simple, BSDOC offers the ability to create an appointment with a doctor for a proper and professional diagnosis. Users are encouraged to consult a doctor for persistent or worsening symptoms."
  }
];


// Reusable FAQ Item Component with Animation
const FAQItem: React.FC<FAQItemProps> = ({ question, answer, isOpen, onClick }) => {
  // Use a ref to get the actual height of the content for a more precise animation
  // Although max-height approach is simpler and often sufficient
  // const contentRef = useRef<HTMLParagraphElement>(null);

  return (
    <div className="faq-item">
      <button onClick={onClick} className="faq-question-button">
        <h2>{question}</h2>
        {/* Animate the indicator rotation */}
        <span className={`indicator ${isOpen ? 'open' : ''}`}>+</span>
      </button>
      {/* Wrap answer in a div for animation control */}
      <div className={`faq-answer-container ${isOpen ? 'open' : ''}`}>
        <p className="faq-answer">
          {answer}
        </p>
      </div>

      <style jsx>{`
        .faq-item {
          background-color: #fff;
          border: 1px solid #ddd;
          border-radius: 4px;
          margin-bottom: 1rem;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          overflow: hidden; /* Important for max-height transition */
        }
        .faq-question-button {
          background: none;
          border: none;
          padding: 1rem 1.5rem;
          width: 100%;
          text-align: left;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .faq-question-button h2 {
          color: #333;
          margin: 0;
          font-size: 1.1em;
          flex-grow: 1;
          padding-right: 1rem;
          font-weight: bold;
        }
        .indicator {
            font-size: 1.8em; /* Slightly larger indicator */
            color: #62B6B8;
            font-weight: bold;
            transition: transform 0.3s ease-in-out; /* Animate rotation */
            display: inline-block; /* Needed for transform */
         }
        .indicator.open {
            transform: rotate(45deg); /* Rotate '+' to 'x' */
        }

        /* Container for the answer to manage height transition */
        .faq-answer-container {
          max-height: 0; /* Start closed */
          overflow: hidden; /* Hide content when closed */
          transition: max-height 0.4s ease-in-out; /* Animation */
        }
        .faq-answer-container.open {
          max-height: 500px; /* Expand to reveal content - adjust if needed */
          /* You could use JS (with useRef) to set this to the actual scrollHeight for perfect fit,
             but a large enough fixed value usually works well. */
        }

        .faq-answer {
          color: #666;
          line-height: 1.6;
          font-size: 1em;
          /* Adjusted padding - top padding is now handled by container */
          padding: 0 1.5rem 1rem 1.5rem;
          /* Removed border-top, separation happens naturally */
          margin-top: 0; /* Reset margin */
          text-align: justify;
        }
      `}</style>
    </div>
  );
};


const FAQPage: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number>(-1);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
        <Header background="white" title="FAQ" />

        <div className="faq-container relative z-10">
          <h1>Frequently Asked Questions (FAQ) - BSDOC</h1>
          {faqsData.map((faq, index) => (
            <FAQItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              onClick={() => handleToggle(index)}
            />
          ))}
        </div>

        <Footer />

        <style jsx>{`
            .faq-container {
              max-width: 800px;
              margin: 2rem auto;
              padding: 2rem 1rem;
              border-radius: 8px;
            }
            h1 {
              text-align: center;
              color: #333;
              margin-bottom: 2rem;
            }
      `}</style>
    </div>
  );
};

export default FAQPage;
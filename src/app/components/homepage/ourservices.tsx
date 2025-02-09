import Image from 'next/image';
import React from 'react';

interface ServiceItem {
  icon: string;
  title: string;
  description: string;
}

const OurServicesSection: React.FC = () => {
  const services: ServiceItem[] = [
    {
      icon: "/graphics/symptom-checker-icon.svg",
      title: "Symptom Checker",
      description: "Input your symptoms to find the right cure, view search results filtered according to your symptoms, and access visual aids with explanations to better understand your condition."
    },
    {
      icon: "/graphics/personal-ht-icon.svg",
      title: "Personalized Health Tips",
      description: "Receive personalized health and wellness tips based on your profile and symptom history, save and track your health data over time, and get email or SMS notifications for self-care reminders."
    },
    {
      icon: "/graphics/otc-guide-icon.svg",
      title: "OTC Medication Guidance",
      description: "Find the right over-the-counter medications based on your symptoms, access detailed information on their uses, dosages, and precautions, and stay informed about potential drug interactions and contraindications."
    },
  ];

  return (
    <div className="bg-white flex items-center flex-col px-4 md:px-[15%] py-8 md:py-[3%] md:pb-[5%]">
      <h2 className="text-3xl md:text-5xl font-bold text-[#043CAA] text-center">
        Our Services
      </h2>
      <div className="flex flex-col md:flex-row gap-8 md:gap-[50px] mt-8 md:mt-[60px] w-full">
        {services.map((service, index) => (
          <div
            key={index}
            className="flex flex-col items-center gap-6 md:gap-[40px] w-full md:w-1/3 bg-white rounded-[30px] px-4 md:px-[50px] py-6 md:py-0 shadow-md md:shadow-none"
          >
            <div className="w-[120px] h-[120px] md:w-[200px] md:h-[200px]">
              <Image
                src={service.icon}
                alt={`${service.title} icon`}
                width={200}
                height={200}
                style={{ objectFit: 'contain' }}
                quality={100}
                className="w-full h-full"
              />
            </div>
            <div className="flex flex-col text-xl text-black items-center">
              <h3 className="text-lg md:text-xl text-[#043CAA] font-semibold text-center">
                {service.title}
              </h3>
              <p className="text-sm md:text-base mt-2 md:mt-3 text-center font-light">
                {service.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default OurServicesSection;
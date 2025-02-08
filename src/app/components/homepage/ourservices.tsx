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
    <div className="bg-white flex items-center flex-col px-[15%] py-[3%] pb-[5%]">
      <h2 className="text-5xl font-bold text-[#043CAA]">
        Our Services
      </h2>
      <div className="flex flex-row gap-[50px] mt-[60px]">
        {services.map((service, index) => (
          <div
            key={index}
            className="flex flex-col items-center gap-[40px] w-1/3 bg-white rounded-[30px] px-[50px]"
          >
            <div className="w-[200px] h-[200px]">
              <Image
                src={service.icon}
                alt={`${service.title} icon`}
                width={200}
                height={200}
                style={{ objectFit: 'cover' }}
                quality={100}
              />
            </div>
            <div className="flex flex-col text-xl text-black items-center">
              <h3 className="text-xl text-[#043CAA] font-semibold">
                {service.title}
              </h3>
              <p className="text-base mt-3 text-center font-light">
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
"use client";
import Header from "@/app/layout/header";
import Footer from "@/app/layout/footer";
import HeroSection from "./compontents/HeroSections";
import WhatWeDoSection from "./compontents/WhatWeDoSection";
import AcknowledgementsSection from "./compontents/AcknowledgementSection";

const AboutUs = () => {
    return (
        <div className="min-h-screen bg-white relative overflow-hidden">
            {/* Background Circle - positioned as a fixed element */}
            <div className="hidden md:block absolute right-0 lg:-right-64 top-[10%] -translate-y-1/2 h-[90vh] w-[90vh] bg-[#62B6B8] rounded-full opacity-80 z-0" />
            
            <Header background="white" title="About Us" />
            <HeroSection />
            <WhatWeDoSection />
            <AcknowledgementsSection />
            <Footer />
        </div>
    );
};

export default AboutUs;
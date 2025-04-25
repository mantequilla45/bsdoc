"use client";
import Header from "@/app/layout/header";
import Footer from "@/app/layout/footer";
import HeroSection from "./compontents/HeroSections";
import WhatWeDoSection from "./compontents/WhatWeDoSection";
import AcknowledgementsSection from "./compontents/AcknowledgementSection";
import TeamSection from "./compontents/TeamSection";

const AboutUs = () => {
    return (
        <div className="min-h-screen bg-white relative overflow-hidden">
            {/* Background elements */}
            <div className="hidden md:block absolute right-0 lg:-right-64 top-[10%] -translate-y-1/2 h-[90vh] w-[90vh] bg-[#62B6B8] rounded-full opacity-20 z-0" />
            <div className="hidden md:block absolute left-0 lg:-left-32 bottom-[20%] h-[60vh] w-[60vh] bg-[#62B6B8] rounded-full opacity-10 z-0" />
            
            <Header background="white" title="About Us" />
            <HeroSection />
            <WhatWeDoSection />
            <TeamSection />
            <AcknowledgementsSection />
            <Footer />
        </div>
    );
};

export default AboutUs;
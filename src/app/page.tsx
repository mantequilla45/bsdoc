import HomePage from "@/app/(pages)/homepage/home";
import Header from "@/app/layout/header";
import Footer from "@/app/layout/footer";
import OurServicesSection from "./(pages)/homepage/ourservices";
import BenefitsSection from "./(pages)/homepage/benefits";
import HowItWorksSection from "./(pages)/homepage/how-it-works";

const Landing = () => {
  return (
    <div className="overflow-x-hidden">
      <Header background="rgba(0,0,0,0.4)" title="BSDOC | Personal Health Management Platform" />
      <HomePage />
      <OurServicesSection />
      <BenefitsSection />
      <HowItWorksSection />
      <Footer />
    </div>
  );
};

export default Landing;
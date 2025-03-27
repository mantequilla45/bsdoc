import HomePage from "@/app/(pages)/homepage/page";
import Header from "@/app/layout/header";
import Footer from "@/app/layout/footer";
import OurServicesSection from "@/app/(pages)/homepage/components/ourservices"

const Landing = () => {
  return (
    <div className="overflow-x-hidden">
      <Header background="[#000000]" title="BSDOC" />
      <HomePage />
      <OurServicesSection />
      <Footer />
    </div>
  );
};

export default Landing;
import HomePage from "@/app/(pages)/homepage/page";
import Header from "@/app/layout/header";
import Footer from "@/app/layout/footer";

const Landing = () => {
  return (
    <div className="bg-white">
      <Header background="black/70" title="BSDOC"/>
      <HomePage />
      <Footer />
    </div>
  );
};

export default Landing;

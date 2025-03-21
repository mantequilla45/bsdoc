
"use client";
import Header from "@/app/components/layout/header";
import Footer from "@/app/components/layout/footer-about";
import Image from "next/image"

const AboutUs = () => {
    return (
        <div className="min-h-screen bg-white py-[1%]">
            <Header />
            <title> About Us</title>
            <div className="flex flex-col md:flex-row h-full items-center mt-[8%] ml-[5%] mr-[5%]">
                <div className="flex flex-col gap-3 w-full md:w-1/2">
                    <div className="w-[50%] md:w-[23%]">
                        <h1 className="border-b text-2xl text-[#62B6B8]">
                            About us
                        </h1>
                    </div>

                    <h2 className="text-lg md:text-xl mt-[1%]">
                        Where your Health Meets
                    </h2>
                    <h2 className="text-4xl md:text-6xl text-[#62B6B8] mt-[1%]">
                        Innovation
                    </h2>
                    <div className="text-sm md:text-base text-[#575454] italic text-justify space-y-3 mt-[1%]">
                        <p>
                            At BSDOC, our mission is to create innovative solutions that simplify and enhance personal health management. We aim to empower individuals with user-friendly tools to manage their health records and receive personalized suggestions for over-the-counter (OTC) medications. We envision a world where everyone has access to efficient, reliable, and easy-to-use health management platforms, leading to better self-care and improved communication with healthcare providers.
                        </p>
                        <p>
                            Founded in 2024, VETT began with the development of the BSDOC project.
                            Our initial goal was to create an efficient and user-friendly platform that allows users to input their medical records, document symptoms,
                            and receive suggestions for OTC drugs and dosages based on their selected symptoms. Over time, we have expanded our offerings and improved
                            our platform to better serve our users&apos; needs.
                        </p>
                    </div>
                </div>
                <div className="w-full md:w-1/2 md:mt-0 z-10">
                    <Image alt="About"
                        style={{
                            position: 'absolute',
                            height: '65%',
                            width: '65%',
                            left: '45%',
                            bottom: '20%',
                            color: 'transparent'
                        }}
                        src="/graphics/about.svg"
                        width={0}
                        height={0}
                    />
                </div>
            </div>
            <div className="hidden md:block absolute right-[-35vh] top-1/3 translate-y-[-50%] h-[80vw] md:h-[1000px] w-[80vw] md:w-[1000px] bg-[#62B6B8] rounded-full z-0" />
            <div className="flex flex-col md:flex-row h-full items-center mt-[5%] ml-[5%] mr-[5%]">
                <div className="flex flex-col gap-3 w-full md:w-1/2">
                    <Image alt="About"
                        style={{
                            position: 'absolute',
                            height: '75%',
                            width: '75%',
                            right: '38%',
                            bottom: '-35%',
                            color: 'transparent'
                        }}
                        src="/graphics/about2.svg"
                        width={0}
                        height={0}
                    />
                </div>
                <div className="w-full md:w-1/2 md:mt-0 z-10">
                    <h1 className="text-4xl md:text-6xl text-[#62B6B8] mt-[10%]">
                        What We Do
                    </h1>
                    <div className="text-sm md:text-base text-[#575454] italic text-justify mt-[2%] space-y-[5%]">
                        <ul className="list-disc list-inside md:list-outside pl-5 space-y-[2%]">
                            <li>Picture of Users Interacting with Technology: Show users engaging with your platform, such as using a mobnile app or computer.</li>
                            <li>Healthcare Tools: Display images of digital health tools or icons representing different features of your platform.</li>
                            <li>Simplified Healthcare Process: Illustrate how your platform simplifies health management, maybe through a flowchart or infographics.</li>
                        </ul>
                    </div>
                </div>
            </div>
            <div className="h-full items-center mb-[5%]">
                <h1 className="text-4xl md:text-6xl text-[#62B6B8] text-center mt-[10%]">
                    Acknowledgements
                </h1>
                <div className="text-m md::text-base text-[#575454] italic text-justify space-y-[1%] ml-[5%] mr-[5%] mt-[3%]">
                    <p>
                        We extend our heartfelt gratitude to everyone who has contributed to the development and success of VETT.
                    </p>
                    <p>
                        First and foremost, we thank our dedicated team whose relentless passion, creativity, and hard work have been the driving force behind our innovative health management solutions. Your commitment to excellence and user-centric design has been instrumental in bringing our vision to life.
                    </p>
                    <p>
                        We are also deeply grateful to our early adopters and users. Your valuable feedback, trust, and support have been crucial in refining our platform and ensuring it meets the highest standards of usability and effectiveness.
                    </p>
                    <p>
                        Special thanks go to our partners and advisors for their unwavering guidance and expertise. Your insights and collaboration have been invaluable in navigating the challenges and opportunities in the healthcare technology landscape.
                    </p>
                    <p>
                        Our deepest gratitde to Jhana Marie for for motivating, inspiring, being the root of this project, and for being the most beautiful girl in the world. BSDOC wouldn&apos;t exist without you.
                    </p>
                    <p>
                        Lastly, we acknowledge the support of our families and friends. Your encouragement and understanding have been the foundation of our perseverance and success.
                    </p>
                    <p>
                        Thank you to everyone who has been part of this journey. We look forward to continuing our mission of revolutionizing personal health management together.
                    </p>
                </div>
            </div>
            <Footer/>
        </div>
    );
}

export default AboutUs;

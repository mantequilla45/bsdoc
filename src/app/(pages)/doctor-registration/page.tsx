"use client";
import Image from 'next/image';
import RegistrationCard from './components/registration-card';
import Header from '@/app/layout/header';
import Footer from '@/app/layout/footer';

const DoctorRegistration = () => {
    return (
        <div className='bg-[#C3EFEB] min-h-screen relative overflow-hidden'>
            <Header title="Doctor Registration" background='#EEFFFE' />
            <div className="flex flex-col md:flex-row min-h-screen py-16">
                {/* Hero section - takes full width on mobile */}
                <div className="w-full md:w-[60%] lg:w-[70%] relative bg-[#C3EFEB] pt-[15vh] pb-8">
                    <div className="z-50 p-4 md:p-8 flex flex-col items-center md:items-start">
                        <div className="flex flex-col items-center md:items-start text-center md:text-left px-4">
                            <p className="text-[#62B6B8] text-6xl md:text-7xl lg:text-[8vw] font-bold leading-tight">
                                HELLO
                            </p>
                            <h1 className="text-2xl md:text-3xl lg:text-[3vw] mt-2">
                                Welcome to <span className="text-[#62B6B8]">BSDOC</span>
                            </h1>
                            <p className="text-base md:text-lg lg:text-xl mt-2 max-w-sm">
                                Your Personal Guide to Self-Care for Common Ailments
                            </p>
                            
                            {/* Image shown on mobile */}
                            <div className="mt-6 mb-8">
                                <Image
                                    src="graphics/floating-medicine.svg"
                                    alt="Floating medicine illustration"
                                    className="object-contain w-48 h-48"
                                    width={200}
                                    height={200}
                                />
                            </div>
                        </div>
                    </div>
                    
                    {/* Background SVG - hidden on smaller screens */}
                    <div className="hidden md:block">
                        <Image
                            src="graphics/doc-register.svg"
                            alt="Doctor registration background"
                            className="absolute left-0 top-0 object-contain w-full h-full"
                            width={1200}
                            height={1200}
                            priority
                        />
                    </div>
                </div>
                
                {/* Registration card - takes full width on mobile */}
                <div className="w-full md:w-[40%] lg:w-[30%] flex justify-center items-center px-4 py-8">
                    <MobileRegistrationCard />
                </div>
            </div>
            <Footer />
        </div>
    );
};

// Mobile-optimized registration card component
const MobileRegistrationCard = () => {
    // For mobile, we'll use the same component but wrap it with styles for mobile
    return (
        <div className="w-full max-w-[500px]">
            <RegistrationCard />
        </div>
    );
};

export default DoctorRegistration;  
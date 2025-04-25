"use client";
import Image from 'next/image';
// Assuming RegistrationCard is correctly imported from './components/registration-card'
import RegistrationCard from './components/registration-card'; 
import Header from '@/app/layout/header';
import Footer from '@/app/layout/footer';

// Assuming MobileRegistrationCard is defined or imported if it's separate
// If it just wraps RegistrationCard, defining it here is fine.
const MobileRegistrationCard = () => {
    return (
        <div className="w-full max-w-[500px]">
            <RegistrationCard />
        </div>
    );
};


const DoctorRegistration = () => {
    return (
        <div className='bg-[#C3EFEB] min-h-screen relative overflow-hidden flex flex-col'> {/* Added flex flex-col */}
            <Header title="Doctor Registration" background='#EEFFFE' />
            {/* Added flex-grow to make this container take remaining height */}
            <div className="flex flex-col md:flex-row flex-grow md:h-screen"> 
                {/* Hero section */}
                 {/* Added min-h-[calc(100vh-HEADER_HEIGHT)] if header has fixed height, or adjust relative positioning */}
                <div className="w-full md:w-[60%] lg:w-[70%] relative bg-[#C3EFEB] flex flex-col justify-center items-center md:items-start pt-24 md:pt-0 pb-8 md:pl-8 lg:pl-16"> {/* Adjust padding/alignment */}

                    {/* Text Content Container: Added 'relative' */}
                    <div className="relative md:z-50 p-4 flex flex-col items-center md:items-start text-center md:text-left">
                        <div className="flex flex-col items-center md:items-start md:pl-[150px] md:pt-[70px]">
                            <p className="text-[#62B6B8] text-6xl md:text-7xl lg:text-[8vw] font-bold leading-tight">
                                HELLO
                            </p>
                            <h1 className="text-2xl md:text-3xl lg:text-[3vw] mt-2">
                                Welcome to <span className="text-[#62B6B8]">BSDOC</span>
                            </h1>
                            <p className="text-base md:text-lg lg:text-xl mt-2 max-w-sm">
                                Your Personal Guide to Self-Care for Common Ailments
                            </p>
                            
                            {/* Image shown on mobile only */}
                            <div className="mt-6 mb-8 md:hidden"> {/* Hide on medium and up */}
                                <Image
                                    src="/graphics/floating-medicine.svg" // Assuming path is correct
                                    alt="Floating medicine illustration"
                                    className="object-contain w-48 h-48"
                                    width={200}
                                    height={200}
                                />
                            </div>
                        </div>
                    </div>
                    
                    {/* Background SVG - hidden on smaller screens: Added 'z-0' */}
                    <div className="hidden md:block absolute inset-0 z-0"> {/* Use inset-0 to cover parent */}
                        <Image
                            src="/graphics/doc-register.svg" // Assuming path is correct
                            alt="Doctor registration background"
                            width={1200}
                            height={1200}
                            style={{ objectFit: 'contain' }} // Control how image fits
                            priority
                        />
                    </div>
                </div>
                
                {/* Registration card */}
                {/* Added self-center for better alignment on mobile */}
                <div className="w-full md:w-[40%] lg:w-[30%] flex justify-center items-center px-4 py-8 md:py-16 self-center md:self-auto"> 
                    <MobileRegistrationCard />
                </div>
            </div>
            <Footer />
        </div>
    );
};


export default DoctorRegistration;
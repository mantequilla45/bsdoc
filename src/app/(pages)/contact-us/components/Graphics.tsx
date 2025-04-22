// components/contact-graphic.tsx
import React from 'react';
import Image from 'next/image';

const ContactGraphic = () => {
    return (
        <div className="relative w-full">
            {/* For smaller tablets */}
            <div className="block md:hidden lg:hidden xl:hidden">
                <Image
                    src="/graphics/contactus.svg"
                    alt="contact graphics"
                    width={450}
                    height={450}
                    className="max-w-full object-contain"
                    priority
                />
            </div>
            
            {/* For larger tablets */}
            <div className="hidden md:block lg:hidden xl:hidden">
                <Image
                    src="/graphics/contactus.svg"
                    alt="contact graphics"
                    width={600}
                    height={600}
                    className="max-w-full object-contain"
                    priority
                />
            </div>
            
            {/* For desktop */}
            <div className="hidden md:hidden lg:block">
                <Image
                    src="/graphics/contactus.svg"
                    alt="contact graphics"
                    width={900}
                    height={900}
                    className="max-w-full object-contain"
                    priority
                />
            </div>
        </div>
    );
};

export default ContactGraphic;
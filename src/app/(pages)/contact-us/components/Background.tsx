// components/contact-background.tsx
import React from 'react';
import Image from 'next/image';

const ContactBackground = () => {
    return (
        <div className="absolute inset-0 -left-[100px] sm:-left-[180px] md:-left-[240px] lg:-left-[360px] top-0 z-0 h-full w-full opacity-30 sm:opacity-40 md:opacity-70 lg:opacity-100">
            <Image
                src="/graphics/doc-register.svg"
                alt="background"
                layout="fill"
                objectFit="fill"
                priority
                className="select-none pointer-events-none"
            />
        </div>
    );
};

export default ContactBackground;
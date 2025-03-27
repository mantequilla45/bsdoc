"use client";
import Link from 'next/link';
import Image from 'next/image';
import RegistrationCard from './components/registration-card';

const DoctorRegistration = () => {
    return (
        <div>
            <div className="fixed h-[10vh] flex items-center justify-center w-full">
                <Link href="/">
                    home
                </Link>
            </div>
            <div className="flex flex-row h-[100vh]">
                <div className="w-full relative bg-[#C3EFEB] overflow-hidden">
                    <div className="absolute w-full z-50 p-8 flex h-full items-center">
                        <div className="flex flex-row items-center justify-between w-full pr-[25%] pl-[10%]">
                            <div className="flex flex-col">
                                <p className="text-[#62B6B8] text-[8vw] leading-tight">
                                    HELLO
                                </p>
                                <h1 className="text-[3vw]">
                                    Welcome to <span className="text-[#62B6B8]">BSDOC</span>
                                </h1>
                                <p className="text-[1.5rem]">
                                    Your Personal Guide to Self-Care for Common Ailments
                                </p>
                            </div>
                            <div>
                                <Image
                                    src="graphics/floating-medicine.svg"
                                    alt="svg"
                                    className="object-contain w-[15vw] h-[15vw]"
                                    width={200}
                                    height={200}
                                />
                            </div>
                        </div>
                    </div>
                    <Image
                        src="graphics/doc-register.svg"
                        alt="svg"
                        className="absolute left-0 top-0 object-contain w-[100%] h-[122vh]"
                        width={1200}
                        height={1200}
                        priority
                    />
                </div>
                <div className="min-w-[600px] pt-[5%] flex items-center">
                    <RegistrationCard />
                </div>
            </div>
        </div>
    );
};

export default DoctorRegistration;
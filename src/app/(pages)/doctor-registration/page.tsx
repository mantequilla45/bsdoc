"use client";
import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, Upload, User } from "lucide-react"; // Using Lucide Icons
import '@/app/components/components.css';
import Link from 'next/link';
import Image from 'next/image';

// Reusable Input Component with Icons
const InputField = ({ label, type }: { label: string; type: string }) => {
    const [showPassword, setShowPassword] = useState(false);

    // Get appropriate icon based on input type
    const getLeftIcon = () => {
        switch (label) {
            case "First Name":
            case "Last Name":
                return <User className="w-5 h-5 text-gray-500" />;
            case "Email":
                return <Mail className="w-5 h-5 text-gray-500" />;
            case "Password":
            case "Confirm Password":
                return <Lock className="w-5 h-5 text-gray-500" />; // Lock icon for password fields
            case "Upload File (PRC ID)":
                return <Upload className="w-5 h-5 text-gray-500" />;
            default:
                return null;
        }
    };

    return (
        <div className="relative w-full input-container mt-[25px]">
            {/* Left Icon (Lock, Mail, User, Upload) */}
            <div className="absolute left-[20px] top-1/2 transform -translate-y-1/2">{getLeftIcon()}</div>

            {/* Input Field */}
            <input
                type={label.includes("Password") && !showPassword ? "password" : type}
                id={label}
                placeholder=" "
                required
                className="pl-12 pr-12 w-full" // Left padding for icon, right padding for eye icon (if password)
            />

            {/* Label */}
            <label htmlFor={label}>{label}</label>

            {/* Right Icon (Eye Toggle for Password Fields) */}
            {label.includes("Password") && (
                <div
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                >
                    {showPassword ? <EyeOff className="w-5 h-5 text-gray-500" /> : <Eye className="w-5 h-5 text-gray-500" />}
                </div>
            )}
        </div>
    );
};

// Registration Card
const RegistrationCard = () => {
    return (
        <div className="flex bg-white m-5 rounded-2xl py-[10%] pb-[15%] flex-col px-[7%]">
            <p className="text-3xl mb-5">Register as Doctor</p>

            {/* Name Fields */}
            <div className="flex flex-row gap-5 w-full">
                {["First Name", "Last Name"].map((label, index) => (
                    <InputField key={index} label={label} type="text" />
                ))}
            </div>

            {/* Other Fields */}
            <div className="w-full flex flex-col mb-7">
                {["Email", "Password", "Confirm Password", "Upload File (PRC ID)"].map((label, index) => (
                    <InputField key={index} label={label} type={label === "Upload File (PRC ID)" ? "file" : "text"} />
                ))}
            </div>
            <div className="register w-full">
                <button>
                    Submit
                </button>
            </div>
        </div>
    );
};

// Doctor Registration Page
const DoctorRegistration = () => {
    return (
        <div>
            <div className="fixed h-[10vh] flex items-center justify-center w-full">
                <Link href="/">
                    home
                </Link>
            </div>
            <div className="flex flex-row h-[100vh]">
                <div className="w-full bg-[#C3EFEB]">
                    <Image
                        src="graphics/doc-register.svg"
                        alt="svg"
                        fill
                        objectFit="contain"
                        className="w-full h-auto"
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

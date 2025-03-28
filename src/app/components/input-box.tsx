"use client";
import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, Upload, User } from "lucide-react";
import './components.css';

interface InputFieldProps {
    label: string;
    type: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const InputField = ({ label, type, value, onChange }: InputFieldProps) => {
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
                value={value}
                onChange={onChange}
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

export default InputField;
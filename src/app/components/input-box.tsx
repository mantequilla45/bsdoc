"use client";
import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, Upload, User, MessageSquare } from "lucide-react";
import './components.css';
import { MdOutlineSubtitles } from "react-icons/md";

interface InputFieldProps {
    label: string;
    type: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    rows?: number;
}

const InputField = ({ label, type, value, onChange, rows = 4 }: InputFieldProps) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const getLeftIcon = () => {
        switch (label) {
            case "First Name":
            case "Last Name":
                return <User className="w-5 h-5 text-gray-500" />;
            case "Email":
                return <Mail className="w-5 h-5 text-gray-500" />;
            case "Password":
            case "Confirm Password":
                return <Lock className="w-5 h-5 text-gray-500" />;
            case "Upload File (PRC ID)":
                return <Upload className="w-5 h-5 text-gray-500" />;
            case "Subject":
                return <MdOutlineSubtitles className="w-5 h-5 text-gray-500" />;
            case "Message":
                return <MessageSquare className="w-5 h-5 text-gray-500" />;
            default:
                return null;
        }
    };

    // Fix: properly handle the input type for password fields
    const getInputType = () => {
        if (type === 'password') {
            return showPassword ? 'text' : 'password';
        }
        return type;
    };

    const inputPaddingRight = type === 'password' ? 'pr-12' : 'pr-4';
    const textareaPaddingRight = 'pr-4';
    const iconTopPosition = type === 'textarea' ? 'top-[18px]' : 'top-1/2';

    const handleFocus = () => {
        setIsFocused(true);
    };

    const handleBlur = () => {
        // Only set isFocused to false if the field is empty
        if (!value) {
            setIsFocused(false);
        }
    };

    return (
        <div className="relative w-full input-container mt-[25px]">
            <div
                className={`absolute text-[13px] pl-[17px] text-[#645F5F] -mt-[20px] transition-all duration-300 ${
                    isFocused ? 'opacity-0 -translate-y-2 pointer-events-none' : 'opacity-100 translate-y-0'
                }`}
            >
                {type === 'textarea' ? null : label}
            </div>

            <div className={`absolute left-[20px] ${iconTopPosition} transform -translate-y-1/2`}>{getLeftIcon()}</div>
            {type === 'textarea' ? (
                <textarea
                    id={label}
                    placeholder=" "
                    required
                    value={value}
                    onChange={onChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    rows={rows}
                    className={`pl-12 ${textareaPaddingRight} w-full pt-4 pb-2`}
                />
            ) : (
                <input
                    type={getInputType()}
                    id={label}
                    placeholder=" "
                    required
                    value={value}
                    onChange={onChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    className={`pl-12 ${inputPaddingRight} w-full`}
                />
            )}
            <label htmlFor={label}>{label}</label>
            {type === 'password' && (
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
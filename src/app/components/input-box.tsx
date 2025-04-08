"use client";
import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, Upload, User, MessageSquare } from "lucide-react"; // Import MessageSquare
import './components.css';
import { MdOutlineSubtitles } from "react-icons/md";

interface InputFieldProps {
    label: string;
    type: string; // e.g., 'text', 'email', 'password', 'file', 'textarea'
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void; // Support both input and textarea events
    rows?: number; // Optional: number of rows for textarea
}

const InputField = ({ label, type, value, onChange, rows = 4 }: InputFieldProps) => { // Added rows prop with default value
    const [showPassword, setShowPassword] = useState(false);

    // Get appropriate icon based on input type or label
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
            case "Message": // Added case for Message
                 return <MessageSquare className="w-5 h-5 text-gray-500" />;
            default:
                return null;
        }
    };

    // Determine the actual input type for the input element (handles password visibility)
    // For textarea, the type attribute isn't directly used in the same way.
    const inputElementType = type === 'password' && !showPassword ? "password" : type;

    // Calculate padding - textarea won't have the eye icon
    const inputPaddingRight = type === 'password' ? 'pr-12' : 'pr-4';
    const textareaPaddingRight = 'pr-4'; // Textarea doesn't need space for eye icon

    // Adjust icon vertical position slightly for textarea if needed
    // The `top-1/2` might work okay, but `top-[18px]` or similar could be better for textarea
    const iconTopPosition = type === 'textarea' ? 'top-[18px]' : 'top-1/2';

    return (
        <div className="relative w-full input-container mt-[25px]">
            {/* Left Icon */}
            {/* Adjusted top positioning potentially */}
            <div className={`absolute left-[20px] ${iconTopPosition} transform -translate-y-1/2`}>{getLeftIcon()}</div>

            {/* Conditional Rendering: Input or Textarea */}
            {type === 'textarea' ? (
                <textarea
                    id={label}
                    placeholder=" " // Keep placeholder for floating label CSS trick
                    required
                    value={value}
                    onChange={onChange}
                    rows={rows} // Use the rows prop
                    className={`pl-12 ${textareaPaddingRight} w-full pt-4 pb-2 min-h-[${rows * 1.5}rem]`} // Adjust padding (added pt-4, pb-2) and set min-height based on rows
                />
            ) : (
                <input
                    type={inputElementType} // Use the determined type ('password' or original type)
                    id={label}
                    placeholder=" " // Keep placeholder for floating label CSS trick
                    required
                    value={value}
                    onChange={onChange}
                    className={`pl-12 ${inputPaddingRight} w-full`} // Apply conditional right padding
                />
            )}

            {/* Label - CSS needs to handle positioning for both input and textarea */}
            <label htmlFor={label}>{label}</label>

            {/* Right Icon (Eye Toggle for Password Fields) */}
            {/* Only show if type is 'password' */}
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
// src/components/TextareaField.tsx
"use client";

import React from "react";
import './components.css'; // Or add to your existing components.css

interface TextareaFieldProps {
    label: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    rows?: number;
    required?: boolean;
    placeholder?: string; // Use " " for floating label
    name?: string;
}

/**
 * A textarea component with a floating label (no icon),
 * styled similarly to the provided input CSS.
 */
const TextareaField = ({
    label,
    value,
    onChange,
    rows = 4, // Default rows
    required = false,
    placeholder = " ", // Default for CSS trick
    name
}: TextareaFieldProps) => {

    // Calculate min-height based on rows and approximate line height (e.g., 24px for 16px font)
    // Plus top/bottom padding (15px + 15px = 30px)
    const minHeight = rows * 24 + 30;

    return (
        // Use the specific container class if styles are tied to it
        <div className="input-container"> {/* Re-use container class */}
            <textarea
                id={label}
                name={name}
                placeholder={placeholder}
                required={required}
                value={value}
                onChange={onChange}
                rows={rows} // rows attribute mainly suggests initial size to browser
                className="textarea-styled" // Use a specific class for textarea styles
                style={{ minHeight: `${minHeight}px` }} // Apply calculated min-height
            />
            <label htmlFor={label}>
                {label}
            </label>
        </div>
    );
};

export default TextareaField;
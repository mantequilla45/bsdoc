// src/app/components/Modals/SimpleModal.tsx
'use client'; // <-- Add 'use client' because it uses useRouter

import React from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter here

// Define the props interface
interface SimpleModalProps {
    message: string;
    onClose: () => void;
    link?: string | null; // Link for the primary action button (e.g., Go to Profile)
    linkLabel?: string; // Optional label for the link button (defaults to "Go")
}

const SimpleModal: React.FC<SimpleModalProps> = ({ message, onClose, link, linkLabel = "Go" }) => {
    const router = useRouter();

    const handleLinkClick = () => {
        if (link) {
            router.push(link);
        }
        onClose(); // Close modal after navigation attempt or if no link
    };

    // Prevent clicks inside the modal from closing it
    const handleModalContentClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    // Close on background click
    const handleBackgroundClick = () => {
        onClose();
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[999] p-4"
            onClick={handleBackgroundClick} // Close on background click
        >
            <div
                className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full"
                onClick={handleModalContentClick} // Stop propagation
            >
                <p className="mb-5 text-gray-700">{message}</p>
                <div className="flex justify-end space-x-3">
                    {/* Close button always present */}
                     <button
                        onClick={onClose}
                        type="button" // Good practice for buttons not submitting forms
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 transition duration-150 ease-in-out"
                    >
                        Close
                    </button>
                    {/* Conditional primary action button */}
                    {link && (
                         <button
                            onClick={handleLinkClick}
                            type="button"
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 transition duration-150 ease-in-out"
                        >
                            {linkLabel} {/* Use dynamic label */}
                         </button>
                    )}
                </div>
            </div>
        </div>
    );
};

// Use default export
export default SimpleModal;
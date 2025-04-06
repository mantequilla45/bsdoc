import React from 'react';

interface ToastProps {
    message: string;
    type?: 'success' | 'error' | 'info';
    onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({
    message,
    type = 'success',
    onClose
}) => {
    const types = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-blue-500'
    };

    return (
        <div className={`fixed bottom-4 right-4 flex items-center p-4 rounded-md text-white shadow-lg ${types[type]}`}>
            <span>{message}</span>
            <button
                onClick={onClose}
                className="ml-4 text-white hover:text-gray-200 focus:outline-none"
            >
                ✕
            </button>
        </div>
    );
};
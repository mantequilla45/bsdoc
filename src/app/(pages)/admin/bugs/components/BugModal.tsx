// ./components/BugDetailModal.tsx (or adjust path)
import React from 'react';
import { X } from 'lucide-react';
// Import the correct type definition for a single bug report
// Adjust the path based on where BugManagement or the BugReport interface is defined
import { BugReport } from '../bug-reports';

interface BugDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    // Use the correct type 'BugReport' here instead of 'BugTable'
    bug: BugReport | null;
}

const BugDetailModal: React.FC<BugDetailModalProps> = ({ isOpen, onClose, bug }) => {
    // Rest of the component logic remains the same...
    if (!isOpen || !bug) return null;

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'open': return 'bg-blue-100 text-blue-800';
            case 'in progress': return 'bg-yellow-100 text-yellow-800';
            case 'resolved': return 'bg-green-100 text-green-800';
            case 'closed': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getSeverityColor = (severity: string | null) => {
        switch (severity?.toLowerCase()) {
            case 'critical': return 'bg-red-100 text-red-800';
            case 'high': return 'bg-orange-100 text-orange-800';
            case 'medium': return 'bg-yellow-100 text-yellow-800';
            case 'low': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };


    return (
        // Backdrop
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300 ease-in-out ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
            onClick={onClose} // Close when clicking backdrop
        >
            {/* Modal Content */}
            <div
                className={`bg-white rounded-lg shadow-xl w-full max-w-2xl m-4 overflow-hidden transform transition-all duration-300 ease-in-out ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
                    }`}
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking content
            >
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-semibold text-gray-800">Bug Report Details</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label="Close modal"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">{bug.title}</h3>
                        <p className="text-sm text-gray-600">{bug.description}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="font-semibold text-gray-700">ID:</span>
                            <span className="ml-2 text-gray-600">{bug.id}</span>
                        </div>
                        <div>
                            <span className="font-semibold text-gray-700">Category:</span>
                            <span className="ml-2 text-gray-600">{bug.category}</span>
                        </div>
                        <div>
                            <span className="font-semibold text-gray-700">Status:</span>
                            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(bug.status)}`}>
                                {bug.status}
                            </span>
                        </div>
                         <div>
                            <span className="font-semibold text-gray-700">Severity:</span>
                             <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(bug.severity)}`}>
                                {bug.severity ?? 'N/A'}
                            </span>
                        </div>
                        <div>
                            <span className="font-semibold text-gray-700">Submitted At:</span>
                            <span className="ml-2 text-gray-600">{new Date(bug.created_at).toLocaleString()}</span>
                        </div>
                        <div>
                            <span className="font-semibold text-gray-700">Last Updated:</span>
                            <span className="ml-2 text-gray-600">{bug.updated_at ? new Date(bug.updated_at).toLocaleString() : 'N/A'}</span>
                        </div>
                        <div>
                             <span className="font-semibold text-gray-700">Submitter User ID:</span>
                             <span className="ml-2 text-gray-600">{bug.user_id ?? 'N/A'}</span>
                         </div>
                         <div>
                             <span className="font-semibold text-gray-700">Submitter Email:</span>
                             <span className="ml-2 text-gray-600">{bug.profiles?.email ?? bug.email + ' (Visitor)'}</span>
                         </div>
                    </div>
                </div>

                {/* Footer (optional) */}
                <div className="flex justify-end p-4 border-t bg-gray-50">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors text-sm"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BugDetailModal;
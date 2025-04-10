// Example file path: src/app/(pages)/admin/doctor-verifications/components/PendingVerificationsList.tsx
'use client'; // Mark this as a Client Component

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Loader, AlertCircle } from 'lucide-react';

// Define a type for the data expected from the API
interface VerificationRequest {
    verificationId: string;
    userId: string;
    prcIdUrl: string; // This is the file path, not a direct URL
    submittedAt: string;
    status: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
}

function PendingVerificationsList() {
    const [requests, setRequests] = useState<VerificationRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [viewingProofId, setViewingProofId] = useState<string | null>(null);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const router = useRouter();

    // Fetch pending requests on component mount
    useEffect(() => {
        fetchVerificationRequests();
    }, []); // Empty dependency array means run once on mount

    // Function to fetch verification requests
    const fetchVerificationRequests = async () => {
        setIsLoading(true);
        setError(null);
        
        try {
            // 1. Check Session first
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();

            if (sessionError || !session) {
                console.error("No session found:", sessionError);
                setError("Authentication error: Not logged in");
                router.push('/');
                return;
            }
            
            // 2. Make API request with token
            const response = await fetch('/api/admin/doctor-verifications', {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorResult = await response.json();
                throw new Error(errorResult.error || `HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            if (Array.isArray(result.data)) {
                setRequests(result.data);
            } else {
                console.error("API response is not an array:", result.data);
                setError("Invalid data format received from API");
            }
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error has occurred.';
            console.error('Error fetching verification requests:', err);
            setError(errorMessage || 'Failed to load verification requests.');
        } finally {
            setIsLoading(false);
        }
    };

    // Handler for viewing proof
    const handleViewProof = async (verificationId: string) => {
        setViewingProofId(verificationId);
        setError(null);
        
        try {
            // Get current session
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                setError("Authentication error: Not logged in");
                return;
            }
            
            // Make API request with token
            const response = await fetch(`/api/admin/doctor-verifications/${verificationId}/proof-url`, {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorResult = await response.json();
                throw new Error(errorResult.error || `HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            if (result.signedUrl) {
                window.open(result.signedUrl, '_blank');
            } else {
                throw new Error('No signed URL received from server.');
            }
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error has occurred.';
            console.error('Error retrieving proof URL:', err);
            setError(errorMessage || 'Could not retrieve proof URL.');
        } finally {
            setViewingProofId(null);
        }
    };

    // Function to handle approval
    const handleApprove = async (verificationId: string, userId: string) => {
        if (!confirm("Are you sure you want to approve this doctor?")) {
            return;
        }
        
        setProcessingId(verificationId);
        setError(null);
        
        try {
            // Get current session
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                setError("Authentication error: Not logged in");
                return;
            }
            
            const response = await fetch(`/api/admin/doctor-verifications/${verificationId}/approve`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }
            
            // Refresh the list after approval
            fetchVerificationRequests();
            alert("Doctor verification approved successfully");
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
            setError(errorMessage);
            console.error("Error approving doctor:", err);
        } finally {
            setProcessingId(null);
        }
    };

    // Function to handle rejection
    const handleReject = async (verificationId: string, userId: string) => {
        if (!confirm("Are you sure you want to reject this verification?")) {
            return;
        }
        
        setProcessingId(verificationId);
        setError(null);
        
        try {
            // Get current session
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                setError("Authentication error: Not logged in");
                return;
            }
            
            const response = await fetch(`/api/admin/doctor-verifications/${verificationId}/reject`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }
            
            // Refresh the list after rejection
            fetchVerificationRequests();
            alert("Doctor verification rejected");
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
            setError(errorMessage);
            console.error("Error rejecting verification:", err);
        } finally {
            setProcessingId(null);
        }
    };

    // Render loading state
    if (isLoading) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <div className="flex flex-col items-center">
                    <Loader className="h-12 w-12 animate-spin text-blue-600" />
                    <p className="mt-4 text-lg text-gray-700">Loading verification requests...</p>
                </div>
            </div>
        );
    }

    // Display general error for loading list
    if (error) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <div className="flex flex-col items-center bg-red-50 p-8 rounded-lg shadow-md">
                    <AlertCircle className="h-12 w-12 text-red-600" />
                    <h2 className="mt-4 text-xl font-semibold text-red-900">Error</h2>
                    <p className="mt-2 text-center text-red-700">{error}</p>
                    <button
                        onClick={() => fetchVerificationRequests()}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4">
            <h2 className="text-2xl font-semibold mb-6">Pending Doctor Verifications</h2>

            {requests.length === 0 ? (
                <div className="bg-white p-6 rounded-lg shadow text-center">
                    <p className="text-gray-700">No pending verification requests found.</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted At</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {requests.map((req) => (
                                <tr key={req.verificationId} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">{req.firstName || ''} {req.lastName || ''}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{req.email || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{new Date(req.submittedAt).toLocaleString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap space-x-2">
                                        <button
                                            onClick={() => handleViewProof(req.verificationId)}
                                            disabled={viewingProofId === req.verificationId || processingId === req.verificationId}
                                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
                                        >
                                            {viewingProofId === req.verificationId ? 'Loading...' : 'View Proof'}
                                        </button>
                                        <button 
                                            onClick={() => handleApprove(req.verificationId, req.userId)}
                                            disabled={processingId === req.verificationId}
                                            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed transition-colors"
                                        >
                                            {processingId === req.verificationId ? 'Processing...' : 'Approve'}
                                        </button>
                                        <button 
                                            onClick={() => handleReject(req.verificationId, req.userId)}
                                            disabled={processingId === req.verificationId}
                                            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed transition-colors"
                                        >
                                            {processingId === req.verificationId ? 'Processing...' : 'Reject'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default PendingVerificationsList;
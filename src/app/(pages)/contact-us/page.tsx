'use client'
import Header from "@/app/layout/header";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import ContactForm from './components/ContactForm';
import ContactBackground from './components/Background';
import ContactGraphic from './components/Graphics';
import Footer from "@/app/layout/footer";

const ContactUs = () => {
    const [submissionStatus, setSubmissionStatus] = useState<string | null>(null);
    const [userEmail, setUserEmail] = useState('');

    useEffect(() => {
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user?.email) {
                setUserEmail(session.user.email);
            }
        };

        getSession();
    }, []);

    const handleSubmission = async (formData: {
        category: string,
        severity: string | null,
        email: string,
        subject: string,
        message: string
    }) => {
        const { data: { session } } = await supabase.auth.getSession();
        const authToken = session?.access_token;

        const reportData = {
            category: formData.category,
            severity: formData.category === 'Bug Report' ? formData.severity : null,
            email: formData.email,
            description: formData.message,
            title: formData.subject,
        };

        const headers: { 'Content-Type': string; Authorization?: string } = {
            'Content-Type': 'application/json',
        };

        if (authToken) {
            headers['Authorization'] = `Bearer ${authToken}`;
        }

        try {
            const response = await fetch('/api/admin/bugs', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(reportData),
            });

            if (response.ok) {
                setSubmissionStatus('success');
                return true;
            } else {
                setSubmissionStatus('error');
                console.error('Error submitting report:', await response.json());
                return false;
            }
        } catch (error) {
            setSubmissionStatus('error');
            console.error('Error submitting report:', error);
            return false;
        }
    };

    return (
        <div className="bg-[#C3EFEB] min-h-screen relative overflow-hidden">
            <Header background="white" title="Contact Us" />

            {/* Background Component */}
            <ContactBackground />

            <div className="relative z-10 flex justify-center items-center min-h-screen py-8 sm:py-12 md:py-16 lg:py-20">
                <div className="flex flex-col md:flex-row items-center justify-center max-w-[1850px] w-full px-4 md:px-6 lg:px-8">
                    
                    {/* Contact Image Component - Hidden on small screens, visible with responsive sizes on larger screens */}
                    <div className="hidden md:block flex-shrink-0 md:mr-6 lg:mr-12 xl:mr-[230px] mb-6 md:mb-0 md:w-2/5 lg:w-1/2">
                        <ContactGraphic />
                    </div>

                    {/* Contact Form Component */}
                    <div className="w-full sm:w-11/12 md:w-3/5 lg:w-1/2 max-w-[600px] px-2 sm:px-0">
                        <ContactForm 
                            initialEmail={userEmail} 
                            onSubmit={handleSubmission}
                            submissionStatus={submissionStatus}
                        />
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    )
}

export default ContactUs;
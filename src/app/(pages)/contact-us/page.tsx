'use client'
import Image from 'next/image';
import Header from "@/app/layout/header";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

const ContactUs = () => {
    const [category, setCategory] = useState('');
    const [severity, setSeverity] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [submissionStatus, setSubmissionStatus] = useState<string | null>(null); // 'success', 'error', null
    const [title, setTitle] = useState('');

    useEffect(() => {
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user?.email) {
                setEmail(session.user.email);
            }
        };

        getSession();
    }, []);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        const { data: { session } } = await supabase.auth.getSession();
        const authToken = session?.access_token;

        const reportData = {
            category,
            severity: category === 'Bug Report' ? severity : null,
            email,
            description: message,
            title: title,//category === 'Bug Report' ? `Bug Report: ${message.substring(0, 50)}...` : `Feedback: ${message.substring(0, 50)}...`, // Create a basic title
        };

        const headers: { 'Content-Type': string; Authorization?: string } = {
            'Content-Type': 'application/json',
        };

        if (authToken) {
            headers['Authorization'] = `Bearer ${authToken}`;
        }

        const response = await fetch('/api/admin/bugs', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(reportData),
        });

        if (response.ok) {
            setSubmissionStatus('success');
            setCategory('');
            setSeverity('');
            setMessage('');
            setTitle('');
        } else {
            setSubmissionStatus('error');
            console.error('Error submitting report:', await response.json());
        }
    };

    return (
        <div className="bg-[#C3EFEB] min-h-screen relative overflow-hidden">
            <Header background="white" title="Contact Us" />

            {/* Background Image */}
            <div className="absolute inset-0 -left-[360px] top-0 z-0 h-full w-full">
                <Image
                    src="/graphics/doc-register.svg"
                    alt="background"
                    layout="fill"
                    objectFit="fill"
                />
            </div>


            <div className="relative z-10 flex justify-center items-center min-h-screen">
                <div className="flex flex-row items-center max-w-[1850px] w-full">

                    {/* Contact Image */}
                    <div className="flex-shrink-0 mr-[230px]">
                        <Image
                            src="/graphics/contactus.svg"
                            alt="contact graphics"
                            width={900}
                            height={900}
                            className="max-w-full"
                        />
                    </div>

                    {/* Contact Form */}
                    <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-[600px]">
                        <form className="flex flex-col items-center gap-6" onSubmit={handleSubmit}>
                            <div className="flex items-center gap-3">
                                <h1 className="text-4xl font-bold">Contact Us</h1>
                                <Image
                                    src="/graphics/logingraphic.svg"  // Replace with your image
                                    alt="mail icon"
                                    width={80}
                                    height={80}
                                />
                            </div>

                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="py-3 px-5 w-full border-[2px] rounded-xl font-light focus:ring-2 focus:ring-[#E97A73]"
                                required
                            >
                                <option value="">Select Category</option>
                                <option value="Bug Report">Bug Report</option>
                                <option value="Feature Request/Feedback">Feature Request/Feedback</option>
                                <option value="General Inquiry">General Inquiry</option>
                            </select>

                            {category === 'Bug Report' && (
                                <select
                                    value={severity}
                                    onChange={(e) => setSeverity(e.target.value)}
                                    className="py-3 px-5 w-full border-[2px] rounded-xl font-light focus:ring-2 focus:ring-[#E97A73]"
                                    required
                                >
                                    <option value="">Select Severity</option>
                                    <option value="Critical">Critical</option>
                                    <option value="Major">Major</option>
                                    <option value="Minor">Minor</option>
                                    <option value="Trivial">Trivial</option>
                                </select>
                            )}

                            <input
                                type="email"
                                placeholder="Email"
                                className="py-3 px-5 w-full border-[2px] rounded-xl font-light focus:ring-2 focus:ring-[#E97A73]"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <input
                                type="text"
                                placeholder="Title"
                                className="py-3 px-5 w-full border-[2px] rounded-xl font-light focus:ring-2 focus:ring-[#E97A73]"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                            <textarea
                                placeholder="Message"
                                className="w-full h-[400px] p-3 border-[2px] rounded-xl focus:ring-2 focus:ring-[#E97A73] text-left align-top"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                required
                            ></textarea>
                            <button type="submit" className="py-3 px-6 w-full border-[1px] rounded-full font-bold bg-[#78DDD3] text-white cursor-pointer hover:bg-[#62B6B8]">
                                Send
                            </button>

                            {submissionStatus === 'success' && (
                                <p className="text-green-500">Report submitted successfully!</p>
                            )}
                            {submissionStatus === 'error' && (
                                <p className="text-red-500">Failed to submit report. Please try again.</p>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ContactUs;
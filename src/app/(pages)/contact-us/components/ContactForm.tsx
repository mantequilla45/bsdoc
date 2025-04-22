// components/contact-form.tsx
'use client'
import React, { useState } from 'react';
import Image from 'next/image';
import InputField from '@/app/components/input-box';
import TextareaField from '@/app/components/text-area';

interface ContactFormProps {
    initialEmail: string;
    onSubmit: (formData: {
        category: string,
        severity: string | null,
        email: string,
        subject: string,
        message: string
    }) => Promise<boolean>;
    submissionStatus: string | null;
}

const ContactForm: React.FC<ContactFormProps> = ({ initialEmail, onSubmit, submissionStatus }) => {
    const [category, setCategory] = useState('');
    const [severity, setSeverity] = useState('');
    const [email, setEmail] = useState(initialEmail);
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Update email if initialEmail changes (e.g. after login)
    React.useEffect(() => {
        if (initialEmail) {
            setEmail(initialEmail);
        }
    }, [initialEmail]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsSubmitting(true);

        const success = await onSubmit({
            category,
            severity: category === 'Bug Report' ? severity : null,
            email,
            subject,
            message
        });

        if (success) {
            // Reset form fields
            setCategory('');
            setSeverity('');
            setSubject('');
            setMessage('');
        }
        
        setIsSubmitting(false);
    };

    return (
        <div className="bg-white p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl shadow-md sm:shadow-lg w-full">
            <form className="flex flex-col items-center gap-3 sm:gap-4" onSubmit={handleSubmit}>
                <div className="flex items-center gap-2 sm:gap-3">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Contact Us</h1>
                    <Image
                        src="/graphics/logingraphic.svg"
                        alt="mail icon"
                        width={60}
                        height={60}
                        className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16"
                    />
                </div>

                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="py-3 sm:py-[15px] px-4 sm:px-5 w-full border-[2px] focus:border-[#216b70] rounded-lg sm:rounded-xl font-light text-sm sm:text-base"
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
                        className="py-3 px-4 sm:px-5 w-full border-[2px] rounded-lg sm:rounded-xl font-light focus:border-[#216b70] text-sm sm:text-base"
                        required
                    >
                        <option value="">Select Severity</option>
                        <option value="Critical">Critical</option>
                        <option value="Major">Major</option>
                        <option value="Minor">Minor</option>
                        <option value="Trivial">Trivial</option>
                    </select>
                )}
                
                <InputField
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                
                <InputField
                    label="Subject"
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                />
                
                <TextareaField
                    label="Message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                />
                
                <button 
                    type="submit" 
                    className="py-2.5 sm:py-3 mt-3 sm:mt-5 px-4 sm:px-6 w-full border-[1px] rounded-full font-bold bg-[#78DDD3] text-white cursor-pointer hover:bg-[#62B6B8] disabled:opacity-70 text-sm sm:text-base transition-colors duration-200"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Sending...' : 'Send'}
                </button>

                {submissionStatus === 'success' && (
                    <p className="text-green-500 text-sm sm:text-base mt-2">Message sent successfully!</p>
                )}
                {submissionStatus === 'error' && (
                    <p className="text-red-500 text-sm sm:text-base mt-2">Failed to send message. Please try again.</p>
                )}
            </form>
        </div>
    );
};

export default ContactForm;
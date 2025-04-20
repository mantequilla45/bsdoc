// src/app/(pages)/doctors/[id]/page.tsx
import React from 'react';
import DoctorDetails from '@/app/components/booking/DoctorDetails';
import Header from '@/app/layout/header'; // Make sure path is correct
import Link from 'next/link'; // Import Link for navigation
import { ArrowLeft } from 'lucide-react'; // Example icon

const DoctorDetailsPage: React.FC<{ params: { id: string } }> = ({ params }) => {
    const { id } = params;

    return (
        // Added wrapper div with background and overflow control
        <div className="overflow-x-hidden bg-[#EEFFFE] min-h-screen">
            {/* Added Header */}
            {/* Title could be dynamic if you fetch doctor name here, otherwise use generic */}
            <Header background="#EEFFFE" title="Doctor Details" />

            {/* Main content area */}
            {/* Added padding-top (pt-24 or similar) to clear the fixed header */}
            <main className="max-w-screen-lg mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24 md:pt-28">

                {/* Optional: Back button */}
                <div className="mb-6">
                    <Link href="/doctors" className="inline-flex items-center text-blue-600 hover:text-blue-800 group">
                        <ArrowLeft size={18} className="mr-2 transition-transform group-hover:-translate-x-1" />
                        Back to Doctors List
                    </Link>
                </div>

                 {/* You might want a heading here too, potentially fetched in DoctorDetails */}
                 {/* <h1 className="text-3xl md:text-4xl font-bold mb-6 md:mb-8 text-gray-800">Doctor Profile</h1> */}

                {/* DoctorDetails component will render here */}
                {/* Its appearance and layout depend on its internal implementation */}
                 <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
                    <DoctorDetails doctorId={id} />
                 </div>

            </main>

             {/* Optional: Add a Footer component here */}
             {/* <Footer /> */}
        </div>
    );
};

export default DoctorDetailsPage;
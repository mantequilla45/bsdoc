// src/app/(pages)/doctors/page.tsx
import React from 'react';
import DoctorList from '../../components/booking/DoctorList'; // Assuming this path is correct
import Header from '@/app/layout/header'; // Make sure path is correct

const DoctorsPage: React.FC = () => {
    return (
        // Added wrapper div with background and overflow control
        <div className="overflow-x-hidden bg-[#EEFFFE] min-h-screen">
            {/* Added Header */}
            <Header background="#EEFFFE" title="Our Doctors" />

            {/* Main content area with responsive padding and max-width */}
            {/* Added padding-top (pt-24 or similar) to clear the fixed header */}
            <main className="max-w-screen-lg mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24 md:pt-28">
                {/* Styled heading */}
                <h1 className="text-3xl md:text-4xl font-bold text-center mb-6 md:mb-10 text-gray-800">
                    Our Doctors
                </h1>

                {/* DoctorList component will render here */}
                {/* Its appearance and layout depend on its internal implementation */}
                <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
                     {/* You might add filtering/sorting controls here above the list */}
                     <DoctorList />
                </div>
            </main>

             {/* Optional: Add a Footer component here */}
             {/* <Footer /> */}
        </div>
    );
};

export default DoctorsPage;
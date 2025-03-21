// src/app/pages/doctors/[id].tsx
import React from 'react';
import DoctorDetails from '../../components/booking/DoctorDetails';

const DoctorDetailsPage: React.FC<{ params: { id: string } }> = ({ params }) => {
    const { id } = params;
    return (
        <div>
            <DoctorDetails doctorId={id} />
        </div>
    );
};

export default DoctorDetailsPage;
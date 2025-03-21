// src/app/pages/doctors/index.tsx
import React from 'react';
import DoctorList from '../../components/booking/DoctorList';

const DoctorsPage: React.FC = () => {
    return (
        <div>
            <h1>Our Doctors</h1>
            <DoctorList />
        </div>
    );
};

export default DoctorsPage;
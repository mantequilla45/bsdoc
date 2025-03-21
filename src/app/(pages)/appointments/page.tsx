// src/app/pages/appointments/index.tsx
import React from 'react';
import AppointmentList from '../../components/booking/AppointmentList';

const AppointmentsPage: React.FC = () => {
    return (
        <div>
            <h1>My Appointments</h1>
            <AppointmentList />
        </div>
    );
};

export default AppointmentsPage;
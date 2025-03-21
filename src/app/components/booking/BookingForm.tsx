// src/app/components/BookingForm.tsx
import React, { useState } from 'react';

interface BookingFormProps {
    doctorId: string;
    selectedDate: string;
    availableTime: string; // Or a time slot object
    onBookingSuccess: () => void;
}

const BookingForm: React.FC<BookingFormProps> = ({
    doctorId,
    selectedDate,
    availableTime,
    onBookingSuccess,
}) => {
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleBooking = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/appointments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    doctor_id: doctorId,
                    appointment_date: selectedDate,
                    appointment_time: availableTime, // Or extract time from slot object
                    notes: notes,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to book appointment');
            }

            onBookingSuccess(); // Notify parent component
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error has occurred';
            console.log(err)
            setError(errorMessage || 'Could not book appointment');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h3>Confirm Booking</h3>
            <p>Doctor ID: {doctorId}</p>
            <p>Date: {selectedDate}</p>
            <p>Time: {availableTime}</p>
            <label htmlFor="notes">Notes:</label>
            <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
            />
            <button onClick={handleBooking} disabled={loading}>
                {loading ? 'Booking...' : 'Book Appointment'}
            </button>
            {error && <div>Error: {error}</div>}
        </div>
    );
};

export default BookingForm;
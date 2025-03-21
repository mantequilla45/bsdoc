// src/app/components/AvailabilityCalendar.tsx
import React, { useState } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';

interface AvailabilityCalendarProps {
    doctorId: string;
    onDateSelect: (date: string) => void;
}

const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({ doctorId, onDateSelect }) => {
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [availableDates, setAvailableDates] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Function to fetch available dates for the doctor
    const fetchAvailableDates = async () => {
        setIsLoading(true);
        setError(null);
        
        try {
            const response = await fetch(`/api/availability?doctorId=${doctorId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch available dates');
            }
            const data = await response.json();
            setAvailableDates(data.availableDates || []);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error has occurred';
            console.log(err);
            setError(errorMessage || 'Could not fetch available dates');
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch available dates when doctorId changes
    React.useEffect(() => {
        if (doctorId) {
            fetchAvailableDates();
        }
    }, [doctorId]);

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const dateString = e.target.value;
        setSelectedDate(dateString);
        onDateSelect(dateString);
    };

    // Get current date in YYYY-MM-DD format for min date attribute
    const today = new Date().toISOString().split('T')[0];
    
    // Calculate date 3 months from now for max date attribute
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
    const maxDate = threeMonthsFromNow.toISOString().split('T')[0];

    return (
        <div className="availability-calendar">
            <h3>Select a Date</h3>
            <div className="date-picker-container">
                <CalendarIcon size={24} className="calendar-icon" />
                <input
                    type="date"
                    value={selectedDate}
                    onChange={handleDateChange}
                    min={today}
                    max={maxDate}
                    className="date-input"
                />
            </div>
            
            {isLoading && <p>Loading available dates...</p>}
            {error && <p className="error-message">Error: {error}</p>}
            
            {!isLoading && !error && availableDates.length === 0 && (
                <p>No available dates found for this doctor.</p>
            )}
            
            {!isLoading && !error && availableDates.length > 0 && (
                <div className="available-dates">
                    <h4>Available Dates:</h4>
                    <ul>
                        {availableDates.map((date) => (
                            <li key={date}>
                                <button 
                                    onClick={() => {
                                        setSelectedDate(date);
                                        onDateSelect(date);
                                    }}
                                    className={selectedDate === date ? 'selected' : ''}
                                >
                                    {new Date(date).toLocaleDateString()}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            
            <style jsx>{`
                .availability-calendar {
                    margin: 1rem 0;
                }
                .date-picker-container {
                    display: flex;
                    align-items: center;
                    margin-bottom: 1rem;
                }
                .calendar-icon {
                    margin-right: 0.5rem;
                }
                .date-input {
                    padding: 0.5rem;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                }
                .available-dates ul {
                    list-style: none;
                    padding: 0;
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                }
                .available-dates button {
                    padding: 0.5rem;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                    background: white;
                    cursor: pointer;
                }
                .available-dates button.selected {
                    background: #007bff;
                    color: white;
                }
                .error-message {
                    color: red;
                }
            `}</style>
        </div>
    );
};

export default AvailabilityCalendar;
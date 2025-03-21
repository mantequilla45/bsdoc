import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Record } from './index';
import LoadingPlaceholder from './loading';

interface RecordsProps {
    userId: string;
}

const Records = ({ userId }: RecordsProps) => {
    const [userRecords, setUserRecords] = useState<Record[] | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAllRecords = async () => {
            try {
                const { data, error } = await supabase
                    .from('records')
                    .select('*')
                    .eq('user_id', userId);

                if (error) throw error;

                if (data) {
                    setUserRecords(data as Record[]);
                }
            } catch (err) {
                console.error('Error fetching records:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchAllRecords();
    }, [userId]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    };

    return (
        <div className="w-full space-y-3">
            <p className="text-2xl">BSDOC Records</p>
            <div className="flex flex-col text-sm font-light">
                <div className="flex flex-row font-[400] h-8 items-center gap-16 border-b-[1px] border-[#D1D5DB]">
                    <p className="w-[100px]">Date</p>
                    <p className="w-[100px]">Weight</p>
                    <p className="w-[100px]">Symptoms</p>
                    <p>Health Conditions</p>
                </div>
                {loading ? (
                    <div className="py-4">
                        <div className="flex flex-row h-8 items-center gap-16 border-b-[1px] border-[#D1D5DB]">
                            <div className="w-[100px]"><LoadingPlaceholder /></div>
                            <div className="w-[100px]"><LoadingPlaceholder /></div>
                            <div className="w-[100px]"><LoadingPlaceholder /></div>
                            <div><LoadingPlaceholder /></div>
                        </div>
                        <div className="flex flex-row h-8 items-center gap-16 border-b-[1px] border-[#D1D5DB]">
                            <div className="w-[100px]"><LoadingPlaceholder /></div>
                            <div className="w-[100px]"><LoadingPlaceholder /></div>
                            <div className="w-[100px]"><LoadingPlaceholder /></div>
                            <div><LoadingPlaceholder /></div>
                        </div>
                    </div>
                ) : (
                    userRecords && userRecords.length > 0 ? (
                        userRecords.map((record, index) => (
                            <div className="flex flex-row h-8 items-center gap-16 border-b-[1px] border-[#D1D5DB]" key={index}>
                                <p className="w-[100px]">{formatDate(record.date)}</p>
                                <p className="w-[100px]">{record.weight} kg</p>
                                <p className="w-[100px]">{record.symptoms.join(', ')}</p>
                                <p>{record.health_conditions.join(', ')}</p>
                            </div>
                        ))
                    ) : (
                        <div className="py-4 text-gray-500">No records found</div>
                    )
                )}
            </div>
        </div>
    );
};

export default Records;
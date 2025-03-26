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

            {/* Desktop/Tablet View */}
            <div className="hidden md:block text-sm font-light">
                <table className="w-full border-collapse table-fixed">
                    <thead>
                        <tr className="h-8 border-b-[1px] border-[#D1D5DB]">
                            <th className="font-[400] w-[80px] min-w-[150px] text-left">Date</th>
                            <th className="font-[400] w-[50px] text-left">Weight</th>
                            <th className="font-[400] w-[30%] text-left">Symptoms</th>
                            <th className="font-[400] w-[40%] text-left">Health Conditions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td className="h-8 border-b-[1px] border-[#D1D5DB]"><LoadingPlaceholder /></td>
                                <td className="h-8 border-b-[1px] border-[#D1D5DB]"><LoadingPlaceholder /></td>
                                <td className="h-8 border-b-[1px] border-[#D1D5DB]"><LoadingPlaceholder /></td>
                                <td className="h-8 border-b-[1px] border-[#D1D5DB]"><LoadingPlaceholder /></td>
                            </tr>
                            // Repeat the above <tr> for additional loading placeholders
                        ) : (
                            userRecords && userRecords.length > 0 ? (
                                userRecords.map((record, index) => (
                                    <tr className="h-8 border-b-[1px] border-[#D1D5DB]" key={index}>
                                        <td className="w-[80px] min-w-[150px] truncate overflow-hidden whitespace-nowrap text-ellipsis" title={formatDate(record.date)}>{formatDate(record.date)}</td>
                                        <td className="w-[50px] truncate overflow-hidden whitespace-nowrap text-ellipsis" title={`${record.weight} kg`}>{record.weight} kg</td>
                                        <td className="w-[30%] truncate overflow-hidden whitespace-nowrap text-ellipsis" title={record.symptoms.join(', ')}>{record.symptoms.join(', ')}</td>
                                        <td className="w-[40%] truncate overflow-hidden whitespace-nowrap text-ellipsis" title={record.health_conditions.join(', ')}>{record.health_conditions.join(', ')}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="py-4 text-gray-500 text-center">No records found</td>
                                </tr>
                            )
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile View */}
            <div className="md:hidden">
                {loading ? (
                    <div className="space-y-4">
                        <div className="bg-white shadow rounded-lg p-4">
                            <LoadingPlaceholder />
                        </div>
                        <div className="bg-white shadow rounded-lg p-4">
                            <LoadingPlaceholder />
                        </div>
                    </div>
                ) : (
                    userRecords && userRecords.length > 0 ? (
                        userRecords.map((record, index) => (
                            <div key={index} className="bg-white shadow rounded-lg p-4 mb-4">
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="text-sm">Date</div>
                                    <div className="text-sm font-light">{formatDate(record.date)}</div>

                                    <div className="text-sm">Weight</div>
                                    <div className="text-sm font-light">{record.weight} kg</div>

                                    <div className="text-sm">Symptoms</div>
                                    <div className="text-sm font-light">{record.symptoms.join(', ')}</div>

                                    <div className="text-sm">Health Conditions</div>
                                    <div className="text-sm font-light">{record.health_conditions.join(', ')}</div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-4 text-gray-500 text-center">No records found</div>
                    )
                )}
            </div>
        </div>
    );
};

export default Records;
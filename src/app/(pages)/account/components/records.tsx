'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import LoadingPlaceholder from './loading';

interface RecordsProps {
  userId: string;
}

interface SymptomResult {
  id: string;
  user_id: string;
  input_symptoms: string[];
  likely_conditions: { disease: string }[];
  created_at: string;
  weight?: number;
}

const Records = ({ userId }: RecordsProps) => {
  const [records, setRecords] = useState<SymptomResult[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecords = async () => {
      if (!userId) return;

      const { data, error } = await supabase
        .from('symptom_results')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching symptom_results:', error);
        return;
      }

      setRecords(data);
      setLoading(false);
    };

    fetchRecords();
  }, [userId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  return (
    <div className="w-full space-y-3">
      <p className="text-2xl">BSDOC Records</p>

      <div className="hidden md:block text-sm font-light">
        <table className="w-full border-collapse table-fixed">
          <thead>
            <tr className="h-8 border-b-[1px] border-[#D1D5DB]">
              <th className="font-[400] w-[150px] text-left">Date</th>
              <th className="font-[400] w-[80px] text-left">Weight</th>
              <th className="font-[400] w-[30%] text-left">Symptoms</th>
              <th className="font-[400] w-[40%] text-left">Top Match</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4}><LoadingPlaceholder /></td>
              </tr>
            ) : records && records.length > 0 ? (
              records.map((record, index) => (
                <tr key={index} className="h-8 border-b-[1px] border-[#D1D5DB]">
                  <td>{formatDate(record.created_at)}</td>
                  <td>{record.weight ? `${record.weight} kg` : 'N/A'}</td>
                  <td className="truncate" title={record.input_symptoms.join(', ')}>
                    {record.input_symptoms.join(', ')}
                  </td>
                  <td>{record.likely_conditions?.[0]?.disease || 'N/A'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-4 text-gray-500 text-center">No records found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="md:hidden">
        {loading ? (
          <LoadingPlaceholder />
        ) : records && records.length > 0 ? (
          records.map((record, index) => (
            <div key={index} className="bg-white shadow rounded-lg p-4 mb-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm">Date</div>
                <div className="text-sm font-light">{formatDate(record.created_at)}</div>

                <div className="text-sm">Weight</div>
                <div className="text-sm font-light">{record.weight ? `${record.weight} kg` : 'N/A'}</div>

                <div className="text-sm">Symptoms</div>
                <div className="text-sm font-light">{record.input_symptoms.join(', ')}</div>

                <div className="text-sm">Top Match</div>
                <div className="text-sm font-light">{record.likely_conditions?.[0]?.disease || 'N/A'}</div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-4 text-gray-500 text-center">No records found</div>
        )}
      </div>
    </div>
  );
};

export default Records;

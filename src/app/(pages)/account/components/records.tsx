'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import LoadingPlaceholder from './loading'; // Assuming this component exists
// Import Heroicons
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/20/solid'; // Using 20px solid icons

interface RecordsProps {
  userId: string;
}

// Interface matching actual 'records' table columns
interface RecordEntry {
  user_id: string;
  date: string;
  weight?: number | null;
  symptoms: string[];
  health_conditions: string[];
  // created_at?: string; // Removed as it doesn't exist
}

const Records = ({ userId }: RecordsProps) => {
  const [records, setRecords] = useState<RecordEntry[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchRecords = async () => {
      setLoading(true);
      if (!userId) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('records')
        .select('user_id, date, weight, symptoms, health_conditions')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching records:', error.message || error);
        setRecords([]);
      } else {
        setRecords(data as RecordEntry[]);
      }
      setLoading(false);
    };

    fetchRecords();
  }, [userId]);

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const formatDisplayString = (item: string): string => {
    if (!item) return '';
    const spaced = item.replace(/_/g, ' ');
    return spaced.charAt(0).toUpperCase() + spaced.slice(1);
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) { return 'Invalid Date'; }
        const userTimezoneOffset = date.getTimezoneOffset() * 60000;
        const adjustedDate = new Date(date.getTime() + userTimezoneOffset);
        return `${adjustedDate.getDate().toString().padStart(2, '0')}/${(adjustedDate.getMonth() + 1).toString().padStart(2, '0')}/${adjustedDate.getFullYear()}`;
    } catch (e) {
        console.error("Error formatting date:", e);
        return 'Invalid Date';
    }
  };

  // --- Refactored Table Body Content Logic ---
  let tableBodyContent;
  if (loading) {
    tableBodyContent = (
      <tr>
        {/* Adjusted colSpan to 5 */}
        <td colSpan={5}><LoadingPlaceholder /></td>
      </tr>
    );
  } else if (records && records.length > 0) {
    tableBodyContent = records.flatMap((record, index) => {
      const isExpanded = expandedIndex === index;
      const formattedSymptoms = record.symptoms?.map(formatDisplayString).join(', ') || 'N/A';
      const formattedConditions = record.health_conditions?.map(formatDisplayString).join(', ') || 'N/A';

      return [
        // Main Row
        <tr key={`main-${index}`} className="h-8 border-b-[1px] border-[#D1D5DB]">
          <td className="px-2 py-1 align-top">{formatDate(record.date)}</td>
          <td className="px-2 py-1 align-top">{record.weight ? `${record.weight} kg` : 'N/A'}</td>
          <td className="truncate px-2 py-1 align-top" title={formattedSymptoms}>
            {formattedSymptoms}
          </td>
          <td className="truncate px-2 py-1 align-top" title={formattedConditions}>
            {formattedConditions}
          </td>
          {/* Expand/Collapse Icon Button Column */}
          <td className="px-2 py-1 align-top text-center w-[80px]">
            <button
              onClick={() => toggleExpand(index)}
              className="p-1 text-gray-500 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 rounded" // Added padding and focus style
              aria-expanded={isExpanded}
              aria-label={isExpanded ? 'Collapse row' : 'Expand row'} // Accessibility label
              aria-controls={`details-${index}`}
            >
              {/* Conditionally render icons */}
              {isExpanded ? (
                 <ChevronUpIcon className="h-5 w-5" />
               ) : (
                 <ChevronDownIcon className="h-5 w-5" />
               )}
            </button>
          </td>
        </tr>,
        // Expanded Row
        isExpanded && (
          <tr key={`details-${index}`} id={`details-${index}`} className="border-b-[1px] border-[#D1D5DB] bg-gray-50">
            <td className="px-2 py-2 text-xs italic text-gray-500 align-top">Details:</td>
            {/* Adjusted colSpan to 4 to align under data columns */}
            <td colSpan={4} className="px-2 py-2 align-top">
              <div className="space-y-1 text-xs break-words"> {/* Added break-words */}
                <div>
                  <span className="font-medium">Symptoms:</span> {formattedSymptoms} {/* Show full formatted */}
                </div>
                <div>
                  <span className="font-medium">Conditions:</span> {formattedConditions} {/* Show full formatted */}
                </div>
              </div>
            </td>
          </tr>
        )
      ];
    }).filter(Boolean);
  } else {
    tableBodyContent = (
      <tr>
        {/* Adjusted colSpan to 5 */}
        <td colSpan={5} className="py-4 text-gray-500 text-center">No records found</td>
      </tr>
    );
  }
  // --- End Table Body Logic ---

   // --- Refactored Mobile Body Content Logic ---
   let mobileBodyContent;
   if (loading) {
       mobileBodyContent = <LoadingPlaceholder />;
   } else if (records && records.length > 0) {
       mobileBodyContent = records.map((record, index) => {
            const isExpanded = expandedIndex === index;
            const formattedSymptoms = record.symptoms?.map(formatDisplayString).join(', ') || 'N/A';
            const formattedConditions = record.health_conditions?.map(formatDisplayString).join(', ') || 'N/A';

           return (
               <div key={index} className="bg-white shadow rounded-lg p-4">
                   <div className="grid grid-cols-3 gap-x-2 gap-y-1 mb-2">
                       <div className="text-sm font-medium col-span-1">Date</div>
                       <div className="text-sm font-light col-span-2">{formatDate(record.date)}</div>

                       <div className="text-sm font-medium col-span-1">Weight</div>
                       <div className="text-sm font-light col-span-2">{record.weight ? `${record.weight} kg` : 'N/A'}</div>

                       <div className="text-sm font-medium col-span-1">Symptoms</div>
                       {/* Show truncated initially ONLY if NOT expanded */}
                       <div className={`text-sm font-light col-span-2 break-words ${!isExpanded ? 'line-clamp-2' : ''}`}>
                           {formattedSymptoms}
                       </div>

                       <div className="text-sm font-medium col-span-1">Conditions</div>
                       {/* Show truncated initially ONLY if NOT expanded */}
                       <div className={`text-sm font-light col-span-2 break-words ${!isExpanded ? 'line-clamp-2' : ''}`}>
                          {formattedConditions}
                       </div>
                   </div>

                   {/* Expand/Collapse Button - aligned right */}
                   <div className="text-right border-t pt-2 mt-2">
                      <button
                        onClick={() => toggleExpand(index)}
                        className="p-1 text-gray-500 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 rounded" // Added padding and focus style
                        aria-expanded={isExpanded}
                        aria-label={isExpanded ? 'Show less' : 'Show more'} // Accessibility label
                        aria-controls={`mobile-details-${index}`}
                      >
                         {/* Conditionally render icons */}
                         {isExpanded ? (
                           <ChevronUpIcon className="h-5 w-5" />
                         ) : (
                           <ChevronDownIcon className="h-5 w-5" />
                         )}
                      </button>
                   </div>

                   {/* Conditionally Rendered Expanded Details (Optional: only show full details here if truncated above) */}
                   {/* If the above text is NOT truncated when expanded, this div might not be needed, */}
                   {/* or it could be styled differently. */}
                   {/* Example: Only show this div if you used line-clamp above */}
                   {isExpanded && (
                      <div id={`mobile-details-${index}`} className="mt-2 pt-2 border-t border-gray-200 text-xs space-y-1">
                         <div>
                           <span className="font-semibold">Full Symptoms:</span> {formattedSymptoms}
                         </div>
                         <div>
                            <span className="font-semibold">Full Conditions:</span> {formattedConditions}
                         </div>
                      </div>
                   )}
               </div>
           );
        });
   } else {
       mobileBodyContent = <div className="py-4 text-gray-500 text-center">No records found</div>;
   }
   // --- End Mobile Logic ---

  return (
    <div className="w-full space-y-3">
      <p className="text-2xl">BSDOC Records</p>

      {/* Desktop Table View */}
      <div className="hidden md:block text-sm font-light overflow-x-auto">
        <table className="w-full border-collapse table-fixed min-w-[600px]">
          <thead>
            <tr className="h-8 border-b-[1px] border-[#D1D5DB]">
              <th className="font-[400] w-[120px] text-left px-2">Date</th>
              <th className="font-[400] w-[100px] text-left px-2">Weight</th>
              <th className="font-[400] w-[35%] text-left px-2">Symptoms</th>
              <th className="font-[400] w-[40%] text-left px-2">Health Conditions</th>
              {/* Adjusted width/text for icon button column */}
              <th className="font-[400] w-[80px] text-center px-2">Details</th>
            </tr>
          </thead>
          <tbody>
            {tableBodyContent}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
         {mobileBodyContent}
      </div>
    </div>
  );
};

export default Records;
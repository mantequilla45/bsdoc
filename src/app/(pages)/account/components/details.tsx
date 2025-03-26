import React from 'react';
import LoadingPlaceholder from './loading';

interface DetailSectionProps {
    title: string;
    labels: string[];
    details: string[] | null;
    isLoading: boolean;
}

const DetailSection = ({ title, labels, details, isLoading }: DetailSectionProps) => (
    <div className="flex flex-col gap-2">
        <p className="text-2xl font-normal">{title}</p>
        <div className="w-full">
            <table className="w-full border-collapse">
                <thead>
                </thead>
                <tbody>
                    {labels.map((label, index) => (
                        <tr key={index} className="border-b border-gray-300">
                            <td className="py-2 w-[150px] text-sm">{label}</td>
                            <td className="py-2 text-sm font-light">
                                {isLoading ? (
                                    <LoadingPlaceholder />
                                ) : (
                                    details?.[index] || '-'
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

export default DetailSection;
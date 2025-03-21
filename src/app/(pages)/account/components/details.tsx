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
        <p className="text-2xl">{title}</p>
        <div className="flex flex-col text-sm font-light">
            {labels.map((label, index) => (
                <div className="flex flex-row h-8 items-center gap-16 border-b-[1px] border-[#D1D5DB]" key={index}>
                    <p className="font-[400] w-[100px]">{label}</p>
                    {isLoading ? (
                        <LoadingPlaceholder />
                    ) : (
                        <p>{details?.[index] || '-'}</p>
                    )}
                </div>
            ))}
        </div>
    </div>
);

export default DetailSection;
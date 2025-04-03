// src/app/(pages)/admin/bugs/[id]/BugReportBackButton.tsx
'use client';

import { useRouter } from 'next/navigation';
import React from 'react';

const BugReportBackButton = () => {
    const router = useRouter();

    return (
        <button onClick={() => router.back()} className="mt-4 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
            Back to List
        </button>
    );
};

export default BugReportBackButton;
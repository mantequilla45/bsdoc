// src/app/(pages)/admin/bugs/[id]/page.tsx
import React from 'react';
import Header from '@/app/layout/header';
import { supabase } from '@/lib/supabaseClient';
import { notFound } from 'next/navigation';
import BugReportView from './components/BugReportView';

interface BugReportWithProfile {
    id: string;
    title: string;
    description: string;
    category: string;
    severity: string | null;
    status: string;
    user_id: string | null;
    created_at: string;
    updated_at: string | null;
    profiles: {
        email: string | null;
    } | null;
    email?: string | null;
}

async function getBugReport(bugId: string): Promise<BugReportWithProfile | null> {
    const { data, error } = await supabase
        .from('bugs')
        .select('*, profiles(email)')
        .eq('id', bugId)
        .single();

    if (error) {
        console.error('Error fetching bug report:', error);
        return null;
    }

    return data as BugReportWithProfile | null;
}

interface AdminViewBugReportProps {
    params: Promise<{ id: string }>;
}

export default async function AdminViewBugReport({ params }: Readonly<AdminViewBugReportProps>) {
    const resolvedParams = await params;
    const bugReport = await getBugReport(resolvedParams.id);


    if (!bugReport) {
        return notFound();
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <Header title={`Bug Report: ${bugReport.id.substring(0, 5)}`} background="bg-white" />
            <div className="container mx-auto py-6">
                <h1 className="text-2xl font-semibold mb-4">Bug Report Details</h1>
                <BugReportView bugReport={bugReport} userEmail={bugReport.email}/>
            </div>
        </div>
    );
}
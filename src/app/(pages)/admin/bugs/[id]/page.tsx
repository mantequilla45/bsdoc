import React from 'react';
import Header from '@/app/layout/header';
import { supabase } from '@/lib/supabaseClient';
import { notFound } from 'next/navigation';
import BugReportBackButton from './components/BugReportBackButton';

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

export default async function AdminViewBugReport({ params }: AdminViewBugReportProps) {
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
                <div className="bg-white shadow rounded-md p-6">
                    <p className="mb-2"><strong>ID:</strong> {bugReport.id}</p>
                    <p className="mb-2"><strong>Title:</strong> {bugReport.title}</p>
                    <p className="mb-2"><strong>Category:</strong> {bugReport.category}</p>
                    <p className="mb-2"><strong>Severity:</strong> {bugReport.severity || 'N/A'}</p>
                    <p className="mb-2"><strong>Status:</strong> {bugReport.status}</p>
                    <p className="mb-2"><strong>User:</strong> {bugReport.profiles?.email || 'Visitor'}</p>
                    <p className="mb-2"><strong>Created At:</strong> {new Date(bugReport.created_at).toLocaleString()}</p>
                    <div className="mt-4">
                        <h3 className="text-lg font-semibold mb-2">Description</h3>
                        <p className="whitespace-pre-wrap">{bugReport.description}</p>
                    </div>
                </div>
                <BugReportBackButton />
            </div>
        </div>
    );
}
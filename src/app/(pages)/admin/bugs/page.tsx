// pages/admin/bugs/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/app/layout/header';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

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

const AdminBugReports = () => {
  const [bugReports, setBugReports] = useState<BugReportWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchBugReports = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Check Session and Admin Role
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
          console.error('No session found:', sessionError);
          setError('Not authenticated');
          // Redirect to login page
          router.push('/'); // Adjust the login route as needed
          return;
        }

        const { data, error } = await supabase
          .from('bugs')
          .select('*, profiles(email)')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching bug reports:', error);
          setError('Failed to fetch bug reports.');
        }

        if (data) {
          setBugReports(data as BugReportWithProfile[]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBugReports();
  }, [router]); // Add router to the dependency array

  const handleRowClick = (id: string) => {
    router.push(`/admin/bugs/${id}`);
  };

  if (loading) {
    return;
  }

  if (error) {
    return; // <div>Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header title="Admin: Bug Reports" background="bg-white" />
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-semibold mb-4">Bug Reports</h1>
        {bugReports.length === 0 ? (
          <p>No bug reports found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300">
              <thead className="bg-gray-200">
                <tr>
                  <th className="py-2 px-4 border-b">ID</th>
                  <th className="py-2 px-4 border-b">Title</th>
                  <th className="py-2 px-4 border-b">Category</th>
                  <th className="py-2 px-4 border-b">Severity</th>
                  <th className="py-2 px-4 border-b">Status</th>
                  <th className="py-2 px-4 border-b">User</th>
                  <th className="py-2 px-4 border-b">Created At</th>
                </tr>
              </thead>
              <tbody>
                {bugReports.map(report => (
                  <tr
                    key={report.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleRowClick(report.id)}
                  >
                    <td className="py-2 px-4 border-b">{report.id.substring(0, 5)}</td>
                    <td className="py-2 px-4 border-b">{report.title}</td>
                    <td className="py-2 px-4 border-b">{report.category}</td>
                    <td className="py-2 px-4 border-b">{report.severity ?? 'N/A'}</td>
                    <td className="py-2 px-4 border-b">{report.status}</td>
                    <td className="py-2 px-4 border-b">
                      {report.profiles?.email ?? 'Visitor'}
                    </td>
                    <td className="py-2 px-4 border-b">{new Date(report.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBugReports;

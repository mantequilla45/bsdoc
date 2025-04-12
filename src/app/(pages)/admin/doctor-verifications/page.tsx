import React from 'react';
import PendingVerificationsList from './components/PendingVerificationsList'; // Adjust path if necessary

// This is the main component for the page /admin/doctor-verifications
// By default, this is a Server Component in Next.js App Router
export default function AdminDoctorVerificationPage() {

  // You can add page-specific layout, titles, etc. here if needed
  return (
    <div>
      <h1>Doctor Verification Management</h1>
      <p>Review pending applications from doctors.</p>
      <hr style={{ margin: '20px 0' }} />

      {/* Render the Client Component that handles fetching and interaction */}
      <PendingVerificationsList />

    </div>
  );
}
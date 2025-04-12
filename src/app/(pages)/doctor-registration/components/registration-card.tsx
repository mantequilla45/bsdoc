// src\app\(pages)\doctor-registration\components\registration-card.tsx
'use client';

import { useState } from 'react';

const RegistrationCard = () => {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    file: null as File | null,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;
    if (name === 'file') {
      setForm((prev) => ({ ...prev, file: files?.[0] || null }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const [formError, setFormError] = useState<string | null>(null); // State for the error message
  const [isLoading, setIsLoading] = useState(false); // Optional: State for loading indicator

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); // Start loading
    setFormError(null); // Clear previous errors on new submission

    try {
      if (!form.file) return alert('Please upload your PRC ID');

      // Log the actual URL we're calling
      const apiUrl = '/api/doctors/doctor-registration';
      console.log('Sending request to:', window.location.origin + apiUrl);

      const formData = new FormData();
      formData.append('firstName', form.firstName);
      formData.append('lastName', form.lastName);
      formData.append('email', form.email);
      formData.append('password', form.password);
      formData.append('file', form.file);

      // Adding logging with fetch
      const res = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
      });

      console.log('Response status:', res.status, res.statusText);
      const result = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          setFormError('Email is already in use. Please try logging in or use a different email.')
        }
        else {
          setFormError(result.error || 'An unknown registration error occurred.');
        }
        // Try to get any text from the response
        const errorText = await res.text();
        console.error('Error response body:', errorText);
        throw new Error(`Server responded with ${res.status}: ${errorText || 'No response body'}`);
      }

      alert(result.message || 'Registration successful! Please verify your email to sign in.');
    } catch (error) {
      console.error('Registration error:', error);
      //alert(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-[600px]">
      <form onSubmit={handleSubmit} className="flex bg-white m-5 rounded-2xl py-10 px-8 flex-col">
        <p className="text-3xl mb-8 text-center text-gray-800 font-semibold">Register as Doctor</p>
        <div className="flex gap-5 mb-5">
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            onChange={handleChange}
            className="border rounded-lg p-3 w-1/2 focus:outline-none focus:ring-2 focus:ring-blue-200"
            required />
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            onChange={handleChange}
            className="border rounded-lg p-3 w-1/2 focus:outline-none focus:ring-2 focus:ring-blue-200"
            required />
        </div>
        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          className="border rounded-lg p-3 mb-6 w-full focus:outline-none focus:ring-2 focus:ring-blue-200"
          required />
        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          className="border rounded-lg p-3 mb-6 w-full focus:outline-none focus:ring-2 focus:ring-blue-200"

          required />
        <input
          type="file"
          name="file"
          accept="image/*"
          onChange={handleChange}
          className="mb-8 w-full"
          required />
        <button
          type="submit"
          className="bg-[#48c9b0] text-white py-3 px-6 rounded-lg w-full font-semibold hover:bg-[#34b19b] transition duration-300">
          {isLoading ? 'Submitting...' : 'Submit Registration'}
        </button>
        {formError && (
          <p style={{ color: 'red', marginTop: '10px', textAlign: 'center' }}>
            {/* You might want specific styling */}
            {formError}
          </p>
        )}
      </form>
    </div>

  );
};

export default RegistrationCard;

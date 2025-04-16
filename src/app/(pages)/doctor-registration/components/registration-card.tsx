// src\app\(pages)\doctor-registration\components\registration-card.tsx
'use client';

import { useState } from 'react';
import InputField from '@/app/components/input-box'; // Adjust path as needed
import { Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';

const RegistrationCard = () => {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    file: null as File | null,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, files } = e.target as HTMLInputElement;
    if (name === 'file') {
      setForm((prev) => ({ ...prev, file: files?.[0] || null }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const [formError, setFormError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFormError(null);

    try {
      if (!form.file) return alert('Please upload your PRC ID');

      const apiUrl = '/api/doctors/doctor-registration';
      console.log('Sending request to:', window.location.origin + apiUrl);

      const formData = new FormData();
      formData.append('firstName', form.firstName);
      formData.append('lastName', form.lastName);
      formData.append('email', form.email);
      formData.append('password', form.password);
      formData.append('file', form.file);

      const res = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
      });

      console.log('Response status:', res.status, res.statusText);
      const result = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          setFormError('Email is already in use. Please try logging in or use a different email.');
        } else {
          setFormError(result.error || 'An unknown registration error occurred.');
        }
        const errorText = await res.text();
        console.error('Error response body:', errorText);
        throw new Error(`Server responded with ${res.status}: ${errorText || 'No response body'}`);
      }

      alert(result.message || 'Registration successful! Please verify your email to sign in.');
      router.push('/');
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-[600px]">
      <form onSubmit={handleSubmit} className="flex bg-white m-5 rounded-2xl gap-2 py-10 px-8 flex-col">
        <p className="text-3xl mb-8 text-center text-gray-800 font-semibold">Register as Doctor</p>
        
        <div className="flex gap-5">
          <div className="w-1/2">
            <InputField
              label="First Name"
              type="text"
              value={form.firstName}
              onChange={(e) => setForm(prev => ({ ...prev, firstName: e.target.value }))}
            />
          </div>
          <div className="w-1/2">
            <InputField
              label="Last Name"
              type="text"
              value={form.lastName}
              onChange={(e) => setForm(prev => ({ ...prev, lastName: e.target.value }))}
            />
          </div>
        </div>
        
        <InputField
          label="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
        />
        
        <InputField
          label="Password"
          type="password"
          value={form.password}
          onChange={(e) => setForm(prev => ({ ...prev, password: e.target.value }))}
        />
        
        {/* Custom file input that maintains your design system */}
        <div className="relative w-full input-container mt-[25px] mb-6">
          <div className="absolute left-[20px] top-1/2 transform -translate-y-1/2">
            <Upload className="w-5 h-5 text-gray-500" />
          </div>
          <input
            type="file"
            id="Upload File (PRC ID)"
            name="file"
            accept="image/*"
            onChange={handleChange}
            className="pl-12 pr-4 w-full py-3 cursor-pointer"
            required
          />
          <label htmlFor="Upload File (PRC ID)">Upload File (PRC ID)</label>
          {form.file && (
            <p className="text-sm text-gray-600 mt-1 ml-12">
              Selected: {form.file.name}
            </p>
          )}
        </div>
        
        <button
          type="submit"
          className="bg-[#48c9b0] text-white py-3 px-6 rounded-lg w-full font-semibold hover:bg-[#34b19b] transition duration-300 mt-4"
        >
          {isLoading ? 'Submitting...' : 'Submit Registration'}
        </button>
        
        {formError && (
          <p className="text-red-500 mt-4 text-center">
            {formError}
          </p>
        )}
      </form>
    </div>
  );
};

export default RegistrationCard;
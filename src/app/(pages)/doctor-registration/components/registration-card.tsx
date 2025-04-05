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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.file) return alert('Please upload your PRC ID');

    const formData = new FormData();
    formData.append('firstName', form.firstName);
    formData.append('lastName', form.lastName);
    formData.append('email', form.email);
    formData.append('password', form.password);
    formData.append('file', form.file);

    const res = await fetch('/api/doctor/register', {
      method: 'POST',
      body: formData,
    });

    const result = await res.json();
    alert(result.message || result.error);
  };

  return (
    <form onSubmit={handleSubmit} className="flex bg-white m-5 rounded-2xl py-10 px-8 flex-col">
      <p className="text-3xl mb-5">Register as Doctor</p>
      <div className="flex gap-5 mb-5">
        <input type="text" name="firstName" placeholder="First Name" onChange={handleChange} className="border p-2" required />
        <input type="text" name="lastName" placeholder="Last Name" onChange={handleChange} className="border p-2" required />
      </div>
      <input type="email" name="email" placeholder="Email" onChange={handleChange} className="border p-2 mb-5" required />
      <input type="password" name="password" placeholder="Password" onChange={handleChange} className="border p-2 mb-5" required />
      <input type="file" name="file" accept="image/*" onChange={handleChange} className="mb-5" required />
      <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded">Submit</button>
    </form>
  );
};

export default RegistrationCard;

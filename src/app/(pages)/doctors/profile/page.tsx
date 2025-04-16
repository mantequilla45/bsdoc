// src\app\(pages)\doctors\profile\page.tsx

import React from "react";
import ProfileForm from "./components/ProfileForm";

export default function ProfilePage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-center mb-8 text-gray-700">
                Doctor Profile
            </h1>
            <ProfileForm/>
        </div>
    )
}
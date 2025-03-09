"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient"; // Adjust path as needed

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // Process the OAuth callback
    const handleAuthCallback = async () => {
      try {
        const { error } = await supabase.auth.getSession();
        if (error) {
          console.error("Error getting session:", error);
        }
        
        // Redirect to home or dashboard after successful auth
        router.push("/");
      } catch (error) {
        console.error("Auth callback error:", error);
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Completing Login...</h1>
        <p>Please wait while we complete your authentication.</p>
      </div>
    </div>
  );
}
import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { Toaster } from "react-hot-toast";
import VerificationStatusListener from "@/app/components/RealTimeListener/VerificationStatusListener";

const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BSDOC | Personal Health Management Platform",
  description: "BSDOC empowers you to manage your health records and get personalized over-the-counter medication suggestions through our user-friendly platform. Simplify your healthcare journey with smart digital tools for better self-care.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${rubik.variable} antialiased`}>
        {/* Place listener here, it won't render anything unless triggered */}
        <VerificationStatusListener />

        {/* Toaster for other notifications */}
        <Toaster position="top-center" reverseOrder={false} />
        {children}
        <Analytics />
      </body>
    </html>
  );
}

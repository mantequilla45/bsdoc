"use client";
import React from 'react';
import Link from 'next/link';
import Header from './layout/header';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Footer from './layout/footer';

const NotFound = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white w-full overflow-x-hidden">
      <Header background="white" title="Page Not Found" />

      <main className="flex-grow flex flex-col items-center justify-center px-6 pt-[70px] h-[100vh] w-full">
        {/* Background Elements */}
        <div className="absolute left-0 top-1/4 w-64 h-64 bg-[#62B6B8] rounded-full opacity-10 -z-10"></div>
        <div className="absolute right-0 bottom-1/4 w-80 h-80 bg-[#62B6B8] rounded-full opacity-5 -z-10"></div>

        <div className="container max-w-4xl mx-auto py-16 flex flex-col items-center">
          {/* 404 Content Container */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full text-center"
          >
            {/* 404 Illustration */}
            <div className="relative h-64 mb-8 mr-[-70px]">
              <Image
                src="/graphics/not-found.svg" // Update with an actual image path in your project
                alt="Page Not Found"
                fill
                className="object-contain"
                priority
              />
            </div>

            <motion.h2
              className="text-2xl md:text-3xl font-semibold text-gray-800 mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Oops! Page Not Found
            </motion.h2>

            <motion.p
              className="text-gray-600 max-w-lg mx-auto mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              We couldn&apos;t find the page you&apos;re looking for. It might have been moved, deleted, or never existed in the first place.
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row justify-center gap-4 mt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Link href="/" className="w-full sm:w-auto">
                <button className="bg-[#62B6B8] hover:bg-[#4a9294] text-white font-medium py-3 px-8 rounded-lg shadow-md transition duration-300 w-full">
                  Return Home
                </button>
              </Link>

              <Link href="/contact-us" className="w-full sm:w-auto">
                <button className="bg-white hover:bg-gray-100 text-[#62B6B8] border border-[#62B6B8] font-medium py-3 px-8 rounded-lg shadow-sm transition duration-300 w-full">
                  Contact Support
                </button>
              </Link>
            </motion.div>

            {/* Helpful Links */}
            <motion.div
              className="mt-16 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <h3 className="text-lg font-medium text-gray-800 mb-4">You might be looking for:</h3>
              <div className="flex flex-wrap justify-center gap-3">
                <Link href="/about" className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-[#62B6B8] rounded-full text-sm transition duration-300">
                  About Us
                </Link>
                <Link href="/terms" className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-[#62B6B8] rounded-full text-sm transition duration-300">
                  Terms & Conditions
                </Link>
                <Link href="/dashboard" className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-[#62B6B8] rounded-full text-sm transition duration-300">
                  Dashboard
                </Link>
                <Link href="/faq" className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-[#62B6B8] rounded-full text-sm transition duration-300">
                  FAQ
                </Link>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NotFound;
"use client";
import Header from "@/app/layout/header";
import React, { useState, useEffect, useRef } from 'react';
import { IoSearch } from "react-icons/io5";
import Footer from "@/app/layout/footer";
import { motion, AnimatePresence } from "framer-motion";
import AdvancedSearchForm from "@/app/components/search-symptoms/adv-search-form";
import ImageContainer from "@/app/components/search-symptoms/background";

const SearchSymptomsPage = () => {
    const [isAdvancedSearchEnabled, setIsAdvancedSearchEnabled] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [isSticky, setIsSticky] = useState(true);
    const footerRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (footerRef.current && containerRef.current) {
                const footerTop = footerRef.current.getBoundingClientRect().top;
                const windowHeight = window.innerHeight;

                // If footer is in view, make images absolute
                if (footerTop <= windowHeight) {
                    setIsSticky(false);
                } else {
                    setIsSticky(true);
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0); // Set to true if scrolled
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="min-h-screen flex flex-col">
            <div
                ref={containerRef}
                className={`bg-[#EEFFFE] flex-grow relative ${isAdvancedSearchEnabled ? 'h-full' : 'h-[100vh]'} px-[15%] pt-[10%]`}
            >
                <Header background="transparent" title="Search Symptoms"/>

                {/* Container for images */}
                <ImageContainer
                    isSticky={isSticky}
                    isScrolled={isScrolled}
                    isAdvancedSearchEnabled={isAdvancedSearchEnabled}
                />


                <div className="flex z-10 flex-col gap-5 mt-16 relative">
                    <h1 className="text-7xl">
                        Welcome to <span className="text-[#519496]">BSDOC</span>
                    </h1>
                    <div className="flex items-center gap-4">
                        <p className="pl-7">Advanced Search</p>
                        <button
                            onClick={() => setIsAdvancedSearchEnabled(!isAdvancedSearchEnabled)}
                            className={`w-12 h-6 rounded-full transition duration-300 border-[1px] ${isAdvancedSearchEnabled ? 'bg-blue-500 border-blue-800' : 'bg-gray-300 border-[#777777]'} relative`}
                        >
                            <span
                                className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full transform transition-transform duration-300 ease-in-out
                                ${isAdvancedSearchEnabled ? 'translate-x-1 bg-white' : '-translate-x-5 bg-[#777777]'}`}
                            />
                        </button>
                    </div>
                    <AnimatePresence mode="wait">
                        {isAdvancedSearchEnabled ? (
                            <motion.div
                                key="advanced-search"
                                initial={{ height: "50vh", opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: "50vh", opacity: 0 }}
                                transition={{
                                    duration: 0.6,
                                    ease: "easeInOut"
                                }}
                                className="w-[100%] bg-white rounded-xl mb-[100px] shadow-md border-[1px]"
                            >
                                <AdvancedSearchForm />

                            </motion.div>
                        ) : (
                            <motion.div
                                key="basic-search"
                                initial={{ height: "59vh", opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{
                                    duration: 0.4,
                                    ease: "easeInOut"
                                }}
                            >
                                <div className="space-y-3">
                                    <div className="relative py-4 pl-10 shadow-md border-[1px] rounded-xl px-6 bg-white text-gray-500 text-[35px] flex items-center">
                                        <input
                                            type="text"
                                            placeholder="Search Symptoms..."
                                            value={inputValue}
                                            onChange={(e) => setInputValue(e.target.value)}
                                            className={`w-full border-none outline-none text-xl ${inputValue ? 'text-[#2D383D] font-normal' : 'text-gray-500 font-light'}`}
                                        />
                                        <button className="">
                                            <IoSearch className="text-gray-500 hover:scale-110 active:scale-90 transition duration-300" />
                                        </button>
                                    </div>
                                </div>
                                <p className="text-gray-600 mt-4">
                                    Introducing a new way to diagnose your sickness.
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
            <div ref={footerRef}>
                <Footer />
            </div>
        </div>
    );
};

export default SearchSymptomsPage;
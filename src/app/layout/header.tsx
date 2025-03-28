"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AuthModal from "@/app/(pages)/login/userAuth";
import Link from "next/link";
import { signOut } from "@/services/Auth/auth";
import { supabase } from "@/lib/supabaseClient";
import Image from 'next/image';

const Header = ({ background, title }: { background: string; title: string }) => {
    const [scrolled, setScrolled] = useState(false);
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [pathname, setPathname] = useState("");
    const [loggedIn, setLoggedIn] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const buttonRef = useRef<HTMLDivElement | null>(null);
    const headerRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current &&
                !containerRef.current.contains(event.target as Node) &&
                !buttonRef.current?.contains(event.target as Node)) {
                setMenuOpen(false);
            }
        }
        if (menuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }
    }, [menuOpen]);

    useEffect(() => {
        // Check if user is logged in when component mounts
        const checkAuthStatus = async () => {
            try {
                // Get the current session from Supabase
                const { data: { session } } = await supabase.auth.getSession();
                setLoggedIn(!!session); // Set to true if session exists, false otherwise
            } catch (error) {
                console.error('Error checking authentication status:', error);
                setLoggedIn(false);
            }
        };

        checkAuthStatus();

        // Optional: Subscribe to auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setLoggedIn(!!session);
            }
        );

        // Clean up subscription when component unmounts
        return () => {
            subscription?.unsubscribe();
        };
    }, []);

    useEffect(() => {
        setPathname(window.location.pathname);

        const handleScroll = () => {
            const scrollPosition = window.scrollY;
            setScrolled(scrollPosition > 50);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleAuthSuccess = () => {
        setIsLoginOpen(false);
        setLoggedIn(true);
    };

    const handleModalClose = () => {
        setIsLoginOpen(false);
    };

    return (
        <header
            ref={headerRef}
            className={`text-[#222726] overflow-visible z-50 ${pathname === "/" ? "fixed" : "sticky"} top-0 transition-all duration-300 bg-${background}
                ${scrolled ? "py-0 h-[70px]" : "py-4 md:h-[10vh] h-[80px]"} 
                flex items-center max-w-[1300px] min-w-[100%]`}
        >
            <title>{title}</title>
            <nav className="relative mx-auto flex justify-center items-center md:px-16 px-6 w-full md:h-full">
                {/* Mobile Menu Button */}
                <div
                    className="md:hidden cursor-pointer"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    <div className="space-y-2">
                        <span className={`block w-8 h-0.5 ${pathname === "/" && !scrolled ? "bg-white" : "bg-black"} transform transition duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-2.5' : ''}`}></span>
                        <span className={`block w-8 h-0.5 ${pathname === "/" && !scrolled ? "bg-white" : "bg-black"} transition duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`}></span>
                        <span className={`block w-8 h-0.5 ${pathname === "/" && !scrolled ? "bg-white" : "bg-black"} transform transition duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-2.5' : ''}`}></span>
                    </div>
                </div>

                {/* Desktop Menu */}
                <div className="flex justify-between w-full">
                    <div className="hidden md:flex flex-row items-center gap-5 text-sm relative justify-start w-[400px] z-100">
                        <Link
                            href="/"
                            className={`hover:underline cursor-pointer ${background === "black/40" ? "text-white" : ""}  text-md `}>
                            Home
                        </Link>
                    </div>

                    <div

                        className={`transform header-transition  relative w-[70px] transition-all duration-300
                            ${scrolled ? "scale-[1] translate-y-0 hover:scale-[1.1]" : "translate-y-[35px] scale-[3] hover:scale-[2.7]"}`}
                    >
                        <Link href="/">
                            <Image
                                fill
                                src={`/logo/${background === "black/40" ? "logo-white" : "logo-clear"}.svg`}
                                alt="BSDOC Logo"
                                className="object-contain"
                            />
                        </Link>

                    </div>

                    <ul className="hidden md:flex flex-row items-center gap-5 text-sm relative justify-end w-[400px]">
                        <a
                            href="/appointment-page"
                            className={`hover:underline cursor-pointer ${background === "black/40" ? "text-white" : ""}  text-md `}>
                            Schedule an Appointment
                        </a>

                        {loggedIn ? (
                            <div className="relative">
                                <div
                                    ref={buttonRef}
                                    onClick={() => setMenuOpen(!menuOpen)}
                                    className="w-10 h-10 rounded-full bg-gray-300 cursor-pointer flex items-center justify-center hover:bg-gray-400 transition active:scale-95"
                                >
                                    <span className="text-lg text-white">👤</span>
                                </div>

                                <AnimatePresence>
                                    {menuOpen && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0, y: 0 }}
                                            animate={{ height: "auto", opacity: 1, y: 0 }}
                                            exit={{ height: 0, opacity: 0, y: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="absolute right-0 mt-2 w-40 bg-white shadow-md rounded-lg border-[1px]"
                                            ref={containerRef}
                                        >
                                            <ul className="text-gray-700">
                                                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                                                    <Link href="/account" className="block w-full h-full">Account</Link>
                                                </li>
                                                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                                                    Settings
                                                </li>
                                                <li
                                                    onClick={() => {
                                                        setLoggedIn(false);
                                                        setMenuOpen(false);
                                                        signOut();
                                                    }}
                                                    className="px-4 py-2 hover:bg-red-100 cursor-pointer text-red-500"
                                                >
                                                    Logout
                                                </li>
                                            </ul>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <div
                                onClick={() => setIsLoginOpen(true)}
                                className="py-3 px-8 bg-white rounded-full border border-[#222726] cursor-pointer active:scale-[.95] hover:scale-[.98] transition duration-200"
                            >
                                Sign in
                            </div>
                        )}
                    </ul>
                </div>


                {/* Mobile Menu */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.2 }}
                            className="absolute top-12 right-0 w-full bg-white shadow-lg rounded-lg md:hidden"
                        >
                            <ul className="py-2">
                                <li className="px-4 py-3 hover:bg-gray-100">
                                    <Link href="/schedule" className="block">
                                        Schedule an Appointment
                                    </Link>
                                </li>
                                {loggedIn ? (
                                    <>
                                        <li className="px-4 py-3 hover:bg-gray-100">
                                            <Link href="/account" className="block">Account</Link>
                                        </li>
                                        <li className="px-4 py-3 hover:bg-gray-100">
                                            <Link href="/settings" className="block">Settings</Link>
                                        </li>
                                        <li
                                            onClick={() => {
                                                setLoggedIn(false);
                                                setMobileMenuOpen(false);
                                            }}
                                            className="px-4 py-3 hover:bg-red-100 text-red-500"
                                        >
                                            Logout
                                        </li>
                                    </>
                                ) : (
                                    <li
                                        onClick={() => {
                                            setIsLoginOpen(true);
                                            setMobileMenuOpen(false);
                                        }}
                                        className="px-4 py-3 hover:bg-gray-100"
                                    >
                                        Sign in
                                    </li>
                                )}
                            </ul>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            <AnimatePresence>
                <AuthModal
                    isOpen={isLoginOpen}
                    onClose={handleModalClose}
                    onAuthSuccess={handleAuthSuccess}
                />
            </AnimatePresence>
        </header>
    );
};

export default Header;
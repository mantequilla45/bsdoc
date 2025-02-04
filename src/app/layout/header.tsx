"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AuthModal from "@/app/components/modals/userAuth";
import Link from "next/link";

const Header = ({ background, title }: { background: string; title: string }) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [scrolled, setScrolled] = useState(false);
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [pathname, setPathname] = useState("");
    const [loggedIn, setLoggedIn] = useState(true); // Simulated login state
    const [menuOpen, setMenuOpen] = useState(false); // Profile menu state
    const containerRef = useRef<HTMLDivElement | null>(null);
    const buttonRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node) && !buttonRef.current?.contains(event.target as Node)) {
                setMenuOpen(false);
            }
        }
        if (menuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }
    }, [menuOpen]); // Add menuOpen to dependencies

    useEffect(() => {
        setPathname(window.location.pathname);
        const handleScroll = () => {
            setScrolled(window.scrollY > 0);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <header
            className={`text-[#222726] py-5 px-[5%] z-50 fixed top-0 left-0 right-0 transition duration-300 bg-${background}
                }`}
        >
            <title>{title}</title>
            <nav>
                <ul className="flex flex-row items-center gap-5 justify-end text-sm relative">
                    <li
                        className={`hover:underline cursor-pointer ${pathname === "/" ? "text-white" : "text-[#2D383D]"
                            } text-md`}
                    >
                        Schedule an Appointment
                    </li>

                    {loggedIn ? (
                        <div className="relative">
                            {/* Profile Button */}
                            <div
                                ref={buttonRef}
                                onClick={() => setMenuOpen(!menuOpen)}
                                className="w-10 h-10 rounded-full bg-gray-300 cursor-pointer flex items-center justify-center hover:bg-gray-400 transition active:scale-95"
                            >
                                <span className="text-lg text-white">👤</span>
                            </div>

                            {/* Dropdown Menu */}
                            <AnimatePresence>
                                {menuOpen && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0, y: 0 }}
                                        animate={{ height: "auto", opacity: 1, y: 0 }}
                                        exit={{ height: 0, opacity: 0, y: 0 }}
                                        transition={{ duration: 0.2 }} // Add explicit transition
                                        className="absolute right-0 mt-2 w-40 bg-white shadow-md rounded-lg overflow-hidden border-[1px]"
                                        ref={containerRef}>
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
            </nav>
            <AnimatePresence>
                <AuthModal
                    isOpen={isLoginOpen}
                    onClose={() => {
                        setIsLoginOpen(false);
                        setLoggedIn(true); // Simulating successful login
                    }}
                    initialTab="login"
                />
            </AnimatePresence>
        </header>
    );
};

export default Header;

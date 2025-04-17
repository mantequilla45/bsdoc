// src/app/layout/Header.tsx (or wherever your header component is)
"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AuthModal from "@/app/(pages)/login/userAuth";
import Link from "next/link";
import { signOut } from "@/services/Auth/auth";
import { supabase } from "@/lib/supabaseClient";
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import NotificationBell from '@/app/components/Notifications/NotificationBell'; // Adjust path if needed

const Header = ({ background, title }: { background: string; title: string }) => {
    const router = useRouter();
    const [scrolled, setScrolled] = useState(false);
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [pathname, setPathname] = useState("");
    const [loggedIn, setLoggedIn] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const buttonRef = useRef<HTMLDivElement | null>(null);
    const headerRef = useRef<HTMLElement | null>(null);

    const [userRole, setUserRole] = useState<string | null>(null);
    const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);

    const fetchUserProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('role, profile_image_url')
                .eq('id', userId)
                .single();

            if (error) {
                console.error('Error fetching user profile:', error);
                setUserRole(null);
                setProfileImageUrl(null);
            } else if (data) {
                setUserRole(data.role);
                setProfileImageUrl(data.profile_image_url);
            } else {
                setUserRole(null);
                setProfileImageUrl(null);
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
            setUserRole(null);
            setProfileImageUrl(null);
        }
    };


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
        const checkAuthStatus = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                setLoggedIn(!!session);
                if (session?.user?.id) {
                    await fetchUserProfile(session.user.id);
                }
                else {
                    setUserRole(null);
                    setProfileImageUrl(null);
                }
            } catch (error) {
                console.error('Error checking authentication status:', error);
                setLoggedIn(false);
            }
        };

        checkAuthStatus();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setLoggedIn(!!session);
                if (session?.user?.id) {
                    fetchUserProfile(session.user.id);
                } else {
                    setUserRole(null);
                    setProfileImageUrl(null);
                }
            }
        );

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

    const handleAuthSuccess = async () => {
        window.location.reload();
        setIsLoginOpen(false);
        setLoggedIn(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.id) {
            await fetchUserProfile(session.user.id);
        }
    };

    const handleModalClose = () => {
        setIsLoginOpen(false);
    };

    const handleLogout = async () => {
        try {
            setUserRole(null);
            setProfileImageUrl(null);
            setLoggedIn(false);
            setMenuOpen(false);
            setMobileMenuOpen(false);
            await signOut();
            router.push('/');
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    return (
        <header
            ref={headerRef}
            style={{ backgroundColor: background }}
            className={`text-[#222726] overflow-visible z-50 fixed top-0 transition-all duration-300
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
                <div className="flex justify-between w-full items-center"> {/* Added items-center */}
                    <div className="hidden md:flex flex-row items-center gap-5 text-sm relative justify-start w-[400px] z-100">

                        <Link
                            href="/"
                            className={`hover:underline cursor-pointer ${background === "rgba(0,0,0,0.4)" ? "text-white" : ""}  text-md `}>
                            Home
                        </Link>

                        {userRole === 'doctor' && (
                            <Link
                                href="/doctors/doctor-schedule"
                                className={`hover:underline cursor-pointer ${background === "rgba(0,0,0,0.4)" ? "text-white" : ""}  text-md`}>
                                My Schedule
                            </Link>
                        )}

                        {userRole === 'admin' && (
                            <Link
                                href="/admin"
                                className={`hover:underline cursor-pointer ${background === "rgba(0,0,0,0.4)" ? "text-white" : ""}  text-md`}>
                                Administrator
                            </Link>
                        )}

                    </div>

                    <div
                        className={`transform header-transition  relative w-[70px] transition-all duration-300
                                ${scrolled ? "scale-[1] translate-y-0 hover:scale-[1.1]" : "scale-[1.8] hover:scale-[1.5]"}`}
                    >
                        {/* Changed Link to point to / for logo click */}
                        <Link href="/">
                            <Image
                                fill
                                src={`/logo/${background === "rgba(0,0,0,0.4)" || pathname === '/' && !scrolled ? "logo-white" : "logo-clear"}.svg`} // Adjusted logo logic slightly
                                alt="BSDOC Logo"
                                className="object-contain"
                            />
                        </Link>
                    </div>

                    {/* Right side items grouped together */}
                    <div className="hidden md:flex flex-row items-center gap-5 text-sm relative justify-end w-[400px]">
                        <Link // Changed from <a> to <Link> for client-side navigation
                            href="/appointment-page" // Make sure this route exists
                            className={`hover:underline cursor-pointer ${background === "rgba(0,0,0,0.4)" || pathname === '/' && !scrolled ? "text-white" : ""}  text-md `}>
                            Schedule an Appointment
                        </Link>

                        {/* --> Add NotificationBell here <-- */}
                        {/* It will only render if loggedIn is true (handled internally by NotificationBell) */}
                        <NotificationBell />

                        {loggedIn ? (
                            <div className="relative"> {/* Wrapper for profile menu */}
                                <div
                                    ref={buttonRef}
                                    onClick={() => setMenuOpen(!menuOpen)}
                                    className="w-10 h-10 rounded-full bg-gray-300 cursor-pointer flex items-center justify-center hover:bg-gray-400 transition active:scale-95 overflow-hidden"
                                >
                                    {profileImageUrl ? (
                                        <Image
                                            src={profileImageUrl}
                                            alt="Profile"
                                            width={40} // Use width/height or layout='fill'
                                            height={40}
                                            objectFit="cover"
                                            className="rounded-full"
                                        />
                                    ) : (
                                        <span className="text-xl text-gray-600">👤</span> // Adjusted icon and color
                                    )}
                                </div>

                                <AnimatePresence>
                                    {menuOpen && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="absolute right-0 mt-2 w-40 bg-white shadow-md rounded-lg border-[1px] overflow-hidden" // Added overflow-hidden
                                            ref={containerRef}
                                        >
                                            <ul className="text-gray-700 text-sm"> {/* Adjusted font size */}
                                                {["/account", "Settings", "Logout"].map((item, index) => (
                                                    <motion.li
                                                        key={item}
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -10 }}
                                                        transition={{ duration: 0.2, delay: index * 0.05 }}
                                                        className={`block w-full text-left px-4 py-2 ${item === "/account"
                                                                ? pathname === "/account"
                                                                    ? "pointer-events-none text-[#62B6B8] cursor-not-allowed" // Style for current page
                                                                    : "hover:bg-gray-100 cursor-pointer"
                                                                : item === "Logout"
                                                                    ? "hover:bg-red-100 cursor-pointer text-red-500"
                                                                    : "hover:bg-gray-100 cursor-pointer"
                                                            }`}
                                                        // Use button for logout for better semantics
                                                        onClick={item === "Logout" ? handleLogout : () => setMenuOpen(false)} // Close menu on item click
                                                    >
                                                        {item === "/account" ? (
                                                            <Link href="/account" className="block w-full h-full">Account</Link>
                                                        ) : item === "Settings" ? (
                                                            <Link href="/settings" className="block w-full h-full">Settings</Link> // Assuming /settings route
                                                         ) : (
                                                            item // Just display "Logout" text
                                                        )}
                                                    </motion.li>
                                                ))}
                                            </ul>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <div
                                onClick={() => setIsLoginOpen(true)}
                                className={`py-2 px-6 rounded-full cursor-pointer active:scale-[.95] hover:opacity-90 transition duration-200 text-md border ${ // Adjusted padding/text size
                                    background === "rgba(0,0,0,0.4)" || pathname === '/' && !scrolled
                                        ? "bg-white text-gray-800 border-transparent"
                                        : "bg-transparent text-gray-800 border-gray-800 hover:bg-gray-100"
                                }`}
                            >
                                Sign in
                            </div>
                        )}
                    </div>
                </div>


                {/* Mobile Menu */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.2 }}
                            className="absolute top-full left-0 w-full bg-white shadow-lg rounded-b-lg md:hidden" // Changed position/rounding
                        >
                             <ul className="py-2 flex flex-col items-center"> {/* Center items */}
                                 <li className="px-4 py-3 hover:bg-gray-100 w-full text-center">
                                     <Link href="/" onClick={() => setMobileMenuOpen(false)} className="block">Home</Link>
                                 </li>
                                <li className="px-4 py-3 hover:bg-gray-100 w-full text-center">
                                    <Link href="/appointment-page" onClick={() => setMobileMenuOpen(false)} className="block">
                                        Schedule Appointment
                                    </Link>
                                </li>
                                 {userRole === 'doctor' && (
                                     <li className="px-4 py-3 hover:bg-gray-100 w-full text-center">
                                         <Link href="/doctors/doctor-schedule" onClick={() => setMobileMenuOpen(false)} className="block">My Schedule</Link>
                                     </li>
                                 )}
                                 {userRole === 'admin' && (
                                     <li className="px-4 py-3 hover:bg-gray-100 w-full text-center">
                                         <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="block">Administrator</Link>
                                     </li>
                                 )}
                                {loggedIn ? (
                                    <>
                                        <li className="px-4 py-3 hover:bg-gray-100 w-full text-center border-t mt-2 pt-3"> {/* Separator */}
                                            <Link href="/account" onClick={() => setMobileMenuOpen(false)} className="block">Account</Link>
                                        </li>
                                        <li className="px-4 py-3 hover:bg-gray-100 w-full text-center">
                                            <Link href="/settings" onClick={() => setMobileMenuOpen(false)} className="block">Settings</Link>
                                        </li>
                                        <li
                                            onClick={handleLogout} // Logout closes menu automatically
                                            className="px-4 py-3 hover:bg-red-100 text-red-500 w-full text-center cursor-pointer"
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
                                        className="px-4 py-3 hover:bg-gray-100 w-full text-center cursor-pointer border-t mt-2 pt-3" // Separator
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
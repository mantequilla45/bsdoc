"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { FcGoogle } from "react-icons/fc";
import { FaArrowRightLong } from "react-icons/fa6";
import { IoIosCloseCircle } from "react-icons/io";
import { supabase } from "@/lib/supabaseClient";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setIsLogin(true);
    setErrorMessage("");
  }, [isOpen]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    if (isLogin) {
      // Login user
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setErrorMessage(error.message);
      } else {
        onClose(); // Close modal after successful login
      }
    } else {
      // Signup user
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setErrorMessage(error.message);
      } else {
        onClose(); // Close modal after successful signup
      }
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google" });
    if (error) setErrorMessage(error.message);
    setLoading(false);
  };

  const slideVariants = {
    initial: (direction: number) => ({ x: direction > 0 ? -300 : 300, opacity: 0 }),
    animate: { x: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 30 } },
    exit: (direction: number) => ({ x: direction > 0 ? 300 : -300, opacity: 0 }),
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 flex justify-center items-center z-50 p-10 py-12 overflow-hidden"
          style={{ background: "linear-gradient(to bottom right, #107373, #63B6B9, #55B7BE)" }}
        >
          <div className="bg-[#9ED8D2] w-full h-full rounded-[30px] overflow-hidden relative">
            <div className="absolute inset-0 flex justify-between">
              <div className="w-[60%] relative">
                <Image alt="Login Background" fill src="/graphics/loginbg.svg" className="object-cover" />
                <div className="absolute inset-0 z-10 flex flex-col pt-[160px] pl-[80px]">
                  <h1 className="text-7xl text-[#62B6B8] mt-10">Hello,</h1>
                  <h2 className="text-5xl">Welcome to <span className="text-[#62B6B8]">BSDOC</span></h2>
                  <h3 className="text-3xl">Your Personal Guide to Self-Care for Common Ailments</h3>
                </div>
              </div>

              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-[25px] w-1/3 shadow-2xl z-10 flex flex-col justify-center m-10 relative overflow-hidden"
              >
                <Image alt="Login" src="/graphics/login.svg" className="absolute object-cover w-[100%] h-[90%] z-0" width={0} height={0} />
                <motion.div className="flex justify-center h-full items-center z-50 relative">
                  <div className="relative w-[800px] h-[100%] overflow-hidden">
                    <button onClick={onClose} className="absolute top-4 right-5 z-10 text-gray-500 hover:text-gray-700 duration-300">
                      <IoIosCloseCircle className="w-[40px] h-[40px]" />
                    </button>

                    <AnimatePresence custom={isLogin ? 1 : -1}>
                      <motion.div
                        key={isLogin ? "login" : "signup"}
                        custom={isLogin ? 1 : -1}
                        variants={slideVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="absolute w-full h-full flex flex-col justify-center items-center p-12 px-16 bg-white/90 gap-6"
                      >
                        <h2 className="text-3xl mb-3">{isLogin ? "Welcome Back!" : "Create an Account"}</h2>

                        <button onClick={handleGoogleLogin} className="py-3 w-full border-[1px] bg-white rounded-full flex justify-center items-center gap-6 active:scale-95 duration-300">
                          <FcGoogle className="w-[25px] h-[25px]" />
                          {isLogin ? "Login with Google" : "Sign up with Google"}
                        </button>

                        <div className="w-full border-t border-gray-300" />

                        <form onSubmit={handleAuth} className="space-y-4 w-full">
                          <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="py-3 px-5 w-full border-[1px] rounded-full font-light focus:ring-2 focus:ring-[#62B6B8]"
                            required
                          />
                          <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="py-3 px-5 w-full border-[1px] rounded-full font-light focus:ring-2 focus:ring-[#62B6B8]"
                            required
                          />
                          {!isLogin && (
                            <input
                              type="password"
                              placeholder="Confirm Password"
                              className="py-3 px-5 w-full border-[1px] rounded-full font-light focus:ring-2 focus:ring-[#62B6B8]"
                              required
                            />
                          )}
                          {errorMessage && <p className="text-red-500">{errorMessage}</p>}
                          <button type="submit" className="py-3 px-5 w-full rounded-full bg-[#78DDD3] text-white hover:bg-[#82C2BC] active:scale-95 duration-300">
                            {loading ? "Processing..." : isLogin ? "Login" : "Sign Up"}
                          </button>
                        </form>

                        <p className="text-center mt-4 cursor-pointer text-[#2D383D] flex flex-row items-center gap-3 hover:underline" onClick={() => setIsLogin(!isLogin)}>
                          <FaArrowRightLong className={isLogin ? "rotate-180" : ""} />
                          {isLogin ? "Create an account" : "Already have an account?"}
                        </p>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;

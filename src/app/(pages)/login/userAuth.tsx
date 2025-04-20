"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
//import { FcGoogle } from "react-icons/fc";
import { FaArrowRightLong, FaArrowLeftLong } from "react-icons/fa6";
import { IoIosCloseCircle } from "react-icons/io";
import { login, signup } from "@/services/Auth/serverauth";
//import { signInWithGoogle } from "@/services/Auth/auth";
import InputField from "@/app/components/input-box"; // Import the new InputField component

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setIsLogin(true);
    setErrorMessage("");
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  }, [isOpen]);

  const handleAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      if (isLogin) {
        await login(email, password);
        onAuthSuccess();
      } else {
        if (password !== confirmPassword) {
          setErrorMessage("Passwords do not match!");
          setLoading(false);
          return;
        }
        await signup(email, password);
        onAuthSuccess();
      }
    }
    catch (error) {
      if (error instanceof Error) {
        if (isLogin && error.message.toLowerCase().includes('email not confirmed')) {
          setErrorMessage("Please verify your email before logging in. Check your inbox for the verification link.");
          alert("Please verify your email before logging in. Check your inbox for the verification link.");
        }
        else {
          console.log('Error: ', error);
          setErrorMessage(error.message);
        }
      }
      else {
        setErrorMessage('An unknown error has occurred.');
      }
    }
    finally {
      setLoading(false);
    }
  };

  // const handleGoogleLogin = async () => {
  //   setLoading(true);
  //   try {
  //     await signInWithGoogle();
  //     onAuthSuccess();
  //   }
  //   catch (error) {
  //     if (error instanceof Error) {
  //       setErrorMessage(error.message);
  //     }
  //     else {
  //       setErrorMessage('An unknown error has occurred with Google sign in.');
  //     }
  //   }
  //   finally {
  //     setLoading(false);
  //   }
  // };

  const getButtonText = () => {
    if (loading) {
      return "Processing...";
    }
    return isLogin ? "Login" : "Sign Up";
  };

  const slideVariants = {
    initial: {
      opacity: 0,
      x: isLogin ? -50 : 50,
      scale: 0.95
    },
    animate: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25,
        duration: 0.3
      }
    },
    exit: {
      opacity: 0,
      x: isLogin ? 50 : -50,
      scale: 0.95,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex justify-center items-center overflow-hidden"
          style={{ background: "linear-gradient(to bottom right, #107373, #63B6B9, #55B7BE)" }}
        >
          <div className="bg-[#9ED8D2] w-full h-full md:h-full rounded-none md:rounded-[30px] overflow-hidden relative flex flex-col md:flex-row">
            {/* Mobile Header */}
            <div className="md:hidden bg-white p-4 flex justify-between items-center">
              <h1 className="text-2xl font-bold text-[#62B6B8]">BSDOC</h1>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                <IoIosCloseCircle className="w-[30px] h-[30px]" />
              </button>
            </div>

            {/* Left Side - Background Image */}
            <div className="hidden md:block md:w-[70%] relative">
              <Image alt="Login Background" fill src="/graphics/loginbg.svg" className="object-cover" />
              <div className="absolute inset-0 z-10 flex flex-col justify-center mb-[150px] pl-[150px]">
                <h1 className="text-[90px]">Welcome to <span className="text-[#62B6B8]">BSDOC</span></h1>
                <p className="text-3xl w-[600px]">Your Personal Guide to Self-Care for Common Ailments</p>
              </div>
            </div>

            {/* Right Side - Auth Form */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full md:min-w-[500px] md:w-[30%] bg-white md:rounded-[25px] rounded-none h-full md:h-auto md:m-10 md:shadow-2xl z-10 flex flex-col justify-center relative overflow-hidden"
            >
              {/* Desktop Close Button */}
              <button
                onClick={onClose}
                className="hidden md:block absolute top-4 right-5 z-10 text-gray-500 hover:text-gray-700 duration-300"
              >
                <IoIosCloseCircle className="w-[40px] h-[40px]" />
              </button>

              <div className="relative w-full h-full overflow-hidden p-6 md:p-12 items-center justify-center flex">
                <AnimatePresence mode="wait">
                  <div className="flex flex-col h-full justify-between w-full">
                    <motion.div
                      key={isLogin ? "login" : "signup"}
                      variants={slideVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      className="flex flex-col justify-center items-center gap-4 md:gap-6 w-full mt-[30%]"
                    >
                      <h2 className="text-2xl md:text-3xl mb-3 text-center">
                        {isLogin ? "Welcome Back!" : "Create an Account"}
                      </h2>

                      {/* <button
                        onClick={handleGoogleLogin}
                        className="py-2 md:py-3 w-full border-[1px] bg-white rounded-full flex justify-center items-center gap-4 md:gap-6 active:scale-95 duration-300"
                      >
                        <FcGoogle className="w-[20px] h-[20px] md:w-[25px] md:h-[25px]" />
                        {isLogin ? "Login with Google" : "Sign up with Google"}
                      </button> */}

                      <div className="w-full border-t border-gray-300" />

                      <form onSubmit={handleAuth} className="space-y-3 md:space-y-8 w-full">
                        <InputField
                          label="Email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                        <InputField
                          label="Password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                        {!isLogin && (
                          <InputField
                            label="Confirm Password"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                          />
                        )}
                        {errorMessage && <p className="text-red-500 text-sm text-center">{errorMessage}</p>}
                        <button
                          type="submit"
                          className="py-2 md:py-3 px-4 md:px-5 w-full rounded-full bg-[#78DDD3] text-white hover:bg-[#55a19a] active:scale-95 duration-300"
                        >
                          {getButtonText()}
                        </button>
                      </form>

                      <button
                        className="text-center mt-2 md:mt-4 cursor-pointer text-[#2D383D] flex flex-row items-center gap-2 md:gap-3 hover:underline"
                        onClick={() => setIsLogin(!isLogin)}
                      >
                        <FaArrowLeftLong className={isLogin ? "hidden" : ""} />
                        {isLogin ? "Create an account" : "Already have an account?"}
                        <FaArrowRightLong className={!isLogin ? "hidden" : ""} />
                      </button>

                    </motion.div>
                    <a href="/doctor-registration" className="text-center underline">
                      Register as Doctor
                    </a>
                  </div>

                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
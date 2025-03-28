"use client";  

import Image from 'next/image';
import Header from "@/app/layout/header";
import { useState } from 'react';

const AppointmentPage = () => {
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');

    return (
        <div className="bg-[#C3EFEB] min-h-screen">
            <Header background="white" title="Account" />

            <div className="relative min-h-screen flex justify-center items-center">
                {/* SVG background */}
                <div className="absolute inset-0 z-0 h-[100%]">
                    <Image
                        src="/graphics/searchpage.svg"
                        alt="background"
                        layout="fill"
                        objectFit="cover"
                        priority
                    />
                </div>

                <div className='flex flex-col z-[1] gap-3 items-center'>
                    {/* Heading Section */}
                    <div className='flex flex-row'>
                        <div className='flex flex-col mr-[50px] gap-10'>
                            <div className="relative mt-[250px] mr-[100px] flex flex-col text-center">
                                <h1 className="text-6xl my-[10px] mr-[100px] font-regular">
                                    Find A <span className="text-[#64B5B7]">Doctor</span> And
                                </h1>

                                {/* Curve under "Book an Appointment" */}
                                <div className="relative inline-block">
                                    <h1 className='text-6xl font-regular'>Book an Appointment</h1>
                                    <svg xmlns="http://www.w3.org/2000/svg" 
                                         className="absolute left-1/2 -translate-x-1/2 mt-1 ml-[120px]"
                                         width="410" 
                                         height="50" 
                                         viewBox="0 0 300 20" 
                                         fill="none">
                                        <path d="M5 10 C 70 50, 230 -40, 295 10" 
                                              stroke="#E97A73" 
                                              strokeWidth="4" 
                                              fill="transparent"/>
                                    </svg>
                                </div>
                            </div>

                            {/* Appointment Form Section */}
                            <div className="border-2 border-[#64B5B7] my-[50px] rounded-lg p-6 w-full max-w-4xl bg-white shadow-md">
                                <h2 className="text-lg font-semibold mb-4">Book your appointment</h2>

                                <div className="flex flex-row items-center justify-between gap-4">
                                    {/* Calendar & Time Picker */}
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="border rounded-md p-3 w-1/4 focus:ring-2 focus:ring-[#62B6B8]"
                                    />

                                    <input
                                        type="time"
                                        value={time}
                                        onChange={(e) => setTime(e.target.value)}
                                        className="border rounded-md p-3 w-1/34 focus:ring-2 focus:ring-[#62B6B8]"
                                    />

                                    {/* Dropdowns */}
                                    <select className="border rounded-md p-3 w-1/34">
                                        <option>Name of Doctor</option>
                                    </select>

                                    {/* Submit Button */}
                                    <button className="bg-[#62B6B8] text-white px-6 py-3 rounded-md">
                                        Submit
                                    </button>
                                </div>
                            </div>
                        </div>

                        <Image
                            src="/graphics/appointment.svg"
                            alt="appointment graphics"
                            width='850'
                            height='850'
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AppointmentPage;

"use client";

import Header from "@/app/layout/header";
import Image from "next/image";
import { useState } from "react";
const AccountPage = () => {

    const basicDetails = ["Joma", "Lina", "jomazlina@gmail.com", "09696969696"];
    const personalDetails = ["B", "170cm", "50kg", "25"];
    const medicalHistory = ["Hypertension, Asthma", "Penicillin, Pollen", "Lisinopril 10mg daily, Albuterol as needed", "Appendectomy (2015), Knee Surgery (2020)"];
    const userRecords = [
        ["1", "20/07/2024", "70kg", "Headache", "High blood pressure, Asthma"],
        ["2", "21/07/2024", "72kg", "Fever", "Flu"],
        ["3", "22/07/2024", "68kg", "Cough", "Bronchitis"],
        ["4", "23/07/2024", "75kg", "Fatigue", "Diabetes"],
    ];


    const [activeButton, setActiveButton] = useState(0);
    const handleButtonClick = (index: number) => {
        setActiveButton(index);
    }

    const Records = () => {
        return (
            <div className="w-full py-10 px-[100px] space-y-3">
                <p className="text-2xl">BSDOC Records</p>
                <table style={{ borderCollapse: "collapse", width: "100%"  }}>
                    <thead>
                        <tr>
                            {["Record ID", "Date", "Weight", "Symptoms", "Health Conditions"].map((label, index) => (
                                <th key={index} style={{ padding: "8px", fontWeight: "500", textAlign: "left" }}>
                                    {label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {userRecords.map((record, rowIndex) => (
                            <tr key={rowIndex}>
                                {record.map((data, colIndex) => (
                                    <td key={colIndex} style={{
                                        borderTop: "1px solid gray",
                                        borderLeft: "none",
                                        borderRight: "none",
                                        borderBottom: "none",
                                        padding: "5px",
                                        fontWeight: "300"
                                    }}>
                                        {data}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }

    const MedicalDetails = () => {
        return (
            <div className="w-full py-10 px-[100px] flex flex-col gap-10">
                <div className="flex flex-col gap-2">
                    <p className="text-2xl">Personal Details</p>
                    <div className="flex flex-col text-sm">
                        {["Blood Type", "Height", "Weight", "Age"].map((label, index) => (
                            <div className="flex flex-row h-8 items-center gap-16 border-black border-b-[1px] w-1/2"
                                key={index}>
                                <p className="w-[100px]">
                                    {label}
                                </p>
                                <p className="">
                                    {personalDetails[index]}
                                </p>
                            </div>
                        ))}
                    </div>

                </div>
                <div className="flex flex-col gap-2">
                    <p className="text-2xl">Medical History</p>
                    <div className="flex flex-col text-sm">
                        {["Blood Type", "Height", "Weight", "Age"].map((label, index) => (
                            <div className="flex flex-row h-8 items-center gap-16 border-black border-b-[1px] w-1/2"
                                key={index}>
                                <p className="w-[100px]">
                                    {label}
                                </p>
                                <p className="">
                                    {medicalHistory[index]}
                                </p>
                            </div>
                        ))}
                    </div>

                </div>
            </div>
        );
    }
    return (
        <div className="">
            <Header background="white" title="Account" />
            <div className="bg-[#62B6B8] p-10  mt-[80px] h-[91.6vh]">
                <div className="flex flex-row bg-white w-full h-full pr-10 py-[50px] rounded-xl">
                    <div className="w-[25%] px-[50px] border-r-[1px] border-[#00909A]/60">
                        <div className="py-[50px] flex flex-col gap-8 items-start ">
                            <div className="w-full aspect-square rounded-2xl overflow-hidden border border-gray-300">
                                <Image
                                    alt="Profile Picture"
                                    src="/Images/profile/profile1.png"
                                    width={500}
                                    height={500}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="flex flex-col font-light text-sm w-full ">
                                <div className="flex flex-col gap-2">
                                    {basicDetails.map((detail, index) => (
                                        <div key={index} className="flex flex-row">
                                            <p className="w-1/2">{["FIRST NAME", "LAST NAME", "EMAIL", "PHONE"][index]}</p>
                                            <p className="w-1/2">{detail}</p>
                                        </div>
                                    ))}
                                </div>

                            </div>
                        </div>

                    </div>
                    <div className="w-full flex flex-col">
                        <div className="flex flex-row justify-end w-full">
                            {["MEDICAL DETAILS", "RECORDS", "ACCOUNT DETAILS"].map((label, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleButtonClick(index)}
                                    style={{
                                        backgroundColor: activeButton === index ? "#00909A" : "white",
                                        color: activeButton === index ? "white" : "#2D383D",
                                    }}
                                    className="w-full py-3 duration-300 text-sm">
                                    {label}
                                </button>
                            ))}
                        </div>
                        <div className="">
                            {activeButton === 0 && <MedicalDetails />}
                            {activeButton === 1 && <Records />}
                        </div>
                    </div>
                </div>

            </div>
        </div >
    );
}

export default AccountPage;
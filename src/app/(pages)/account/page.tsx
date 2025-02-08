import Header from "@/app/layout/header";
import Image from "next/image";
const AccountPage = () => {
    const basicdetails = ["Joma", "Lina", "jomazlina@gmail.com", "09696969696"];
    const basicdetaiilsform = ["FIRST NAME", "LAST NAME", "EMAIL", "PHONE"]
    const Records = () => {
        return (
            <div className="w-full py-10 px-[100px] space-y-3">
                <p className="text-2xl">Records</p>
                <table style={{ border: "1px solid black", borderCollapse: "collapse" }}>
                    <thead>
                        <tr>
                            <th style={{ border: "1px solid black", padding: "8px" }}>Record ID</th>
                            <th style={{ border: "1px solid black", padding: "8px" }}>Date</th>
                            <th style={{ border: "1px solid black", padding: "8px" }}>Weight</th>
                            <th style={{ border: "1px solid black", padding: "8px" }}>Symptoms</th>
                            <th style={{ border: "1px solid black", padding: "8px" }}>Health Conditions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style={{ border: "1px solid black", padding: "8px" }}>1</td>
                            <td style={{ border: "1px solid black", padding: "8px" }}>20/07/2024</td>
                            <td style={{ border: "1px solid black", padding: "8px" }}>70kg</td>
                            <td style={{ border: "1px solid black", padding: "8px" }}>Headache</td>
                            <td style={{ border: "1px solid black", padding: "8px" }}>High blood pressure, Asthma</td>
                        </tr>
                    </tbody>
                </table>
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
                                    {basicdetails.map((detail, index) => (
                                        <div key={index} className="flex flex-row">
                                            <p className="w-1/2">{basicdetaiilsform[index]}</p>
                                            <p className="w-1/2">{detail}</p>
                                        </div>
                                    ))}
                                </div>

                            </div>
                        </div>

                    </div>
                    <div className="w-full flex flex-col">
                        <div className="flex flex-row justify-end w-full">
                            <button className="w-full py-3">
                                MEDICAL DETAILS
                            </button>
                            <button className="w-full py-3">
                                RECORDS
                            </button>
                            <button className="w-full py-3">
                                ACCOUNT DETAILS
                            </button>
                        </div>
                        <div className="">
                            <Records />
                        </div>
                    </div>
                </div>

            </div>
        </div >
    );
}

export default AccountPage;
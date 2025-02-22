import Header from "@/app/layout/header";

const DoctorRegistration = () => {

    const RegistrationCard = () => {
        return (
            <div className="flex items-center bg-white m-5 rounded-2xl py-[10%] flex-col px-[10%]">
                <p className="text-2xl text-black">
                    Register as Doctor
                </p>
                <div className="flex flex-row gap-5 w-full">
                    {["First Name", "Last Name"].map((label, index) => (
                        <div key={index} className="input-container mt-[25px]">
                            <input type="text" id={`${label}`} placeholder=" " required />
                            <label htmlFor={`${label}`}>{`${label}`}</label>
                        </div>
                    ))}
                </div>
                <div className="w-full flex flex-col">
                    {["Email", "Password", "Confirm Password", "Upload File (PRC ID)"].map((label, index) => (
                        <div key={index} className="input-container mt-[25px]">
                            <input type="text" id={`${label}`} placeholder=" " required />
                            <label htmlFor={`${label}`}>{`${label}`}</label>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div>
            <Header background="white" title="Doctor Registration" />
            <div className="h-[10vh]" />
            <div className="flex flex-row bg-[#C3EFEB] h-[90vh]">
                <div className="w-[50%]">
                </div>
                <div className="w-[50%]">
                    <RegistrationCard />
                </div>
            </div>
        </div>
    );
}

export default DoctorRegistration;
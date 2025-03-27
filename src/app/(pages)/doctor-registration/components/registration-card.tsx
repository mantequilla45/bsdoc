import InputField from '@/app/components/input-box'; // Importing the new separate component

// Registration Card
const RegistrationCard = () => {
    return (
        <div className="flex bg-white m-5 rounded-2xl py-[10%] pb-[15%] flex-col px-[7%]">
            <p className="text-3xl mb-5">Register as Doctor</p>

            {/* Name Fields */}
            <div className="flex flex-row gap-5 w-full">
                {["First Name", "Last Name"].map((label, index) => (
                    <InputField key={index} label={label} type="text" />
                ))}
            </div>

            {/* Other Fields */}
            <div className="w-full flex flex-col mb-7">
                {["Email", "Password", "Confirm Password", "Upload File (PRC ID)"].map((label, index) => (
                    <InputField key={index} label={label} type={label === "Upload File (PRC ID)" ? "file" : "text"} />
                ))}
            </div>
            <div className="register w-full">
                <button>
                    Submit
                </button>
            </div>
        </div>
    );
};

export default RegistrationCard;
import Image from 'next/image';
import Header from "@/app/layout/header";

const ContactUs = () => {
    return (
        <div className="bg-[#C3EFEB] min-h-screen relative overflow-hidden">
            <Header background="white" title="Account" />

            {/* Background Image */}
            <div className="absolute inset-0 z-0 h-full w-full">
                <Image
                    src="/graphics/loginbg.svg"
                    alt="background"
                    layout="fill"
                    objectFit="fill"
                />
            </div>

            
            <div className="relative z-10 flex justify-center items-center min-h-screen">
                <div className="flex flex-row items-center max-w-[1850px] w-full">

                    {/* Contact Image */}
                    <div className="flex-shrink-0 mr-[230px]">
                        <Image
                            src="/graphics/contactus.svg"
                            alt="contact graphics"
                            width={900}
                            height={900}
                            className="max-w-full"
                        />
                    </div>

                    {/* Contact Form */}
                    <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-[500px]">
                        <div className="flex flex-col items-center gap-6">
                            <div className="flex items-center gap-3">
                                <h1 className="text-4xl font-bold">Contact Us</h1>
                                <Image
                                    src="/graphics/logingraphic.svg"  // Replace with your image
                                    alt="mail icon"
                                    width={80}
                                    height={80}
                                />

                            </div>
                            <input
                                type="email"
                                placeholder="Email"
                                className="py-3 px-5 w-full border-[2px] rounded-xl font-light focus:ring-2 focus:ring-[#E97A73]"
                                required
                            />
                            <textarea
                                placeholder="Message"
                                className="w-full h-[400px] p-3 border-[2px] rounded-xl focus:ring-2 focus:ring-[#E97A73] text-left align-top"
                                required
                            ></textarea>
                            <button className="py-3 px-6 w-full border-[1px] rounded-full font-bold bg-[#78DDD3] text-white cursor-pointer hover:bg-[#62B6B8]">
                                Send
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ContactUs;

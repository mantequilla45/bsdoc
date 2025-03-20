import Image from 'next/image';
import Header from "@/app/layout/header";

const AppointmentPage = () =>{
    return (
        <div className="bg-[#C3EFEB] min-h-screen">
            <Header background="white" title="Account" />
            <div className="flex flex-row max-w-[1300px] items-center mx-auto h-screen">
                <div className="flex justify-center items-center min-h-screen bg-[#C3EFEB]">
                    <div className="bg-white p-8 rounded-2xl shadow-lg w-[500px]">
                        <div className="flex flex-col items-center gap-6">
                            <h1 className="text-4xl font-bold">Contact Us</h1>
            
                            <input
                                type="email"
                                placeholder="Email"
                                className="py-3 px-5 w-full border-[1px] rounded-xl font-light focus:ring-2 focus:ring-[#62B6B8]"
                                required
                            />
                            <textarea
                                placeholder="Message"
                                className="w-full h-[200px] p-3 border rounded-xl focus:ring-2 focus:ring-[#62B6B8] text-left align-top"
                                required
                            ></textarea>
                            <button className="py-3 px-6 w-full border-[1px] rounded-full font-bold bg-[#78DDD3] text-white cursor-pointer hover:bg-[#62B6B8]">
                                 Send
                            </button>
                        </div>
                 </div>
            </div>
            <div className="w-1/2 ">
                            <Image
                            src="/graphics/appointment.svg"
                            alt="contact-us graphics"
                            width='500'
                            height='500' />
                </div>

                
                
            </div>

        </div>
    )
}
export default AppointmentPage;
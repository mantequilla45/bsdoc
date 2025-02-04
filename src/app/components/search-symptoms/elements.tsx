import { useState } from 'react';

export const RadioButton = ({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) => {
    return (
        <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            className="w-6 h-6 appearance-none border-2 border-gray-300 rounded-full cursor-pointer bg-white
                  checked:bg-blue-500 checked:border-blue-600 
                  hover:border-indigo-400
                  transition-all duration-200 ease-in-out
                  relative
                  after:content-[''] after:absolute after:top-1/2 after:left-1/2
                  after:w-[10px] after:h-[10px] after:rounded-full
                  after:bg-white after:-translate-x-1/2 after:-translate-y-1/2
                  checked:after:block after:hidden"
        />
    );
};

export const CheckBox = ({item}: {item: string}) => {
    return (
        <div className="flex flex-row items-center gap-4">
            <input
                type="checkbox"
                className="w-5 h-5 appearance-none border-2 border-gray-300 rounded-md cursor-pointer
                    checked:bg-blue-500 checked:border-blue-500 
                    hover:border-blue-600 hover:shadow-sm
                    transition-all duration-200 ease-in-out
                    relative
                    after:content-[''] after:absolute after:top-[2px] after:left-[5px]
                    after:w-[6px] after:h-[10px] after:border-r-2 after:border-b-2
                    after:border-white after:rotate-45
                    checked:after:block after:hidden"
            />

            <p>{item}</p>
        </div>

    );
}


export const Gender = () => {
    const [selectedGender, setSelectedGender] = useState<'male' | 'female' | null>(null);
    return (
        <div className="flex flex-col w-full">
            <p className="text-2xl mb-6">Gender</p>
            <div className="flex flex-row gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                    <RadioButton
                        checked={selectedGender === 'male'}
                        onChange={() => setSelectedGender('male')}
                    />
                    <p>Male</p>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                    <RadioButton
                        checked={selectedGender === 'female'}
                        onChange={() => setSelectedGender('female')}
                    />
                    <p>Female</p>
                </label>
            </div>
        </div>
    );
};

export const TextBox = ({ title }: { title: string }) => {
    return (
        <div className="flex flex-col gap-3 w-full">
            <p className="text-2xl">{title}</p>
            <input
                placeholder="Your Answer"
                className="mb-2 py-3 px-6 rounded-xl placeholder:font-light border-[1px] 
                border-gray-300 w-[80%] 
                focus:border-gray-400 focus:outline-none"
            />
        </div>
    );
}
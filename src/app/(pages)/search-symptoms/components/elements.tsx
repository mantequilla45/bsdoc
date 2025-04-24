import React from 'react';

// ✅ RADIO BUTTON FOR GENDER SELECTION
export const RadioButton = ({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) => {
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

// ✅ CUSTOM CHECKBOX (STATIC)
export const CheckBox = ({ item }: { item: string }) => {
  return (
    <div className="flex flex-row items-start gap-4">
      <input
        type="checkbox"
        className="min-w-[20px] min-h-[20px] w-5 h-5 appearance-none border-2 border-gray-300 rounded-md cursor-pointer
          checked:bg-blue-500 checked:border-blue-500 
          hover:border-blue-600 hover:shadow-sm
          transition-all duration-200 ease-in-out
          relative
          after:content-[''] after:absolute after:top-[2px] after:left-[5px]
          after:min-w-[6px] after:min-h-[10px]
          after:w-[6px] after:h-[10px] after:border-r-2 after:border-b-2
          after:border-white after:rotate-45
          checked:after:block after:hidden
          mt-[2px]"
      />
      <p>{item}</p>
    </div>
  );
};

// ✅ CUSTOM TEXTBOX WITH CONTROLLED VALUE AND OPTIONAL READONLY
export const TextBox = ({
  title,
  value,
  onChange,
  readOnly = false,
  placeholder = 'Your Answer', // ✅ Add placeholder with default value
}: {
  title: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  readOnly?: boolean;
  placeholder?: string; // ✅ Add this line
}) => {
  return (
    <div className="flex flex-col gap-3 w-full">
      <p className="md:text-2xl text-lg">{title}</p>
      <input
        type="text"
        placeholder={placeholder} // ✅ Use placeholder here
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        className={`mb-2 md:py-3 py-2 md:px-6 px-4 rounded-xl md:text-base text-sm placeholder:font-light border-[1px] 
        border-gray-300 md:w-[80%] w-full
        focus:border-gray-400 focus:outline-none ${
          readOnly ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
        }`}
      />
    </div>
  );
};

// ✅ GENDER COMPONENT USING RADIO BUTTONS
export const Gender = ({
  value,
  setValue,
}: {
  value: string;
  setValue: (value: string) => void;
}) => {
  return (
    <div className="flex flex-col w-full">
      <p className="md:text-2xl text-lg md:mb-6 mb-3">Gender</p>
      <div className="flex flex-row gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <RadioButton
            checked={value === 'male'}
            onChange={() => setValue('male')}
          />
          <p>Male</p>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <RadioButton
            checked={value === 'female'}
            onChange={() => setValue('female')}
          />
          <p>Female</p>
        </label>
      </div>
    </div>
  );
};

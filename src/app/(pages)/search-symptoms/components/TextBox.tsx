import React from 'react';

interface TextBoxProps {
  title: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  disabled?: boolean; // ✅ Add this line to fix the error
}

const TextBox: React.FC<TextBoxProps> = ({
  title,
  value,
  onChange,
  placeholder,
  disabled,
}) => {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm text-gray-700 font-medium">{title}</label>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled} // ✅ Make sure it is passed here
        className="border rounded px-3 py-2 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
      />
    </div>
  );
};

export default TextBox;

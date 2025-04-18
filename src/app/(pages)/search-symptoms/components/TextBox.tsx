import React from 'react';

interface TextBoxProps {
  title: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const TextBox: React.FC<TextBoxProps> = ({ title, value, onChange }) => {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm text-gray-700 font-medium">{title}</label>
      <input
        type="text"
        value={value}
        onChange={onChange}
        className="border rounded px-3 py-2 text-sm"
      />
    </div>
  );
};

export default TextBox;

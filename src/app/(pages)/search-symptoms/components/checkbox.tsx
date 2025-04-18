'use client';
import React from 'react';

interface CheckBoxProps {
  item: string;
  checked?: boolean;
  onChange?: () => void;
}

const CheckBox = ({ item, checked, onChange }: CheckBoxProps) => {
  const isControlled = typeof checked === 'boolean';

  return (
    <label className="inline-flex items-center gap-2 cursor-pointer select-none">
      <input
        type="checkbox"
        className="form-checkbox accent-[#519496] w-4 h-4"
        {...(isControlled
          ? { checked, onChange }
          : { defaultChecked: false })}
      />
      <span className="capitalize text-sm text-gray-700">{item}</span>
    </label>
  );
};

export default CheckBox;

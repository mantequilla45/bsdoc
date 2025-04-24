'use client';
import React from 'react';

interface CheckBoxProps {
  item: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
}

const CheckBox = ({ item, checked = false, onChange, disabled = false }: CheckBoxProps) => {
  const labelProps = disabled ? {} : { onMouseDown: (e: React.MouseEvent) => e.preventDefault() };

  return (
    <label
      {...labelProps}
      className={`inline-flex items-center gap-2 select-none ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      }`}
    >
      <input
        type="checkbox"
        className="form-checkbox accent-[#519496] w-4 h-4"
        checked={checked}
        onChange={(e) => onChange?.(e.target.checked)}
        disabled={disabled}
      />
      <span className="capitalize text-sm text-gray-700">{item}</span>
    </label>
  );
};

export default CheckBox;

'use client';

import React from 'react';
import { RiArrowLeftDoubleFill, RiArrowRightDoubleFill } from 'react-icons/ri';

type CalendarHeaderProps = {
  selectedMonth: number;
  selectedYear: number;
  changeMonth: (direction: 'next' | 'prev') => void;
};

export default function CalendarHeader({ selectedMonth, selectedYear, changeMonth }: CalendarHeaderProps) {
  return (
    <div className="">
      <div className="flex justify-between items-center ">
        <button
          onClick={() => changeMonth('prev')}
          className="bg-gray-200 py-2 px-7 rounded group hover:bg-[#55B7BE] duration-300"
        >
          <RiArrowLeftDoubleFill className="text-gray-700 group-hover:text-white transition-colors duration-200" />
        </button>

        <h2 className="text-xl font-semibold">
          {new Date(selectedYear, selectedMonth).toLocaleString('default', {
            month: 'long',
            year: 'numeric',
          })}
        </h2>
        <button
          onClick={() => changeMonth('next')}
          className="bg-gray-200 py-2 px-7 rounded group hover:bg-[#55B7BE] duration-300"
        >

          <RiArrowRightDoubleFill className="text-gray-700 group-hover:text-white transition-colors duration-200" />
        </button>
      </div>
    </div>

  );
}
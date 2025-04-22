// src/app/(pages)/admin/user-management/components/SearchInput.tsx
import React from 'react';
import { Search } from 'lucide-react';

interface SearchInputProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  className?: string; // Allow passing additional Tailwind classes
}

const SearchInput: React.FC<SearchInputProps> = ({
  searchTerm,
  onSearchChange,
  placeholder = "Search...", // Default placeholder
  className = "" // Default empty className
}) => {
  return (
    <div className={`flex items-center relative ${className}`}>
      <input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        // Base styles - combine with passed className for flexibility
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md md:text-base text-sm focus:outline-none focus:border-[#00909A]"
      />
      {/* Adjusted icon size slightly for consistency */}
      <Search className="w-5 h-5 absolute left-3 text-gray-400" />
    </div>
  );
};

export default SearchInput;
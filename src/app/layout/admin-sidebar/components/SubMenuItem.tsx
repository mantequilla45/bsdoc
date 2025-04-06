'use client';
import React from 'react';

interface SubMenuItemProps {
  title: string;
  href?: string;
  onClick?: (contentId: string) => void;
}

const SubMenuItem: React.FC<SubMenuItemProps> = ({ title, href, onClick }) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onClick && href) {
      // Extract contentId from href, or use a normalized version of the title
      const contentId = href.split('/').pop() || title.toLowerCase().replace(/\s+/g, '-');
      onClick(contentId);
    }
  };

  return (
    <div 
      className="px-4 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded-md cursor-pointer"
      onClick={handleClick}
    >
      {title}
    </div>
  );
};

export default SubMenuItem;
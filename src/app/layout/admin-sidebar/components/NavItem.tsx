'use client';
import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface NavItemProps {
  href?: string;
  icon: React.ReactNode;
  title: string;
  active?: boolean;
  children?: React.ReactNode;
  onClick?: (contentId: string) => void;
  collapsed?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({
  href,
  icon,
  title,
  active,
  children,
  collapsed,
  onClick
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = !!children;

  const handleClick = (e: React.MouseEvent) => {
    if (hasChildren) {
      e.preventDefault();
      setIsOpen(!isOpen);
    } else if (onClick && href) {
      e.preventDefault();
      // Extract content ID from href - assuming format like /admin/dashboard
      const contentId = href.split('/').pop() || '';
      onClick(contentId);
    }
  };

  return (
    <div className="mb-1">
      <div
        className={`flex items-center px-4 py-2 gap-3 ${collapsed ? 'justify-center' : 'justify-between' } rounded-md truncate cursor-pointer hover:bg-gray-700 ${active ? 'bg-gray-700' : ''
          }`}
        onClick={handleClick}
      >
        <span className={`${active ? 'text-white' : 'text-gray-300'}`}>{icon}</span>

        <span className={`${collapsed ? 'hidden' : 'block'} flex-1 ${active ? 'text-white' : 'text-gray-300'}`}>
          {title}
        </span>

        {hasChildren && (
          <span>
            {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </span>
        )}
      </div>

      {hasChildren && isOpen && (
        <div className="ml-6 mt-1 space-y-1">
          {children}
        </div>
      )}
    </div>
  );
};

export default NavItem;

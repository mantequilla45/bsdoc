'use client';
import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface NavItemProps {
  href?: string;
  icon: React.ReactNode;
  title: string;
  active?: boolean;
  badge?: number | string;
  children?: React.ReactNode;
  onClick?: (contentId: string) => void;
  collapsed?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({
  href = '#',
  icon,
  title,
  active = false,
  badge,
  children,
  collapsed = false,
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

  const content = (
    <>
      <span className="flex-shrink-0 text-white">{icon}</span>
      
      {!collapsed && (
        <span className="flex-1 text-sm font-medium truncate text-white">
          {title}
        </span>
      )}
      
      {!collapsed && badge && (
        <span className="flex-shrink-0 px-2 py-1 ml-2 text-xs font-medium text-white bg-blue-600 rounded-full">
          {badge}
        </span>
      )}

      {!collapsed && hasChildren && (
        <span className="flex-shrink-0 ml-2 text-white">
          {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </span>
      )}
    </>
  );

  return (
    <div className="mb-1">
      {hasChildren ? (
        <div
          className={`
            flex items-center md:px-3 px-1 py-2 space-x-3 md:rounded-md cursor-pointer
            transition-colors duration-200
            ${collapsed ? 'justify-center' : 'justify-between'}
            ${active ? 'bg-gray-700 text-white' : 'text-white hover:bg-gray-700'}
          `}
          onClick={handleClick}
        >
          {content}
        </div>
      ) : (
        <Link
          href={href}
          className={`
            flex items-center md:px-3 px-1 py-2 space-x-3 md:rounded-md 
            transition-colors duration-200
            ${collapsed ? 'justify-center ' : 'justify-between'}
            ${active ? 'bg-gray-700 text-white' : 'text-white hover:bg-gray-700'}
          `}
          onClick={handleClick}
        >
          {content}
        </Link>
      )}

      {hasChildren && isOpen && !collapsed && (
        <div className="pl-9 mt-1 space-y-1">
          {children}
        </div>
      )}
    </div>
  );
};

export default NavItem;
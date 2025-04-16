// src/app/context/AdminPanelContext.tsx (Create this new file)
'use client';

import React, { createContext, useContext, ReactNode } from 'react';

interface AdminPanelContextType {
  // Function to change the displayed section in the admin panel
  setActiveAdminSection: (sectionId: string) => void;
  // Optional: You could also expose the current active section if needed elsewhere
  // activeAdminSection: string;
}

export const AdminPanelContext = createContext<AdminPanelContextType | undefined>(undefined);

export const useAdminPanel = (): AdminPanelContextType => {
  const context = useContext(AdminPanelContext);
  if (!context) {
    throw new Error('useAdminPanel must be used within an AdminPanelProvider');
  }
  return context;
};

interface AdminPanelProviderProps {
  children: ReactNode;
  // Pass the actual function that handles content switching in your layout
  switchContent: (sectionId: string) => void;
}

export const AdminPanelProvider: React.FC<AdminPanelProviderProps> = ({ children, switchContent }) => {
  // This provider essentially just exposes the passed-in switchContent function
  const setActiveAdminSection = (sectionId: string) => {
    console.log(`[AdminPanelContext] Setting active section to: ${sectionId}`);
    switchContent(sectionId);
  };

  const value = {
    setActiveAdminSection,
  };

  return (
    <AdminPanelContext.Provider value={value}>
      {children}
    </AdminPanelContext.Provider>
  );
};
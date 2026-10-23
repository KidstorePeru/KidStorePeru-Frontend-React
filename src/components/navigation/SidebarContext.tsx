import React, { createContext, useContext, useState, ReactNode } from 'react';
import useMediaQuery from '../../hooks/useMediaQuery';

/** Below this width the menu becomes a drawer opened from a top bar. */
export const MOBILE_QUERY = '(max-width: 767px)';

interface SidebarContextType {
  /** Desktop: menu expanded (true) or collapsed to icons (false). */
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  /** Phone-sized screen: the menu is a drawer. */
  isMobile: boolean;
  /** Mobile: whether the drawer is open. */
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

interface SidebarProviderProps {
  children: ReactNode;
}

export const SidebarProvider: React.FC<SidebarProviderProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useMediaQuery(MOBILE_QUERY);

  return (
    <SidebarContext.Provider value={{ isSidebarOpen, setIsSidebarOpen, isMobile, mobileMenuOpen, setMobileMenuOpen }}>
      {children}
    </SidebarContext.Provider>
  );
};

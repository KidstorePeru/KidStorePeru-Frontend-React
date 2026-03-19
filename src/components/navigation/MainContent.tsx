import React, { ReactNode } from 'react';
import { useSidebar } from './SidebarContext';

const MainContent: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isSidebarOpen } = useSidebar();
  return (
    <div style={{ marginLeft: isSidebarOpen ? '240px' : '68px', minHeight:'100vh', width:'100%',
      overflowY:'auto', overflowX:'hidden', padding:'28px 24px',
      background:'var(--bg-base)', transition:'margin-left 0.3s ease, background 0.25s ease',
      fontFamily:"'Manrope',sans-serif", boxSizing:'border-box' }}>
      {children}
    </div>
  );
};
export default MainContent;

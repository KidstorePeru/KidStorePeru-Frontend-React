import React, { ReactNode } from 'react';
import { useSidebar } from './SidebarContext';

const MainContent: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isSidebarOpen, isMobile } = useSidebar();
  return (
    <div style={{ marginLeft: isMobile ? 0 : isSidebarOpen ? '240px' : '68px', minHeight:'100vh', width:'100%',
      overflowY:'auto', overflowX:'hidden',
      // on a phone the fixed top bar (52px) sits above the content
      padding: isMobile ? '68px 12px 24px' : '28px 24px',
      background:'var(--bg-base)', transition:'margin-left 0.3s ease, background 0.25s ease',
      fontFamily:"'Manrope',sans-serif", boxSizing:'border-box', minWidth: 0 }}>
      {children}
    </div>
  );
};
export default MainContent;

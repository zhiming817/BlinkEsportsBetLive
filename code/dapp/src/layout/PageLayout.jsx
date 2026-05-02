import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

/**
 * PageLayout Component
 * Wraps pages with common layout elements
 */
export default function PageLayout({ children }) {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div className="relative min-h-screen bg-[#0a0a0a]">
      <Navbar />
      
      {/* Background for non-home pages */}
      {!isHomePage && (
        <>
          <div 
            className="fixed inset-0 z-0"
            style={{
              backgroundImage: 'url(/backgroundotherpage.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'repeat',
            }}
          />
          <div className="fixed inset-0 z-0 bg-black/40" />
        </>
      )}
      
      {/* Content */}
      <main className="relative z-10">
        {children}
      </main>

      <Footer />
    </div>
  );
}


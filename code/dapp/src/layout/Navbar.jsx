import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { publicKey } = useWallet();

  const formatAddress = (address) => {
    if (!address) return '';
    const addressStr = address.toString();
    return `${addressStr.slice(0, 6)}...${addressStr.slice(-4)}`;
  };

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Matches', href: '/matches' },
    { name: 'My Bets', href: '/my-bets' },
  ];

  const isActive = (href) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  const handleNavigation = (href) => {
    navigate(href);
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-[#0a0a0a] border-b border-gray-800 sticky top-0 z-50 backdrop-blur-sm bg-[#0a0a0a]/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <button
            onClick={() => handleNavigation('/')}
            className="flex items-center space-x-2 cursor-pointer group"
          >
            <img 
              src="/logo.png" 
              alt="BlinkBet Logo" 
              className="w-10 h-10 transform group-hover:scale-110 transition-transform"
            />
            <span className="text-xl font-black bg-gradient-to-r from-orange-400 to-red-500 text-transparent bg-clip-text">BlinkBet</span>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.href)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'text-white bg-gradient-to-r from-orange-500 to-red-600'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  {item.name}
                </button>
            ))}
          </div>

          {/* Wallet Connection */}
          <div className="flex items-center space-x-4">
            {publicKey ? (
              <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-medium text-white">
                    {formatAddress(publicKey)}
                  </div>
                  <div className="text-xs text-gray-400">
                    Connected
                  </div>
                </div>
                <WalletMultiButton className="!bg-gradient-to-r !from-orange-500 !to-red-600 hover:!from-orange-600 hover:!to-red-700" />
              </div>
            ) : (
              <WalletMultiButton className="!bg-gradient-to-r !from-orange-500 !to-red-600 hover:!from-orange-600 hover:!to-red-700" />
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-800"
            >
              {isMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-800 pt-4 pb-4">
            <div className="space-y-2">
              {navigation.map((item) => (
                <React.Fragment key={item.name}>
                  <button
                    onClick={() => handleNavigation(item.href)}
                    className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      isActive(item.href)
                        ? 'text-orange-400 bg-orange-500/10'
                        : 'text-gray-300 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    {item.name}
                  </button>
                </React.Fragment>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

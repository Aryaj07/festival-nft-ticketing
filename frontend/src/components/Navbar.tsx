import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useNFTContract } from '../hooks/useNFTContract';
import { useAccount } from 'wagmi';
import { useState, useEffect, useCallback, ReactNode } from 'react';
import { toast } from 'react-hot-toast';

const MINTER_ROLE = '0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6';

interface NavLinkProps {
  href: string;
  children: string;
  isMobile?: boolean;
}

const NavLink = ({ href, children, isMobile = false }: NavLinkProps) => (
  <div className={`
    text-white hover:text-white hover:bg-purple-700 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200
    ${isMobile ? 'block text-base' : ''}
  `}>
    <Link href={href}>
      {children}
    </Link>
  </div>
);

export function Navbar() {
  const pathname = usePathname();
  const { address } = useAccount();
  const { hasMinterRole, hasAdminRole, grantMinterRole, isGrantingMinterRole } = useNFTContract();
  const [addressToGrant, setAddressToGrant] = useState('');

  // Debug logging - only when role status changes
  useEffect(() => {
    if (address) {
      console.log('Navbar Role Status:', {
        address,
        hasAdminRole,
        hasMinterRole,
        showAdminUI: Boolean(address && hasAdminRole),
        showMinterUI: Boolean(hasMinterRole)
      });
    }
  }, [address, hasAdminRole, hasMinterRole]);

  const isActive = useCallback((path: string) => {
    return pathname === path ? 'bg-blue-700' : '';
  }, [pathname]);

  const handleGrantMinterRole = async () => {
    if (!addressToGrant) {
      toast.error('Please enter an address');
      return;
    }
    try {
      console.log('Granting minter role:', {
        role: MINTER_ROLE,
        to: addressToGrant
      });
      
      await grantMinterRole({
        args: [MINTER_ROLE, addressToGrant] as const
      });
      
      setAddressToGrant('');
      toast.success('Minter role granted successfully!');
    } catch (error) {
      console.error('Error granting minter role:', error);
      toast.error('Failed to grant minter role');
    }
  };

  return (
    <nav className="bg-gradient-to-r from-purple-800 to-indigo-900 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center space-x-8">
            <div className="text-2xl font-bold text-white hover:text-purple-200 transition-colors">
              <Link href="/">
                FestivalNFT
              </Link>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <NavLink href="/primary-market">
                Primary Market
              </NavLink>
              <NavLink href="/market">
                Secondary Market
              </NavLink>
              <NavLink href="/my-tickets">
                My Tickets
              </NavLink>
              {hasMinterRole && (
                <NavLink href="/create-festival">
                  Create Festival
                </NavLink>
              )}
              {hasAdminRole && (
                <NavLink href="/admin">
                  Admin
                </NavLink>
              )}
            </div>
          </div>
          <div className="flex items-center">
            <div className="ml-4 flex items-center space-x-4">
              {address && (
                <div className="flex items-center space-x-4">
                  {hasAdminRole && (
                    <div className="flex items-center space-x-4">
                      <div className="px-3 py-1.5 bg-gradient-to-r from-green-600 to-green-600 text-white text-sm font-medium rounded-lg shadow-sm">
                        Admin Role
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          placeholder="Address to grant minter role"
                          className="w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder:text-gray-500 bg-white/10 backdrop-blur-sm text-white"
                          value={addressToGrant}
                          onChange={(e) => setAddressToGrant(e.target.value)}
                        />
                        <button
                          onClick={handleGrantMinterRole}
                          disabled={isGrantingMinterRole || !addressToGrant}
                          className="px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
                        >
                          {isGrantingMinterRole ? 'Granting...' : 'Grant Role'}
                        </button>
                      </div>
                    </div>
                  )}
                  {hasMinterRole && !hasAdminRole && (
                    <div className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-medium rounded-lg shadow-sm">
                      Minter Role
                    </div>
                  )}
                  {!hasAdminRole && !hasMinterRole && (
                    <p className="text-sm text-white/80">Contact admin to get minter role</p>
                  )}
                </div>
              )}
              <ConnectButton 
                chainStatus="icon" 
                showBalance={false}
              />
            </div>
          </div>
        </div>
      </div>
      {/* Mobile menu */}
      <div className="md:hidden">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <NavLink href="/primary-market" isMobile>
            Primary Market
          </NavLink>
          <NavLink href="/market" isMobile>
            Secondary Market
          </NavLink>
          <NavLink href="/my-tickets" isMobile>
            My Tickets
          </NavLink>
          {hasMinterRole && (
            <NavLink href="/create-festival" isMobile>
              Create Festival
            </NavLink>
          )}
          {hasAdminRole && (
            <NavLink href="/admin" isMobile>
              Admin
            </NavLink>
          )}
        </div>
      </div>
    </nav>
  );
} 
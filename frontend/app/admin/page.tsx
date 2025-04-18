'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { Navbar } from '../../src/components/Navbar';
import { useNFTContract } from '../../src/hooks/useNFTContract';
import { formatEther } from 'viem';
import { LoadingSpinner } from '../../src/components/LoadingSpinner';

export default function AdminDashboard() {
  const { address } = useAccount();
  const { hasAdminRole, totalCommissionData } = useNFTContract();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (address) {
      setLoading(false);
    }
  }, [address]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center">
            <LoadingSpinner />
          </div>
        </main>
      </div>
    );
  }

  if (!address || !hasAdminRole) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500">
            Access denied. Only admin can view this page.
          </div>
        </main>
      </div>
    );
  }

  const commission = typeof totalCommissionData === 'bigint' ? totalCommissionData : BigInt(0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Commission Summary</h2>
          <div className="grid grid-cols-1 gap-4">
            <div className="border rounded-lg p-4">
              <p className="text-gray-600">Total Commission Earned</p>
              <p className="text-2xl font-bold text-green-600">
                {formatEther(commission)} ETH
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 
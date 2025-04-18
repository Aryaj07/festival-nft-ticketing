'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { Navbar } from '../../src/components/Navbar';
import { useNFTContract } from '../../src/hooks/useNFTContract';
import { formatEther } from 'viem';
import { LoadingSpinner } from '../../src/components/LoadingSpinner';
import { toast } from 'react-hot-toast';

interface Festival {
  id: string;
  name: string;
  description: string;
  date: bigint;
  venue: string;
  ticketPrice: bigint;
  totalTickets: bigint;
  remainingTickets?: bigint;
}

export default function PrimaryMarket() {
  const { address } = useAccount();
  const { activeFestivals, getFestival, purchaseTicket } = useNFTContract();
  
  const [festivals, setFestivals] = useState<Festival[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchFestivals = async () => {
      try {
        const response = await fetch('/api/festivals/active');
        if (!response.ok) {
          throw new Error('Failed to fetch active festivals');
        }
        
        const activeFestivals = await response.json();
        console.log('Active festivals:', activeFestivals);

        const processedFestivals = activeFestivals.map((festival: any) => ({
          ...festival,
          date: BigInt(festival.date),
          ticketPrice: BigInt(festival.ticketPrice),
          totalTickets: BigInt(festival.totalTickets),
          remainingTickets: BigInt(festival.remainingTickets)
        }));

        setFestivals(processedFestivals);
      } catch (error) {
        console.error('Error fetching festivals:', error);
        toast.error('Failed to fetch festivals');
      } finally {
        setLoading(false);
      }
    };

    fetchFestivals();
  }, []);

  const handlePurchase = async (festivalId: string, price: bigint) => {
    if (!address) {
      toast.error('Please connect your wallet first');
      return;
    }

    setPurchasing(prev => ({ ...prev, [festivalId]: true }));
    try {
      await purchaseTicket({
        args: [BigInt(festivalId)],
        value: price
      });
      
      setFestivals(prev => 
        prev.map(festival => 
          festival.id === festivalId && festival.remainingTickets
            ? { ...festival, remainingTickets: festival.remainingTickets - BigInt(1) }
            : festival
        )
      );

      toast.success('Ticket purchased successfully!');
    } catch (error) {
      console.error('Error purchasing ticket:', error);
      toast.error('Failed to purchase ticket');
    } finally {
      setPurchasing(prev => ({ ...prev, [festivalId]: false }));
    }
  };

  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleDateString();
  };

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Primary Market</h1>
        
        {festivals.length === 0 ? (
          <div className="text-center text-gray-600 text-lg">
            No active festivals available.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {festivals.map((festival) => (
              <div key={festival.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                {/* Festival Header */}
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4">
                  <h3 className="text-xl font-bold text-white mb-1">{festival.name}</h3>
                  <p className="text-purple-100 line-clamp-2">{festival.description}</p>
                </div>

                {/* Festival Details */}
                <div className="p-6">
                  <div className="space-y-3 text-gray-800">
                    <div className="flex items-center">
                      <span className="font-medium w-32">Venue:</span>
                      <span>{festival.venue}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium w-32">Date:</span>
                      <span>{formatDate(festival.date)}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium w-32">Available:</span>
                      <span>{festival.remainingTickets?.toString() || 'Loading...'} tickets</span>
                    </div>
                    <div className="flex items-center text-green-600 font-semibold">
                      <span className="w-32">Price:</span>
                      <span>{formatEther(festival.ticketPrice)} ETH</span>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <button
                      onClick={() => handlePurchase(festival.id, festival.ticketPrice)}
                      disabled={
                        purchasing[festival.id] || 
                        !address || 
                        (festival.remainingTickets !== undefined && festival.remainingTickets <= BigInt(0))
                      }
                      className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {purchasing[festival.id] 
                        ? 'Processing...' 
                        : festival.remainingTickets !== undefined && festival.remainingTickets <= BigInt(0)
                          ? 'Sold Out'
                          : 'Purchase Ticket'
                      }
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
} 
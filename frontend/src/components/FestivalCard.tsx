import { formatEther } from 'viem';
import { useNFTContract } from '../hooks/useNFTContract';
import { LoadingSpinner } from './LoadingSpinner';
import { useState } from 'react';

interface FestivalCardProps {
  festivalId: bigint;
  name: string;
  description: string;
  date: bigint;
  venue: string;
  ticketPrice: bigint;
  totalTickets: bigint;
  availableTickets: bigint;
  onPurchase?: () => void;
}

export function FestivalCard({
  festivalId,
  name,
  description,
  date,
  venue,
  ticketPrice,
  totalTickets,
  availableTickets,
  onPurchase
}: FestivalCardProps) {
  const { purchaseTicket } = useNFTContract();
  const [isLoading, setIsLoading] = useState(false);

  const handlePurchase = async () => {
    try {
      setIsLoading(true);
      await purchaseTicket({
        args: [festivalId],
        value: ticketPrice
      });
      onPurchase?.();
    } catch (error) {
      console.error('Error purchasing ticket:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formattedDate = new Date(Number(date) * 1000).toLocaleDateString();
  const soldOut = availableTickets === BigInt(0);

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
      {/* Festival Image/Banner */}
      <div className="h-48 bg-gradient-to-r from-purple-500 to-indigo-600 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <h3 className="text-3xl font-bold text-white text-center px-4">{name}</h3>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6">
        <div className="mb-4">
          <p className="text-gray-600 text-sm mb-2">{description}</p>
          <div className="flex items-center text-gray-500 text-sm">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {formattedDate}
          </div>
          <div className="flex items-center text-gray-500 text-sm mt-1">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {venue}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-2 bg-purple-50 rounded-lg">
            <p className="text-sm text-gray-600">Available</p>
            <p className="text-lg font-semibold text-purple-600">
              {availableTickets.toString()}/{totalTickets.toString()}
            </p>
          </div>
          <div className="text-center p-2 bg-purple-50 rounded-lg">
            <p className="text-sm text-gray-600">Price</p>
            <p className="text-lg font-semibold text-purple-600">
              {formatEther(ticketPrice)} ETH
            </p>
          </div>
        </div>

        {/* Purchase Button */}
        <button
          onClick={handlePurchase}
          disabled={soldOut || isLoading}
          className={`
            w-full py-3 px-4 rounded-lg font-medium text-white text-sm
            transition-all duration-200
            ${soldOut 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700'
            }
          `}
        >
          {isLoading ? (
            <div className="flex justify-center items-center">
              <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin mr-2"></div>
              Processing...
            </div>
          ) : soldOut ? (
            'Sold Out'
          ) : (
            'Purchase Ticket'
          )}
        </button>
      </div>
    </div>
  );
} 
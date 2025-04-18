import { useState } from 'react';
import { Button } from './Button';
import { formatEther, parseEther } from 'viem';
import { useNFTContract } from '../hooks/useNFTContract';

interface TicketCardProps {
  ticketId: bigint;
  festivalName: string;
  festivalDate: bigint;
  venue: string;
  purchasePrice: bigint;
  sellingPrice: bigint;
  forSale: boolean;
  onListingChange?: () => void;
}

export function TicketCard({
  ticketId,
  festivalName,
  festivalDate,
  venue,
  purchasePrice,
  sellingPrice,
  forSale,
  onListingChange
}: TicketCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [listingPrice, setListingPrice] = useState('');
  const [showListingForm, setShowListingForm] = useState(false);
  const { listTicket, unlistTicket } = useNFTContract();

  const handleList = async () => {
    if (!listingPrice) return;
    try {
      setIsLoading(true);
      await listTicket({
        args: [ticketId, BigInt(parseFloat(listingPrice) * 1e18)]
      });
      onListingChange?.();
      setShowListingForm(false);
      setListingPrice('');
    } catch (error) {
      console.error('Error listing ticket:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnlist = async () => {
    try {
      setIsLoading(true);
      await unlistTicket({
        args: [ticketId]
      });
      onListingChange?.();
    } catch (error) {
      console.error('Error unlisting ticket:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formattedDate = new Date(Number(festivalDate) * 1000).toLocaleDateString();

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
      {/* Ticket Header */}
      <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <h3 className="text-2xl font-bold text-white text-center px-4">{festivalName}</h3>
        </div>
        <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
          <span className="text-white text-sm">#{ticketId.toString()}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="mb-4">
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

        {/* Price Info */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-2 bg-purple-50 rounded-lg">
            <p className="text-sm text-gray-600">Purchase Price</p>
            <p className="text-lg font-semibold text-purple-600">
              {formatEther(purchasePrice)} ETH
            </p>
          </div>
          {forSale && (
            <div className="text-center p-2 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">Listed For</p>
              <p className="text-lg font-semibold text-green-600">
                {formatEther(sellingPrice)} ETH
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {!forSale && !showListingForm && (
            <button
              onClick={() => setShowListingForm(true)}
              className="w-full py-2 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200"
            >
              List for Sale
            </button>
          )}

          {showListingForm && (
            <div className="space-y-3">
              <div className="relative">
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  placeholder="Price in ETH"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder:text-gray-500"
                  value={listingPrice}
                  onChange={(e) => setListingPrice(e.target.value)}
                />
                <span className="absolute right-3 top-2 text-gray-700">ETH</span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleList}
                  disabled={isLoading || !listingPrice}
                  className="flex-1 py-2 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Listing...' : 'Confirm'}
                </button>
                <button
                  onClick={() => {
                    setShowListingForm(false);
                    setListingPrice('');
                  }}
                  className="flex-1 py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {forSale && (
            <button
              onClick={handleUnlist}
              disabled={isLoading}
              className="w-full py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 disabled:opacity-50"
            >
              {isLoading ? 'Processing...' : 'Remove Listing'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 
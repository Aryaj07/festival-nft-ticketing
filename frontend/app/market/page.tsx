'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { Navbar } from '../../src/components/Navbar';
import { useNFTContract } from '../../src/hooks/useNFTContract';
import { formatEther } from 'viem';
import { LoadingSpinner } from '../../src/components/LoadingSpinner';
import { toast } from 'react-hot-toast';
import { contractAddress } from '../../src/config/contracts';

interface TicketDetails {
  ticketId: bigint;
  festivalId: bigint;
  price: bigint;
  isForSale: boolean;
  owner: string;
}

interface Festival {
  id: string;
  name: string;
  description: string;
  date: bigint;
  venue: string;
  ticketPrice: bigint;
  totalTickets: bigint;
}

export default function Market() {
  const { address } = useAccount();
  const { ticketsForSale, secondaryPurchase } = useNFTContract();
  
  const [tickets, setTickets] = useState<Record<string, TicketDetails>>({});
  const [festivals, setFestivals] = useState<Record<string, Festival>>({});
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<Record<string, boolean>>({});
  const [ticketLoadingStates, setTicketLoadingStates] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchListedTickets = async () => {
      console.log('Market page: Starting fetchListedTickets', {
        ticketsForSale,
        isArray: Array.isArray(ticketsForSale),
        contractAddress,
        timestamp: new Date().toISOString()
      });

      if (!ticketsForSale || ticketsForSale.length === 0) {
        console.log('Market page: No tickets for sale available', {
          ticketsForSale,
          timestamp: new Date().toISOString()
        });
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/market/tickets');
        if (!response.ok) {
          throw new Error('Failed to fetch market tickets');
        }
        
        const marketTickets = await response.json();
        console.log('Market tickets:', marketTickets);

        const ticketDetailsMap = marketTickets.reduce((acc: Record<string, TicketDetails>, ticket: any) => {
          acc[ticket.ticketId] = {
            ticketId: BigInt(ticket.ticketId),
            festivalId: BigInt(ticket.festivalId),
            price: BigInt(ticket.price),
            isForSale: ticket.isForSale,
            owner: ticket.owner
          };
          return acc;
        }, {});

        setTickets(ticketDetailsMap);

        const festivalPromises = marketTickets.map(async (ticket: any) => {
          const response = await fetch(`/api/festivals/${ticket.festivalId}`);
          if (!response.ok) {
            throw new Error(`Failed to fetch festival ${ticket.festivalId}`);
          }
          const festivalDetails = await response.json();
          return [ticket.ticketId, festivalDetails] as [string, Festival];
        });

        const festivalResults = await Promise.all(festivalPromises);
        console.log('Processed festival results:', festivalResults);
        setFestivals(Object.fromEntries(festivalResults));
      } catch (error) {
        console.error('Error fetching market tickets:', error);
        toast.error('Failed to fetch market tickets');
      } finally {
        setLoading(false);
      }
    };

    fetchListedTickets();
  }, [ticketsForSale]);

  const handlePurchase = async (ticketId: string, price: bigint) => {
    if (!address) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!price) {
      toast.error('Invalid ticket price');
      return;
    }

    setPurchasing(prev => ({ ...prev, [ticketId]: true }));
    try {
      await secondaryPurchase({
        args: [BigInt(ticketId)],
        value: price
      });
      
      setTickets(prev => {
        const newTickets = { ...prev };
        delete newTickets[ticketId];
        return newTickets;
      });
      setFestivals(prev => {
        const newFestivals = { ...prev };
        delete newFestivals[ticketId];
        return newFestivals;
      });

      toast.success('Ticket purchased successfully! (10% platform fee included in price)');
    } catch (error) {
      console.error('Error purchasing ticket:', error);
      if (error instanceof Error) {
        if (error.message.includes('Cannot buy own ticket')) {
          toast.error('You cannot buy your own ticket');
        } else if (error.message.includes('Incorrect price')) {
          toast.error('The ticket price has changed. Please refresh the page.');
        } else {
          toast.error('Failed to purchase ticket');
        }
      }
    } finally {
      setPurchasing(prev => ({ ...prev, [ticketId]: false }));
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Secondary Market</h1>
        
        {(!ticketsForSale || ticketsForSale.length === 0) ? (
          <div className="text-center text-gray-600 text-lg">
            No tickets are currently listed for sale.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {ticketsForSale.map((ticketId) => {
              const ticket = tickets[ticketId.toString()];
              const festival = festivals[ticketId.toString()];
              const isTicketLoading = ticketLoadingStates[ticketId.toString()];
              
              if (isTicketLoading) {
                return (
                  <div key={ticketId.toString()} className="bg-white rounded-xl shadow-lg p-4 flex justify-center items-center min-h-[200px]">
                    <LoadingSpinner />
                  </div>
                );
              }

              if (!ticket || !festival) return null;

              return (
                <div key={ticketId.toString()} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                  {/* Festival Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                    <h3 className="text-xl font-bold text-white mb-1">{festival.name}</h3>
                    <p className="text-blue-100">Ticket #{ticketId.toString()}</p>
                  </div>

                  {/* Ticket Details */}
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
                      <div className="flex items-center text-green-600 font-semibold">
                        <span className="w-32">Price:</span>
                        <span>{ticket.price ? formatEther(ticket.price) : '0'} ETH</span>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <button
                        onClick={() => handlePurchase(ticketId.toString(), ticket.price || BigInt(0))}
                        disabled={purchasing[ticketId.toString()] || !address || !ticket.price}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {purchasing[ticketId.toString()] ? 'Processing...' : 'Purchase Ticket'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
} 
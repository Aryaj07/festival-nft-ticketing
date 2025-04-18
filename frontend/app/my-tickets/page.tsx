'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { Navbar } from '../../src/components/Navbar';
import { Button } from '../../src/components/Button';
import { useNFTContract } from '../../src/hooks/useNFTContract';
import { formatEther, parseEther } from 'viem';
import { LoadingSpinner } from '../../src/components/LoadingSpinner';
import { toast } from 'react-hot-toast';

interface TicketDetails {
  ticketId: bigint;
  festivalId: bigint;
  owner: string;
  forSale: boolean;
  purchasePrice: bigint;
  sellingPrice: bigint;
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

export default function MyTickets() {
  const { address } = useAccount();
  const {
    myTickets,
    listTicket,
    unlistTicket,
    isListing: isListingInProgress,
    isUnlisting,
  } = useNFTContract();

  const [tickets, setTickets] = useState<Record<string, TicketDetails>>({});
  const [festivals, setFestivals] = useState<Record<string, Festival>>({});
  const [loading, setLoading] = useState(true);
  const [listingPrices, setListingPrices] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchTicketAndFestivalDetails = async () => {
      if (!address || !myTickets?.length) {
        setLoading(false);
        return;
      }

      try {
        // First fetch all ticket details
        const ticketPromises = myTickets.map(async (ticketId) => {
          const response = await fetch(`/api/tickets/${ticketId}`);
          if (!response.ok) throw new Error(`Failed to fetch ticket ${ticketId}`);
          const details = await response.json();
          console.log(`Ticket ${ticketId} details:`, details);
          
          // Convert string values back to BigInt
          const processedDetails = {
            ...details,
            ticketId: BigInt(details.ticketId),
            festivalId: BigInt(details.festivalId),
            purchasePrice: BigInt(details.purchasePrice),
            sellingPrice: details.sellingPrice ? BigInt(details.sellingPrice) : BigInt(0),
          };
          
          return [ticketId.toString(), processedDetails] as [string, TicketDetails];
        });

        const ticketResults = await Promise.all(ticketPromises);
        const ticketDetailsMap = Object.fromEntries(ticketResults);
        setTickets(ticketDetailsMap);

        // Then fetch festival details using the festival IDs from tickets
        const festivalPromises = ticketResults.map(async ([ticketId, ticketDetails]) => {
          const festivalId = ticketDetails.festivalId;
          const response = await fetch(`/api/festivals/${festivalId}`);
          if (!response.ok) throw new Error(`Failed to fetch festival ${festivalId} for ticket ${ticketId}`);
          const details = await response.json();
          return [ticketId, details];
        });

        const festivalResults = await Promise.all(festivalPromises);
        setFestivals(Object.fromEntries(festivalResults));
      } catch (error) {
        console.error('Error fetching ticket details:', error);
        toast.error('Failed to fetch ticket details');
      } finally {
        setLoading(false);
      }
    };

    fetchTicketAndFestivalDetails();
  }, [address, myTickets]);

  const handleListTicket = async (ticketId: string, price: string) => {
    if (!price) {
      toast.error('Please enter a price');
      return;
    }

    const ticket = tickets[ticketId];
    if (!ticket) {
      toast.error('Ticket not found');
      return;
    }

    // Ensure listing price matches purchase price
    const listingPriceWei = parseEther(price);
    if (listingPriceWei !== ticket.purchasePrice) {
      toast.error('Listing price must match your purchase price');
      return;
    }

    setIsLoading(true);
    try {
      await listTicket({
        args: [BigInt(ticketId), listingPriceWei],
      });

      // Clear the listing price input
      setListingPrices(prev => ({
        ...prev,
        [ticketId]: ''
      }));

      // Update the ticket's status in the UI
      setTickets(prev => ({
        ...prev,
        [ticketId]: {
          ...prev[ticketId],
          forSale: true,
          sellingPrice: listingPriceWei
        }
      }));

      toast.success('Ticket listed successfully!');
    } catch (error) {
      console.error('Error listing ticket:', error);
      toast.error('Failed to list ticket');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnlistTicket = async (ticketId: string) => {
    try {
      setIsLoading(true);
      const result = await unlistTicket({
        args: [BigInt(ticketId)]
      });
      
      // Update the ticket details after unlisting
      const updatedTicketDetails = await fetch(`/api/tickets/${ticketId}`);
      if (!updatedTicketDetails.ok) throw new Error(`Failed to fetch updated ticket details for ${ticketId}`);
      const details = await updatedTicketDetails.json();
      setTickets(prevTickets => ({
        ...prevTickets,
        [ticketId]: {
          ...prevTickets[ticketId],
          details: details
        }
      }));
      
      toast.success('Ticket unlisted successfully!');
    } catch (error) {
      console.error('Error unlisting ticket:', error);
      toast.error('Failed to unlist ticket');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleDateString();
  };

  if (!address) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600 text-lg">
            Please connect your wallet to view your tickets.
          </div>
        </main>
      </div>
    );
  }

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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Tickets</h1>
        
        {(!myTickets || myTickets.length === 0) ? (
          <div className="text-center text-gray-600 text-lg">
            You don't own any tickets yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {myTickets.map((ticketId) => {
              const ticket = tickets[ticketId.toString()];
              const festival = festivals[ticketId.toString()];
              
              if (!ticket || !festival) return null;

              return (
                <div key={ticketId.toString()} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                  {/* Festival Header */}
                  <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4">
                    <h3 className="text-xl font-bold text-white mb-1">{festival.name}</h3>
                    <p className="text-purple-100">Ticket #{ticketId.toString()}</p>
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
                      <div className="flex items-center">
                        <span className="font-medium w-32">Purchase Price:</span>
                        <span>{ticket.purchasePrice ? formatEther(ticket.purchasePrice) : '0'} ETH</span>
                      </div>
                      {ticket.forSale && (
                        <div className="flex items-center text-green-600 font-semibold">
                          <span className="w-32">Listed Price:</span>
                          <span>{ticket.sellingPrice ? formatEther(ticket.sellingPrice) : '0'} ETH</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-6 space-y-4">
                      {ticket.forSale ? (
                        <button
                          onClick={() => handleUnlistTicket(ticketId.toString())}
                          disabled={isUnlisting || isLoading}
                          className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isLoading ? 'Unlisting...' : 'Unlist Ticket'}
                        </button>
                      ) : (
                        <div className="space-y-4">
                          <input
                            type="number"
                            step="0.001"
                            placeholder="Price in ETH"
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder:text-gray-500"
                            value={listingPrices[ticketId.toString()] || ''}
                            onChange={(e) => setListingPrices(prev => ({
                              ...prev,
                              [ticketId.toString()]: e.target.value
                            }))}
                          />
                          <button
                            onClick={() => handleListTicket(ticketId.toString(), listingPrices[ticketId.toString()] || '')}
                            disabled={isListingInProgress || !listingPrices[ticketId.toString()]}
                            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isLoading ? 'Listing...' : 'List for Sale'}
                          </button>
                        </div>
                      )}
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
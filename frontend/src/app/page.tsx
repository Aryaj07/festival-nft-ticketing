'use client';

import { useAccount } from 'wagmi';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/Button';
import { TicketCard } from '../components/TicketCard';
import { useNFTContract } from '../hooks/useNFTContract';
import { formatEther, parseEther } from 'viem';
import { useEffect, useState } from 'react';

interface TicketDetail {
  purchasePrice: bigint;
  sellingPrice: bigint;
  forSale: boolean;
  metadata: string;
}

export default function Home() {
  const { address } = useAccount();
  const {
    myTickets,
    ticketsForSale,
    ticketPrice,
    purchaseTicket,
    isPurchasing,
    listTicket,
    isListing,
    unlistTicket,
    isUnlisting,
    secondaryPurchase,
    isSecondaryPurchasing,
  } = useNFTContract();

  const [ticketDetails, setTicketDetails] = useState<Record<number, TicketDetail>>({});

  // Function to fetch ticket details
  const fetchTicketDetails = async (ticketId: bigint) => {
    try {
      const response = await fetch(`/api/tickets/${ticketId}`);
      if (!response.ok) throw new Error('Failed to fetch ticket details');
      const details = await response.json();
      setTicketDetails(prev => ({
        ...prev,
        [Number(ticketId)]: details
      }));
    } catch (error) {
      console.error('Error fetching ticket details:', error);
    }
  };

  // Fetch details for all tickets
  useEffect(() => {
    const allTickets = new Set([
      ...(myTickets || []),
      ...(ticketsForSale || [])
    ]);
    
    allTickets.forEach(ticketId => {
      if (!ticketDetails[Number(ticketId)]) {
        fetchTicketDetails(ticketId);
      }
    });
  }, [myTickets, ticketsForSale]);

  // Function to handle primary market purchase
  const handlePurchase = () => {
    if (ticketPrice) {
      purchaseTicket({
        value: ticketPrice,
      });
    }
  };

  // Function to handle secondary market purchase
  const handleSecondaryPurchase = (ticketId: number) => {
    const details = ticketDetails[ticketId];
    if (details) {
      secondaryPurchase({
        args: [BigInt(ticketId)],
        value: details.sellingPrice,
      });
    }
  };

  // Function to handle listing ticket for sale
  const handleList = (ticketId: number, price: string) => {
    listTicket({
      args: [BigInt(ticketId), parseEther(price)],
    });
  };

  // Function to handle unlisting ticket
  const handleUnlist = (ticketId: number) => {
    unlistTicket({
      args: [BigInt(ticketId)],
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Primary Market Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Primary Market</h2>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-lg mb-4">
              Ticket Price: {ticketPrice ? formatEther(ticketPrice) : '0'} ETH
            </p>
            <Button
              onClick={handlePurchase}
              isLoading={isPurchasing}
              disabled={!address}
            >
              Purchase New Ticket
            </Button>
          </div>
        </section>

        {/* My Tickets Section */}
        {address && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">My Tickets</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(myTickets as bigint[])?.map((ticketId) => (
                <TicketCard
                  key={Number(ticketId)}
                  ticketId={Number(ticketId)}
                  details={ticketDetails[Number(ticketId)] || {
                    purchasePrice: BigInt(0),
                    sellingPrice: BigInt(0),
                    forSale: false,
                    metadata: '',
                  }}
                  isOwner={true}
                  onList={handleList}
                  onUnlist={handleUnlist}
                  isLoading={isListing || isUnlisting}
                />
              ))}
            </div>
          </section>
        )}

        {/* Secondary Market Section */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Secondary Market</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(ticketsForSale as bigint[])?.map((ticketId) => (
              <TicketCard
                key={Number(ticketId)}
                ticketId={Number(ticketId)}
                details={ticketDetails[Number(ticketId)] || {
                  purchasePrice: BigInt(0),
                  sellingPrice: BigInt(0),
                  forSale: false,
                  metadata: '',
                }}
                isOwner={false}
                onPurchase={handleSecondaryPurchase}
                isLoading={isSecondaryPurchasing}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
} 
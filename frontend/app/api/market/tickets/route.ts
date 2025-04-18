import { NextResponse } from 'next/server';
import { createPublicClient, http } from 'viem';
import { Chain } from 'viem/chains';
import { CONTRACTS } from '../../../../src/config/contracts';

// Define Ganache chain
const ganache: Chain = {
  id: 1337,
  name: 'Ganache',
  network: 'ganache',
  nativeCurrency: {
    decimals: 18,
    name: 'Ethereum',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { http: ['http://127.0.0.1:7545'] },
    public: { http: ['http://127.0.0.1:7545'] },
  },
};

const client = createPublicClient({
  chain: ganache,
  transport: http('http://127.0.0.1:7545'),
});

type TicketDetails = {
  festivalId: bigint;
  purchasePrice: bigint;
  sellingPrice: bigint;
  forSale: boolean;
  metadata: string;
};

export async function GET() {
  try {
    // Get all listed tickets
    const listedTickets = await client.readContract({
      address: CONTRACTS.FestivalNFT.address as `0x${string}`,
      abi: CONTRACTS.FestivalNFT.abi,
      functionName: 'getTicketsForSale',
      args: [],
    }) as bigint[];

    console.log('Listed tickets:', listedTickets);

    // Fetch details for each listed ticket
    const ticketDetailsPromises = listedTickets.map(async (ticketId) => {
      const ticket = await client.readContract({
        address: CONTRACTS.FestivalNFT.address as `0x${string}`,
        abi: CONTRACTS.FestivalNFT.abi,
        functionName: 'getTicketDetails',
        args: [ticketId],
      }) as TicketDetails;

      const owner = await client.readContract({
        address: CONTRACTS.FestivalNFT.address as `0x${string}`,
        abi: CONTRACTS.FestivalNFT.abi,
        functionName: 'ownerOf',
        args: [ticketId],
      }) as string;

      return {
        ticketId: ticketId.toString(),
        festivalId: ticket.festivalId.toString(),
        price: ticket.sellingPrice.toString(),
        owner,
        isForSale: ticket.forSale
      };
    });

    const ticketDetails = await Promise.all(ticketDetailsPromises);
    console.log('Market tickets with details:', ticketDetails);

    return NextResponse.json(ticketDetails);
  } catch (error) {
    console.error('Error fetching market tickets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch market tickets' },
      { status: 500 }
    );
  }
} 
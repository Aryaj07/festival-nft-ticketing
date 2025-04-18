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

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Validate ticket ID
    if (!params.id || isNaN(Number(params.id))) {
      return NextResponse.json(
        { error: 'Invalid ticket ID' },
        { status: 400 }
      );
    }

    const ticketId = BigInt(params.id);
    
    // Call the contract to get ticket details
    const ticket = await client.readContract({
      address: CONTRACTS.FestivalNFT.address as `0x${string}`,
      abi: CONTRACTS.FestivalNFT.abi,
      functionName: 'getTicketDetails',
      args: [ticketId],
    }) as TicketDetails;

    // Check if ticket exists
    if (!ticket) {
      console.log(`Ticket not found for ID: ${ticketId}`);
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }

    // Format the response
    const formattedTicket = {
      ticketId: ticketId.toString(),
      festivalId: ticket.festivalId.toString(),
      purchasePrice: ticket.purchasePrice.toString(),
      sellingPrice: ticket.sellingPrice.toString(),
      forSale: ticket.forSale,
      owner: await client.readContract({
        address: CONTRACTS.FestivalNFT.address as `0x${string}`,
        abi: CONTRACTS.FestivalNFT.abi,
        functionName: 'ownerOf',
        args: [ticketId],
      }) as string
    };

    console.log('Formatted ticket response:', formattedTicket);
    return NextResponse.json(formattedTicket);
  } catch (error) {
    console.error('Error fetching ticket details:', {
      ticketId: params.id,
      error: error instanceof Error ? error.message : String(error)
    });
    
    // Handle specific error types
    if (error instanceof Error && error.message.includes('contract')) {
      return NextResponse.json(
        { error: 'Error connecting to blockchain' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch ticket details' },
      { status: 500 }
    );
  }
} 
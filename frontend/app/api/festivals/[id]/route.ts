import { NextResponse } from 'next/server';
import { createPublicClient, http } from 'viem';
import { Chain } from 'viem';
import { CONTRACTS } from '../../../../src/config/contracts';

const ganacheChain: Chain = {
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

const transport = http('http://127.0.0.1:7545');
const client = createPublicClient({
  chain: ganacheChain,
  transport,
});

type FestivalTuple = readonly [
  string,    // name
  string,    // description
  bigint,    // date
  string,    // venue
  bigint,    // ticketPrice
  bigint,    // totalTickets
  bigint,    // availableTickets
  `0x${string}`, // organizer
  boolean    // isActive
];

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Validate festival ID
    if (!params.id || isNaN(Number(params.id))) {
      return NextResponse.json(
        { error: 'Invalid festival ID' },
        { status: 400 }
      );
    }

    const festivalId = BigInt(params.id);
    
    // Call the contract to get festival details
    const festival = await client.readContract({
      address: CONTRACTS.FestivalNFT.address as `0x${string}`,
      abi: CONTRACTS.FestivalNFT.abi,
      functionName: 'festivals',
      args: [festivalId],
    }) as FestivalTuple;

    // Check if festival exists by verifying name is not empty
    if (!festival || !festival[0]) {
      console.log(`Festival not found for ID: ${festivalId}`);
      return NextResponse.json(
        { error: 'Festival not found' },
        { status: 404 }
      );
    }

    // Convert BigInts to strings for JSON serialization
    const [
      name,
      description,
      date,
      venue,
      ticketPrice,
      totalTickets,
      availableTickets,
      organizer,
      isActive
    ] = festival;

    const formattedFestival = {
      id: params.id,
      name,
      description,
      date: Number(date),
      venue,
      ticketPrice: ticketPrice.toString(),
      totalTickets: Number(totalTickets),
      availableTickets: Number(availableTickets),
      organizer,
      isActive,
    };

    return NextResponse.json(formattedFestival);
  } catch (error) {
    console.error('Error fetching festival:', {
      festivalId: params.id,
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
      { error: 'Failed to fetch festival details' },
      { status: 500 }
    );
  }
} 
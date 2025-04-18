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

type FestivalDetails = {
  name: string;
  description: string;
  date: bigint;
  venue: string;
  ticketPrice: bigint;
  totalTickets: bigint;
  remainingTickets: bigint;
};

export async function GET() {
  try {
    // Get active festivals
    const activeFestivalIds = await client.readContract({
      address: CONTRACTS.FestivalNFT.address as `0x${string}`,
      abi: CONTRACTS.FestivalNFT.abi,
      functionName: 'getActiveFestivals',
      args: undefined,
    }) as bigint[];

    console.log('Active festival IDs:', activeFestivalIds);

    // Fetch details for each active festival
    const festivalPromises = activeFestivalIds.map(async (festivalId) => {
      const festivalData = await client.readContract({
        address: CONTRACTS.FestivalNFT.address as `0x${string}`,
        abi: CONTRACTS.FestivalNFT.abi,
        functionName: 'festivals',
        args: [festivalId],
      }) as [string, string, bigint, string, bigint, bigint, bigint, `0x${string}`, boolean];

      // Convert the array to our FestivalDetails type
      const festival: FestivalDetails = {
        name: festivalData[0],
        description: festivalData[1],
        date: festivalData[2],
        venue: festivalData[3],
        ticketPrice: festivalData[4],
        totalTickets: festivalData[5],
        remainingTickets: festivalData[6]
      };

      return {
        id: festivalId.toString(),
        ...festival,
        date: festival.date.toString(),
        ticketPrice: festival.ticketPrice.toString(),
        totalTickets: festival.totalTickets.toString(),
        remainingTickets: festival.remainingTickets.toString()
      };
    });

    const festivals = await Promise.all(festivalPromises);
    console.log('Active festivals with details:', festivals);

    return NextResponse.json(festivals);
  } catch (error) {
    console.error('Error fetching active festivals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch active festivals' },
      { status: 500 }
    );
  }
} 
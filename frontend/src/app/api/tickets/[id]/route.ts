import { NextResponse } from 'next/server';
import { createPublicClient, http } from 'viem';
import { hardhat } from 'viem/chains';
import { CONTRACTS } from '../../../../config/contracts';

const client = createPublicClient({
  chain: hardhat,
  transport: http(),
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const ticketId = BigInt(params.id);
    
    const details = await client.readContract({
      address: CONTRACTS.FestivalNFT.address as `0x${string}`,
      abi: CONTRACTS.FestivalNFT.abi,
      functionName: 'getTicketDetails',
      args: [ticketId],
    });

    return NextResponse.json(details);
  } catch (error) {
    console.error('Error fetching ticket details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ticket details' },
      { status: 500 }
    );
  }
} 
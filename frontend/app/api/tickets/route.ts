import { NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { Chain } from "viem";
import { contractAddress, NFTAbi } from "../../../src/config/contracts";

const chain: Chain = {
  id: 1337,
  name: "Ganache",
  network: "ganache",
  nativeCurrency: {
    decimals: 18,
    name: "Ethereum",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http: ["http://127.0.0.1:7545"],
    },
    public: {
      http: ["http://127.0.0.1:7545"],
    },
  },
};

const publicClient = createPublicClient({
  chain,
  transport: http(),
});

interface TicketDetails {
  festivalId: bigint;
  purchasePrice: bigint;
  sellingPrice: bigint;
  forSale: boolean;
  metadata: string;
}

export async function GET() {
  try {
    const totalSupply = await publicClient.readContract({
      address: contractAddress,
      abi: NFTAbi,
      functionName: "totalSupply",
    });

    const tickets = [];
    for (let i = 0; i < Number(totalSupply); i++) {
      try {
        const owner = await publicClient.readContract({
          address: contractAddress,
          abi: NFTAbi,
          functionName: "ownerOf",
          args: [BigInt(i)],
        });

        const ticketDetails = (await publicClient.readContract({
          address: contractAddress,
          abi: NFTAbi,
          functionName: "getTicketDetails",
          args: [BigInt(i)],
        })) as TicketDetails;

        tickets.push({
          id: i,
          owner,
          festivalId: Number(ticketDetails.festivalId),
          purchasePrice: Number(ticketDetails.purchasePrice),
          sellingPrice: Number(ticketDetails.sellingPrice),
          forSale: ticketDetails.forSale,
          metadata: ticketDetails.metadata
        });
      } catch (error) {
        console.error(`Error fetching ticket ${i}:`, error);
      }
    }

    return NextResponse.json({ tickets });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return NextResponse.json(
      { error: "Failed to fetch tickets" },
      { status: 500 }
    );
  }
} 
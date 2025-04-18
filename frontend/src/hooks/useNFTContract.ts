import { useContractRead, useContractWrite, useWaitForTransaction, useAccount, useNetwork } from 'wagmi';
import { parseEther } from 'viem';
import { useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { CONTRACTS } from '../config/contracts';
import nftAbi from '../abi/FestivalNFT.json';
import { contractAddress } from '../config/contracts';

const MINTER_ROLE = '0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6';
const DEFAULT_ADMIN_ROLE = '0x0000000000000000000000000000000000000000000000000000000000000000';

export function useNFTContract() {
  const { address } = useAccount();
  const { chain } = useNetwork();

  // Read functions
  const { data: myTickets = [] } = useContractRead({
    address: CONTRACTS.FestivalNFT.address as `0x${string}`,
    abi: nftAbi,
    functionName: 'getCustomerTickets',
    args: address ? [address] : undefined,
    enabled: !!address,
  });

  const { data: totalCommissionData } = useContractRead({
    address: CONTRACTS.FestivalNFT.address as `0x${string}`,
    abi: nftAbi,
    functionName: 'totalCommissionEarned',
  });

  const { data: ticketsForSale = [] } = useContractRead({
    address: CONTRACTS.FestivalNFT.address as `0x${string}`,
    abi: nftAbi,
    functionName: 'getTicketsForSale',
    watch: true,
  });

  const { data: activeFestivals = [] } = useContractRead({
    address: CONTRACTS.FestivalNFT.address as `0x${string}`,
    abi: nftAbi,
    functionName: 'getActiveFestivals',
    watch: true,
  }) as { data: bigint[] };

  const { data: hasMinterRole } = useContractRead({
    address: CONTRACTS.FestivalNFT.address as `0x${string}`,
    abi: nftAbi,
    functionName: 'hasRole',
    args: [MINTER_ROLE, address as `0x${string}`],
    enabled: !!address,
  });

  const { data: hasAdminRole } = useContractRead({
    address: CONTRACTS.FestivalNFT.address as `0x${string}`,
    abi: nftAbi,
    functionName: 'hasRole',
    args: [DEFAULT_ADMIN_ROLE, address as `0x${string}`],
    enabled: !!address,
  });

  // Debug logging for role checks - only log when values change
  useEffect(() => {
    if (address) {
      console.log('Role Check Update:', {
        address,
        contractAddress: CONTRACTS.FestivalNFT.address,
        hasMinterRole,
        hasAdminRole,
      });
    }
  }, [address, hasMinterRole, hasAdminRole]);

  // Debug logging for tickets for sale
  useEffect(() => {
    console.log('Tickets for sale update:', {
      contractAddress: CONTRACTS.FestivalNFT.address,
      ticketsForSale,
      timestamp: new Date().toISOString()
    });
  }, [ticketsForSale]);

  // Write functions with status tracking
  const { 
    writeAsync: purchaseTicket,
    data: purchaseData,
    isLoading: isPurchasing 
  } = useContractWrite({
    address: CONTRACTS.FestivalNFT.address as `0x${string}`,
    abi: nftAbi,
    functionName: 'purchaseTicket',
  });

  const {
    writeAsync: listTicket,
    data: listData,
    isLoading: isListing
  } = useContractWrite({
    address: CONTRACTS.FestivalNFT.address as `0x${string}`,
    abi: nftAbi,
    functionName: 'listTicketForSale',
  });

  const {
    writeAsync: unlistTicket,
    data: unlistData,
    isLoading: isUnlisting
  } = useContractWrite({
    address: CONTRACTS.FestivalNFT.address as `0x${string}`,
    abi: nftAbi,
    functionName: 'unlistTicket',
  });

  const {
    writeAsync: secondaryPurchase,
    data: secondaryPurchaseData,
    isLoading: isSecondaryPurchasing
  } = useContractWrite({
    address: CONTRACTS.FestivalNFT.address as `0x${string}`,
    abi: nftAbi,
    functionName: 'secondaryPurchase',
  });

  const { 
    writeAsync: createFestival,
    data: createFestivalData,
    isLoading: isCreatingFestival 
  } = useContractWrite({
    address: CONTRACTS.FestivalNFT.address as `0x${string}`,
    abi: nftAbi,
    functionName: 'createFestival',
  });

  const {
    writeAsync: grantMinterRole,
    data: grantMinterRoleData,
    isLoading: isGrantingMinterRole
  } = useContractWrite({
    address: CONTRACTS.FestivalNFT.address as `0x${string}`,
    abi: nftAbi,
    functionName: 'grantRole',
  });

  // Transaction status tracking
  useWaitForTransaction({
    hash: purchaseData?.hash,
    onSuccess: () => {
      toast.success('Ticket purchased successfully! 🎉');
    },
    onError: () => {
      toast.error('Failed to purchase ticket');
    },
  });

  useWaitForTransaction({
    hash: listData?.hash,
    onSuccess: () => {
      toast.success('Ticket listed successfully! 🎫');
    },
    onError: () => {
      toast.error('Failed to list ticket');
    },
  });

  useWaitForTransaction({
    hash: unlistData?.hash,
    onSuccess: () => {
      toast.success('Ticket unlisted successfully');
    },
    onError: () => {
      toast.error('Failed to unlist ticket');
    },
  });

  useWaitForTransaction({
    hash: secondaryPurchaseData?.hash,
    onSuccess: () => {
      toast.success('Ticket purchased from secondary market! 🎉');
    },
    onError: () => {
      toast.error('Failed to purchase ticket from secondary market');
    },
  });

  useWaitForTransaction({
    hash: createFestivalData?.hash,
    onSuccess: () => {
      toast.success('Festival created successfully! 🎪');
    },
    onError: (error) => {
      console.error('Festival creation error:', error);
      toast.error('Failed to create festival. Make sure you have the MINTER_ROLE.');
    },
  });

  useWaitForTransaction({
    hash: grantMinterRoleData?.hash,
    onSuccess: () => {
      toast.success('Minter role granted successfully!');
    },
    onError: () => {
      toast.error('Failed to grant minter role. Make sure you have admin rights.');
    },
  });

  // Helper functions for reading festival and ticket details
  const getFestival = async (festivalId: bigint) => {
    const response = await fetch(`/api/festivals/${festivalId}`);
    if (!response.ok) throw new Error(`Failed to fetch festival ${festivalId}`);
    return response.json();
  };

  const getTicketDetails = async (ticketId: bigint) => {
    const response = await fetch(`/api/tickets/${ticketId}`);
    if (!response.ok) throw new Error(`Failed to fetch ticket ${ticketId}`);
    return response.json();
  };

  return {
    // Read functions
    myTickets,
    ticketsForSale,
    activeFestivals,
    getFestival,
    getTicketDetails,
    totalCommissionData,
    hasMinterRole,
    hasAdminRole,

    // Write functions
    purchaseTicket,
    listTicket,
    unlistTicket,
    secondaryPurchase,
    createFestival,
    grantMinterRole,

    // Loading states
    isPurchasing,
    isListing,
    isUnlisting,
    isSecondaryPurchasing,
    isCreatingFestival,
    isGrantingMinterRole,
  };
} 
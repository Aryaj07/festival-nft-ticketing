// Contract deployed on Ganache
const FESTIVAL_NFT_ADDRESS = '0x67081e0FD7A19aEb6F940C6d31c5bE6aA99A8abF';

export const CONTRACTS = {
  FestToken: {
    address: '0x35C2aeB654B7EDEDE9e22800D1af23B43F1A938a',
    abi: [
      'function mint(address to, uint256 amount)',
      'function balanceOf(address account) view returns (uint256)',
      'function approve(address spender, uint256 amount) returns (bool)',
      'function allowance(address owner, address spender) view returns (uint256)',
    ],
  },
  FestivalNFT: {
    address: "0x1169f6493EEE5Ae447D744891473A50F1a337868",
    abi: [
      {
        name: 'festivals',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ name: 'festivalId', type: 'uint256' }],
        outputs: [
          { name: 'name', type: 'string' },
          { name: 'description', type: 'string' },
          { name: 'date', type: 'uint256' },
          { name: 'venue', type: 'string' },
          { name: 'ticketPrice', type: 'uint256' },
          { name: 'totalTickets', type: 'uint256' },
          { name: 'availableTickets', type: 'uint256' },
          { name: 'organizer', type: 'address' },
          { name: 'isActive', type: 'bool' }
        ]
      },
      {
        name: 'createFestival',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [
          { name: 'name', type: 'string' },
          { name: 'description', type: 'string' },
          { name: 'date', type: 'uint256' },
          { name: 'venue', type: 'string' },
          { name: 'ticketPrice', type: 'uint256' },
          { name: 'totalTickets', type: 'uint256' }
        ],
        outputs: []
      },
      {
        name: 'purchaseTicket',
        type: 'function',
        stateMutability: 'payable',
        inputs: [{ name: 'festivalId', type: 'uint256' }],
        outputs: []
      },
      {
        name: 'getCustomerTickets',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ name: 'customer', type: 'address' }],
        outputs: [{ name: '', type: 'uint256[]' }]
      },
      {
        name: 'getTicketDetails',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ name: 'ticketId', type: 'uint256' }],
        outputs: [
          {
            name: '',
            type: 'tuple',
            components: [
              { name: 'festivalId', type: 'uint256' },
              { name: 'purchasePrice', type: 'uint256' },
              { name: 'sellingPrice', type: 'uint256' },
              { name: 'forSale', type: 'bool' },
              { name: 'metadata', type: 'string' }
            ]
          }
        ]
      },
      {
        name: 'listTicketForSale',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [
          { name: 'ticketId', type: 'uint256' },
          { name: 'sellingPrice', type: 'uint256' }
        ],
        outputs: []
      },
      {
        name: 'unlistTicket',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [{ name: 'ticketId', type: 'uint256' }],
        outputs: []
      },
      {
        name: 'secondaryPurchase',
        type: 'function',
        stateMutability: 'payable',
        inputs: [{ name: 'ticketId', type: 'uint256' }],
        outputs: []
      },
      {
        name: 'getTicketsForSale',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ name: '', type: 'uint256[]' }]
      },
      {
        name: 'ownerOf',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ name: 'tokenId', type: 'uint256' }],
        outputs: [{ name: '', type: 'address' }]
      },
      {
        name: 'MINTER_ROLE',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ name: '', type: 'bytes32' }]
      },
      {
        name: 'hasRole',
        type: 'function',
        stateMutability: 'view',
        inputs: [
          { name: 'role', type: 'bytes32' },
          { name: 'account', type: 'address' }
        ],
        outputs: [{ name: '', type: 'bool' }]
      },
      {
        name: 'grantRole',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [
          { name: 'role', type: 'bytes32' },
          { name: 'account', type: 'address' }
        ],
        outputs: []
      },
      {
        name: 'getActiveFestivals',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ name: '', type: 'uint256[]' }]
      }
    ],
  },
} as const;

// Export the contract address for consistency
export const contractAddress = FESTIVAL_NFT_ADDRESS as `0x${string}`;

// Import the full ABI from the JSON file
export { default as NFTAbi } from '../abi/FestivalNFT.json'; 
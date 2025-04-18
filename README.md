# FestivalNFT - NFT Ticketing Platform

A decentralized NFT ticketing platform built on Ethereum that allows festival organizers to create and sell tickets as NFTs, and enables users to trade these tickets in a secondary market.

## Features

- **Primary Market**: Purchase tickets directly from festival organizers
- **Secondary Market**: Trade tickets with other users
- **NFT Tickets**: Each ticket is a unique NFT with built-in royalties
- **Role-Based Access**: Admin and Minter roles for controlled access
- **Wallet Integration**: Seamless connection with Web3 wallets
- **Modern UI**: Responsive design with a clean interface

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Ganache (for local blockchain)
- MetaMask or any Web3 wallet

## Project Structure

```
├── backend/               # Smart contract code
│   ├── contracts/        # Solidity contracts
│   ├── scripts/          # Deployment scripts
│   └── test/            # Contract tests
└── frontend/             # Next.js frontend application
    ├── app/             # Next.js 13 app directory
    ├── src/            # Source files
    └── public/         # Static files
```

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd run
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Start Ganache (in a separate terminal)
ganache-cli

# Deploy contracts
npx hardhat run scripts/deploy.js --network ganache
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local file
cp .env.example .env.local

# Update .env.local with your contract addresses
# The addresses will be output after running the deployment script
```

### 4. Start the Development Server

```bash
# In the frontend directory
npm run dev
```

The application will be available at `http://localhost:3000`

## Smart Contract Deployment

The project uses the following contracts:
- `FestToken`: ERC20 token for the platform
- `FestivalNFT`: Main NFT contract for tickets
- `FestiveTicketsFactory`: Factory contract for creating new festivals

After deployment, make sure to:
1. Copy the contract addresses from the deployment output
2. Update the `.env.local` file with these addresses
3. Grant MINTER_ROLE to desired addresses through the admin interface

## Wallet Configuration

1. Install MetaMask or another Web3 wallet
2. Connect to Ganache network:
   - Network Name: Ganache
   - RPC URL: http://127.0.0.1:8545
   - Chain ID: 1337
   - Currency Symbol: ETH

## Usage

1. **Admin Role**:
   - The deploying address automatically gets admin role
   - Can grant minter role to other addresses
   - Access admin dashboard

2. **Minter Role**:
   - Can create new festivals
   - Set ticket prices and quantities
   - Manage festival details

3. **Users**:
   - Connect wallet to interact
   - Purchase tickets from primary market
   - Trade tickets on secondary market
   - View owned tickets

## Development Commands

```bash
# Run tests
cd backend
npx hardhat test

# Run linting
cd frontend
npm run lint

# Build for production
cd frontend
npm run build
```

## Environment Variables

Create a `.env.local` file in the frontend directory with:

```env
NEXT_PUBLIC_FESTIVAL_NFT_ADDRESS=<your-nft-contract-address>
NEXT_PUBLIC_FEST_TOKEN_ADDRESS=<your-token-contract-address>
NEXT_PUBLIC_FACTORY_ADDRESS=<your-factory-contract-address>
```

## Common Issues

1. **MetaMask Connection**: Ensure you're connected to the correct network
2. **Transaction Errors**: Make sure you have enough ETH in your wallet
3. **Role Access**: Verify you have the correct role for restricted actions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License. 
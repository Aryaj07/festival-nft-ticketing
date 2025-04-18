'use client';

import * as React from 'react';
import {
  RainbowKitProvider,
  getDefaultWallets,
  connectorsForWallets,
  Wallet,
} from '@rainbow-me/rainbowkit';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { Chain } from 'wagmi/chains';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import '@rainbow-me/rainbowkit/styles.css';

// Define Ganache as a custom chain
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

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [ganache],
  [
    jsonRpcProvider({
      rpc: () => ({
        http: 'http://127.0.0.1:7545',
      }),
    }),
  ]
);

const projectId = 'TEST'; // You can use any string here since we're using Ganache

const { wallets } = getDefaultWallets({
  appName: 'Festival NFT Marketplace',
  projectId,
  chains,
});

const connectors = connectorsForWallets(wallets);

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains}>
        {mounted ? children : null}
      </RainbowKitProvider>
    </WagmiConfig>
  );
} 
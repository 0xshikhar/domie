'use client';

import * as React from 'react';
import { PrivyProvider } from '@privy-io/react-auth';
import { WagmiProvider } from 'wagmi';
import {
    QueryClientProvider,
    QueryClient,
} from "@tanstack/react-query";

import { sepolia } from 'wagmi/chains';
import { defineChain } from 'viem';
import { createConfig } from 'wagmi';
import { http } from 'viem';
import { XMTPProvider } from '@/components/messaging/XMTPProvider';

// Define Doma Testnet chain
const domaTestnet = defineChain({
    id: 97476,
    name: 'Doma Testnet',
    network: 'doma-testnet',
    nativeCurrency: {
        name: 'Ethereum',
        symbol: 'ETH',
        decimals: 18,
    },
    rpcUrls: {
        default: {
            http: ['https://rpc-testnet.doma.xyz'],
        },
        public: {
            http: ['https://rpc-testnet.doma.xyz'],
        },
    },
    blockExplorers: {
        default: {
            name: 'Doma Explorer',
            url: 'https://explorer-testnet.doma.xyz',
        },
    },
    testnet: true,
});

// Configure wagmi client with only Sepolia and Doma Testnet
const config = createConfig({
    chains: [sepolia, domaTestnet],
    transports: {
        [sepolia.id]: http(),
        [domaTestnet.id]: http('https://rpc-testnet.doma.xyz'),
    },
});

const queryClient = new QueryClient();

// Your Privy App ID - replace with your actual app ID
const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID || 'your-privy-app-id';

export function Providers({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = React.useState(false);
    React.useEffect(() => setMounted(true), []);
    
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <PrivyProvider
                    appId={PRIVY_APP_ID}
                    config={{
                        loginMethods: ['wallet', 'email', 'google'],
                        appearance: {
                            theme: 'light',
                            accentColor: '#3B82F6',
                        },
                        embeddedWallets: {
                            createOnLogin: 'users-without-wallets',
                        },
                        supportedChains: [sepolia, domaTestnet],
                    }}
                >
                    <XMTPProvider>
                        {mounted ? (
                            children
                        ) : (
                            <div style={{ visibility: "hidden" }}>
                                {children}
                            </div>
                        )}
                    </XMTPProvider>
                </PrivyProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}

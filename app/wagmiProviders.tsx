'use client'

import * as React from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider, http } from 'wagmi'
import { polygonAmoy } from 'viem/chains';
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit'

const projectId = (process.env.NEXT_PUBLIC_WALLECTCONNECT_PROJECTID) as string;

const queryClient = new QueryClient();

const config = getDefaultConfig({
  appName: 'Gearfight',
  projectId: projectId,
  chains: [polygonAmoy],
  transports: {
    [polygonAmoy.id]: http(),
  },
})

export function WagmiProviders({
  children
}: {
  children: React.ReactNode
}) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider initialChain={polygonAmoy}>
          {mounted && children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
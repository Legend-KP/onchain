import { createConfig, WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { farcasterFrame } from "@farcaster/miniapp-wagmi-connector";
import { base, arbitrum, celo } from "wagmi/chains";
import { http } from "viem";

// Create Wagmi config with Farcaster connector and only the chains we need
// Base, Arbitrum, and Celo for USDC payments
export const config = createConfig({
  chains: [base, arbitrum, celo],
  connectors: [farcasterFrame()],
  transports: {
    [base.id]: http(),
    [arbitrum.id]: http(),
    [celo.id]: http(),
  },
});

const queryClient = new QueryClient();

export default function Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}

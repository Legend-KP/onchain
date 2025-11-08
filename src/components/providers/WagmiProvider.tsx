import { createConfig, WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { farcasterFrame } from "@farcaster/miniapp-wagmi-connector";
import { base, arbitrum, celo } from "wagmi/chains";
import { http } from "viem";

// Reliable Celo RPC endpoint
// Using official Celo RPC - forno.celo.org is the recommended public endpoint
const CELO_RPC_URL = "https://forno.celo.org";

// Create Wagmi config with Farcaster connector and only the chains we need
// Base, Arbitrum, and Celo for USDC payments
export const config = createConfig({
  chains: [base, arbitrum, celo],
  connectors: [farcasterFrame()],
  transports: {
    [base.id]: http(),
    [arbitrum.id]: http(),
    [celo.id]: http(CELO_RPC_URL, {
      // Add timeout configuration for Celo (Celo can be slower)
      timeout: 30000, // 30 second timeout
      // Note: Celo transactions may take longer due to network conditions
      // The wallet will handle retries automatically
    }),
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

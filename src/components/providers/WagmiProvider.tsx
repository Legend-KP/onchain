import { createConfig, WagmiProvider, http } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { farcasterFrame } from "@farcaster/miniapp-wagmi-connector";
import { base, arbitrum, celo } from "wagmi/chains";
import { APP_NAME, APP_ICON_URL, APP_URL } from "~/lib/constants";

// Create a custom config WITHOUT using Daimo's getDefaultConfig
// This prevents Daimo from injecting its own wallet connectors
// We only want the Farcaster wallet connector
// Note: Daimo Pay may still scan the browser for wallets (MetaMask, etc.)
// This config ensures only Farcaster connector is available in Wagmi
export const config = createConfig({
  chains: [base, arbitrum, celo], // Only the chains we need for USDC payments
  connectors: [
    farcasterFrame(), // Farcaster wallet is the ONLY connector
  ],
  transports: {
    [base.id]: http(),
    [arbitrum.id]: http(),
    [celo.id]: http(),
  },
  ssr: false,
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

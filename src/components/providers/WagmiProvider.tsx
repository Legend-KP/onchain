import { createConfig, WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { farcasterFrame } from "@farcaster/miniapp-wagmi-connector";
import { getDefaultConfig } from "@daimo/pay";
import { APP_NAME, APP_ICON_URL, APP_URL } from "~/lib/constants";

// Use Daimo Pay's getDefaultConfig to automatically configure all required chains
// This includes: Arbitrum One, Base, BNB Smart Chain, Celo, Linea Mainnet, 
// Ethereum, Polygon, OP Mainnet, Scroll, World Chain
const daimoConfig = getDefaultConfig({
  appName: APP_NAME,
  appIcon: APP_ICON_URL,
  appUrl: APP_URL,
});

// Merge Daimo's config with our Farcaster connector
// Only use Farcaster wallet connector to ensure it's the primary and only option
export const config = createConfig({
  ...daimoConfig,
  connectors: [
    farcasterFrame(), // Farcaster wallet is the primary and only connector
    // Daimo's default connectors are excluded to ensure only Farcaster wallet is shown
  ],
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

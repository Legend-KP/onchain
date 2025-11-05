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
// Farcaster wallet is set as the first connector to prioritize it
export const config = createConfig({
  ...daimoConfig,
  connectors: [
    farcasterFrame(), // Farcaster wallet is the first/primary connector
    ...(daimoConfig.connectors || []), // Keep Daimo's default connectors for compatibility
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

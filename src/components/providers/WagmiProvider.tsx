import { createConfig, WagmiProvider, http } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { farcasterFrame } from "@farcaster/miniapp-wagmi-connector";
import { base, arbitrum, celo } from "wagmi/chains";

// DAIMO CONFIG (HIDDEN - KEPT FOR REFERENCE)
// Use Daimo Pay's getDefaultConfig to automatically configure all required chains
// This includes: Arbitrum One, Base, BNB Smart Chain, Celo, Linea Mainnet, 
// Ethereum, Polygon, OP Mainnet, Scroll, World Chain
// NOTE: Daimo config is commented out to prevent initialization errors
// import { getDefaultConfig } from "@daimo/pay";
// import { APP_NAME, APP_ICON_URL, APP_URL } from "~/lib/constants";
// const daimoConfig = getDefaultConfig({
//   appName: APP_NAME,
//   appIcon: APP_ICON_URL,
//   appUrl: APP_URL,
// });

// Create config with only Farcaster connector and required chains
// This prevents MetaMask/Coinbase connection errors since we only want Farcaster wallet
export const config = createConfig({
  chains: [base, arbitrum, celo], // Only the chains we need for USDC payments
  connectors: [
    farcasterFrame(), // Farcaster wallet only - no MetaMask/Coinbase
  ],
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

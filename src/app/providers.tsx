'use client';

import dynamic from 'next/dynamic';
import { MiniAppProvider } from '@neynar/react';
import { SafeFarcasterSolanaProvider } from '~/components/providers/SafeFarcasterSolanaProvider';
import { ANALYTICS_ENABLED, RETURN_URL } from '~/lib/constants';

const WagmiProvider = dynamic(
  () => import('~/components/providers/WagmiProvider'),
  {
    ssr: false,
  }
);

// DAIMO PROVIDER (HIDDEN - KEPT FOR REFERENCE)
// Daimo is not required since we're using direct USDC transfers
// If you need Daimo in the future, uncomment and fix the import path:
// const DaimoPayProvider = dynamic(
//   () => import('@daimo/pay').then(mod => mod.DaimoPayProvider),
//   { ssr: false, loading: () => null }
// );

// Fallback component - Daimo is optional
const DaimoPayProviderFallback = ({ children }: { children: React.ReactNode }) => <>{children}</>;

export function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  const solanaEndpoint =
    process.env.SOLANA_RPC_ENDPOINT || 'https://solana-rpc.publicnode.com';
  
  return (
    <WagmiProvider>
      <MiniAppProvider
        analyticsEnabled={ANALYTICS_ENABLED}
        backButtonEnabled={true}
        returnUrl={RETURN_URL}
      >
        <SafeFarcasterSolanaProvider endpoint={solanaEndpoint}>
          {/* DaimoPayProvider is optional - kept for reference but not required */}
          <DaimoPayProviderFallback>
            {children}
          </DaimoPayProviderFallback>
        </SafeFarcasterSolanaProvider>
      </MiniAppProvider>
    </WagmiProvider>
  );
}

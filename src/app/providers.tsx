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

// Safely import DaimoPayProvider - handle errors gracefully
const DaimoPayProvider = dynamic(
  () => import('@daimo/pay').then(mod => mod.DaimoPayProvider).catch(() => {
    // Return a fallback component if Daimo fails to load
    return ({ children }: { children: React.ReactNode }) => <>{children}</>;
  }),
  {
    ssr: false,
    loading: () => null,
  }
);

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
          <DaimoPayProvider mode="auto" theme="auto">
            {children}
          </DaimoPayProvider>
        </SafeFarcasterSolanaProvider>
      </MiniAppProvider>
    </WagmiProvider>
  );
}

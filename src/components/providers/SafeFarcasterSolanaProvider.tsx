import React, { createContext, useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Safely import Farcaster SDK - handle import errors gracefully
let sdk: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const sdkModule = require('@farcaster/miniapp-sdk');
  sdk = sdkModule?.sdk || null;
} catch (error) {
  // SDK not available - this is fine, Solana provider is optional
  sdk = null;
}

const FarcasterSolanaProvider = dynamic(
  () => import('@farcaster/mini-app-solana').then(mod => mod.FarcasterSolanaProvider),
  { 
    ssr: false,
    loading: () => null, // Don't show loading state
  }
);

type SafeFarcasterSolanaProviderProps = {
  endpoint: string;
  children: React.ReactNode;
};

const SolanaProviderContext = createContext<{ hasSolanaProvider: boolean }>({ hasSolanaProvider: false });

export function SafeFarcasterSolanaProvider({ endpoint, children }: SafeFarcasterSolanaProviderProps) {
  const isClient = typeof window !== "undefined";
  const [hasSolanaProvider, setHasSolanaProvider] = useState<boolean>(false);
  const [checked, setChecked] = useState<boolean>(false);

  useEffect(() => {
    if (!isClient) return;
    let cancelled = false;
    (async () => {
      try {
        // Check if SDK is available before using it
        if (!sdk || !sdk.wallet) {
          if (!cancelled) {
            setHasSolanaProvider(false);
            setChecked(true);
          }
          return;
        }
        
        const provider = await sdk.wallet.getSolanaProvider();
        if (!cancelled) {
          setHasSolanaProvider(!!provider);
        }
      } catch (error) {
        // Silently handle errors - Solana provider is optional
        if (!cancelled) {
          setHasSolanaProvider(false);
        }
      } finally {
        if (!cancelled) {
          setChecked(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isClient]);

  useEffect(() => {
    let errorShown = false;
    const origError = console.error;
    console.error = (...args) => {
      if (
        typeof args[0] === "string" &&
        args[0].includes("WalletConnectionError: could not get Solana provider")
      ) {
        if (!errorShown) {
          origError(...args);
          errorShown = true;
        }
        return;
      }
      origError(...args);
    };
    return () => {
      console.error = origError;
    };
  }, []);

  // Always return children - don't block rendering if SDK isn't available
  if (!isClient) {
    return <>{children}</>;
  }

  if (!checked) {
    // Return children immediately while checking - don't block rendering
    return <>{children}</>;
  }

  return (
    <SolanaProviderContext.Provider value={{ hasSolanaProvider }}>
      {hasSolanaProvider ? (
        <FarcasterSolanaProvider endpoint={endpoint}>
          {children}
        </FarcasterSolanaProvider>
      ) : (
        <>{children}</>
      )}
    </SolanaProviderContext.Provider>
  );
}

export function useHasSolanaProvider() {
  return React.useContext(SolanaProviderContext).hasSolanaProvider;
}

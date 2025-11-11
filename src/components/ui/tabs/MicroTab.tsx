"use client";

/**
 * MicroTab component displays a simple page with two buttons for Base and Celo.
 * Each button sends a zero-value native token transaction on the respective chain.
 * 
 * @example
 * ```tsx
 * <MicroTab />
 * ```
 */

import { useState, useEffect } from "react";
import { useAccount, useSendTransaction, useWaitForTransactionReceipt, useSwitchChain } from "wagmi";
import { base, celo } from "wagmi/chains";
import { PAYMENT_RECIPIENT_ADDRESS, SUPPORTED_CHAINS } from "~/lib/constants";

type ChainType = "base" | "celo";

interface TransactionState {
  hash: `0x${string}` | null;
  isPending: boolean;
  isConfirming: boolean;
  isConfirmed: boolean;
  error: Error | null;
}

export function MicroTab() {
  const { address, isConnected, chainId } = useAccount();
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain();
  const { sendTransaction, data: hash, isPending, error } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  const [baseState, setBaseState] = useState<TransactionState>({
    hash: null,
    isPending: false,
    isConfirming: false,
    isConfirmed: false,
    error: null,
  });

  const [celoState, setCeloState] = useState<TransactionState>({
    hash: null,
    isPending: false,
    isConfirming: false,
    isConfirmed: false,
    error: null,
  });

  const [activeChain, setActiveChain] = useState<ChainType | null>(null);

  // Handle transaction hash updates
  useEffect(() => {
    if (hash && activeChain) {
      if (activeChain === "base") {
        setBaseState((prev) => ({ ...prev, hash, isPending: false }));
      } else if (activeChain === "celo") {
        setCeloState((prev) => ({ ...prev, hash, isPending: false }));
      }
    }
  }, [hash, activeChain]);

  // Handle transaction confirmation
  useEffect(() => {
    if (isConfirmed && hash && activeChain) {
      if (activeChain === "base") {
        setBaseState((prev) => ({ ...prev, isConfirming: false, isConfirmed: true }));
        alert(`✅ Base transaction confirmed!\n\nTransaction: ${hash}`);
        setActiveChain(null);
      } else if (activeChain === "celo") {
        setCeloState((prev) => ({ ...prev, isConfirming: false, isConfirmed: true }));
        alert(`✅ Celo transaction confirmed!\n\nTransaction: ${hash}`);
        setActiveChain(null);
      }
    }
  }, [isConfirmed, hash, activeChain]);

  // Handle transaction confirmation status
  useEffect(() => {
    if (isConfirming && activeChain) {
      if (activeChain === "base") {
        setBaseState((prev) => ({ ...prev, isConfirming: true }));
      } else if (activeChain === "celo") {
        setCeloState((prev) => ({ ...prev, isConfirming: true }));
      }
    }
  }, [isConfirming, activeChain]);

  // Handle errors
  useEffect(() => {
    if (error && activeChain) {
      if (activeChain === "base") {
        setBaseState((prev) => ({
          ...prev,
          error: error as Error,
          isPending: false,
        }));
        alert(`❌ Base transaction failed: ${error.message}`);
        setActiveChain(null);
      } else if (activeChain === "celo") {
        setCeloState((prev) => ({
          ...prev,
          error: error as Error,
          isPending: false,
        }));
        alert(`❌ Celo transaction failed: ${error.message}`);
        setActiveChain(null);
      }
    }
  }, [error, activeChain]);

  // Handle pending state
  useEffect(() => {
    if (isPending && activeChain) {
      if (activeChain === "base") {
        setBaseState((prev) => ({ ...prev, isPending: true }));
      } else if (activeChain === "celo") {
        setCeloState((prev) => ({ ...prev, isPending: true }));
      }
    }
  }, [isPending, activeChain]);

  const handleTransaction = async (chainType: ChainType) => {
    if (!isConnected) {
      alert("Please connect your wallet first");
      return;
    }

    setActiveChain(chainType);
    const targetChainId = chainType === "base" ? SUPPORTED_CHAINS.base : SUPPORTED_CHAINS.celo;
    const targetChain = chainType === "base" ? base : celo;

    // Reset state for the selected chain
    if (chainType === "base") {
      setBaseState({
        hash: null,
        isPending: false,
        isConfirming: false,
        isConfirmed: false,
        error: null,
      });
    } else {
      setCeloState({
        hash: null,
        isPending: false,
        isConfirming: false,
        isConfirmed: false,
        error: null,
      });
    }

    try {
      // Switch chain if needed
      if (chainId !== targetChainId) {
        console.log(`Switching chain from ${chainId} to ${targetChainId} (${chainType})`);
        try {
          await switchChain({ chainId: targetChainId });
          
          // Add delay for chain switch to complete
          // Celo may need more time to sync
          const delay = chainType === "celo" ? 2000 : 1000;
          await new Promise((resolve) => setTimeout(resolve, delay));
        } catch (switchError) {
          console.error("Chain switch error:", switchError);
          alert(`Failed to switch to ${chainType}. Please switch manually and try again.`);
          setActiveChain(null);
          return;
        }
      }

      // Send zero-value transaction
      console.log(`Sending zero-value transaction on ${chainType}`);
      sendTransaction({
        to: PAYMENT_RECIPIENT_ADDRESS,
        value: 0n, // Zero value transaction
      });
    } catch (err) {
      console.error("Transaction error:", err);
      alert(`Transaction failed. Please try again.`);
      setActiveChain(null);
    }
  };

  const getButtonState = (chainType: ChainType) => {
    const state = chainType === "base" ? baseState : celoState;
    const isProcessing = state.isPending || state.isConfirming || isSwitchingChain || 
                        (activeChain === chainType && (isPending || isConfirming || isSwitchingChain));
    
    return {
      isProcessing,
      state,
    };
  };

  return (
    <div className="px-6 py-4 max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-center mb-6">Micro Page</h2>

      {/* Connection Status */}
      {!isConnected && (
        <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            ⚠️ Please connect your wallet to send transactions
          </p>
        </div>
      )}

      <div className="space-y-4">
        {/* Base Button */}
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 shadow-md">
          <button
            onClick={() => handleTransaction("base")}
            disabled={!isConnected || getButtonState("base").isProcessing}
            className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-300 ${
              getButtonState("base").isProcessing
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {getButtonState("base").isProcessing ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Processing...
              </span>
            ) : (
              "Base"
            )}
          </button>
          {getButtonState("base").state.hash && (
            <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
              <div>Hash: {getButtonState("base").state.hash}</div>
              <div>
                Status:{" "}
                {getButtonState("base").state.isConfirming
                  ? "Confirming..."
                  : getButtonState("base").state.isConfirmed
                  ? "Confirmed!"
                  : "Pending"}
              </div>
            </div>
          )}
        </div>

        {/* Celo Button */}
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 shadow-md">
          <button
            onClick={() => handleTransaction("celo")}
            disabled={!isConnected || getButtonState("celo").isProcessing}
            className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-300 ${
              getButtonState("celo").isProcessing
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {getButtonState("celo").isProcessing ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Processing...
              </span>
            ) : (
              "Celo"
            )}
          </button>
          {getButtonState("celo").state.hash && (
            <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
              <div>Hash: {getButtonState("celo").state.hash}</div>
              <div>
                Status:{" "}
                {getButtonState("celo").state.isConfirming
                  ? "Confirming..."
                  : getButtonState("celo").state.isConfirmed
                  ? "Confirmed!"
                  : "Pending"}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Info Text */}
      <div className="mt-6 bg-gray-50 dark:bg-gray-900 rounded-lg p-4 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          💳 Zero-value transactions on Base and Celo
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500">
          Each button sends a zero-value native token transaction
        </p>
      </div>
    </div>
  );
}


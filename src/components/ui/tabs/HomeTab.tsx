"use client";

/**
 * HomeTab component displays the Passes page with three types of passes.
 * 
 * This is the default tab that users see when they first open the mini app.
 * It shows three passes: Daily, Weekly, and Monthly with their prices.
 * Includes direct USDC payment via ERC20 transfer using Wagmi.
 * 
 * @example
 * ```tsx
 * <HomeTab />
 * ```
 */

import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useSwitchChain, useSendTransaction } from "wagmi";
import { encodeFunctionData } from "viem";
import { 
  PAYMENT_RECIPIENT_ADDRESS, 
  USDC_ADDRESSES, 
  SUPPORTED_CHAINS,
  PASS_PRICES,
  PASS_DISPLAY_PRICES 
} from "~/lib/constants";

// ERC20 ABI for transfer function
const ERC20_ABI = [
  {
    name: "transfer",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

type ChainKey = keyof typeof SUPPORTED_CHAINS;
type PassType = "daily" | "weekly" | "monthly";

interface PassTicketProps {
  price: string;
  name: string;
  textColor: string;
  isHighlighted?: boolean;
  passId: PassType;
  onBuyClick: (passId: PassType) => void;
  isProcessing?: boolean;
}

function PassTicket({
  price,
  name,
  textColor,
  isHighlighted = false,
  passId,
  onBuyClick,
  isProcessing = false,
}: PassTicketProps) {
  const [dollar, cents] = price.split(".");
  
  // Get the actual color value for the text
  const getColorClass = () => {
    if (textColor === "text-white") return "white";
    if (textColor.includes("gray")) return "#9ca3af";
    if (textColor.includes("orange")) return "#fb923c";
    return "white";
  };
  
  const fillColor = getColorClass();
  
  return (
    <div
      className={`relative bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-4 shadow-md ${
        isHighlighted ? "border-2 border-orange-400" : ""
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        {/* Price Section */}
        <div className="flex items-baseline">
          <span
            className="text-5xl font-bold"
            style={{
              WebkitTextStroke: "2px black",
              WebkitTextFillColor: fillColor,
              color: fillColor,
              textShadow: "none",
            }}
          >
            ${dollar}
          </span>
          <span
            className="text-2xl ml-1 font-bold"
            style={{
              WebkitTextStroke: "1.5px black",
              WebkitTextFillColor: fillColor,
              color: fillColor,
              textShadow: "none",
            }}
          >
            .{cents}
          </span>
        </div>
        
        {/* Divider */}
        <div className="flex-1 mx-4 border-t-2 border-dashed border-gray-400"></div>
        
        {/* Pass Name Section */}
        <div className="flex flex-col items-end">
          <span
            className="text-3xl font-bold uppercase"
            style={{
              WebkitTextStroke: "2px black",
              WebkitTextFillColor: fillColor,
              color: fillColor,
              textShadow: "none",
              lineHeight: "1.1",
            }}
          >
            {name.split(" ")[0]}
          </span>
          <span
            className="text-3xl font-bold uppercase"
            style={{
              WebkitTextStroke: "2px black",
              WebkitTextFillColor: fillColor,
              color: fillColor,
              textShadow: "none",
              lineHeight: "1.1",
            }}
          >
            {name.split(" ")[1]}
          </span>
        </div>
        
        {/* Ticket notch */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-4 h-4 bg-white dark:bg-gray-900 rounded-full border-2 border-gray-300 dark:border-gray-600"></div>
      </div>
      
      {/* Buy Button */}
      <button
        onClick={() => onBuyClick(passId)}
        className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-300 ${
          isProcessing
            ? "bg-gray-400 cursor-not-allowed"
            : isHighlighted
            ? "bg-orange-500 hover:bg-orange-600"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
        disabled={isProcessing}
      >
        {isProcessing ? (
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
          `Buy ${name}`
        )}
      </button>
    </div>
  );
}

// Chain selection modal
interface ChainSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectChain: (chain: ChainKey) => void;
  passType: PassType;
  price: string;
}

function ChainSelectorModal({
  isOpen,
  onClose,
  onSelectChain,
  passType,
  price,
}: ChainSelectorModalProps) {
  if (!isOpen) return null;

  const chains = [
    {
      key: "base" as ChainKey,
      name: "Base",
      icon: "🔵",
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      key: "arbitrum" as ChainKey,
      name: "Arbitrum",
      icon: "🔷",
      color: "bg-indigo-500 hover:bg-indigo-600",
    },
    {
      key: "celo" as ChainKey,
      name: "Celo",
      icon: "💚",
      color: "bg-green-500 hover:bg-green-600",
    },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Select Payment Network
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Pass Info */}
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            You&apos;re purchasing:
          </p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {passType.toUpperCase()} PASS
          </p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            ${price} USDC
          </p>
        </div>

        {/* Chain Options */}
        <div className="space-y-3">
          {chains.map((chain) => (
            <button
              key={chain.key}
              onClick={() => onSelectChain(chain.key)}
              className={`w-full flex items-center justify-between p-4 rounded-lg ${chain.color} text-white transition-all duration-300 shadow-md hover:shadow-lg`}
            >
              <div className="flex items-center">
                <span className="text-3xl mr-3">{chain.icon}</span>
                <div className="text-left">
                  <p className="font-bold text-lg">{chain.name}</p>
                  <p className="text-sm opacity-90">Pay with USDC on {chain.name}</p>
                </div>
              </div>
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          ))}
        </div>

        {/* Info Text */}
        <div className="mt-6 space-y-2">
          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            Payment will be sent to your Farcaster wallet for confirmation
          </p>
          <p className="text-xs text-center text-blue-600 dark:text-blue-400 font-semibold">
            💡 Amount: ${price} USDC will be transferred (encoded in transaction data)
          </p>
        </div>
      </div>
    </div>
  );
}

export function HomeTab() {
  const { address, isConnected, chainId } = useAccount();
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { sendTransaction: sendRawTransaction, data: rawHash, isPending: isRawPending, error: rawError } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash: hash || rawHash });

  const [selectedPass, setSelectedPass] = useState<PassType | null>(null);
  const [showChainModal, setShowChainModal] = useState(false);
  const [processingPass, setProcessingPass] = useState<PassType | null>(null);
  const [hasShownSuccess, setHasShownSuccess] = useState(false);
  const [hasShownError, setHasShownError] = useState(false);
  const [targetChainId, setTargetChainId] = useState<number | null>(null);
  const [pendingTransaction, setPendingTransaction] = useState<{
    chain: ChainKey;
    usdcAddress: `0x${string}`;
    amount: string;
    displayPrice: string;
  } | null>(null);

  // Handle transaction confirmation
  useEffect(() => {
    const txHash = hash || rawHash;
    if (isConfirmed && processingPass && txHash && !hasShownSuccess) {
      console.log("Payment confirmed!", { hash: txHash, pass: processingPass });
      alert(`✅ ${processingPass.toUpperCase()} PASS ACTIVATED!\n\nTransaction: ${txHash}`);
      setProcessingPass(null);
      setSelectedPass(null);
      setHasShownSuccess(true);
    }
  }, [isConfirmed, processingPass, hash, rawHash, hasShownSuccess]);

  // Handle errors
  useEffect(() => {
    const txError = error || rawError;
    if (txError && processingPass && !hasShownError) {
      console.error("Transaction error:", txError);
      alert(`❌ Payment failed: ${txError.message}`);
      setProcessingPass(null);
      setTargetChainId(null);
      setPendingTransaction(null);
      setHasShownError(true);
    }
  }, [error, rawError, processingPass, hasShownError]);

  // Reset success/error flags when starting new transaction
  useEffect(() => {
    if (!hash && !rawHash) {
      setHasShownSuccess(false);
      setHasShownError(false);
    }
  }, [hash, rawHash]);

  // Execute transaction after chain switch completes
  useEffect(() => {
    if (
      pendingTransaction &&
      targetChainId &&
      chainId === targetChainId &&
      !isPending &&
      !isRawPending &&
      !hash &&
      !rawHash &&
      !isSwitchingChain
    ) {
      console.log("Chain switch confirmed, executing transaction:", pendingTransaction);
      
      // Encode the transaction data
      const encodedData = encodeFunctionData({
        abi: ERC20_ABI,
        functionName: "transfer",
        args: [PAYMENT_RECIPIENT_ADDRESS, BigInt(pendingTransaction.amount)],
      });
      
      // Use sendTransaction with encoded data - this might show amount better in some wallets
      sendRawTransaction({
        to: pendingTransaction.usdcAddress,
        data: encodedData,
        // Note: value is 0 because we're transferring ERC20, not native token
        // The amount is encoded in the data field
      });
      
      // Clear pending transaction
      setPendingTransaction(null);
    }
  }, [chainId, targetChainId, pendingTransaction, isPending, isRawPending, hash, rawHash, isSwitchingChain, sendRawTransaction]);

  const handleBuyClick = (passId: PassType) => {
    if (!isConnected) {
      alert("Please connect your Farcaster wallet first");
      return;
    }

    setSelectedPass(passId);
    setShowChainModal(true);
  };

  const handleChainSelect = async (chain: ChainKey) => {
    if (!selectedPass || !address) return;

    setShowChainModal(false);
    setProcessingPass(selectedPass);

    try {
      // Get USDC contract address for selected chain
      const usdcAddress = USDC_ADDRESSES[chain];
      const amount = PASS_PRICES[selectedPass];
      const targetChain = SUPPORTED_CHAINS[chain];
      setTargetChainId(targetChain);

      const displayPrice = PASS_DISPLAY_PRICES[selectedPass];

      console.log("Initiating payment:", {
        pass: selectedPass,
        chain,
        usdcAddress,
        amount,
        displayPrice,
        recipient: PAYMENT_RECIPIENT_ADDRESS,
        targetChainId: targetChain,
        currentChainId: chainId,
      });

      // Switch chain if needed - useEffect will execute transaction after switch
      if (chainId !== targetChain) {
        console.log(`Switching chain from ${chainId} to ${targetChain}`);
        try {
          // Store transaction details to execute after chain switch
          setPendingTransaction({
            chain,
            usdcAddress,
            amount,
            displayPrice,
          });
          
          // Switch chain - useEffect will handle transaction execution
          await switchChain({ chainId: targetChain });
        } catch (switchError) {
          console.error("Chain switch error:", switchError);
          alert("Failed to switch chain. Please switch manually and try again.");
          setProcessingPass(null);
          setTargetChainId(null);
          setPendingTransaction(null);
          return;
        }
      } else {
        // Already on correct chain - execute transaction immediately
        console.log("Already on correct chain, executing transaction immediately");
        
        // Encode the transaction data
        const encodedData = encodeFunctionData({
          abi: ERC20_ABI,
          functionName: "transfer",
          args: [PAYMENT_RECIPIENT_ADDRESS, BigInt(amount)],
        });

        console.log("Executing USDC transfer:", {
          to: usdcAddress,
          data: encodedData,
          amount: displayPrice,
          chain: chain.toUpperCase(),
        });

        // Use sendTransaction with encoded data - this might show amount better in some wallets
        // The amount is encoded in the data field as part of the ERC20 transfer function call
        sendRawTransaction({
          to: usdcAddress,
          data: encodedData,
          // Note: value is 0 because we're transferring ERC20 token, not native ETH
          // The USDC amount is encoded in the data field
        });
      }
    } catch (err) {
      console.error("Payment error:", err);
      alert("Payment failed. Please try again.");
      setProcessingPass(null);
      setTargetChainId(null);
    }
  };

  const isProcessing = isPending || isRawPending || isConfirming || processingPass !== null;

  return (
    <div className="px-6 py-4 max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-center mb-6">Passes</h2>

      {/* Connection Status */}
      {!isConnected && (
        <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            ⚠️ Please connect your Farcaster wallet to purchase passes
          </p>
        </div>
      )}

      <div className="space-y-4">
        {/* Daily Pass */}
        <PassTicket
          price={PASS_DISPLAY_PRICES.daily}
          name="DAILY PASS"
          textColor="text-white"
          passId="daily"
          onBuyClick={handleBuyClick}
          isProcessing={processingPass === "daily" && isProcessing}
        />

        {/* Weekly Pass */}
        <PassTicket
          price={PASS_DISPLAY_PRICES.weekly}
          name="WEEKLY PASS"
          textColor="text-gray-500 dark:text-gray-400"
          passId="weekly"
          onBuyClick={handleBuyClick}
          isProcessing={processingPass === "weekly" && isProcessing}
        />

        {/* Monthly Pass - Highlighted */}
        <PassTicket
          price={PASS_DISPLAY_PRICES.monthly}
          name="MONTHLY PASS"
          textColor="text-orange-400"
          isHighlighted={true}
          passId="monthly"
          onBuyClick={handleBuyClick}
          isProcessing={processingPass === "monthly" && isProcessing}
        />
      </div>

      {/* Network Information */}
      <div className="mt-6 bg-gray-50 dark:bg-gray-900 rounded-lg p-4 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          💳 Pay with USDC from Base, Arbitrum, or Celo
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500">
          Choose your preferred network when purchasing
        </p>
      </div>

      {/* Chain Selector Modal */}
      {selectedPass && (
        <ChainSelectorModal
          isOpen={showChainModal}
          onClose={() => {
            setShowChainModal(false);
            setSelectedPass(null);
          }}
          onSelectChain={handleChainSelect}
          passType={selectedPass}
          price={PASS_DISPLAY_PRICES[selectedPass]}
        />
      )}
    </div>
  );
}

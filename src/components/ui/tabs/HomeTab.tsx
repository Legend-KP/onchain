"use client";

/**
 * HomeTab component displays the Passes page with three types of passes.
 * 
 * This is the default tab that users see when they first open the mini app.
 * It shows three passes: Daily, Weekly, and Monthly with their prices.
 * Includes Daimo Pay integration for payment processing.
 * 
 * @example
 * ```tsx
 * <HomeTab />
 * ```
 */

import { useState } from "react";
import { DaimoPayButton } from "@daimo/pay";
import { baseUSDC, arbitrumUSDC, celoUSDC } from "@daimo/pay-common";
import { getAddress } from "viem";
import { 
  DAIMO_APP_ID, 
  DAIMO_RECIPIENT_ADDRESS, 
  DAIMO_REFUND_ADDRESS 
} from "~/lib/constants";

interface PassProps {
  price: string;
  name: string;
  textColor: string;
  isHighlighted?: boolean;
  passId: string;
  onPaymentStarted?: (passId: string, event: any) => void;
  onPaymentCompleted?: (passId: string, event: any) => void;
  onPaymentBounced?: (passId: string, event: any) => void;
  isProcessing?: boolean;
}

function PassTicket({ 
  price, 
  name, 
  textColor, 
  isHighlighted = false,
  passId,
  onPaymentStarted,
  onPaymentCompleted,
  onPaymentBounced,
  isProcessing = false
}: PassProps) {
  const [dollar, cents] = price.split(".");
  
  // Get the actual color value for the text
  const getColorClass = () => {
    if (textColor === "text-white") return "white";
    if (textColor.includes("gray")) return "#9ca3af";
    if (textColor.includes("orange")) return "#fb923c";
    return "white";
  };
  
  const fillColor = getColorClass();
  
  // Check if addresses are configured and valid
  const hasValidAddresses = DAIMO_RECIPIENT_ADDRESS && DAIMO_REFUND_ADDRESS && 
    DAIMO_RECIPIENT_ADDRESS.startsWith('0x') && DAIMO_REFUND_ADDRESS.startsWith('0x');
  
  // Get validated addresses (only if configured)
  let recipientAddress: `0x${string}` | undefined;
  let refundAddress: `0x${string}` | undefined;
  
  if (hasValidAddresses) {
    try {
      recipientAddress = getAddress(DAIMO_RECIPIENT_ADDRESS);
      refundAddress = getAddress(DAIMO_REFUND_ADDRESS);
    } catch (error) {
      console.error('Invalid address format:', error);
      recipientAddress = undefined;
      refundAddress = undefined;
    }
  }
  
  const isConfigured = recipientAddress && refundAddress;
  
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
              WebkitTextStroke: '2px black',
              WebkitTextFillColor: fillColor,
              color: fillColor,
              textShadow: 'none'
            }}
          >
            ${dollar}
          </span>
          <span 
            className="text-2xl ml-1 font-bold"
            style={{ 
              WebkitTextStroke: '1.5px black',
              WebkitTextFillColor: fillColor,
              color: fillColor,
              textShadow: 'none'
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
              WebkitTextStroke: '2px black',
              WebkitTextFillColor: fillColor,
              color: fillColor,
              textShadow: 'none',
              lineHeight: '1.1'
            }}
          >
            {name.split(" ")[0]}
          </span>
          <span 
            className="text-3xl font-bold uppercase"
            style={{ 
              WebkitTextStroke: '2px black',
              WebkitTextFillColor: fillColor,
              color: fillColor,
              textShadow: 'none',
              lineHeight: '1.1'
            }}
          >
            {name.split(" ")[1]}
          </span>
        </div>
        
        {/* Ticket notch */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-4 h-4 bg-white dark:bg-gray-900 rounded-full border-2 border-gray-300 dark:border-gray-600"></div>
      </div>
      
      {/* Payment Button */}
      {isConfigured && recipientAddress && refundAddress ? (
        <DaimoPayButton.Custom
          appId={DAIMO_APP_ID}
          intent="Purchase"
          toChain={baseUSDC.chainId}
          toToken={getAddress(baseUSDC.token)}
          toAddress={recipientAddress}
          toUnits={price}
          refundAddress={refundAddress}
          preferredChains={[
            baseUSDC.chainId,
            arbitrumUSDC.chainId,
            celoUSDC.chainId
          ]}
          preferredTokens={[
            { chain: baseUSDC.chainId, address: getAddress(baseUSDC.token) },
            { chain: arbitrumUSDC.chainId, address: getAddress(arbitrumUSDC.token) },
            { chain: celoUSDC.chainId, address: getAddress(celoUSDC.token) }
          ]}
          metadata={{
            passType: passId,
            price: price,
            name: name
          }}
          onPaymentStarted={(e) => onPaymentStarted?.(passId, e)}
          onPaymentCompleted={(e) => onPaymentCompleted?.(passId, e)}
          onPaymentBounced={(e) => onPaymentBounced?.(passId, e)}
        >
          {({ show, hide }) => (
            <button 
              onClick={show}
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
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </span>
              ) : (
                `Buy ${name}`
              )}
            </button>
          )}
        </DaimoPayButton.Custom>
      ) : (
        <div className="w-full py-3 px-4 rounded-lg bg-yellow-500 text-white text-center text-sm font-semibold">
          ⚠️ Please configure DAIMO_RECIPIENT_ADDRESS and DAIMO_REFUND_ADDRESS
        </div>
      )}
    </div>
  );
}

export function HomeTab() {
  const [processingPass, setProcessingPass] = useState<string | null>(null);

  const handlePaymentStarted = (passId: string, event: any) => {
    console.log(`Payment started for ${passId}:`, event);
    setProcessingPass(passId);
    // You can add toast notifications or other UI feedback here
  };

  const handlePaymentCompleted = (passId: string, event: any) => {
    console.log(`Payment completed for ${passId}:`, event);
    setProcessingPass(null);
    
    // TODO: Call your backend API to activate the pass
    // Example: activatePass(passId, event.paymentId, event.chainId);
    
    // Show success message (you can replace with a toast notification)
    alert(`✅ ${passId.toUpperCase()} PASS ACTIVATED!\n\nPayment ID: ${event.paymentId}`);
  };

  const handlePaymentBounced = (passId: string, event: any) => {
    console.error(`Payment bounced for ${passId}:`, event);
    setProcessingPass(null);
    alert("❌ Payment failed. Your funds will be refunded automatically.");
  };

  return (
    <div className="px-6 py-4 max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-center mb-6">Passes</h2>
      
      <div className="space-y-4">
        {/* Daily Pass */}
        <PassTicket
          price="1.00"
          name="DAILY PASS"
          textColor="text-white"
          passId="daily"
          onPaymentStarted={handlePaymentStarted}
          onPaymentCompleted={handlePaymentCompleted}
          onPaymentBounced={handlePaymentBounced}
          isProcessing={processingPass === "daily"}
        />
        
        {/* Weekly Pass */}
        <PassTicket
          price="3.00"
          name="WEEKLY PASS"
          textColor="text-gray-500 dark:text-gray-400"
          passId="weekly"
          onPaymentStarted={handlePaymentStarted}
          onPaymentCompleted={handlePaymentCompleted}
          onPaymentBounced={handlePaymentBounced}
          isProcessing={processingPass === "weekly"}
        />
        
        {/* Monthly Pass - Highlighted */}
        <PassTicket
          price="9.00"
          name="MONTHLY PASS"
          textColor="text-orange-400"
          isHighlighted={true}
          passId="monthly"
          onPaymentStarted={handlePaymentStarted}
          onPaymentCompleted={handlePaymentCompleted}
          onPaymentBounced={handlePaymentBounced}
          isProcessing={processingPass === "monthly"}
        />
      </div>
      
      {/* Network Information */}
      <div className="mt-6 bg-gray-50 dark:bg-gray-900 rounded-lg p-4 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          💳 Pay with USDC from Base, Arbitrum, or Celo
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500">
          All payments settle in USDC on Base
        </p>
      </div>
    </div>
  );
} 
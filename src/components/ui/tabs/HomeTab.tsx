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

import { useState, useRef } from "react";
import { DaimoPayButton } from "@daimo/pay";
import { baseUSDC, arbitrumUSDC, celoUSDC } from "@daimo/pay-common";
import { getAddress } from "viem";
import { X } from "lucide-react";
import { 
  DAIMO_APP_ID, 
  DAIMO_RECIPIENT_ADDRESS, 
  DAIMO_REFUND_ADDRESS 
} from "~/lib/constants";

// Token configurations for custom selection
const PAYMENT_TOKENS = [
  {
    name: 'USDC on Base',
    chain: 8453,
    address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    icon: '🔵',
    color: 'bg-blue-500 hover:bg-blue-600',
    usdc: baseUSDC
  },
  {
    name: 'USDC on Arbitrum',
    chain: 42161,
    address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
    icon: '🔷',
    color: 'bg-indigo-500 hover:bg-indigo-600',
    usdc: arbitrumUSDC
  },
  {
    name: 'USDC on Celo',
    chain: 42220,
    address: '0xcebA9300f2b948710d2653dD7B07f33A8B32118C',
    icon: '💚',
    color: 'bg-green-500 hover:bg-green-600',
    usdc: celoUSDC
  }
];

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
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [selectedTokenIndex, setSelectedTokenIndex] = useState<number | null>(null);
  
  // Refs to store Daimo Pay show functions for each token
  const daimoShowFunctions = useRef<{ [key: number]: () => void }>({});
  
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
  
  // Ensure price is properly formatted for Daimo Pay (must be a precise decimal string with 2 decimals)
  const formattedPrice = parseFloat(price).toFixed(2);
  
  // Handle token selection - opens Daimo Pay with that specific token
  const handleTokenSelect = (tokenIndex: number) => {
    setSelectedTokenIndex(tokenIndex);
    setShowTokenModal(false); // Close custom modal
    
    // Trigger the corresponding Daimo Pay modal
    const showFunction = daimoShowFunctions.current[tokenIndex];
    if (showFunction) {
      showFunction();
    }
  };
  
  // Hide non-Farcaster wallets when Daimo modal opens
  const hideNonFarcasterWallets = () => {
    const allButtons = document.querySelectorAll('button, [role="button"], a[role="button"]');
    
    allButtons.forEach((element) => {
      const text = (element.textContent || '').toLowerCase();
      const innerHTML = (element.innerHTML || '').toLowerCase();
      
      const isNonFarcasterWallet = 
        text.includes('pay with another wallet') ||
        text.includes('metamask') ||
        text.includes('coinbase') ||
        text.includes('walletconnect') ||
        text.includes('rainbow') ||
        text.includes('trust wallet') ||
        text.includes('ledger') ||
        text.includes('trezor') ||
        innerHTML.includes('metamask') ||
        innerHTML.includes('coinbase') ||
        element.querySelector('img[alt*="MetaMask" i]') ||
        element.querySelector('img[alt*="Coinbase" i]') ||
        element.querySelector('svg[aria-label*="MetaMask" i]') ||
        element.querySelector('svg[aria-label*="Coinbase" i]') ||
        (element.querySelector('img[alt*="wallet" i]') && !text.includes('farcaster'));
      
      if (isNonFarcasterWallet) {
        (element as HTMLElement).style.display = 'none';
        (element as HTMLElement).style.visibility = 'hidden';
        (element as HTMLElement).style.opacity = '0';
        (element as HTMLElement).style.height = '0';
        (element as HTMLElement).style.padding = '0';
        (element as HTMLElement).style.margin = '0';
      }
    });
    
    // Hide "or" separators
    const separators = document.querySelectorAll('div, span, p');
    separators.forEach((el) => {
      const text = (el.textContent || '').trim().toLowerCase();
      if (text === 'or' || text === 'or pay with') {
        const nextSibling = el.nextElementSibling;
        if (nextSibling && (nextSibling.textContent?.toLowerCase().includes('wallet') || 
            nextSibling.querySelector('button'))) {
          (el as HTMLElement).style.display = 'none';
        }
      }
    });
  };
  
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
      
      {/* Payment Button - Opens Custom Token Selection Modal */}
      {isConfigured && recipientAddress && refundAddress ? (
        <>
          {/* Trigger Button - Opens Custom Token Modal */}
          <button 
            onClick={() => setShowTokenModal(true)}
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
          
          {/* Custom Token Selection Modal */}
          {showTokenModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Purchase {name}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Select your payment token</p>
                  </div>
                  <button
                    onClick={() => setShowTokenModal(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>
                
                {/* Amount Display */}
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">${price}</span>
                    {recipientAddress && (
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {recipientAddress.slice(0, 6)}...{recipientAddress.slice(-4)}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Token Selection Buttons */}
                <div className="p-6 space-y-3">
                  {PAYMENT_TOKENS.map((token, index) => (
                    <button
                      key={index}
                      onClick={() => handleTokenSelect(index)}
                      className={`w-full ${token.color} text-white rounded-xl p-4 transition-all transform hover:scale-105 shadow-md hover:shadow-lg`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{token.icon}</span>
                          <div className="text-left">
                            <div className="font-semibold text-lg">Pay with {token.name}</div>
                            <div className="text-sm opacity-90">{formattedPrice} USDC</div>
                          </div>
                        </div>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </button>
                  ))}
                </div>
                
                {/* Info Footer */}
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 rounded-b-2xl">
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    Payments are processed securely via Daimo Pay
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Three Separate Daimo Pay Instances - One per Token */}
          {PAYMENT_TOKENS.map((token, index) => (
            <DaimoPayButton.Custom
              key={`daimo-${passId}-${token.chain}`}
              appId={DAIMO_APP_ID}
              intent={`Purchase ${name} with ${token.name}`}
              toChain={baseUSDC.chainId} // Always settles on Base
              toToken={getAddress(baseUSDC.token)} // USDC on Base
              toAddress={recipientAddress!}
              toUnits={formattedPrice}
              refundAddress={refundAddress!}
              
              // CRITICAL: Only show this specific token (enforces strict order)
              preferredTokens={[
                { chain: token.chain, address: token.address } // Only this token
              ]}
              
              preferredChains={[
                token.usdc.chainId // Only this chain
              ]}
              
              paymentOptions={[]} // Hide exchanges
              
              metadata={{
                passType: passId,
                price: formattedPrice,
                name: name,
                selectedToken: token.name
              }}
              
              onPaymentStarted={(e) => {
                console.log(`[Payment Started] Pass: ${passId}, Token: ${token.name}, Event:`, e);
                onPaymentStarted?.(passId, e);
              }}
              onPaymentCompleted={(e) => {
                console.log(`[Payment Completed] Pass: ${passId}, Token: ${token.name}, Event:`, e);
                onPaymentCompleted?.(passId, e);
              }}
              onPaymentBounced={(e) => {
                console.error(`[Payment Bounced] Pass: ${passId}, Token: ${token.name}, Event:`, e);
                onPaymentBounced?.(passId, e);
              }}
              onOpen={() => {
                console.log(`[Daimo Pay Opened] Pass: ${passId}, Token: ${token.name}`);
                // Hide non-Farcaster wallets
                setTimeout(hideNonFarcasterWallets, 100);
                setTimeout(hideNonFarcasterWallets, 300);
                setTimeout(hideNonFarcasterWallets, 500);
                
                // MutationObserver for dynamic content
                const observer = new MutationObserver(() => {
                  hideNonFarcasterWallets();
                });
                observer.observe(document.body, {
                  childList: true,
                  subtree: true,
                  attributes: false,
                });
                setTimeout(() => observer.disconnect(), 10000);
              }}
              onClose={() => {
                console.log(`[Daimo Pay Closed] Pass: ${passId}, Token: ${token.name}`);
                setSelectedTokenIndex(null);
              }}
            >
              {({ show, hide }) => {
                // Store the show function for this token
                daimoShowFunctions.current[index] = show;
                return null; // Hidden - triggered programmatically
              }}
            </DaimoPayButton.Custom>
          ))}
        </>
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

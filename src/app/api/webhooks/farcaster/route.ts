import { NextRequest, NextResponse } from "next/server";
import { 
  PAYMENT_RECIPIENT_ADDRESS, 
  USDC_ADDRESSES, 
  PASS_PRICES 
} from "~/lib/constants";

/**
 * Webhook endpoint for Farcaster transaction events.
 * 
 * This endpoint receives webhook events from Farcaster when transactions
 * are detected. It handles:
 * - transaction: USDC transfer to payment recipient
 * 
 * @param req - Next.js request object containing the webhook event
 * @returns NextResponse with status 200 on success, 500 on error
 */
export async function POST(req: NextRequest) {
  try {
    const event = await req.json();
    
    console.log("Farcaster webhook received:", event);
    
    // Check if it's a transaction event
    if (event.type === "transaction" && event.data) {
      const { hash, chainId, to, value, from } = event.data;
      
      // Check if transaction is to our payment recipient
      const isPaymentTransaction = 
        to?.toLowerCase() === PAYMENT_RECIPIENT_ADDRESS.toLowerCase();
      
      // Check if transaction is to one of our USDC contracts
      const usdcAddresses = Object.values(USDC_ADDRESSES).map(addr => addr.toLowerCase());
      const isUSDCTransfer = usdcAddresses.includes(to?.toLowerCase());
      
      if (isPaymentTransaction || isUSDCTransfer) {
        console.log("USDC transfer detected:", {
          hash,
          chainId,
          from,
          to,
          value
        });
        
        // Determine which pass was purchased based on amount
        let passType: string | null = null;
        const amount = BigInt(value || "0").toString();
        
        if (amount === PASS_PRICES.daily) passType = "daily";
        else if (amount === PASS_PRICES.weekly) passType = "weekly";
        else if (amount === PASS_PRICES.monthly) passType = "monthly";
        
        if (passType) {
          console.log(`✅ ${passType.toUpperCase()} PASS purchased by ${from}`);
          console.log(`   Transaction: ${hash}`);
          console.log(`   Chain: ${chainId}`);
          console.log(`   Amount: ${amount} (${parseInt(amount) / 1000000} USDC)`);
          
          // TODO: Activate pass in your database
          // await activatePass(from, passType, hash, chainId);
          
          // TODO: Send confirmation notification
          // await sendConfirmationNotification(from, passType);
        } else {
          console.log("⚠️ Payment detected but amount doesn't match any pass price:", amount);
        }
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * Helper function to activate a pass (placeholder for your implementation)
 */
async function _activatePass(
  userAddress: string,
  passType: string,
  transactionHash: string,
  chainId: number
) {
  // TODO: Implement your pass activation logic
  // Example:
  // await db.passes.create({
  //   userAddress,
  //   passType,
  //   transactionHash,
  //   chainId,
  //   activatedAt: new Date(),
  //   expiresAt: calculateExpiry(passType)
  // });
}

/**
 * Helper function to calculate expiry based on pass type
 */
function _calculateExpiry(passType: string): Date {
  const now = new Date();
  switch (passType) {
    case 'daily':
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    case 'weekly':
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    case 'monthly':
      return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    default:
      return now;
  }
}


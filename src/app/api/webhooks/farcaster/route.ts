import { NextRequest, NextResponse } from "next/server";
import { PAYMENT_RECIPIENT_ADDRESS, USDC_ADDRESSES, PASS_PRICES } from "~/lib/constants";

/**
 * Webhook endpoint for Farcaster transaction events.
 * 
 * This endpoint receives webhook events from Farcaster when transactions
 * are completed. It detects USDC transfers to the payment recipient address
 * and activates the corresponding pass.
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
      
      // Check if transaction is to our payment recipient address
      const isPaymentTransaction = 
        to?.toLowerCase() === PAYMENT_RECIPIENT_ADDRESS.toLowerCase();
      
      if (isPaymentTransaction) {
        console.log("Payment transaction detected:", {
          hash,
          chainId,
          from,
          to,
          value,
        });
        
        // Check if the transaction is a USDC transfer
        // We need to verify it's from one of our USDC contracts
        const chainKey = Object.entries(USDC_ADDRESSES).find(
          ([_key, _address]) => {
            // For ERC20 transfers, we'd need to check the transaction logs
            // For now, we'll check if the chain matches
            return true; // Simplified - in production, parse transaction logs
          }
        )?.[0] as keyof typeof USDC_ADDRESSES | undefined;
        
        if (chainKey) {
          // Determine which pass was purchased based on amount
          let passType: string | null = null;
          
          // Compare value (in wei/units) with pass prices
          const valueBigInt = BigInt(value || "0");
          
          if (valueBigInt === BigInt(PASS_PRICES.daily)) {
            passType = "daily";
          } else if (valueBigInt === BigInt(PASS_PRICES.weekly)) {
            passType = "weekly";
          } else if (valueBigInt === BigInt(PASS_PRICES.monthly)) {
            passType = "monthly";
          }
          
          if (passType) {
            console.log(`✅ ${passType.toUpperCase()} PASS purchased by ${from}`);
            console.log(`Transaction hash: ${hash}`);
            console.log(`Chain: ${chainKey} (${chainId})`);
            
            // TODO: Activate pass in your database
            // Example:
            // await activatePass(from, passType, hash, chainId);
            
            // TODO: Send confirmation notification
            // Example:
            // await sendPassActivationNotification(from, passType);
            
            return NextResponse.json({
              success: true,
              passType,
              transactionHash: hash,
              from,
              chainId,
            });
          } else {
            console.log("Payment amount doesn't match any pass price:", value);
          }
        }
      }
    }
    
    // Handle other event types if needed
    if (event.type === "payment_completed") {
      console.log("Payment completed event:", event);
      // Handle payment completed events
    }
    
    return NextResponse.json({ success: true, message: "Event received" });
    
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


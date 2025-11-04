import { NextRequest, NextResponse } from 'next/server';
import { DAIMO_WEBHOOK_TOKEN } from '~/lib/constants';

// Only allow payments from these chains (Base, Arbitrum, Celo)
const ALLOWED_CHAINS = [8453, 42161, 42220];

/**
 * Webhook endpoint for Daimo Pay payment events.
 * 
 * This endpoint receives webhook events from Daimo Pay when payments
 * are started, completed, bounced, or refunded. It handles:
 * - payment_started: User initiated payment
 * - payment_completed: Payment successfully completed
 * - payment_bounced: Contract call reverted, refund issued
 * - payment_refunded: Payment was refunded
 * 
 * @param req - Next.js request object containing the webhook event
 * @returns NextResponse with status 200 on success, 401 on unauthorized, 500 on error
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Verify webhook authenticity
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.includes(DAIMO_WEBHOOK_TOKEN)) {
      console.error('Unauthorized webhook request');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse the webhook event
    const event = await req.json();
    console.log('Received webhook event:', event.type);

    // 3. Check for test events
    if (event.isTestEvent) {
      console.log('Test event received:', event);
      return NextResponse.json({ status: 'test event received' });
    }

    // 4. Handle different event types
    switch (event.type) {
      case 'payment_started':
        await handlePaymentStarted(event);
        break;
      
      case 'payment_completed':
        await handlePaymentCompleted(event);
        break;
      
      case 'payment_bounced':
        await handlePaymentBounced(event);
        break;
      
      case 'payment_refunded':
        await handlePaymentRefunded(event);
        break;
      
      default:
        console.log('Unknown event type:', event.type);
    }

    return NextResponse.json({ status: 'success' });
    
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Handle payment_started event.
 * Triggered when a user makes a valid payment.
 */
async function handlePaymentStarted(event: any) {
  const { paymentId, payment } = event;
  const sourceChain = parseInt(payment.source.chainId);
  
  console.log(`Payment started: ${paymentId} from chain ${sourceChain}`);
  
  // Validate chain
  if (!ALLOWED_CHAINS.includes(sourceChain)) {
    console.warn(`⚠️ Payment from unauthorized chain: ${sourceChain}`);
    // You could send a notification to admin here
  }
  
  // TODO: Store in database
  // await db.payments.create({
  //   id: paymentId,
  //   status: 'started',
  //   chainId: sourceChain,
  //   passType: payment.metadata?.passType,
  //   amount: payment.source.amountUnits,
  //   timestamp: new Date()
  // })
}

/**
 * Handle payment_completed event.
 * Triggered when payment recipient has successfully received the payment.
 */
async function handlePaymentCompleted(event: any) {
  const { paymentId, payment } = event;
  const { passType, price } = payment.metadata || {};
  
  console.log(`✅ Payment completed: ${paymentId}`);
  console.log(`   Pass: ${passType}`);
  console.log(`   Amount: ${price} USDC`);
  
  // TODO: Activate the pass in your database
  // await db.passes.create({
  //   paymentId,
  //   passType,
  //   activatedAt: new Date(),
  //   expiresAt: calculateExpiry(passType),
  //   userId: getUserFromMetadata(payment.metadata)
  // })
  
  // TODO: Send confirmation email
  // await sendConfirmationEmail(payment.metadata?.email, passType)
}

/**
 * Handle payment_bounced event.
 * Triggered if a contract call on the destination chain reverts.
 */
async function handlePaymentBounced(event: any) {
  const { paymentId } = event;
  
  console.error(`❌ Payment bounced: ${paymentId}`);
  
  // TODO: Update payment status
  // await db.payments.update({
  //   where: { id: paymentId },
  //   data: { status: 'bounced' }
  // })
  
  // TODO: Notify user about refund
  // await sendRefundNotification(payment.metadata?.email)
}

/**
 * Handle payment_refunded event.
 * Triggered when a payment is refunded.
 */
async function handlePaymentRefunded(event: any) {
  const { paymentId, refundAddress, amountUnits } = event;
  
  console.log(`💸 Payment refunded: ${paymentId}`);
  console.log(`   To: ${refundAddress}`);
  console.log(`   Amount: ${amountUnits}`);
  
  // TODO: Update records
  // await db.payments.update({
  //   where: { id: paymentId },
  //   data: { status: 'refunded', refundedAt: new Date() }
  // })
}

/**
 * Helper to calculate expiry based on pass type.
 * @param passType - The type of pass (daily, weekly, monthly)
 * @returns Date when the pass expires
 */
function calculateExpiry(passType: string): Date {
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


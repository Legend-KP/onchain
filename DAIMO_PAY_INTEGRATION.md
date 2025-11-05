# Daimo Pay Integration Guide

## 📋 Overview

Daimo Pay is a payment infrastructure that enables users to pay with USDC from multiple chains (Base, Arbitrum, Celo) and automatically settles all payments to Base. It's integrated into this Farcaster mini app to handle pass purchases.

## 📦 Packages Installed

```json
{
  "@daimo/pay": "^1.18.3",
  "@daimo/pay-common": "^1.18.3"
}
```

## 🔧 Configuration

### Environment Variables

Set these in your `.env.local` file:

```bash
# Daimo Pay App ID (get from Daimo team)
NEXT_PUBLIC_DAIMO_APP_ID=pay-trenchy-FGhJgP9hwghGh9bLxVzawb

# Recipient address (where payments are sent)
NEXT_PUBLIC_DAIMO_RECIPIENT_ADDRESS=0xYourWalletAddress

# Refund address (for failed payments)
NEXT_PUBLIC_DAIMO_REFUND_ADDRESS=0xYourWalletAddress

# Webhook secret (for server-side webhooks)
DAIMO_WEBHOOK_TOKEN=your-webhook-secret-token
```

### Constants (src/lib/constants.ts)

```typescript
export const DAIMO_APP_ID: string = process.env.NEXT_PUBLIC_DAIMO_APP_ID || "pay-trenchy-FGhJgP9hwghGh9bLxVzawb";
export const DAIMO_RECIPIENT_ADDRESS: string = process.env.NEXT_PUBLIC_DAIMO_RECIPIENT_ADDRESS || "";
export const DAIMO_REFUND_ADDRESS: string = process.env.NEXT_PUBLIC_DAIMO_REFUND_ADDRESS || "";
export const DAIMO_WEBHOOK_TOKEN: string = process.env.DAIMO_WEBHOOK_TOKEN || "";
```

## 🏗️ Architecture

### Provider Setup (src/app/providers.tsx)

```typescript
<WagmiProvider>
  <MiniAppProvider>
    <SafeFarcasterSolanaProvider>
      <DaimoPayProvider mode="auto" theme="auto">
        {children}
      </DaimoPayProvider>
    </SafeFarcasterSolanaProvider>
  </MiniAppProvider>
</WagmiProvider>
```

**DaimoPayProvider Props:**
- `mode="auto"` - Automatically detects light/dark theme
- `theme="auto"` - Matches system theme preference

### Wagmi Configuration (src/components/providers/WagmiProvider.tsx)

```typescript
// Uses Daimo's getDefaultConfig to configure all required chains
const daimoConfig = getDefaultConfig({
  appName: APP_NAME,
  appIcon: APP_ICON_URL,
  appUrl: APP_URL,
});

// Merges with Farcaster connector (prioritized first)
export const config = createConfig({
  ...daimoConfig,
  connectors: [
    farcasterFrame(), // Farcaster wallet (primary)
    ...(daimoConfig.connectors || []), // Daimo's default connectors
  ],
});
```

**Supported Chains (via Daimo):**
- Arbitrum One (42161)
- Base (8453)
- BNB Smart Chain
- Celo (42220)
- Linea Mainnet
- Ethereum (1)
- Polygon
- OP Mainnet
- Scroll
- World Chain

## 💳 Payment Button Implementation

### Basic Usage (src/components/ui/tabs/HomeTab.tsx)

```typescript
<DaimoPayButton.Custom
  appId={DAIMO_APP_ID}
  intent={`Purchase ${name}`}
  toChain={baseUSDC.chainId}  // Base (8453)
  toToken={getAddress(baseUSDC.token)}  // USDC on Base
  toAddress={recipientAddress}
  toUnits={formattedPrice}  // e.g., "1.00"
  refundAddress={refundAddress}
  
  // Token prioritization (from Daimo team)
  preferredTokens={[
    { chain: 8453, address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" },    // USDC on Base
    { chain: 42161, address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831" },  // USDC on Arbitrum
    { chain: 42220, address: "0xcebA9300f2b948710d2653dD7B07f33A8B32118C" }   // USDC on Celo
  ]}
  
  preferredChains={[
    baseUSDC.chainId,      // 8453 - Base
    arbitrumUSDC.chainId,  // 42161 - Arbitrum
    celoUSDC.chainId       // 42220 - Celo
  ]}
  
  paymentOptions={[]}  // Hide exchanges/payment apps
  
  metadata={{
    passType: passId,
    price: formattedPrice,
    name: name
  }}
  
  onPaymentStarted={(e) => {...}}
  onPaymentCompleted={(e) => {...}}
  onPaymentBounced={(e) => {...}}
  onOpen={() => {...}}
  onClose={() => {...}}
>
  {({ show, hide }) => (
    <button onClick={show}>Buy Pass</button>
  )}
</DaimoPayButton.Custom>
```

### Key Props Explained

| Prop | Type | Description |
|------|------|-------------|
| `appId` | string | Your Daimo Pay App ID |
| `intent` | string | Description of the payment (shown to user) |
| `toChain` | number | Chain ID where payment settles (Base: 8453) |
| `toToken` | `0x${string}` | Token address on destination chain |
| `toAddress` | `0x${string}` | Recipient wallet address |
| `toUnits` | string | Amount as decimal string (e.g., "1.00") |
| `refundAddress` | `0x${string}` | Address for refunds if payment fails |
| `preferredTokens` | Array | Tokens to show first (in order) |
| `preferredChains` | Array | Chains to prioritize (in order) |
| `paymentOptions` | Array | Empty array hides exchanges |
| `metadata` | Object | Custom data passed to webhooks |

## 🎯 Token Prioritization

### Fixed Order (Recommended by Daimo Team)

The `preferredTokens` array enforces a fixed order regardless of wallet balances:

```typescript
preferredTokens={[
  { chain: 8453, address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" },    // 1. USDC on Base
  { chain: 42161, address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831" },  // 2. USDC on Arbitrum
  { chain: 42220, address: "0xcebA9300f2b948710d2653dD7B07f33A8B32118C" }   // 3. USDC on Celo
]}
```

**Important:**
- Use raw string addresses (NOT `getAddress()`)
- Order matters - tokens appear in this exact sequence
- Addresses must match exactly (case-sensitive)

### Token Addresses

| Chain | Chain ID | Token Address | Token |
|-------|----------|---------------|-------|
| Base | 8453 | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` | USDC |
| Arbitrum | 42161 | `0xaf88d065e77c8cC2239327C5EDb3A432268e5831` | USDC |
| Celo | 42220 | `0xcebA9300f2b948710d2653dD7B07f33A8B32118C` | USDC |

## 🔔 Event Handlers

### onPaymentStarted

Triggered when user initiates payment:

```typescript
onPaymentStarted={(e) => {
  console.log('Payment started:', e);
  // e.paymentId - Unique payment ID
  // e.payment - Payment details
  // e.payment.source.chainId - Source chain
  // e.payment.source.amountUnits - Amount in source token
}}
```

### onPaymentCompleted

Triggered when payment successfully settles:

```typescript
onPaymentCompleted={(e) => {
  console.log('Payment completed:', e);
  // e.paymentId - Payment ID
  // e.payment.metadata - Your custom metadata
  // e.payment.to.chainId - Destination chain (Base)
  // e.payment.to.amountUnits - Final amount received
}}
```

### onPaymentBounced

Triggered if payment fails (contract reverts):

```typescript
onPaymentBounced={(e) => {
  console.error('Payment bounced:', e);
  // User's funds are automatically refunded
  // e.paymentId - Payment ID
  // e.reason - Bounce reason
}}
```

### onOpen / onClose

Modal lifecycle events:

```typescript
onOpen={() => {
  // Modal opened - hide non-Farcaster wallets here
}}
onClose={() => {
  // Modal closed
}}
```

## 🚫 Restricting to Farcaster Wallet Only

Daimo Pay scans the browser for all available wallets (MetaMask, Coinbase, etc.). To hide non-Farcaster wallets:

### JavaScript Solution (in `onOpen` handler)

```typescript
onOpen={() => {
  const hideNonFarcasterWallets = () => {
    const buttons = document.querySelectorAll('button, [role="button"]');
    buttons.forEach((btn) => {
      const text = (btn.textContent || '').toLowerCase();
      if (text.includes('pay with another wallet') ||
          text.includes('metamask') ||
          text.includes('coinbase')) {
        (btn as HTMLElement).style.display = 'none';
      }
    });
  };
  
  // Run multiple times to catch dynamically added elements
  setTimeout(hideNonFarcasterWallets, 100);
  setTimeout(hideNonFarcasterWallets, 300);
  setTimeout(hideNonFarcasterWallets, 500);
  
  // Use MutationObserver for dynamic content
  const observer = new MutationObserver(() => {
    hideNonFarcasterWallets();
  });
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  setTimeout(() => observer.disconnect(), 10000);
}}
```

## 📡 Webhook Integration

### Webhook Endpoint (src/app/api/webhooks/daimo/route.ts)

Handles server-side payment events:

```typescript
POST /api/webhooks/daimo
```

**Authentication:**
- Header: `Authorization: Bearer ${DAIMO_WEBHOOK_TOKEN}`
- Verify token matches your configured secret

**Event Types:**

1. **payment_started**
   - User initiated payment
   - Use to track pending payments

2. **payment_completed**
   - Payment successfully settled
   - Use to activate pass/product

3. **payment_bounced**
   - Contract call reverted
   - Refund automatically issued

4. **payment_refunded**
   - Payment refunded to user
   - Update payment status

**Event Structure:**

```typescript
{
  type: 'payment_completed',
  paymentId: 'unique-payment-id',
  payment: {
    source: {
      chainId: 42161,  // Arbitrum
      amountUnits: '1.00',
      token: '0x...'
    },
    to: {
      chainId: 8453,  // Base (settlement chain)
      amountUnits: '1.00',
      token: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
    },
    metadata: {
      passType: 'daily',
      price: '1.00',
      name: 'DAILY PASS'
    }
  }
}
```

## 💰 Payment Flow

1. **User clicks "Buy Pass"**
   - `onOpen` fires → Modal opens
   - JavaScript hides non-Farcaster wallets
   - User sees only Farcaster wallet options

2. **User selects payment method**
   - Can pay with USDC on Base, Arbitrum, or Celo
   - Tokens appear in fixed order (preferredTokens)
   - User approves transaction

3. **Payment initiated**
   - `onPaymentStarted` fires
   - Webhook `payment_started` sent to server
   - Payment pending

4. **Payment settles**
   - Daimo bridges/swaps to Base if needed
   - USDC arrives at `toAddress` on Base
   - `onPaymentCompleted` fires
   - Webhook `payment_completed` sent to server

5. **Activation**
   - Server receives webhook
   - Activate pass in database
   - Send confirmation to user

## ⚠️ Important Notes

### Price Formatting

```typescript
// ✅ CORRECT - Must be decimal string with 2 decimals
const formattedPrice = parseFloat(price).toFixed(2); // "1.00"

// ❌ WRONG
const formattedPrice = price; // "1" - missing decimals
const formattedPrice = parseFloat(price).toString(); // "1" - missing decimals
```

### Address Validation

```typescript
// ✅ CORRECT - Use getAddress() for toAddress and refundAddress
const recipientAddress = getAddress(DAIMO_RECIPIENT_ADDRESS);
const refundAddress = getAddress(DAIMO_REFUND_ADDRESS);

// ❌ WRONG - preferredTokens must be raw strings
preferredTokens={[
  { chain: 8453, address: getAddress("0x...") }  // DON'T use getAddress()
]}
```

### Token Addresses

```typescript
// ✅ CORRECT - Raw strings for preferredTokens
preferredTokens={[
  { chain: 8453, address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" }
]}

// ❌ WRONG - Don't use getAddress() here
preferredTokens={[
  { chain: 8453, address: getAddress("0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913") }
]}
```

## 🔒 Security

1. **Webhook Authentication**
   - Always verify `DAIMO_WEBHOOK_TOKEN`
   - Reject unauthorized requests

2. **Chain Validation**
   - Verify payments from allowed chains only
   - Check `ALLOWED_CHAINS` in webhook handler

3. **Address Validation**
   - Validate addresses using `getAddress()` from viem
   - Check address format before using

4. **Metadata Validation**
   - Don't trust user-provided metadata
   - Validate passType and amounts

## 🐛 Troubleshooting

### Payment not appearing in modal

- Check `DAIMO_RECIPIENT_ADDRESS` and `DAIMO_REFUND_ADDRESS` are set
- Verify addresses are valid Ethereum addresses
- Check console for error messages

### Wrong token order

- Verify `preferredTokens` uses raw string addresses (not `getAddress()`)
- Check order matches: Base → Arbitrum → Celo
- Ensure addresses match exactly (case-sensitive)

### Wallets not hiding

- Check MutationObserver is running
- Increase timeout delays if needed
- Verify selectors match Daimo Pay's DOM structure

### Webhook not receiving events

- Verify `DAIMO_WEBHOOK_TOKEN` matches
- Check webhook URL is publicly accessible
- Verify webhook is configured in Daimo dashboard

## 📚 Additional Resources

- [Daimo Pay Documentation](https://docs.daimo.com)
- [Daimo Pay GitHub](https://github.com/daimo-eth/daimo)
- [Wagmi Documentation](https://wagmi.sh)

## 🎯 Current Implementation

This integration is configured for:
- **3 Pass Types**: Daily ($1.00), Weekly ($3.00), Monthly ($9.00)
- **Fixed Token Order**: USDC on Base → Arbitrum → Celo
- **Farcaster Wallet Only**: JavaScript hides other wallets
- **Webhook Support**: Full event handling on server
- **Auto-refund**: Failed payments automatically refunded


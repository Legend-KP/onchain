# Daimo Pay Token Display Structure

## 📊 Current Token Display Order

Based on your modal, tokens are appearing in this order:

1. **1.00 USDC on Base** (Balance: 202.75 USDC)
   - Chain: Base (8453)
   - Token: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`
   - ✅ In `preferredTokens` (position 1)

2. **631 DEGEN on Base** (Balance: 3882 DEGEN)
   - Chain: Base (8453)
   - Token: DEGEN token (NOT in `preferredTokens`)
   - ❌ NOT configured - appearing due to wallet balance

3. **1.00 USDC on Celo** (Balance: 4.00 USDC)
   - Chain: Celo (42220)
   - Token: `0xcebA9300f2b948710d2653dD7B07f33A8B32118C`
   - ✅ In `preferredTokens` (position 3)

## 🔍 Why DEGEN is Appearing

**Problem:** DEGEN token is showing even though it's NOT in `preferredTokens`.

**Root Cause:**
According to the Daimo team's explanation, `preferredTokens` **prioritizes** certain tokens, but **other tokens can still appear if the user holds a large balance**.

The user has **3,882 DEGEN** in their wallet, which is a large balance, so Daimo Pay automatically includes it as a payment option.

## 🎯 How Token Display Works

### Token Display Logic

Daimo Pay uses a **two-tier system**:

1. **Preferred Tokens (First Tier)**
   - Tokens specified in `preferredTokens` array
   - Always shown FIRST, in the exact order specified
   - Shown regardless of wallet balance

2. **Balance-Based Tokens (Second Tier)**
   - Tokens NOT in `preferredTokens`
   - Only shown if user has a **significant balance**
   - Shown AFTER preferred tokens
   - Ordered by balance amount (largest first)

### Current Configuration

```typescript
preferredTokens={[
  { chain: 8453, address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" },    // 1. USDC on Base
  { chain: 42161, address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831" },  // 2. USDC on Arbitrum
  { chain: 42220, address: "0xcebA9300f2b948710d2653dD7B07f33A8B32118C" }   // 3. USDC on Celo
]}
```

**Expected Display Order:**
1. USDC on Base (preferred, position 1)
2. USDC on Arbitrum (preferred, position 2) - **NOT SHOWING** (user has 0 balance)
3. USDC on Celo (preferred, position 3)
4. DEGEN on Base (balance-based, appears because large balance)

**Actual Display Order:**
1. USDC on Base ✅ (preferred)
2. DEGEN on Base ❌ (balance-based, 3,882 DEGEN)
3. USDC on Celo ✅ (preferred)

## 🚨 Why Arbitrum USDC is Missing

**USDC on Arbitrum** is NOT showing because:
- User has **0 balance** of USDC on Arbitrum
- Daimo Pay only shows tokens if user has sufficient balance to cover the payment
- Even though it's in `preferredTokens`, it won't appear if balance is 0

## 💡 Solution: Enforce Strict Order

Based on the Daimo team's solution, `preferredTokens` should enforce a **static order** for all users. However, Daimo Pay still shows other tokens if the user has large balances.

### Option 1: Accept Current Behavior (Recommended)

The current behavior is actually **correct** - Daimo Pay:
1. Shows preferred tokens first (in order)
2. Shows other tokens with large balances after

This gives users flexibility while prioritizing your preferred tokens.

### Option 2: Hide Non-Preferred Tokens (Custom Implementation)

If you want to **strictly enforce** only showing USDC on Base, Arbitrum, and Celo, you would need to:

1. **Hide balance-based tokens with JavaScript** (similar to hiding wallets)

```typescript
onOpen={() => {
  const hideNonPreferredTokens = () => {
    // Find all token options
    const tokenOptions = document.querySelectorAll('[class*="token"], [class*="Token"]');
    
    tokenOptions.forEach((element) => {
      const text = (element.textContent || '').toLowerCase();
      
      // Hide if it's not USDC on Base/Arbitrum/Celo
      const isNonPreferredToken = 
        text.includes('degen') ||
        text.includes('eth') ||
        text.includes('weth') ||
        (text.includes('usdc') && !text.includes('base') && !text.includes('arbitrum') && !text.includes('celo'));
      
      if (isNonPreferredToken) {
        (element as HTMLElement).style.display = 'none';
      }
    });
  };
  
  setTimeout(hideNonPreferredTokens, 100);
  setTimeout(hideNonPreferredTokens, 500);
  // ... MutationObserver
}}
```

### Option 3: Contact Daimo Team

If you need a **strict enforcement** where only `preferredTokens` are shown (no balance-based tokens), you may need to:
- Contact Daimo team for a configuration option
- Or use a custom implementation to hide non-preferred tokens

## 📋 Token Display Structure Breakdown

### Visual Structure

```
┌─────────────────────────────────────────┐
│  Purchase DAILY PASS              [X]   │
├─────────────────────────────────────────┤
│  $1.00                   0xE51f...0670 │
├─────────────────────────────────────────┤
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ 1.00 USDC on Base                 │ │  ← preferredTokens[0]
│  │ Balance: 202.75 USDC              │ │
│  │ [USDC Icon]                        │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ 631 DEGEN on Base                 │ │  ← Balance-based (not in preferredTokens)
│  │ Balance: 3882 DEGEN               │ │
│  │ [DEGEN Icon]                       │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ 1.00 USDC on Celo                 │ │  ← preferredTokens[2]
│  │ Balance: 4.00 USDC                │ │
│  │ [USDC Icon with C]                │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ─────────────────────────────────────  │
│  or                                     │  ← Separator
│  ─────────────────────────────────────  │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ Pay with another wallet           │ │  ← Wallet options (hidden by JS)
│  │ [MetaMask Icon] [Other Wallets]   │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### Data Structure

Each token option contains:
- **Amount Required**: e.g., "1.00 USDC" (calculated from `toUnits`)
- **Token Name**: e.g., "USDC on Base"
- **User Balance**: e.g., "Balance: 202.75 USDC" (from wallet)
- **Token Icon**: Visual representation of the token
- **Chain Indicator**: Shows which chain the token is on

### Token Calculation

Daimo Pay calculates the required amount for each token:
- **USDC on Base**: Direct payment (1.00 USDC = 1.00 USDC)
- **USDC on Arbitrum**: Direct payment (1.00 USDC = 1.00 USDC)
- **USDC on Celo**: Direct payment (1.00 USDC = 1.00 USDC)
- **DEGEN on Base**: Calculated equivalent (e.g., 631 DEGEN ≈ $1.00 USDC)

## 🔧 Configuration Impact

### preferredTokens

```typescript
preferredTokens={[
  { chain: 8453, address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" },    // Position 1
  { chain: 42161, address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831" },  // Position 2
  { chain: 42220, address: "0xcebA9300f2b948710d2653dD7B07f33A8B32118C" }   // Position 3
]}
```

**Effect:**
- These tokens appear **FIRST** in the list
- Order is **guaranteed** (Base → Arbitrum → Celo)
- Shown even with small balances
- Hidden if balance is 0

### preferredChains

```typescript
preferredChains={[
  baseUSDC.chainId,      // 8453 - Base
  arbitrumUSDC.chainId,  // 42161 - Arbitrum
  celoUSDC.chainId       // 42220 - Celo
]}
```

**Effect:**
- Prioritizes these chains when showing tokens
- Affects chain ordering, not token filtering

### paymentOptions

```typescript
paymentOptions={[]}
```

**Effect:**
- Hides exchanges and payment apps
- Does NOT affect token display
- Only affects wallet/exchange options

## 📝 Summary

**Current Token Display:**
1. ✅ USDC on Base (preferred, shown first)
2. ❌ DEGEN on Base (balance-based, shown because large balance)
3. ✅ USDC on Celo (preferred, shown third)
4. ❌ USDC on Arbitrum (preferred, but hidden because 0 balance)

**Why DEGEN appears:**
- User has 3,882 DEGEN balance (large amount)
- Daimo Pay automatically includes it as a payment option
- `preferredTokens` prioritizes but doesn't exclude other tokens

**To enforce strict order:**
- Option 1: Accept current behavior (recommended)
- Option 2: Use JavaScript to hide non-preferred tokens
- Option 3: Contact Daimo team for strict enforcement option


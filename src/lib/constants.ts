import { type AccountAssociation } from '@farcaster/miniapp-core/src/manifest';

/**
 * Application constants and configuration values.
 *
 * This file contains all the configuration constants used throughout the mini app.
 * These values are either sourced from environment variables or hardcoded and provide
 * configuration for the app's appearance, behavior, and integration settings.
 *
 * NOTE: This file is automatically updated by the init script.
 * Manual changes may be overwritten during project initialization.
 */

// --- App Configuration ---
/**
 * The base URL of the application.
 * Used for generating absolute URLs for assets and API endpoints.
 */
export const APP_URL: string = process.env.NEXT_PUBLIC_URL || 
  (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

/**
 * The name of the mini app as displayed to users.
 * Used in titles, headers, and app store listings.
 */
export const APP_NAME: string = 'ONCHAIN ';

/**
 * A brief description of the mini app's functionality.
 * Used in app store listings and metadata.
 */
export const APP_DESCRIPTION: string = 'Test all the blockahin as a mode of payment';

/**
 * The primary category for the mini app.
 * Used for app store categorization and discovery.
 */
export const APP_PRIMARY_CATEGORY: string = '';

/**
 * Tags associated with the mini app.
 * Used for search and discovery in app stores.
 */
export const APP_TAGS: string[] = ['neynar', 'starter-kit', 'demo'];

// --- Asset URLs ---
/**
 * URL for the app's icon image.
 * Used in app store listings and UI elements.
 */
export const APP_ICON_URL: string = `${APP_URL}/icon.png`;

/**
 * URL for the app's Open Graph image.
 * Used for social media sharing and previews.
 */
export const APP_OG_IMAGE_URL: string = `${APP_URL}/api/opengraph-image`;

/**
 * URL for the app's splash screen image.
 * Displayed during app loading.
 */
export const APP_SPLASH_URL: string = `${APP_URL}/splash.png`;

/**
 * Background color for the splash screen.
 * Used as fallback when splash image is loading.
 */
export const APP_SPLASH_BACKGROUND_COLOR: string = '#f7f7f7';

/**
 * Account association for the mini app.
 * Used to associate the mini app with a Farcaster account.
 * If not provided, the mini app will be unsigned and have limited capabilities.
 */
export const APP_ACCOUNT_ASSOCIATION: AccountAssociation | undefined =
  undefined;

// --- UI Configuration ---
/**
 * Text displayed on the main action button.
 * Used for the primary call-to-action in the mini app.
 */
export const APP_BUTTON_TEXT: string = 'Launch Mini App';

// --- Integration Configuration ---
/**
 * Webhook URL for receiving events from Neynar.
 *
 * If Neynar API key and client ID are configured, uses the official
 * Neynar webhook endpoint. Otherwise, falls back to a local webhook
 * endpoint for development and testing.
 */
export const APP_WEBHOOK_URL: string =
  process.env.NEYNAR_API_KEY && process.env.NEYNAR_CLIENT_ID
    ? `https://api.neynar.com/f/app/${process.env.NEYNAR_CLIENT_ID}/event`
    : `${APP_URL}/api/webhook`;

/**
 * Flag to enable/disable wallet functionality.
 *
 * When true, wallet-related components and features are rendered.
 * When false, wallet functionality is completely hidden from the UI.
 * Useful for mini apps that don't require wallet integration.
 */
export const USE_WALLET: boolean = true;

/**
 * Flag to enable/disable analytics tracking.
 *
 * When true, usage analytics are collected and sent to Neynar.
 * When false, analytics collection is disabled.
 * Useful for privacy-conscious users or development environments.
 */
export const ANALYTICS_ENABLED: boolean = true;

/**
 * Required chains for the mini app.
 *
 * Contains an array of CAIP-2 identifiers for blockchains that the mini app requires.
 * If the host does not support all chains listed here, it will not render the mini app.
 * If empty or undefined, the mini app will be rendered regardless of chain support.
 *
 * Supported chains: eip155:1, eip155:137, eip155:42161, eip155:10, eip155:8453,
 * solana:mainnet, solana:devnet
 */
export const APP_REQUIRED_CHAINS: string[] = [];

/**
 * Return URL for the mini app.
 *
 * If provided, the mini app will be rendered with a return URL to be rendered if the
 * back button is pressed from the home page.
 */
export const RETURN_URL: string | undefined = undefined;

// --- Daimo Pay Configuration ---
/**
 * Daimo Pay App ID for payment processing.
 * Use "pay-demo" for prototyping, or get a production ID from Daimo.
 */
export const DAIMO_APP_ID: string = process.env.NEXT_PUBLIC_DAIMO_APP_ID || "pay-trenchy-FGhJgP9hwghGh9bLxVzawb";

/**
 * Recipient address where payments will be sent.
 * This should be a wallet address you control on all supported networks.
 */
export const DAIMO_RECIPIENT_ADDRESS: string = process.env.NEXT_PUBLIC_DAIMO_RECIPIENT_ADDRESS || "";

/**
 * Refund address for failed or bounced payments.
 * Should be a wallet address you control on all supported networks.
 * Can be the same as RECIPIENT_ADDRESS.
 */
export const DAIMO_REFUND_ADDRESS: string = process.env.NEXT_PUBLIC_DAIMO_REFUND_ADDRESS || process.env.NEXT_PUBLIC_DAIMO_RECIPIENT_ADDRESS || "";

/**
 * Webhook secret token for verifying Daimo Pay webhook requests.
 * Get this from Daimo when setting up webhooks.
 */
export const DAIMO_WEBHOOK_TOKEN: string = process.env.DAIMO_WEBHOOK_TOKEN || "";

// --- Custom USDC Payment Configuration ---
/**
 * Your wallet address (receives all payments)
 */
export const PAYMENT_RECIPIENT_ADDRESS = "0xE51f63637c549244d0A8E11ac7E6C86a1E9E0670" as const;

/**
 * USDC token addresses for each supported chain
 */
export const USDC_ADDRESSES = {
  base: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as `0x${string}`,
  arbitrum: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831" as `0x${string}`,
  celo: "0xcebA9300f2b948710d2653dD7B07f33A8B32118C" as `0x${string}`,
} as const;

/**
 * Chain IDs for supported networks
 */
export const SUPPORTED_CHAINS = {
  base: 8453,
  arbitrum: 42161,
  celo: 42220,
} as const;

/**
 * Pass prices (in USDC - 6 decimals)
 */
export const PASS_PRICES = {
  daily: "1000000", // 1 USDC (1 * 10^6)
  weekly: "3000000", // 3 USDC (3 * 10^6)
  monthly: "9000000", // 9 USDC (9 * 10^6)
} as const;

/**
 * Pass display prices (for UI)
 */
export const PASS_DISPLAY_PRICES = {
  daily: "1.00",
  weekly: "3.00",
  monthly: "9.00",
} as const;

// PLEASE DO NOT UPDATE THIS
export const SIGNED_KEY_REQUEST_VALIDATOR_EIP_712_DOMAIN = {
  name: 'Farcaster SignedKeyRequestValidator',
  version: '1',
  chainId: 10,
  verifyingContract:
    '0x00000000fc700472606ed4fa22623acf62c60553' as `0x${string}`,
};

// PLEASE DO NOT UPDATE THIS
export const SIGNED_KEY_REQUEST_TYPE = [
  { name: 'requestFid', type: 'uint256' },
  { name: 'key', type: 'bytes' },
  { name: 'deadline', type: 'uint256' },
];

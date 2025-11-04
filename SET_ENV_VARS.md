# Setting Daimo Pay Environment Variables in Vercel

## Quick Setup

Run these commands to set the environment variables in Vercel:

```bash
# Set Recipient Address
echo "0xE51f63637c549244d0A8E11ac7E6C86a1E9E0670" | vercel env add NEXT_PUBLIC_DAIMO_RECIPIENT_ADDRESS production

# Set Refund Address
echo "0xE51f63637c549244d0A8E11ac7E6C86a1E9E0670" | vercel env add NEXT_PUBLIC_DAIMO_REFUND_ADDRESS production
```

## Manual Setup via Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add these variables:
   - `NEXT_PUBLIC_DAIMO_RECIPIENT_ADDRESS` = `0xE51f63637c549244d0A8E11ac7E6C86a1E9E0670`
   - `NEXT_PUBLIC_DAIMO_REFUND_ADDRESS` = `0xE51f63637c549244d0A8E11ac7E6C86a1E9E0670`
5. Make sure to select **Production**, **Preview**, and **Development** environments
6. Click **Save**
7. Redeploy your application

## Important Notes

- `NEXT_PUBLIC_` prefix is required for client-side environment variables in Next.js
- After adding environment variables, you need to redeploy for changes to take effect
- Local `.env.local` files are NOT deployed to Vercel - you must set them in Vercel dashboard


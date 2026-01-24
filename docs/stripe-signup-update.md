# Stripe + Signup Update Guide ($1 First Month)

This guide explains the non-code updates needed for the new "$1 for the first month, then $5.99/month" offer.

## 1) Stripe: Create the $1 Intro Coupon

1. Open the Stripe Dashboard ➜ **Products** ➜ locate the existing **Educational Elements** subscription product/price.
2. Go to **Billing ➜ Coupons** and click **New**.
3. Create a coupon with:
   - **Amount off:** `$4.99` (USD)
   - **Duration:** `Once`
   - **Name:** `EE Intro $1 First Month` (or similar)
4. Save and copy the **Coupon ID** (looks like `coupon_...`).

> Why $4.99 off? The subscription price is $5.99, so this yields a $1 first month. If you change the base price later, update the coupon amount accordingly.

## 2) Vercel: Add the New Environment Variable

Add the coupon ID as an environment variable so Checkout can apply it for new signups:

1. Vercel ➜ **Project Settings ➜ Environment Variables**
2. Add:
   - `STRIPE_INTRO_COUPON_ID` = `coupon_...` (from Step 1)
3. Redeploy (or trigger a redeploy) so the new variable is available.

Existing variables still required:
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_ID_EDUCATIONAL_ELEMENTS`

## 3) Firebase: No Console Changes Required

No Firebase console changes are required for this update.

- The Stripe webhooks will keep updating user records as new subscriptions are created.
- Existing trial users will continue to be handled by the current trial logic (if any are still active).

If you want to track the new intro offer in Firestore, the webhook now writes:
- `introOffer: true|false`
- `discountApplied: <coupon_id>`

## 4) Optional: Test the Flow

1. In Stripe, create a test customer and go through the signup flow.
2. Confirm the first invoice is **$1**.
3. Check the subscription in Stripe to ensure the coupon is applied for **one billing cycle**.
4. Verify Firestore shows the new subscription status and metadata updates.

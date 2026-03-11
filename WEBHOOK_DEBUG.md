# Stripe Webhook Debugging Guide for FoldPDF

## Issue Summary
Stripe webhooks are failing to reach the endpoint: `https://pixel-and-purpose.com/pdf/api/stripe-webhook`

## Checklist for Debugging

### 1. Environment Variables (Critical)
Ensure these are set in Netlify environment variables:

```bash
STRIPE_SECRET_KEY=sk_live_...  # Your live Stripe secret key
STRIPE_WEBHOOK_SECRET=whsec_...  # From Stripe Dashboard webhook endpoint
CAMPAIGNCORE_API_KEY=...  # For user tagging
CAMPAIGNCORE_PRO_SEGMENT_ID=...  # For user tagging (optional)
```

### 2. Stripe Dashboard Configuration
Go to [Stripe Dashboard > Developers > Webhooks](https://dashboard.stripe.com/webhooks):

1. **Endpoint URL**: `https://pixel-and-purpose.com/pdf/api/stripe-webhook`
2. **Events to send**: `checkout.session.completed`
3. **Copy Signing Secret**: Use this as `STRIPE_WEBHOOK_SECRET`

### 3. Testing the Endpoint

#### Health Check (GET request)
```bash
curl https://pixel-and-purpose.com/pdf/api/stripe-webhook
```
Should return:
```json
{
  "status": "healthy",
  "timestamp": "...",
  "env": {
    "hasStripeSecretKey": true,
    "hasWebhookSecret": true,
    "hasCampaignCoreApiKey": true,
    "hasProSegmentId": true
  }
}
```

#### Check Netlify Function Logs
1. Go to Netlify Dashboard > Site > Functions tab
2. Look for `stripe-webhook` function
3. Check recent invocations and logs

### 4. Common Issues & Solutions

#### Issue: "Webhook not configured" (500 error)
**Cause**: Missing environment variables
**Fix**: Add `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` to Netlify

#### Issue: "Invalid signature" (400 error)  
**Cause**: Wrong webhook secret or body modification
**Fix**: 
- Verify `STRIPE_WEBHOOK_SECRET` matches Stripe Dashboard
- Ensure body isn't modified by middleware

#### Issue: Webhook endpoint not found (404)
**Cause**: Deployment or routing issue
**Fix**: 
- Verify deployment succeeded
- Check if `/pdf` basePath is correctly configured
- Confirm route file exists at `app/api/stripe-webhook/route.ts`

#### Issue: Connection timeout
**Cause**: Function cold start or timeout
**Fix**: Function should respond quickly - check for hanging operations

### 5. Verification Steps After Fixing

1. **Deploy changes**: `git push` to trigger Netlify rebuild
2. **Test health endpoint**: Visit `https://pixel-and-purpose.com/pdf/api/stripe-webhook`
3. **Test webhook**: Make a test purchase or use Stripe CLI
4. **Check logs**: Monitor Netlify function logs for any errors
5. **Verify Stripe**: Check webhook attempts in Stripe Dashboard

### 6. Stripe CLI Testing (Optional)
Install Stripe CLI and test locally:
```bash
stripe login
stripe listen --forward-to https://pixel-and-purpose.com/pdf/api/stripe-webhook
stripe trigger checkout.session.completed
```

### 7. Monitoring
After fixing, monitor:
- Stripe Dashboard > Webhooks > [Your endpoint] > Recent deliveries
- Netlify Dashboard > Site > Functions > Recent invocations
- Check for any error patterns in logs
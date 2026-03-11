#!/usr/bin/env node

/**
 * Simple webhook health check script
 * Tests if the Stripe webhook endpoint is accessible and properly configured
 */

const WEBHOOK_URL = 'https://pixel-and-purpose.com/pdf/api/stripe-webhook';

async function testWebhookHealth() {
  console.log('Testing webhook health...\n');
  
  try {
    console.log(`📡 Checking: ${WEBHOOK_URL}`);
    
    const response = await fetch(WEBHOOK_URL, {
      method: 'GET',
      headers: {
        'User-Agent': 'FoldPDF-Health-Check/1.0'
      }
    });
    
    console.log(`📊 Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('📋 Response:', JSON.stringify(data, null, 2));
      
      // Check environment configuration
      const env = data.env || {};
      console.log('\n🔍 Environment Check:');
      console.log(`  ✅ Stripe Secret Key: ${env.hasStripeSecretKey ? '✓' : '❌'}`);
      console.log(`  ✅ Webhook Secret: ${env.hasWebhookSecret ? '✓' : '❌'}`);
      console.log(`  ✅ CampaignCore Key: ${env.hasCampaignCoreApiKey ? '✓' : '❌'}`);
      console.log(`  ✅ Pro Segment ID: ${env.hasProSegmentId ? '✓' : '❌'}`);
      
      if (env.hasStripeSecretKey && env.hasWebhookSecret) {
        console.log('\n🎉 Webhook endpoint appears to be properly configured!');
      } else {
        console.log('\n⚠️  Missing required environment variables. Check Netlify settings.');
      }
    } else {
      const text = await response.text();
      console.log('❌ Error response:', text);
    }
    
  } catch (error) {
    console.log('❌ Connection failed:', error.message);
    console.log('\nPossible issues:');
    console.log('  - Deployment not complete');
    console.log('  - DNS issues');
    console.log('  - Function timeout');
    console.log('  - CORS or firewall blocking');
  }
}

// Run the test
testWebhookHealth().catch(console.error);
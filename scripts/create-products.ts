/**
 * Script to create/update Polar products: Go, Plus, and Pro
 * Run with: npx ts-node scripts/create-products.ts
 */

import { Polar } from '@polar-sh/sdk';
import * as dotenv from 'dotenv';

dotenv.config();

const accessToken = process.env.POLAR_ACCESS_TOKEN;
const server = (
  process.env.POLAR_ENVIRONMENT === 'sandbox' ? 'sandbox' : 'production'
) as 'production' | 'sandbox';

if (!accessToken) {
  console.error('POLAR_ACCESS_TOKEN not set in environment');
  process.exit(1);
}

const polarClient = new Polar({
  accessToken,
  server,
});

const benefitId = '77fa0176-9d49-4646-98c6-535996a35920'; // Existing benefit ID

async function createOrUpdateProducts() {
  try {
    // 1. Update existing product to "Go"
    const existingProductId = 'b0d421eb-615c-4ef8-9053-1a8449afbcc0';

    console.log('Updating existing product to "Go Plan"...');
    await polarClient.products.update({
      id: existingProductId,
      productUpdate: {
        name: 'Go Plan',
        metadata: {
          ai_images: 'true',
          plan_name: 'go',
          ai_credits: '3000',
          max_slides: '20',
          no_branding: 'true',
          white_label: 'true',
          beautiful_ai_images: 'true',
        },
      },
    });
    console.log('✓ Updated product to "Go Plan"');

    // 2. Create Plus product
    console.log('Creating Plus product...');
    const plusProduct = await polarClient.products.create({
      name: 'Plus',
      recurringInterval: 'month',
      recurringIntervalCount: 1,
      prices: [
        {
          amountType: 'fixed',
          priceAmount: 2000,
          priceCurrency: 'usd',
        },
      ],
      metadata: {
        ai_images: 'true',
        plan_name: 'plus',
        ai_credits: '10000',
        max_slides: '50',
        no_branding: 'true',
        white_label: 'true',
        beautiful_ai_images: 'true',
      },
    });
    console.log('✓ Created Plus product:', plusProduct.id);

    // Attach benefit to Plus
    if (plusProduct.id) {
      await polarClient.products.updateBenefits({
        id: plusProduct.id,
        productBenefitsUpdate: {
          benefits: [benefitId],
        },
      });
      console.log('✓ Attached benefit to Plus');
    }

    // 3. Create Pro product
    console.log('Creating Pro product...');
    const proProduct = await polarClient.products.create({
      name: 'Pro',
      recurringInterval: 'month',
      recurringIntervalCount: 1,
      prices: [
        {
          amountType: 'fixed',
          priceAmount: 5000,
          priceCurrency: 'usd',
        },
      ],
      metadata: {
        ai_images: 'true',
        plan_name: 'pro',
        ai_credits: '50000',
        max_slides: '100',
        no_branding: 'true',
        white_label: 'true',
        beautiful_ai_images: 'true',
      },
    });
    console.log('✓ Created Pro product:', proProduct.id);

    // Attach benefit to Pro
    if (proProduct.id) {
      await polarClient.products.updateBenefits({
        id: proProduct.id,
        productBenefitsUpdate: {
          benefits: [benefitId],
        },
      });
      console.log('✓ Attached benefit to Pro');
    }

    console.log('\n✅ All products created/updated successfully!');
    console.log('\nProduct Summary:');
    console.log('- Go:   $10/month, 3000 credits, 20 slides');
    console.log('- Plus: $20/month, 10000 credits, 50 slides');
    console.log('- Pro:  $50/month, 50000 credits, 100 slides');
  } catch (error: any) {
    console.error('Error creating/updating products:', error);
    if (error.body) {
      console.error('Error body:', error.body);
    }
    process.exit(1);
  }
}

createOrUpdateProducts();

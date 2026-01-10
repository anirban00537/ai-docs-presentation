# Pricing Recommendation for ButterFast
**Date**: January 10, 2026
**LLM Model**: minimax/minimax-m2.1

## 📊 Cost Analysis

### LLM Pricing
- **Prompt tokens**: $0.28 per 1M tokens
- **Completion tokens**: $1.20 per 1M tokens

### Actual Usage Statistics
- **Total presentations analyzed**: 14 valid presentations
- **Total slides generated**: 109 slides
- **Total tokens consumed**: 419,583 tokens
- **Average tokens per slide**: **3,849 tokens**

### Cost per Slide Breakdown
| Component | Tokens | Rate | Cost |
|:---|---:|---:|---:|
| Prompt (40%) | 1,540 | $0.28/1M | $0.000431 |
| Completion (60%) | 2,309 | $1.20/1M | $0.002771 |
| **Total Cost** | **3,849** | - | **$0.003202** |

---

## 💰 Pricing Strategy (80% Profit Margin)

### Formula:
```
Selling Price = Cost / (1 - Profit Margin)
Selling Price = $0.003202 / 0.20 = $0.01601 per slide
```

### Recommended Pricing Tiers

| Plan | Monthly Credits | Your Cost | Sell For | Profit | Margin | Price/Credit |
|:---|---:|---:|---:|---:|---:|---:|
| **Free** | 10 | $0.03 | $0.00 | -$0.03 | -100% | Free |
| **Starter** | 100 | $0.32 | **$1.99** | $1.67 | **84%** | $0.0199 |
| **Pro** | 500 | $1.60 | **$8.99** | $7.39 | **82%** | $0.0180 |
| **Business** | 1,500 | $4.80 | **$24.99** | $20.19 | **81%** | $0.0167 |
| **Enterprise** | 5,000 | $16.01 | **$79.99** | $63.98 | **80%** | $0.0160 |

### Volume Discount Structure
This pricing includes built-in volume discounts:
- **100 credits**: $0.0199/credit (Premium)
- **500 credits**: $0.0180/credit (9% discount)
- **1,500 credits**: $0.0167/credit (16% discount)
- **5,000 credits**: $0.0160/credit (20% discount - at 80% margin threshold)

---

## 🎯 Implementation in Polar.sh

### Step 1: Update Product Metadata
For each product in Polar.sh dashboard, add this metadata:

**Free Tier** (Default for all users):
```json
{
  "ai_credits": 10
}
```

**Starter** ($1.99/month):
```json
{
  "ai_credits": 100,
  "feature_1": "100 AI-generated slides per month",
  "feature_2": "All block types",
  "feature_3": "Export to PDF",
  "feature_4": "Standard support"
}
```

**Pro** ($8.99/month):
```json
{
  "ai_credits": 500,
  "feature_1": "500 AI-generated slides per month",
  "feature_2": "All block types",
  "feature_3": "Advanced layouts",
  "feature_4": "Priority support",
  "feature_5": "Custom branding"
}
```

**Business** ($24.99/month):
```json
{
  "ai_credits": 1500,
  "feature_1": "1,500 AI-generated slides per month",
  "feature_2": "Team collaboration",
  "feature_3": "Advanced analytics",
  "feature_4": "Priority support",
  "feature_5": "Custom branding",
  "feature_6": "API access"
}
```

**Enterprise** ($79.99/month):
```json
{
  "ai_credits": 5000,
  "feature_1": "5,000 AI-generated slides per month",
  "feature_2": "Unlimited team members",
  "feature_3": "Advanced analytics",
  "feature_4": "Dedicated support",
  "feature_5": "White labeling",
  "feature_6": "API access",
  "feature_7": "Custom integrations"
}
```

### Step 2: Verify Current System

The system already:
- ✅ Fetches `ai_credits` from Polar product metadata
- ✅ Sets credit limits automatically via `getMonthlyCreditLimit()`
- ✅ Deducts 1 credit per slide via `creditsPerSlide = 1`
- ✅ Resets credits monthly on subscription renewal

**No code changes needed!** Just update Polar.sh product metadata.

---

## 📈 Revenue Projections

### Example Scenarios

**Scenario 1: Modest Growth**
- 100 Free users (10 credits) = $3.20 cost
- 50 Starter users ($1.99) = $99.50/month revenue - $16.00 cost = **$83.50 profit**
- 20 Pro users ($8.99) = $179.80/month revenue - $32.00 cost = **$147.80 profit**
- 5 Business users ($24.99) = $124.95/month revenue - $24.00 cost = **$100.95 profit**

**Monthly Revenue**: $404.25  
**Monthly Cost**: $75.20  
**Monthly Profit**: **$329.05** (81% margin)

**Scenario 2: Scale**
- 1,000 Free users = $32.00 cost
- 200 Starter = $398/month revenue - $64 cost = **$334 profit**
- 100 Pro = $899/month revenue - $160 cost = **$739 profit**
- 30 Business = $749.70/month revenue - $144 cost = **$605.70 profit**
- 10 Enterprise = $799.90/month revenue - $160.10 cost = **$639.80 profit**

**Monthly Revenue**: $2,846.60  
**Monthly Cost**: $560.10  
**Monthly Profit**: **$2,286.50** (80% margin)

---

## 🚀 Next Steps

1. **Update Polar.sh Products**:
   - Log in to https://polar.sh
   - Navigate to Products
   - For each product, click Edit → Metadata
   - Add the `ai_credits` value as shown above
   - Add `feature_*` keys for feature list

2. **Verify Configuration**:
   ```bash
   # Test the API
   curl http://localhost:8000/api/subscription/products
   ```
   
   Check that `monthlyCreditLimit` appears for each product.

3. **Monitor Usage**:
   - Track actual token consumption vs estimates
   - Adjust pricing if costs deviate significantly
   - Consider annual plans with 2-month discount (16% off)

---

## 💡 Additional Recommendations

### Annual Plans (Save 2 months)
Offer 10-month pricing for 12-month commitment:

| Plan | Monthly | Annual (Save 17%) |
|:---|---:|---:|
| Starter | $1.99 | **$19.90**/year |
| Pro | $8.99 | **$89.90**/year |
| Business | $24.99 | **$249.90**/year |
| Enterprise | $79.99 | **$799.90**/year |

### One-Time Credit Packs
For users who don't want subscriptions:

| Pack | Credits | Price | Margin |
|:---|---:|---:|---:|
| Small | 50 | $1.49 | 85% |
| Medium | 250 | $5.99 | 83% |
| Large | 1,000 | $19.99 | 81% |

---

## 📊 Competitive Positioning

Your pricing is:
- **5-10x cheaper** than Canva Pro ($12.99/month for limited AI)
- **3-5x cheaper** than Gamma.app ($15/month for 400 credits)
- **Similar to** Beautiful.ai ($12/month for presentations)

**Value Proposition**: "Professional AI presentations at 1/5th the cost"

---

## ⚠️ Risk Mitigation

### If Token Costs Increase:
1. **Monitor usage** weekly during first month
2. **Set alerts** if average tokens/slide exceeds 4,500
3. **Have fallback pricing** ready (reduce credits or increase prices by 10-20%)

### Current Margin Buffer:
- Target: 80% margin
- Actual: 81-84% margin (built-in safety buffer)
- Can absorb up to **33% cost increase** before hitting 70% margin

---

**Implementation Priority**: HIGH  
**Estimated Time**: 15 minutes  
**Revenue Impact**: Immediate (starts with next subscription)

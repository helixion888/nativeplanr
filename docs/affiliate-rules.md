# Monetization & Affiliate Compliance

## Integration Layout
- Recommendation Blocks: Product links (Amazon Affiliate tracking IDs, nursery partnership codes) must render dynamically from structured backend database response models.
- Monetization Extensions: Stripe transactional checkouts and premium download deliveries are isolated into dedicated monetized extension layers without touching application routing modules.

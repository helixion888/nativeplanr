# Architectural Framework & Data Flow Spec

## Global System Topography
- Frontend Interface Layer: React 19, TypeScript, Vite, Tailwind CSS hosted on Cloudflare Pages.
- Serverless Layer: Cloudflare Workers handling safe schema-validated API requests.
- Storage Layer: Cloudflare D1 (SQL Tables), Cloudflare KV (Static Lookups), Cloudflare R2 (PDF Assets).

## Data Flow Pipeline
1. User interacts with UI Component -> 2. Action fires inside Module Repository -> 3. Request validated at Edge Gateway via Schema Filter -> 4. Transaction executed cleanly on Database.

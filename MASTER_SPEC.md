# NativePlanr Master Specification v1.0.0

## Core Philosophy
NativePlanr is a data-driven, modular platform designed for native plant garden layout generation. The system shell must remain completely independent of specific features.

## Immutable Rules
1. All feature modules must be built as independent plugins inside the `/modules` folder.
2. No plugin may directly import code or alter state belonging to another plugin. All communication must pass through the Core Event Bus.
3. Every component interface must render dynamically from structured JSON contracts. Hardcoded HTML layouts are strictly prohibited.
4. Total server execution must run on Cloudflare edge infrastructure utilizing serverless architecture models.

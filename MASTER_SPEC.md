# NativePlanr Master Specification v1.0.0

## Core Philosophy
NativePlanr is a data-driven, modular platform designed for native plant garden layout generation. The system shell must remain completely independent of specific features.

## Immutable Rules
1. All feature modules must be built as independent plugins inside the `/modules` folder.
2. No plugin may directly import code or alter state belonging to another plugin. All communication must pass through the Core Event Bus.
3. Every component interface must render dynamically from structured JSON contracts. Hardcoded HTML layouts are strictly prohibited.
4. Total server execution must run on Cloudflare edge infrastructure utilizing serverless architecture models.


# Immutable Knowledge Object Rule

Every entity stored within `/data/plants/` represents a canonical botanical fact record.

Plant records shall contain only intrinsic botanical or ecological properties that remain true independent of user, computation, presentation, monetization, or rendering context.

The following categories must never be persisted within a plant record:

* AI-generated scores
* recommendation rankings
* runtime calculations
* habitat simulation outputs
* blueprint coordinates
* SEO metadata
* page titles
* page descriptions
* affiliate mappings
* merchant identifiers
* pricing
* inventory
* image URLs
* user state
* analytics
* cache objects
* presentation-layer data

These concerns belong in separate repositories or plugins that are composed together only at runtime.

The application architecture shall follow a layered composition model:

Canonical Knowledge Layer

→ Computation Layer

→ Simulation Layer

→ Presentation Layer

→ Monetization Layer

→ User Personalization Layer

The canonical knowledge layer must remain immutable so that any future engine, AI model, importer, or plugin can be replaced without requiring migration of the botanical dataset.

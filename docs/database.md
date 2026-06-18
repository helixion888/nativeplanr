# Database Management Schema Rules

## Structural Consistency
- Direct external interface execution is restricted. All data interactions must pass through the dedicated core Repository layer.
- Relational integrity constraints are verified natively using Cloudflare D1 SQLite prepared layouts.
- Security Isolation Check: All record creation or query steps must inherently match and restrict records to the logged-in User ID string ($OwnerID = ActiveSession$).

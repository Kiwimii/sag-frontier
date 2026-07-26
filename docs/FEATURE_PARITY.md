# Godot feature parity gate

S.A.G. Frontier keeps `web/legacy-041/` as the protected production runtime until the Godot implementation reaches verified feature parity.

The machine-readable source is [`feature-parity.json`](feature-parity.json). `npm run check:parity` verifies that every mandatory production capability remains listed, every evidence file exists and the Godot release switch cannot be enabled while blockers remain.

## Current release decision

- Production runtime: `web/legacy-041/`
- Migration target: `godot/`
- Godot production release: blocked
- Current migration status: foundation only

## Status summary

| Capability | Godot status | Current assessment |
|---|---|---|
| Action combat and expedition loop | Partial | Basic five-sector loop, enemies, upgrades and meta progression exist. Production loadouts, bosses and combat depth remain open. |
| Command progression | Missing | Ranks, contracts and research remain only in the protected browser runtime. |
| Galia map and stations | Missing | Sector discovery, stations and production travel state are not yet in Godot. |
| Economy and trade | Missing | Cargo, fuel cells, credits and markets are not yet in Godot. |
| Ship services | Missing | Modules, repair, refuel and logistics services are not yet in Godot. |
| Events and reputation | Partial | Basic route reputation exists; production event chains and consequences remain open. |
| SAG campaign | Missing | SAG HQ, recruitment, campaign and finale remain in the browser runtime. |
| Kiwimi narrative | Missing | Dialogue depth, trust and archive remain in the browser runtime. |
| Save migration | Partial | Godot ConfigFile schemas and legacy key aliases are migrated. Browser localStorage import is still required. |
| Mobile input | Partial | Touch movement and responsive foundations exist. Real touch regression and performance budgets remain open. |
| Accessibility | Partial | Production accessibility behavior has not yet been ported completely. |
| Pages deployment | Partial | The protected browser runtime deploys from `main`; a production Godot artifact is not deployed yet. |
| WordPress packaging | Partial | The builder can package a Godot export, but the final Godot ZIP path still needs release-level validation. |

## Release rule

`godotReleaseAllowed` may only be set to `true` when every row marked `requiredForGodotRelease` has status `parity`. The CI gate rejects an earlier switch.

A status may only move to `parity` when the implementation and its evidence are committed together. Evidence should normally include an automated flow, browser, migration or packaging test rather than documentation alone.

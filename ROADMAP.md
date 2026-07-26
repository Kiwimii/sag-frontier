# Roadmap

## Checkpoint A — Consolidated source

Status: implemented in the 0.41.1 consolidation branch.

- Move the complete production runtime into `main`
- Freeze `live` as a historical reference
- Deploy Pages and build the WordPress ZIP from repository-owned sources
- Protect the imported content with a file/hash manifest
- Correct locked travel, campaign rewards, fuel/cargo separation and action results
- Run a mobile browser test against the actual current release

## Checkpoint B — Godot architecture

Status: foundation implemented; content migration continues.

- Explicit game-flow states for command, run, upgrade, route, pause and result
- Versioned save service
- Dedicated combat director with mobile entity limits
- Data-owned upgrade and route catalogs
- Small coordinating scene controller instead of one growing monolith

## Checkpoint C — Feature-parity migration

- Port the action roguelite, Command progression and meta progression
- Port Galia star map, stations, economy, ship services and events
- Port factions, SAG HQ, campaign, Kiwimi dialogue and archive
- Add save migrations from every current local-storage namespace
- Maintain a parity matrix so a protected 0.41 feature cannot disappear unnoticed
- Switch production to Godot only after desktop and mobile parity tests pass

## Checkpoint D — Expansion

- Data-driven quests, encounters, bosses and additional ships
- Inventory and equipment components
- Longer campaign arcs and faction consequences
- Optional WordPress accounts, cloud saves and leaderboards
- Server-side validation for shared or competitive systems

## Definition of done

Every checkpoint must end with a playable build, documented changes, reproducible packaging, automated regression coverage and no known blocker that prevents an expedition from starting on supported desktop or mobile browsers.

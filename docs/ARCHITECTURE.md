# Architecture

## One repository source, two controlled runtimes

`main` is the only development and deployment source.

| Runtime | Purpose | Production status |
|---|---|---|
| `web/legacy-041/` | Complete protected browser release and content reference | Current production |
| `godot/` | Modular destination for future gameplay and content | Migration target |

The former `live` branch is retained only as history. GitHub Pages no longer checks out another branch during a `main` deployment.

## Delivery paths

- GitHub Pages validates and publishes `web/legacy-041/`.
- The WordPress builder packages an existing Godot web export when available.
- Without a Godot export, the same protected 0.41.1 runtime is packaged into the plugin.
- Both `[sag_frontier]` and `[sag_voidrunner]` remain supported.

## Godot boundaries

```text
main.gd                 scene coordination and UI wiring
services/game_flow.gd   authoritative screen/run state
services/save_service.gd versioned persistence
services/combat_director.gd spawning, targeting, fire and entity limits
content/frontier_catalog.gd route and upgrade data
player/enemy/projectile focused entity behavior
```

New features should extend these boundaries or add focused services/resources. They should not reintroduce unrelated logic into `main.gd`.

## Protected web runtime

The browser release remains a compatibility layer during migration. Its `release-manifest.json` records every imported file and hash. `npm run check:web` verifies:

- full file inventory and hashes;
- JavaScript syntax;
- all CJS regressions;
- protected story/game feature tokens;
- local HTML asset references.

The runtime may receive critical fixes, but it is not the place for another sequence of patch sprints.

## Engineering rules

- Mobile-first controls and layout are mandatory.
- Save formats are versioned and migrations preserve valid player state.
- UI renders state; core operations return structured results.
- Combat entity counts remain bounded for mobile performance.
- Content definitions stay separate from coordinating code.
- Every release must build reproducibly for Pages and WordPress.

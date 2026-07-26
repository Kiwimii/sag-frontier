# Godot migration

## Decision

Godot 4 remains the future gameplay runtime. Build 0.41.1 remains the production runtime until Godot reaches verified content parity.

This is a strangler migration: the current game stays playable while systems are moved behind explicit Godot services. There is no big-bang rewrite and no implicit removal of existing content.

## Implemented foundation

- `FrontierGameFlow` owns command, running, upgrade, route, pause and result states.
- `FrontierSaveService` persists a schema version and loads existing progress keys.
- `FrontierCombatDirector` owns spawning, target selection, firing and entity limits.
- `FrontierCatalog` owns route and upgrade definitions.
- `main.gd` coordinates these systems and has been reduced from 792 to roughly 640 lines.
- The deterministic full-flow test covers launch, movement, pause, upgrades, five sectors, success, failure, persistence and mobile entity caps.

## Parity gate

Godot becomes production only when automated or documented checks cover:

- action combat and all current loadouts;
- Command progression and contracts;
- Galia map, trade, ship, events, reputation and facilities;
- SAG campaign, faction narrative and Kiwimi depth;
- existing savegame migration;
- keyboard, touch and narrow-screen flows;
- Pages deployment and WordPress packaging.

Until that gate passes, the protected web runtime remains the default plugin payload.

## Export path

```bash
npm run export:web
npm run build
```

The export writes to `wordpress/sag-frontier-game/public/game/`. The plugin builder detects it automatically. If no export exists, `npm run build` uses `web/legacy-041/`.

The web preset remains unthreaded for broad hosting compatibility. Threading should be considered only after measurement demonstrates a clear benefit and hosting headers are controlled.

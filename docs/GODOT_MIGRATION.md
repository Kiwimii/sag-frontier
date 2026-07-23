# Godot Migration

## Decision

S.A.G. Frontier uses Godot 4 as its gameplay runtime and exports to WebAssembly/WebGL for delivery inside WordPress.

The previous monolithic Canvas prototype remains a historical reference only. New gameplay work is implemented in Godot.

## Delivery architecture

1. Godot project lives in `godot/`.
2. `npm run export:web` exports the game into `wordpress/sag-frontier-game/public/game/`.
3. The WordPress plugin exposes `[sag_frontier]` and keeps `[sag_voidrunner]` as a compatibility alias.
4. A guarded iframe loader displays progress and explicit errors instead of leaving users on a black screen.
5. `npm run build` packages the exported game and WordPress wrapper into `dist/sag-frontier-game.zip`.

## Current verification level

The repository validates source syntax and export wiring in CI. It does not yet claim a successful Godot web binary export because the project has not been executed in a Godot 4 build environment through this connector.

Before merging a release, complete these checks locally or in a dedicated Godot CI runner:

- Open `godot/project.godot` in Godot 4.
- Run the main scene.
- Test keyboard movement.
- Test drag movement using device emulation or a touch device.
- Export the `Web` preset.
- Load the generated `index.html` through a web server, not directly from the filesystem.
- Install the generated WordPress ZIP on a staging site.
- Confirm that missing game files produce the visible loader error.

## Browser constraints

The initial web preset deliberately avoids thread support. This reduces hosting requirements because cross-origin isolation headers are not required for the first playable build. Threaded export can be reconsidered after performance profiling.

## Next implementation checkpoint

- Add player health and weapon components.
- Add projectile pooling.
- Add the first enemy archetype and spawner.
- Add a deterministic smoke-test arena.
- Only after that, expand to elites, upgrades and boss phases.

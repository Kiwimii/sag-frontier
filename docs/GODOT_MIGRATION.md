# Godot migration plan

## Decision

S.A.G. Frontier uses Godot 4 as the game runtime and exports to WebAssembly/WebGL for browser delivery. WordPress remains the distribution shell and embeds the exported game.

## Why

The previous Canvas prototype proved the basic loop but concentrated rendering, input, combat and UI in a small number of JavaScript files. That made mobile regressions and black-screen failures difficult to isolate. Godot provides a scene tree, deterministic lifecycle hooks, input abstraction, animation tools and a reproducible web export.

## Target architecture

```text
godot/
  project.godot
  scenes/
    main.tscn
    game/
    entities/
    ui/
  scripts/
    core/
    combat/
    entities/
    ui/
  resources/
    weapons/
    enemies/
    upgrades/
wordpress/
  sag-frontier-loader/
    sag-frontier-loader.php
    assets/
web-export/
```

## Delivery model

1. Godot exports the game into `web-export/`.
2. The WordPress loader plugin serves the exported files from its own directory.
3. `[sag_voidrunner]` renders a responsive container and loads the game.
4. The loader displays a clear fallback error instead of a black screen when required files fail to load.

## Migration stages

### Foundation

- Godot 4 project
- responsive viewport
- keyboard and touch movement
- GL Compatibility renderer
- no external assets required for boot

### Vertical slice

- player health and weapon
- enemy spawner
- four enemy archetypes
- upgrade choice
- boss encounter
- complete run state machine

### WordPress integration

- web export preset
- loader plugin
- versioned cache busting
- boot timeout and error reporting
- installable ZIP artifact

### Production hardening

- mobile performance budget
- save migration
- telemetry hooks with privacy-safe defaults
- browser compatibility matrix

## Non-negotiable acceptance checks

- The game boots without network-loaded art or fonts.
- A failed export produces a visible error message, never an empty black area.
- Touch movement works in portrait and landscape.
- The game pauses when the browser tab is hidden.
- The WordPress shortcode remains backward compatible.

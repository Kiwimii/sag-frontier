# S.A.G. Frontier

Mobile-first browser roguelite and Galia Operations experience for the Star Atlas Germany community.

## Current release

- Production content: **Kiwimi Depth 0.41.1**
- Source of truth: **`main`**
- Protected browser runtime: `web/legacy-041/`
- Future gameplay runtime: modular Godot 4 project in `godot/`
- WordPress shortcodes: `[sag_frontier]` and `[sag_voidrunner]`

Build 0.41 remains fully available while its mechanics and content are migrated into Godot. The former `live` branch is a frozen historical reference and is no longer the deployment source.

## Repository layout

```text
web/legacy-041/             Complete protected 0.41 browser runtime
godot/                      Modular future gameplay runtime
wordpress/sag-frontier-game Installable WordPress wrapper
docs/                       Architecture and migration documentation
tools/                      Build and validation scripts
.github/workflows/          CI, browser regression and deployment
```

## Validation and packaging

Requirements:

- Node.js 20+
- PHP 7.4+
- WordPress 6.0+
- Godot 4.6.3 for local Godot flow tests and exports

Run all source and protected-content checks:

```bash
npm run check
```

Build the installable plugin:

```bash
npm run build
```

The plugin builder packages a local Godot web export when one is present. Otherwise it packages the protected 0.41.1 browser runtime, so the ZIP remains reproducible throughout the migration.

The generated archive is written to `dist/sag-frontier-game.zip`.

## Release rules

- Existing game, story, campaign, progression and community content may not be removed implicitly.
- Changes to the protected runtime require an intentional update of `release-manifest.json`.
- Save data must be versioned and migrated without discarding player inventory.
- A release must pass Node/PHP checks, the Godot full-flow test and the current mobile browser regression.

## License

Code is released under the MIT License. Star Atlas names, marks and associated intellectual property remain with their respective owners. This is a community project and is not an official Star Atlas product.

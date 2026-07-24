# Release blocker: game logic script not loading

Status: reproduced on the exported browser build.

Observed browser/Godot errors:

- `main.gd` parse error at the inferred `base_direction` variable
- `main.gd` parse error at the inferred `distance` variable
- `main.gd` fails to load entirely
- movement InputMap actions are consequently never registered

User impact:

- the command screen renders because the scene file loads
- buttons are not connected to the game logic
- the expedition cannot start

Required release fix:

1. Correct all ambiguous GDScript type inference in the main game script.
2. Add a deterministic headless full-flow test.
3. Make CI fail on script parse/runtime errors.
4. Export and exercise the browser build through the full run loop before deployment.

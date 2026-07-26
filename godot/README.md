# Godot workspace

Open `project.godot` with Godot 4.6.3.

The current vertical slice provides:

- keyboard and drag-based touch movement;
- five-sector expedition flow and route decisions;
- enemy archetypes, auto-fire, XP and run upgrades;
- faction reputation and persistent meta upgrades;
- explicit command/run/upgrade/route/pause/result states;
- versioned persistence and a dedicated combat director;
- GL Compatibility rendering and bounded entities for mobile browsers.

Run the deterministic flow test from the repository root:

```bash
godot --headless --path godot --script res://tests/test_full_flow.gd
```

The complete 0.41.1 browser game remains under `web/legacy-041/` until this runtime reaches content parity.

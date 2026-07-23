# Architecture

## Delivery model

S.A.G. Frontier is developed as a browser game packaged inside a WordPress plugin. WordPress is responsible for page integration, asset loading and future authenticated API endpoints. The game runtime must remain independent from Elementor and should only require a mount element rendered by the shortcode.

## Runtime boundaries

The target runtime is split into these layers:

```text
bootstrap     WordPress-provided configuration and mount lifecycle
core          clock, fixed-step loop, scene lifecycle and events
input         keyboard, pointer and virtual controls
render        canvas sizing, camera and drawing
entities      player, enemies, projectiles and pickups
combat        weapons, damage, effects and encounters
content       factions, enemy definitions and upgrades
ui            HUD, menus, tutorial and upgrade selection
save          versioned local persistence and migrations
```

Sprint 1 may temporarily retain a monolithic JavaScript file while tests and interfaces are established. Sprint 2 will extract combat behavior behind stable modules instead of adding more global state.

## Engineering rules

- Mobile-first layout and pointer input are mandatory.
- The canvas backing resolution must account for device pixel ratio while limiting excessive resolution on weak devices.
- Gameplay advances on a fixed timestep; rendering may interpolate or run independently.
- Reusable projectiles, particles and enemies should use pools where allocation pressure becomes measurable.
- Save data must include a schema version and tolerate corrupt or outdated local storage.
- WordPress globals are read only during bootstrap and never throughout gameplay logic.
- Every release must be buildable into an installable plugin ZIP from the repository.

## Supported baseline

- Current Chrome, Edge, Firefox and Safari
- Current Android Chrome
- Current iOS Safari
- WordPress 6.0+
- PHP 7.4+

## Sprint 2 design direction

Combat is organized around data-driven definitions:

- weapons specify cadence, projectile behavior and damage model;
- enemies specify movement behavior, attacks and encounter weight;
- encounters control spawning and completion;
- bosses use explicit phases with readable telegraphs;
- run upgrades modify player stats through a constrained modifier system.

This avoids hard-coding every new weapon or enemy directly into the main loop.

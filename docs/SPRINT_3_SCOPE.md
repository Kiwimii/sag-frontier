# Sprint 3 — The Fractured Relay

## Sprint objective

Turn the existing arcade survival loop into the first playable vertical slice of the intended roguelite. A complete expedition must now contain route decisions, persistent account progress and a short faction-driven story.

## Scope

### 1. Roguelite sector route

- Replace the endless linear difficulty ramp with five discrete combat sectors.
- End each sector with a route screen containing three randomized choices.
- Give every route a visible faction, event type, risk multiplier and reward.
- Carry the selected route's combat modifier and reward into the following sector.
- Finish the expedition after the fifth sector with a success state and epilogue.

### 2. Persistent meta progression

- Award Frontier Data after every expedition, including failed runs.
- Persist Frontier Data, lifetime data, completed runs, high score and permanent upgrade levels in `user://frontier_save.cfg`.
- Add three permanent upgrade tracks to the command screen:
  - Reinforced Hull
  - Calibrated Weapons
  - Vector Control
- Apply purchased upgrades to every future expedition.
- Derive and display a persistent Command Rank from lifetime data.

### 3. Factions, events and story

- Add route events for MUD, ONI, Ustur, S.A.G. and the hostile Null Cartel signal.
- Track MUD, ONI and Ustur reputation during each run.
- Add command transmissions and event outcomes during the expedition.
- Resolve the successful-run epilogue from the faction most strongly supported by the player.
- Establish the first story premise: recover five relay signatures before the Null Cartel reaches the Frontier Core.

### 4. Presentation and UX

- Rebuild the command, route and result panels in a consistent science-fiction visual language.
- Expose sector progress, jump timer and faction reputation in the combat HUD.
- Keep all decisions usable in the fixed 1280 × 720 mobile-landscape viewport.
- Preserve keyboard, touch movement, pause handling and the existing level-up upgrade flow.

## Explicitly out of scope

- Cloud saves or WordPress account synchronization
- A fully authored branching campaign
- Animated map traversal
- New art assets, audio or voice acting
- Shops, inventory, equipment drops or multiple playable ships
- Balance finalization

These belong in later sprints. Adding them now would broaden the architecture before the new run loop has been validated.

## Acceptance criteria

1. Starting an expedition always enters sector 1 without a black screen.
2. Combat stops after the sector timer expires and presents exactly three route choices.
3. Selecting a route applies its reward, risk and faction reputation, then starts the next sector.
4. The fifth completed sector ends the run successfully.
5. Death in any sector still awards at least one Frontier Data.
6. Frontier Data and purchased permanent upgrades survive a browser restart.
7. Permanent upgrades are applied when a new expedition launches.
8. The game-over screen reports sectors cleared, data earned, account data and Command Rank.
9. The successful epilogue changes according to the dominant supported faction.
10. Existing XP level-ups, pause controls, desktop movement and mobile drag movement remain functional.

## Follow-up validation

The next sprint should not add another major system immediately. First measure:

- average sector reached
- route selection distribution
- Frontier Data earned per run
- permanent upgrade purchase pacing
- mobile panel readability
- whether players understand risk versus reward without external explanation

# S.A.G. Frontier

Mobile-first browser roguelite for the Star Atlas Germany community.

The game is delivered as a standalone WordPress plugin and embedded with the shortcode:

```text
[sag_voidrunner]
```

## Current status

- `main`: stable Sprint 1 baseline
- Sprint 2: combat systems, enemy archetypes, bosses and run upgrades

## Project goals

- Reliable expedition loop on desktop and mobile
- Short, replayable roguelite runs
- MUD, ONI and Ustur faction identities
- Kiwimi tutorial and mission guidance
- Persistent progression without requiring an account
- Clean path toward WordPress users, cloud saves and leaderboards

## Repository layout

```text
wordpress/sag-voidrunner/   Installable WordPress plugin source
docs/                       Architecture and design documentation
tools/                      Build and validation scripts
.github/workflows/          Automated checks
```

## Development

Requirements:

- PHP 7.4+
- Node.js 20+
- WordPress 6.0+

Run local checks:

```bash
npm run check
```

Build the installable plugin ZIP:

```bash
npm run build
```

The generated archive is written to `dist/sag-voidrunner.zip`.

## License

Code is released under the MIT License. Star Atlas names, marks and associated intellectual property remain with their respective owners. This is a community project and is not an official Star Atlas product.

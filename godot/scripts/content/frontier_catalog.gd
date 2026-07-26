class_name FrontierCatalog
extends RefCounted

const UPGRADE_CATALOG: Array[Dictionary] = [
	{"id": "rapid_fire", "title": "OVERCLOCKED ARRAY", "description": "Weapons fire 18% faster."},
	{"id": "heavy_laser", "title": "HEAVY LASER", "description": "+1 projectile damage."},
	{"id": "thrusters", "title": "VECTOR THRUSTERS", "description": "+45 movement speed."},
	{"id": "multishot", "title": "SPLIT LANCE", "description": "+1 simultaneous projectile."},
	{"id": "plating", "title": "REACTOR PLATING", "description": "+20 maximum hull and repair 20."},
	{"id": "accelerator", "title": "MAGNETIC ACCELERATOR", "description": "+140 projectile speed."},
	{"id": "repair", "title": "FIELD REPAIRS", "description": "Restore 35 hull immediately."}
]

const ROUTE_CATALOG: Array[Dictionary] = [
	{
		"id": "mud_convoy",
		"faction": "MUD",
		"kind": "DISTRESS",
		"title": "BROKEN CONVOY",
		"description": "A MUD civilian convoy is pinned inside a debris field.",
		"reward": "+18 max hull, full repair, +60 score",
		"risk": 1.08,
		"effect": "mud_hull",
		"result": "The convoy survives. MUD engineers reinforce your outer plating before you depart."
	},
	{
		"id": "mud_salvage",
		"faction": "MUD",
		"kind": "SALVAGE",
		"title": "IRON HARVEST",
		"description": "A stripped refinery still broadcasts an obsolete S.A.G. claim code.",
		"reward": "+2 Frontier Data at run end, +90 score",
		"risk": 1.14,
		"effect": "mud_salvage",
		"result": "The refinery yields intact survey cores. Command marks them for permanent research."
	},
	{
		"id": "oni_signal",
		"faction": "ONI",
		"kind": "ANOMALY",
		"title": "LIVING SIGNAL",
		"description": "An ONI chorus is trapped inside a signal that should not be alive.",
		"reward": "8% faster fire rate, +80 projectile speed",
		"risk": 1.12,
		"effect": "oni_precision",
		"result": "The chorus aligns with your targeting lattice. Every shot now follows the same impossible rhythm."
	},
	{
		"id": "oni_garden",
		"faction": "ONI",
		"kind": "RESCUE",
		"title": "GLASS GARDEN",
		"description": "A drifting ONI bio-vault is losing atmosphere around its seed archives.",
		"reward": "Repair 30 hull, +1 projectile count",
		"risk": 1.18,
		"effect": "oni_flux",
		"result": "The archive survives. Its caretakers gift you a refractive weapon node grown from living crystal."
	},
	{
		"id": "ustur_forge",
		"faction": "USTUR",
		"kind": "PACT",
		"title": "SILENT FORGE",
		"description": "A dormant Ustur forge offers one exchange: power for proof of purpose.",
		"reward": "+1 projectile damage, +75 score",
		"risk": 1.20,
		"effect": "ustur_weapons",
		"result": "The forge accepts your combat record. A cold new emitter locks into the weapon spine."
	},
	{
		"id": "ustur_clock",
		"faction": "USTUR",
		"kind": "PURSUIT",
		"title": "CLOCKWORK HUNT",
		"description": "Ustur scouts request a joint strike against a Null Cartel relay swarm.",
		"reward": "12% faster fire rate, +125 score",
		"risk": 1.28,
		"effect": "ustur_overclock",
		"result": "The relay swarm collapses. Ustur timing code pushes your weapon cycle past safe doctrine."
	},
	{
		"id": "frontier_cache",
		"faction": "S.A.G.",
		"kind": "CACHE",
		"title": "OLD FRONTIER CACHE",
		"description": "A forgotten S.A.G. beacon opens only for a current expedition signature.",
		"reward": "Repair 25 hull, +150 score",
		"risk": 1.05,
		"effect": "frontier_cache",
		"result": "Inside: spare cells, field notes and one message — 'The frontier remembers who returns.'"
	},
	{
		"id": "null_signal",
		"faction": "UNKNOWN",
		"kind": "BLACK SIGNAL",
		"title": "THE HOLLOW STAR",
		"description": "A forbidden route cuts directly through the Null Cartel sensor lattice.",
		"reward": "+1 damage, +3 Frontier Data at run end",
		"risk": 1.38,
		"effect": "null_signal",
		"result": "You cross unseen, but something crosses with you. The recovered signal contains coordinates to the core."
	}
]

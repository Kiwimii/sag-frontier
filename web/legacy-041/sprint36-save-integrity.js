(() => {
  "use strict";
  const G = window.SAGGalia;
  if (!G) return;
  const KEY = "sag-galia-035",
    BACKUP = "sag-galia-035-backup";
  const finite = (v, f = 0, min = 0, max = 999999) =>
    Number.isFinite(Number(v)) ? Math.max(min, Math.min(max, Number(v))) : f;
  function sanitize() {
    const s = G.state;
    if (!s || typeof s !== "object") return false;
    s.version = 41;
    s.credits = finite(s.credits, 1200);
    s.location = typeof s.location === "string" ? s.location : "aurelia";
    s.discovered = Array.isArray(s.discovered)
      ? [...new Set(s.discovered.filter((x) => typeof x === "string"))]
      : ["aurelia", "cinder"];
    s.visited = Array.isArray(s.visited)
      ? [...new Set(s.visited.filter((x) => typeof x === "string"))]
      : [];
    const validSectors = new Set(G.C.sectors.map((sector) => sector.id));
    if (validSectors.size) {
      if (!validSectors.has(s.location)) s.location = "aurelia";
      s.discovered = s.discovered.filter((id) => validSectors.has(id));
      s.visited = s.visited.filter((id) => validSectors.has(id));
    }
    for (const requiredSector of ["aurelia", "cinder", s.location]) {
      if (!s.discovered.includes(requiredSector))
        s.discovered.push(requiredSector);
    }
    s.facilities = Array.isArray(s.facilities)
      ? [...new Set(s.facilities.filter((x) => typeof x === "string"))]
      : ["hangar"];
    if (!s.facilities.includes("hangar")) s.facilities.unshift("hangar");
    s.log = Array.isArray(s.log)
      ? s.log.filter((x) => typeof x === "string").slice(0, 60)
      : [];
    s.flags = s.flags && typeof s.flags === "object" ? s.flags : {};
    s.npcTrust = s.npcTrust && typeof s.npcTrust === "object" ? s.npcTrust : {};
    s.cargo = s.cargo && typeof s.cargo === "object" ? s.cargo : {};
    if (Object.prototype.hasOwnProperty.call(s.cargo, "fuel")) {
      s.cargo.fuel_cells =
        finite(s.cargo.fuel_cells, 0, 0, 9999) +
        finite(s.cargo.fuel, 0, 0, 9999);
    }
    delete s.cargo.fuel;
    for (const k of [
      "fuel_cells",
      "ore",
      "data",
      "food",
      "parts",
      "artifact",
    ])
      s.cargo[k] = Math.floor(finite(s.cargo[k], 0, 0, 9999));
    s.ship = s.ship && typeof s.ship === "object" ? s.ship : {};
    const shipDefaults = {
      name: "SAG Pathfinder",
      hull: 100,
      fuel: 10,
      cargo: 12,
      scanner: 1,
      engine: 1,
      shield: 1,
      ai: 0,
      stealth: 0,
      drones: 0,
    };
    for (const [k, v] of Object.entries(shipDefaults)) {
      if (k === "name")
        s.ship[k] =
          typeof s.ship[k] === "string" && s.ship[k].trim()
            ? s.ship[k].slice(0, 40)
            : v;
      else
        s.ship[k] = Math.floor(
          finite(s.ship[k], v, 0, k === "hull" ? 100 : 999),
        );
    }
    s.ship.fuel = Math.min(
      12 + Math.max(0, s.ship.engine - 1) * 2,
      s.ship.fuel,
    );
    s.reputation =
      s.reputation && typeof s.reputation === "object" ? s.reputation : {};
    for (const k of ["SAG", "MUD", "ONI", "USTUR", "COUNCIL", "NEUTRAL"])
      s.reputation[k] = Math.round(finite(s.reputation[k], 0, -100, 100));
    s.campaignStep = Math.floor(finite(s.campaignStep, 0, 0, 999));
    return true;
  }
  function backup() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) localStorage.setItem(BACKUP, raw);
    } catch {}
  }
  const originalSave = G.save.bind(G),
    originalLoad = G.load.bind(G);
  G.load = function () {
    const state = originalLoad();
    sanitize();
    return state;
  };
  G.save = function () {
    sanitize();
    backup();
    return originalSave();
  };
  window.SAGGaliaGuard = {
    sanitize,
    backup,
    restore() {
      try {
        const raw = localStorage.getItem(BACKUP);
        if (!raw) return false;
        localStorage.setItem(KEY, raw);
        originalLoad();
        sanitize();
        originalSave();
        return true;
      } catch {
        return false;
      }
    },
    export() {
      sanitize();
      return JSON.stringify(G.state, null, 2);
    },
  };
  sanitize();
  G.save();
})();

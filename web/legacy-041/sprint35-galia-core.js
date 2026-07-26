(() => {
  "use strict";
  const KEY = "sag-galia-035";
  const C = {
    sectors: [],
    stations: [],
    npcs: [],
    goods: [],
    ships: [],
    events: [],
    factions: [],
    facilities: [],
    campaign: [],
  };
  const defaults = {
    version: 35,
    credits: 1200,
    location: "aurelia",
    discovered: ["aurelia", "cinder"],
    visited: [],
    cargo: {
      fuel_cells: 0,
      ore: 0,
      data: 0,
      food: 2,
      parts: 1,
      artifact: 0,
    },
    ship: {
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
    },
    reputation: { SAG: 10, MUD: 0, ONI: 0, USTUR: 0, COUNCIL: 0, NEUTRAL: 0 },
    npcTrust: {},
    facilities: ["hangar"],
    campaignStep: 0,
    flags: {},
    log: ["Galia Operations 0.35 initialisiert."],
  };
  let state;
  const merge = (a, b) => {
    const out = { ...a, ...b };
    for (const k of ["cargo", "ship", "reputation", "npcTrust", "flags"])
      out[k] = { ...(a[k] || {}), ...(b?.[k] || {}) };
    return out;
  };
  function load() {
    try {
      state = merge(defaults, JSON.parse(localStorage.getItem(KEY) || "{}"));
    } catch {
      state = structuredClone(defaults);
    }
    return state;
  }
  function save() {
    localStorage.setItem(KEY, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent("sag:galia-save", { detail: state }));
  }
  function log(text) {
    state.log.unshift(
      `${new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })} — ${text}`,
    );
    state.log = state.log.slice(0, 60);
    save();
  }
  function register(type, items) {
    if (!Array.isArray(C[type]))
      throw new Error(`Unknown Galia content ${type}`);
    C[type].push(...items);
  }
  function capacity() {
    const cargoGoods = new Set(C.goods.map((good) => good.id));
    return Object.entries(state.cargo).reduce(
      (total, [goodId, amount]) =>
        total +
        (cargoGoods.has(goodId)
          ? Math.max(0, Math.floor(Number(amount) || 0))
          : 0),
      0,
    );
  }
  function maxFuel() {
    return 12 + Math.max(0, (Number(state.ship.engine) || 1) - 1) * 2;
  }
  function discoverLinkedSectors(sector) {
    for (const linkedId of sector.links || []) {
      if (!state.discovered.includes(linkedId)) state.discovered.push(linkedId);
    }
  }
  function applyEffects(effects = {}) {
    for (const [key, rawValue] of Object.entries(effects)) {
      const value = Number(rawValue);
      if (key === "credits" && Number.isFinite(value)) {
        state.credits = Math.max(0, state.credits + value);
      } else if (key === "fuel" && Number.isFinite(value)) {
        state.ship.fuel = Math.max(
          0,
          Math.min(maxFuel(), state.ship.fuel + value),
        );
      } else if (key.startsWith("rep:") && Number.isFinite(value)) {
        const faction = key.split(":")[1];
        state.reputation[faction] = (state.reputation[faction] || 0) + value;
      } else {
        state.flags[key] = rawValue;
      }
    }
  }
  function travel(id) {
    const target = C.sectors.find((x) => x.id === id);
    if (!target) return { ok: false, msg: "Sektor unbekannt." };
    if (id === state.location)
      return { ok: false, msg: "Du bist bereits in diesem Sektor." };
    if (!state.discovered.includes(id))
      return {
        ok: false,
        msg: "Dieser Sektor ist noch nicht über eine sichere Route entdeckt.",
      };
    const cost = Math.max(1, target.distance - (state.ship.engine - 1));
    if (state.ship.fuel < cost)
      return { ok: false, msg: `${cost} Treibstoff benötigt.` };
    state.ship.fuel -= cost;
    state.location = id;
    if (!state.discovered.includes(id)) state.discovered.push(id);
    if (!state.visited.includes(id)) state.visited.push(id);
    discoverLinkedSectors(target);
    state.reputation.SAG += 1;
    log(`Kurs auf ${target.name}. Treibstoff -${cost}.`);
    return { ok: true, msg: `${target.name} erreicht.` };
  }
  function trade(goodId, dir) {
    const good = C.goods.find((x) => x.id === goodId);
    if (!good) return { ok: false, msg: "Ware unbekannt." };
    if (!["buy", "sell"].includes(dir))
      return { ok: false, msg: "Ungültige Handelsrichtung." };
    const sector = C.sectors.find((x) => x.id === state.location);
    const price = Math.max(
      1,
      Math.round(good.base * (sector?.market?.[goodId] || 1)),
    );
    if (dir === "buy") {
      if (state.credits < price) {
        const msg = "Transaktion abgelehnt: zu wenig Credits.";
        log(msg);
        return { ok: false, msg };
      }
      if (capacity() >= state.ship.cargo) {
        const msg = "Transaktion abgelehnt: Frachtraum voll.";
        log(msg);
        return { ok: false, msg };
      }
      state.credits -= price;
      state.cargo[goodId] = (state.cargo[goodId] || 0) + 1;
      const msg = `${good.name} gekauft: ${price} C.`;
      log(msg);
      return { ok: true, msg };
    } else {
      if ((state.cargo[goodId] || 0) < 1) {
        const msg = `${good.name} nicht im Frachtraum.`;
        log(msg);
        return { ok: false, msg };
      }
      state.cargo[goodId] -= 1;
      state.credits += price;
      const msg = `${good.name} verkauft: ${price} C.`;
      log(msg);
      return { ok: true, msg };
    }
  }
  function upgrade(key) {
    const level = state.ship[key] || 0,
      cost = 250 * (level + 1);
    if (state.credits < cost) {
      const msg = `Upgrade ${key}: ${cost} C benötigt.`;
      log(msg);
      return { ok: false, msg };
    }
    state.credits -= cost;
    state.ship[key] = level + 1;
    if (key === "cargo") state.ship.cargo += 4;
    const msg = `${key.toUpperCase()} auf Stufe ${level + 1} erweitert.`;
    log(msg);
    return { ok: true, msg };
  }
  function encounter(id, choice) {
    const ev = C.events.find((x) => x.id === id);
    const option = ev?.choices?.[choice];
    if (!option) return { ok: false, msg: "Ereignisoption nicht verfügbar." };
    applyEffects(option.effect);
    log(option.result);
    return { ok: true, msg: option.result };
  }
  function build(id) {
    const f = C.facilities.find((x) => x.id === id);
    if (!f) return { ok: false, msg: "Ausbau unbekannt." };
    if (state.facilities.includes(id))
      return { ok: false, msg: `${f.name} ist bereits aktiv.` };
    const ok = Object.entries(f.cost).every(
      ([k, v]) => (k === "credits" ? state.credits : state.cargo[k] || 0) >= v,
    );
    if (!ok) {
      const msg = `${f.name}: Ressourcen fehlen.`;
      log(msg);
      return { ok: false, msg };
    }
    for (const [k, v] of Object.entries(f.cost)) {
      if (k === "credits") state.credits -= v;
      else state.cargo[k] -= v;
    }
    state.facilities.push(id);
    state.reputation.SAG += f.rep || 2;
    const msg = `${f.name} im SAG HQ aktiviert.`;
    log(msg);
    return { ok: true, msg };
  }
  function chooseCampaign(index) {
    const scene = C.campaign[state.campaignStep],
      choice = scene?.choices?.[index];
    if (!choice)
      return { ok: false, msg: "Entscheidung nicht verfügbar." };
    applyEffects(choice.effect);
    state.campaignStep = Math.min(C.campaign.length, state.campaignStep + 1);
    log(choice.result);
    return { ok: true, msg: choice.result };
  }
  window.SAGGalia = {
    C,
    get state() {
      return state;
    },
    load,
    save,
    log,
    register,
    travel,
    trade,
    upgrade,
    encounter,
    build,
    chooseCampaign,
    capacity,
    maxFuel,
  };
  load();
})();

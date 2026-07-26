const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const runtimeFiles = [
  "sprint35-galia-core.js",
  "sprint26-star-map.js",
  "sprint29-economy.js",
  "sprint35-campaign.js",
  "sprint36-save-integrity.js",
  "sprint37-action-safety.js",
  "sprint38-ship-services.js",
];

function boot(savedState) {
  const store = new Map();
  if (savedState) store.set("sag-galia-035", JSON.stringify(savedState));
  const localStorage = {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, String(value)),
  };
  const context = {
    window: { dispatchEvent() {}, addEventListener() {} },
    localStorage,
    CustomEvent: function CustomEvent() {},
    structuredClone: global.structuredClone,
    setTimeout(callback) {
      callback();
      return 0;
    },
    console,
    Date,
    Math,
    JSON,
    Number,
    Object,
    Array,
    String,
    Set,
  };
  context.window.window = context.window;
  vm.createContext(context);
  for (const file of runtimeFiles) {
    vm.runInContext(fs.readFileSync(file, "utf8"), context, { filename: file });
  }
  return { G: context.window.SAGGalia, store };
}

{
  const { G } = boot();
  assert.equal(G.capacity(), 3, "a new ship must start with 3/12 cargo");
  assert.equal(G.state.cargo.fuel_cells, 0);
  assert.equal(G.state.ship.fuel, 10, "ship fuel remains a separate tank");

  const lockedFuel = G.state.ship.fuel;
  const lockedLocation = G.state.location;
  const locked = G.travel("jorvik");
  assert.equal(locked.ok, false, "undiscovered sectors must reject travel");
  assert.equal(G.state.ship.fuel, lockedFuel);
  assert.equal(G.state.location, lockedLocation);

  const firstRoute = G.travel("cinder");
  assert.equal(firstRoute.ok, true);
  assert.ok(
    G.state.discovered.includes("saand"),
    "arriving in Cinder must reveal its linked route",
  );

  G.state.campaignStep = 3;
  const creditsBefore = G.state.credits;
  const campaign = G.chooseCampaign(1);
  assert.equal(campaign.ok, true);
  assert.equal(
    G.state.credits,
    creditsBefore + 400,
    "campaign credit rewards must affect the credit balance",
  );
  assert.equal(
    Object.hasOwn(G.state.flags, "credits"),
    false,
    "credits must never be stored as a narrative flag",
  );

  G.state.credits = 0;
  const rejectedTrade = G.trade("ore", "buy");
  assert.equal(
    rejectedTrade.ok,
    false,
    "the action guard must preserve failed transaction results",
  );
}

{
  const { G } = boot({
    credits: 1200,
    location: "aurelia",
    cargo: { fuel: 8, ore: 1 },
    ship: { fuel: 10, cargo: 12, engine: 1, hull: 100 },
  });
  assert.equal(G.state.cargo.fuel, undefined);
  assert.equal(
    G.state.cargo.fuel_cells,
    8,
    "legacy fuel cargo must be migrated without losing player inventory",
  );
}

{
  const kiwimiSource = fs.readFileSync("sprint41-kiwimi-depth.js", "utf8");
  assert.match(
    kiwimiSource,
    /document\.readyState === 'loading'/,
    "the Kiwimi UI must support scripts injected after DOMContentLoaded",
  );
}

console.log("Sprint 41 state regression passed");

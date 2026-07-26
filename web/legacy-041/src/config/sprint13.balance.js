(() => {
  'use strict';

  const deepFreeze = value => {
    if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
    Object.freeze(value);
    Object.values(value).forEach(deepFreeze);
    return value;
  };

  window.SAG13_CONFIG = deepFreeze({
    version: 13,
    title: 'S.A.G. FRONTIER // OUTER FRONTIER 0.13',

    world: {
      chunkSize: 900,
      activeRadius: 2,
      cacheLimit: 180,
      safeOriginRadius: 285,
      stationChance: 0.10,
      stationSafeRadius: 340,
      discoveryRange: 520,
      radarRange: 1500
    },

    performance: {
      desktopVisualScale: 1,
      reducedVisualScale: 0.65,
      reducedWidth: 720,
      lowCoreThreshold: 4,
      hudInterval: 0.10,
      maxParticlesDesktop: 460,
      maxParticlesReduced: 220,
      maxEnemyBullets: 260,
      maxPickups: 90,
      maxFields: 36
    },

    timing: {
      spawnGrace: 3.5,
      majorUpgradeMinimum: 75,
      toastDuration: 2.15,
      scanDuration: 2.4,
      autoPauseOnHidden: true
    },

    enemyLimits: {
      explorer: 28,
      operation: 36,
      veteran: 44
    },

    rewards: {
      minimumRunCredits: 55,
      minimumPilotXp: 35,
      explorationCreditFactor: 0.032,
      explorationCreditCap: 260,
      discoveryScore: 75,
      stationScore: 220,
      asteroidScore: 180,
      stationCreditMin: 95,
      stationCreditRange: 66,
      asteroidCreditMin: 45,
      asteroidCreditRange: 46,
      techPityRuns: 3
    },

    outerFrontier: {
      tiers: [
        { id: 'frontier', min: 0, labelDe: 'GRENZRAUM', labelEn: 'FRINGE', reward: 1.00, danger: 1.00 },
        { id: 'deep', min: 1500, labelDe: 'TIEFER RAUM', labelEn: 'DEEP SPACE', reward: 1.18, danger: 1.13 },
        { id: 'void', min: 3200, labelDe: 'LEERE', labelEn: 'VOID', reward: 1.42, danger: 1.30 },
        { id: 'abyss', min: 5500, labelDe: 'ABGRUND', labelEn: 'ABYSS', reward: 1.78, danger: 1.55 }
      ],
      discoveryChances: {
        station: [0.10, 0.09, 0.07, 0.05],
        tradePost: [0.00, 0.075, 0.065, 0.055],
        beacon: [0.00, 0.085, 0.065, 0.050],
        vault: [0.00, 0.00, 0.060, 0.070],
        anomaly: [0.00, 0.00, 0.060, 0.075],
        rift: [0.00, 0.00, 0.00, 0.060]
      },
      discoveryRewards: {
        tradePost: 120,
        beacon: 170,
        vault: 430,
        anomaly: 340,
        rift: 520
      },
      scanSeconds: {
        station: 3.0,
        tradePost: 1.25,
        beacon: 2.3,
        vault: 3.6,
        anomaly: 2.8,
        rift: 2.4
      },
      tradeBuffs: {
        overclock: { cost: 90, labelDe: 'WAFFEN-OVERCLOCK', labelEn: 'WEAPON OVERCLOCK', descDe: '+15 % Schaden, +14 % Feuerrate', descEn: '+15% damage, +14% fire rate' },
        aegis: { cost: 80, labelDe: 'AEGIS-HARMONISIERUNG', labelEn: 'AEGIS HARMONIZATION', descDe: '+40 Schild und vollständige Ladung', descEn: '+40 shield and full recharge' },
        nanites: { cost: 75, labelDe: 'NANITEN-PAKET', labelEn: 'NANITE PACKAGE', descDe: '+25 maximale Hülle und Reparatur', descEn: '+25 maximum hull and repair' },
        thrusters: { cost: 85, labelDe: 'VEKTORSCHUB', labelEn: 'VECTOR THRUST', descDe: '+14 % Geschwindigkeit, -18 % Dash-Cooldown', descEn: '+14% speed, -18% dash cooldown' },
        salvage: { cost: 105, labelDe: 'BERGUNGSVERTRAG', labelEn: 'SALVAGE CONTRACT', descDe: '+25 % Credits und +15 % Fundchance', descEn: '+25% credits and +15% drop chance' },
        hunter: { cost: 120, labelDe: 'BOSSJÄGER-PROTOKOLL', labelEn: 'BOSS HUNTER PROTOCOL', descDe: '+28 % Schaden gegen Bosse', descEn: '+28% damage against bosses' }
      },
      enemyUnlocks: {
        drone: 0,
        scout: 0,
        rusher: 0,
        tank: 0,
        gunner: 0,
        hunter: 1,
        sniper: 1,
        miner: 2,
        sentinel: 2,
        phase: 3
      },
      bosses: [
        { id: 'warden', minTier: 0, label: 'FRONTIER WARDEN', hp: 1.00, speed: 1.00, damage: 1.00, reward: 1.00 },
        { id: 'siege', minTier: 1, label: 'SIEGE WARDEN', hp: 1.42, speed: 0.72, damage: 1.25, reward: 1.30 },
        { id: 'carrier', minTier: 2, label: 'CARRIER PRIME', hp: 1.18, speed: 0.88, damage: 1.05, reward: 1.45 },
        { id: 'hunter', minTier: 2, label: 'VOID HUNTER', hp: 0.94, speed: 1.58, damage: 1.38, reward: 1.50 },
        { id: 'architect', minTier: 3, label: 'RIFT ARCHITECT', hp: 1.34, speed: 0.92, damage: 1.32, reward: 1.80 }
      ]
    },

    accessibility: {
      screenShakeDefault: true,
      autoPauseDefault: true,
      radarDefault: true,
      canvasKeyboardFocus: true
    }
  });
})();

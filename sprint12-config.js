(() => {
  'use strict';

  const deepFreeze = value => {
    if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
    Object.freeze(value);
    Object.values(value).forEach(deepFreeze);
    return value;
  };

  window.SAG12_CONFIG = deepFreeze({
    version: 12,
    title: 'S.A.G. FRONTIER // MODULAR DEEP SPACE 0.12',

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
      explorationCreditFactor: 0.025,
      explorationCreditCap: 180,
      discoveryScore: 75,
      stationScore: 220,
      asteroidScore: 180,
      stationCreditMin: 95,
      stationCreditRange: 66,
      asteroidCreditMin: 45,
      asteroidCreditRange: 46,
      techPityRuns: 3
    },

    accessibility: {
      screenShakeDefault: true,
      autoPauseDefault: true,
      radarDefault: true,
      canvasKeyboardFocus: true
    }
  });
})();

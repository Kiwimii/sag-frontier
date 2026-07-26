(() => {
  'use strict';

  const $ = id => document.getElementById(id);
  const setText = (id, value) => { const node = $(id); if (node && node.textContent !== value) node.textContent = value; };
  const INTRO_KEY = 'sag-frontier-intro-seen-v06';
  const TUTORIAL_KEY = 'sag-frontier-kiwimi-tutorial-v2';
  const VERSION_TITLE = document.body?.dataset.versionTitle || 'S.A.G. FRONTIER // KIWIMI PROTOCOL 0.6';

  const safeStorage = {
    get(key) { try { return localStorage.getItem(key); } catch { return null; } },
    set(key, value) { try { localStorage.setItem(key, value); } catch {} }
  };

  const assetManifest = {
    kiwimi: ['s06-kiwimi-0.txt','s06-kiwimi-1.txt','s06-kiwimi-2.txt','s06-kiwimi-3.txt'],
    logo: ['s06-sag-logo.txt'],
    banner: ['s06-sag-banner-0.txt','s06-sag-banner-1.txt','s06-sag-banner-2.txt','s06-sag-banner-3.txt','s06-sag-banner-4.txt']
  };

  async function loadBrandAssets() {
    try {
      const load = async files => (await Promise.all(files.map(async path => {
        const response = await fetch(path, { cache: 'force-cache' });
        if (!response.ok) throw new Error(`${path} ${response.status}`);
        return response.text();
      }))).join('').replace(/\s/g, '');
      const [kiwimi, logo, banner] = await Promise.all([load(assetManifest.kiwimi), load(assetManifest.logo), load(assetManifest.banner)]);
      const root = document.documentElement.style;
      root.setProperty('--kiwimi', `url("data:image/webp;base64,${kiwimi}")`);
      root.setProperty('--sag-logo', `url("data:image/webp;base64,${logo}")`);
      root.setProperty('--sag-banner', `url("data:image/webp;base64,${banner}")`);
      document.documentElement.classList.add('brand-assets-ready');
    } catch (error) {
      console.error('S.A.G. branding assets could not be loaded', error);
      document.documentElement.classList.add('brand-assets-failed');
    }
  }

  const copy = {
    de: {
      introLead: 'Eine Expedition der Star Atlas Germany Community.', enter: 'Hangar betreten', skip: 'Intro überspringen', replay: 'Intro erneut abspielen',
      introTitle: 'Willkommen, Pilot.', introText: 'Ich führe dich durch den Hangar, deine Systeme und die Frontier.',
      deploymentHeading: 'Bereit für die Frontier', weaponsHeading: 'Waffen konfigurieren', shipsHeading: 'Schiff auswählen', modulesHeading: 'Module installieren', dataHeading: 'Spielstand sichern',
      contexts: { deployment:'HANGARPROTOKOLL', weapons:'ARSENALANALYSE', ships:'FLOTTENBERATUNG', modules:'SYSTEMDIAGNOSE', data:'DATENARCHIV' },
      messages: {
        deployment:['Willkommen im Hangar, Pilot.','Hier stellst du dein Schiff, deine Waffen und deine Systeme für die nächste Expedition zusammen.'],
        weapons:['Waffen bestimmen deinen Kampfstil.','Der Impulslaser ist schnell, die Railgun durchschlägt Panzerung und Raketen kontrollieren Gruppen.'],
        ships:['Jedes Schiff verlangt eine andere Taktik.','Prüfe Hülle, Geschwindigkeit und Schild. Die beste Wahl ist die, die zu deinem Loadout passt.'],
        modules:['Module verändern deine Expedition dauerhaft.','Installiere gezielt. Ein guter Pilot verstärkt nicht alles, sondern baut eine klare Stärke aus.'],
        data:['Dein Fortschritt gehört dir.','Exportiere deinen Spielstand regelmäßig, bevor du Browserdaten löschst oder das Gerät wechselst.'],
        equipped:['Loadout aktualisiert.','Die Ausrüstung ist registriert und für den nächsten Einsatz freigegeben.'],
        purchased:['Freischaltung bestätigt.','Neue Systeme erweitern deine taktischen Möglichkeiten. Prüfe das Loadout vor dem Start.'],
        launch:['Alle Systeme grün.','Bleib beweglich, halte die Kombo und setze EMP nicht zu früh ein. Ich bleibe auf dem Com-Link.'],
        gameover:['Signal wiederhergestellt.','Die Kampfdaten wurden gesichert. Werte den Einsatz aus, verbessere dein Loadout und starte erneut.']
      },
      tutorialTitle:'ERSTE SCHRITTE', steps:['Schiffsdaten prüfen','Waffe prüfen oder ausrüsten','Modul prüfen oder installieren','Expedition starten'],
      quote:'„Wissen ist dein Kompass. Entschlossenheit ist dein Antrieb.“',
      comms:{ launch:'Systeme synchronisiert. Die Frontier ist offen.', wave:'Neue Kampfphase erkannt:', low:'Warnung: Hüllenintegrität kritisch. Priorität auf Ausweichen.', boss:'Warden-Signatur erkannt. Konzentriere das Feuer.', return:'Willkommen zurück. Die Daten des Einsatzes liegen bereit.' }
    },
    en: {
      introLead: 'An expedition by the Star Atlas Germany community.', enter: 'Enter hangar', skip: 'Skip intro', replay: 'Replay intro',
      introTitle: 'Welcome, pilot.', introText: 'I will guide you through the hangar, your systems, and the Frontier.',
      deploymentHeading: 'Ready for the Frontier', weaponsHeading: 'Configure weapons', shipsHeading: 'Select ship', modulesHeading: 'Install modules', dataHeading: 'Secure save data',
      contexts: { deployment:'HANGAR PROTOCOL', weapons:'ARSENAL ANALYSIS', ships:'FLEET ADVISORY', modules:'SYSTEM DIAGNOSTICS', data:'DATA ARCHIVE' },
      messages: {
        deployment:['Welcome to the hangar, pilot.','Configure your ship, weapons, and systems for the next expedition.'],
        weapons:['Weapons define your combat style.','Pulse lasers are fast, railguns pierce armor, and missiles control groups.'],
        ships:['Every ship demands a different tactic.','Review hull, speed, and shields. The best choice is the one that supports your loadout.'],
        modules:['Modules permanently shape your expedition.','Build a clear strength instead of improving everything at once.'],
        data:['Your progress belongs to you.','Export your save before clearing browser data or changing devices.'],
        equipped:['Loadout updated.','The equipment is registered and cleared for the next deployment.'],
        purchased:['Unlock confirmed.','New systems expand your tactical options. Review the loadout before launch.'],
        launch:['All systems green.','Stay mobile, maintain your combo, and do not spend EMP too early. I will remain on comms.'],
        gameover:['Signal restored.','Combat data secured. Review the run, improve the loadout, and deploy again.']
      },
      tutorialTitle:'FIRST STEPS', steps:['Review ship data','Review or equip a weapon','Review or install a module','Start expedition'],
      quote:'“Knowledge is your compass. Resolve is your drive.”',
      comms:{ launch:'Systems synchronized. The Frontier is open.', wave:'New combat phase detected:', low:'Warning: hull integrity critical. Prioritize evasion.', boss:'Warden signature detected. Focus fire.', return:'Welcome back. Deployment data is ready.' }
    }
  };

  let lang = document.documentElement.lang === 'en' ? 'en' : 'de';
  let commsTimer = 0;
  let instructorTimer = 0;
  let lastCommsText = '';
  let lastCommsAt = 0;
  let lastLowHullWarning = 0;
  let lastWaveText = '';
  let tutorial = (() => {
    try {
      const value = JSON.parse(safeStorage.get(TUTORIAL_KEY) || '[false,false,false,false]');
      return Array.isArray(value) && value.length === 4 ? value.map(Boolean) : [false,false,false,false];
    } catch { return [false,false,false,false]; }
  })();

  function enforceBrandVersion() {
    if (document.title !== VERSION_TITLE) document.title = VERSION_TITLE;
    setText('gameTitle', VERSION_TITLE);
  }

  function syncMode() {
    const inGame = !$('hud')?.classList.contains('hidden');
    document.body.classList.toggle('in-game', inGame);
    if (!inGame) $('kiwimiComms')?.classList.remove('show');
  }

  function applyLanguage() {
    lang = document.documentElement.lang === 'en' || $('langEn')?.classList.contains('active') ? 'en' : 'de';
    document.documentElement.lang = lang;
    const q = copy[lang];
    setText('introLead', q.introLead); setText('enterHangarBtn', q.enter); setText('skipIntroBtn', q.skip); setText('replayIntroBtn', q.replay);
    setText('introKiwimiTitle', q.introTitle); setText('introKiwimiText', q.introText);
    setText('deploymentHeading', q.deploymentHeading); setText('weaponsHeading', q.weaponsHeading); setText('shipsHeading', q.shipsHeading); setText('modulesHeading', q.modulesHeading); setText('dataHeading', q.dataHeading);
    setText('tutorialTitle', q.tutorialTitle); setText('kiwimiQuote', q.quote);
    q.steps.forEach((text, index) => { const node = $(`tutorialStep${index + 1}`)?.querySelector('span'); if (node) node.textContent = text; });
    const active = document.querySelector('.tabs button.active')?.dataset.tab || 'deployment';
    setInstructor(active, false);
    renderTutorial();
    enforceBrandVersion();
  }

  function setInstructor(key, animate = true) {
    const q = copy[lang];
    const message = q.messages[key] || q.messages.deployment;
    const activeTab = document.querySelector('.tabs button.active')?.dataset.tab || 'deployment';
    const contextKey = q.contexts[key] ? key : activeTab;
    setText('kiwimiContext', q.contexts[contextKey] || q.contexts.deployment);
    setText('kiwimiTitle', message[0]); setText('kiwimiMessage', message[1]);
    if (!animate) return;
    const panel = $('kiwimiPanel');
    panel?.classList.add('speaking');
    clearTimeout(instructorTimer);
    instructorTimer = setTimeout(() => panel?.classList.remove('speaking'), 650);
  }

  function renderTutorial() {
    const next = tutorial.findIndex(done => !done);
    tutorial.forEach((done, index) => {
      const node = $(`tutorialStep${index + 1}`);
      if (!node) return;
      node.classList.toggle('done', done);
      node.classList.toggle('active', !done && index === next);
    });
    setText('tutorialProgress', `${tutorial.filter(Boolean).length} / 4`);
    safeStorage.set(TUTORIAL_KEY, JSON.stringify(tutorial));
  }

  function completeStep(index) {
    if (tutorial[index]) return;
    tutorial[index] = true;
    renderTutorial();
  }

  function hideComms() {
    clearTimeout(commsTimer);
    $('kiwimiComms')?.classList.remove('show');
  }

  function showComms(text, duration = 5200, force = false) {
    const panel = $('kiwimiComms');
    if (!panel || $('hud')?.classList.contains('hidden')) return;
    const now = performance.now();
    if (!force && text === lastCommsText && now - lastCommsAt < 4000) return;
    lastCommsText = text; lastCommsAt = now;
    setText('kiwimiCommsText', text);
    panel.classList.add('show');
    clearTimeout(commsTimer);
    commsTimer = setTimeout(() => panel.classList.remove('show'), duration);
  }

  function closeIntro() {
    document.documentElement.classList.add('intro-seen');
    $('brandIntro')?.classList.add('is-hidden');
    safeStorage.set(INTRO_KEY, '1');
    setInstructor('deployment', false);
  }

  function replayIntro() {
    document.documentElement.classList.remove('intro-seen');
    const intro = $('brandIntro');
    intro?.classList.remove('is-hidden');
    intro?.querySelector('button')?.focus();
  }

  $('enterHangarBtn')?.addEventListener('click', closeIntro);
  $('skipIntroBtn')?.addEventListener('click', closeIntro);
  $('replayIntroBtn')?.addEventListener('click', replayIntro);
  addEventListener('keydown', event => {
    const introVisible = !$('brandIntro')?.classList.contains('is-hidden') && !document.documentElement.classList.contains('intro-seen');
    if (introVisible && (event.key === 'Enter' || event.key === 'Escape')) closeIntro();
  });

  document.querySelector('.tabs')?.addEventListener('click', event => {
    const button = event.target.closest('button[data-tab]');
    if (!button) return;
    requestAnimationFrame(() => { setInstructor(button.dataset.tab); enforceBrandVersion(); });
    if (button.dataset.tab === 'ships') completeStep(0);
    if (button.dataset.tab === 'weapons') completeStep(1);
    if (button.dataset.tab === 'modules') completeStep(2);
  });

  $('hangar')?.addEventListener('click', event => {
    const button = event.target.closest('.card-actions button');
    if (!button || button.disabled) return;
    const page = button.closest('.tab-page')?.id;
    requestAnimationFrame(() => {
      setInstructor(button.classList.contains('gold') ? 'purchased' : 'equipped');
      if (page === 'pageWeapons') completeStep(1);
      if (page === 'pageModules') completeStep(2);
      if (page === 'pageShips') completeStep(0);
      enforceBrandVersion();
    });
  });

  $('startRunBtn')?.addEventListener('click', () => {
    completeStep(3); setInstructor('launch');
    setTimeout(() => { syncMode(); showComms(copy[lang].comms.launch, 4300, true); }, 550);
  });
  $('retryBtn')?.addEventListener('click', () => setTimeout(() => { syncMode(); showComms(copy[lang].comms.launch, 4300, true); }, 450));
  $('returnHangarBtn')?.addEventListener('click', () => setTimeout(() => { syncMode(); setInstructor('gameover'); }, 180));

  for (const id of ['langDe','langEn']) $(id)?.addEventListener('click', () => requestAnimationFrame(applyLanguage));

  const waveNode = $('waveText');
  if (waveNode) new MutationObserver(() => {
    if ($('hud')?.classList.contains('hidden')) return;
    const text = waveNode.textContent.trim();
    if (!text || text === lastWaveText) return;
    lastWaveText = text;
    showComms(`${copy[lang].comms.wave} ${text}`, 3000);
  }).observe(waveNode, { childList:true, subtree:true, characterData:true });

  const bossWrap = $('bossWrap');
  if (bossWrap) new MutationObserver(() => {
    if (bossWrap.classList.contains('active')) showComms(copy[lang].comms.boss, 5000, true);
  }).observe(bossWrap, { attributes:true, attributeFilter:['class'] });

  const hpNode = $('hpText');
  if (hpNode) new MutationObserver(() => {
    if ($('hud')?.classList.contains('hidden')) return;
    const match = hpNode.textContent.match(/(\d+)\s*\/\s*(\d+)/);
    if (!match) return;
    const ratio = Number(match[1]) / Math.max(1, Number(match[2]));
    const now = performance.now();
    if (ratio < .3 && now - lastLowHullWarning > 15000) {
      lastLowHullWarning = now;
      showComms(copy[lang].comms.low, 4600, true);
    }
  }).observe(hpNode, { childList:true, subtree:true, characterData:true });

  const gameOver = $('gameOverOverlay');
  if (gameOver) new MutationObserver(() => {
    if (!gameOver.classList.contains('hidden')) { hideComms(); setInstructor('gameover'); }
  }).observe(gameOver, { attributes:true, attributeFilter:['class'] });

  for (const id of ['hud','hangar']) {
    const node = $(id);
    if (node) new MutationObserver(syncMode).observe(node, { attributes:true, attributeFilter:['class'] });
  }

  const gameTitle = $('gameTitle');
  if (gameTitle) new MutationObserver(enforceBrandVersion).observe(gameTitle, { childList:true, subtree:true, characterData:true });
  const titleNode = document.querySelector('title');
  if (titleNode) new MutationObserver(enforceBrandVersion).observe(titleNode, { childList:true, subtree:true, characterData:true });

  document.addEventListener('visibilitychange', () => { if (document.hidden) hideComms(); });

  if (safeStorage.get(INTRO_KEY) === '1') document.documentElement.classList.add('intro-seen');
  loadBrandAssets();
  applyLanguage();
  renderTutorial();
  syncMode();
})();

(() => {
  'use strict';
  const $ = id => document.getElementById(id);

  const assetManifest = {
    kiwimi: ['s06-kiwimi-0.txt','s06-kiwimi-1.txt'],
    logo: ['s06-sag-logo-0.txt'],
    banner: ['s06-sag-banner-0.txt','s06-sag-banner-1.txt','s06-sag-banner-2.txt','s06-sag-banner-3.txt']
  };
  async function loadBrandAssets() {
    try {
      const load = async files => (await Promise.all(files.map(file => fetch(file, {cache:'force-cache'}).then(response => {
        if (!response.ok) throw new Error(`${file} ${response.status}`);
        return response.text();
      })))).join('').replace(/\s/g, '');
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
  loadBrandAssets();

  const safeStorage = {
    get(key) { try { return localStorage.getItem(key); } catch { return null; } },
    set(key, value) { try { localStorage.setItem(key, value); } catch {} }
  };

  const copy = {
    de: {
      introLead: 'Eine Expedition der Star Atlas Germany Community.',
      enter: 'Hangar betreten', skip: 'Intro überspringen',
      introTitle: 'Willkommen, Pilot.',
      introText: 'Ich führe dich durch den Hangar, deine Systeme und die Frontier.',
      deploymentHeading: 'Bereit für die Frontier', weaponsHeading: 'Waffen konfigurieren', shipsHeading: 'Schiff auswählen', modulesHeading: 'Module installieren', dataHeading: 'Spielstand sichern',
      contexts: {deployment:'HANGARPROTOKOLL',weapons:'ARSENALANALYSE',ships:'FLOTTENBERATUNG',modules:'SYSTEMDIAGNOSE',data:'DATENARCHIV'},
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
      tutorialTitle:'ERSTE SCHRITTE', steps:['Schiff prüfen oder auswählen','Waffe ausrüsten','Modul installieren','Expedition starten'],
      quote:'„Wissen ist dein Kompass. Entschlossenheit ist dein Antrieb.“',
      comms:{launch:'Systeme synchronisiert. Die Frontier ist offen.',wave:'Neue Kampfphase erkannt:',low:'Warnung: Hüllenintegrität kritisch. Priorität auf Ausweichen.',boss:'Warden-Signatur erkannt. Konzentriere das Feuer.',return:'Willkommen zurück. Die Daten des Einsatzes liegen bereit.'}
    },
    en: {
      introLead: 'An expedition by the Star Atlas Germany community.',
      enter: 'Enter hangar', skip: 'Skip intro',
      introTitle: 'Welcome, pilot.',
      introText: 'I will guide you through the hangar, your systems, and the Frontier.',
      deploymentHeading: 'Ready for the Frontier', weaponsHeading: 'Configure weapons', shipsHeading: 'Select ship', modulesHeading: 'Install modules', dataHeading: 'Secure save data',
      contexts: {deployment:'HANGAR PROTOCOL',weapons:'ARSENAL ANALYSIS',ships:'FLEET ADVISORY',modules:'SYSTEM DIAGNOSTICS',data:'DATA ARCHIVE'},
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
      tutorialTitle:'FIRST STEPS', steps:['Review or select a ship','Equip a weapon','Install a module','Start expedition'],
      quote:'“Knowledge is your compass. Resolve is your drive.”',
      comms:{launch:'Systems synchronized. The Frontier is open.',wave:'New combat phase detected:',low:'Warning: hull integrity critical. Prioritize evasion.',boss:'Warden signature detected. Focus fire.',return:'Welcome back. Deployment data is ready.'}
    }
  };

  let lang = document.documentElement.lang === 'en' ? 'en' : 'de';
  let commsTimer = 0;
  let lastLowHullWarning = 0;
  const tutorialKey = 'sag-frontier-kiwimi-tutorial-v1';
  let tutorial = (() => { try { return JSON.parse(safeStorage.get(tutorialKey) || '[false,false,false,false]'); } catch { return [false,false,false,false]; } })();
  if (!Array.isArray(tutorial) || tutorial.length !== 4) tutorial = [false,false,false,false];

  function applyLanguage() {
    lang = document.documentElement.lang === 'en' || $('langEn')?.classList.contains('active') ? 'en' : 'de';
    const q = copy[lang];
    $('introLead').textContent = q.introLead;
    $('enterHangarBtn').textContent = q.enter;
    $('skipIntroBtn').textContent = q.skip;
    $('introKiwimiTitle').textContent = q.introTitle;
    $('introKiwimiText').textContent = q.introText;
    $('deploymentHeading').textContent = q.deploymentHeading;
    $('weaponsHeading').textContent = q.weaponsHeading;
    $('shipsHeading').textContent = q.shipsHeading;
    $('modulesHeading').textContent = q.modulesHeading;
    $('dataHeading').textContent = q.dataHeading;
    $('tutorialTitle').textContent = q.tutorialTitle;
    q.steps.forEach((text, i) => { const node = $(`tutorialStep${i+1}`)?.querySelector('span'); if (node) node.textContent = text; });
    $('kiwimiQuote').textContent = q.quote;
    const active = document.querySelector('.tabs button.active')?.dataset.tab || 'deployment';
    setInstructor(active, false);
    renderTutorial();
  }

  function setInstructor(key, animate = true) {
    const q = copy[lang];
    const message = q.messages[key] || q.messages.deployment;
    const tabKey = q.contexts[key] ? key : (document.querySelector('.tabs button.active')?.dataset.tab || 'deployment');
    $('kiwimiContext').textContent = q.contexts[tabKey] || q.contexts.deployment;
    if (animate) $('kiwimiPanel').classList.add('speaking');
    $('kiwimiTitle').textContent = message[0];
    $('kiwimiMessage').textContent = message[1];
    if (animate) setTimeout(() => $('kiwimiPanel')?.classList.remove('speaking'), 650);
  }

  function renderTutorial() {
    const next = tutorial.findIndex(done => !done);
    tutorial.forEach((done, i) => {
      const node = $(`tutorialStep${i+1}`);
      if (!node) return;
      node.classList.toggle('done', done);
      node.classList.toggle('active', !done && i === next);
    });
    $('tutorialProgress').textContent = `${tutorial.filter(Boolean).length} / 4`;
    safeStorage.set(tutorialKey, JSON.stringify(tutorial));
  }

  function completeStep(index) {
    if (tutorial[index]) return;
    tutorial[index] = true;
    renderTutorial();
  }

  function showComms(text, duration = 5200) {
    const panel = $('kiwimiComms');
    if (!panel) return;
    $('kiwimiCommsText').textContent = text;
    panel.classList.add('show');
    clearTimeout(commsTimer);
    commsTimer = setTimeout(() => panel.classList.remove('show'), duration);
  }

  function closeIntro() {
    $('brandIntro')?.classList.add('is-hidden');
    safeStorage.set('sag-frontier-intro-seen-v06', '1');
    setInstructor('deployment', false);
  }

  $('enterHangarBtn')?.addEventListener('click', closeIntro);
  $('skipIntroBtn')?.addEventListener('click', closeIntro);
  addEventListener('keydown', event => {
    if ((event.key === 'Enter' || event.key === 'Escape') && !$('brandIntro')?.classList.contains('is-hidden')) closeIntro();
  });

  document.querySelector('.tabs')?.addEventListener('click', event => {
    const button = event.target.closest('button[data-tab]');
    if (!button) return;
    setTimeout(() => setInstructor(button.dataset.tab), 20);
    if (button.dataset.tab === 'ships') completeStep(0);
    if (button.dataset.tab === 'weapons') completeStep(1);
    if (button.dataset.tab === 'modules') completeStep(2);
  });

  $('hangar')?.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    const label = button.textContent.trim().toLowerCase();
    if (/kaufen|buy|freischalten|unlock|verbessern|upgrade/.test(label)) setTimeout(() => setInstructor('purchased'), 80);
    if (/ausrüsten|equip|primär|primary|sekundär|secondary/.test(label)) {
      setTimeout(() => setInstructor('equipped'), 80);
      if (button.closest('#pageWeapons')) completeStep(1);
      if (button.closest('#pageModules')) completeStep(2);
      if (button.closest('#pageShips')) completeStep(0);
    }
  });

  $('startRunBtn')?.addEventListener('click', () => {
    completeStep(3);
    setInstructor('launch');
    setTimeout(() => showComms(copy[lang].comms.launch), 700);
  });
  $('retryBtn')?.addEventListener('click', () => setTimeout(() => showComms(copy[lang].comms.launch), 600));
  $('returnHangarBtn')?.addEventListener('click', () => {
    setTimeout(() => { setInstructor('gameover'); showComms(copy[lang].comms.return, 3600); }, 250);
  });

  for (const id of ['langDe','langEn']) $(id)?.addEventListener('click', () => setTimeout(applyLanguage, 35));

  const waveNode = $('waveText');
  if (waveNode) new MutationObserver(() => {
    if ($('hud')?.classList.contains('hidden')) return;
    const text = waveNode.textContent.trim();
    const bossVisible = $('bossWrap')?.classList.contains('active');
    showComms(bossVisible ? copy[lang].comms.boss : `${copy[lang].comms.wave} ${text}`, bossVisible ? 5600 : 3200);
  }).observe(waveNode, {childList:true,subtree:true,characterData:true});

  const gameOver = $('gameOverOverlay');
  if (gameOver) new MutationObserver(() => {
    if (!gameOver.classList.contains('hidden')) setInstructor('gameover');
  }).observe(gameOver, {attributes:true,attributeFilter:['class']});

  setInterval(() => {
    if ($('hud')?.classList.contains('hidden')) return;
    const match = $('hpText')?.textContent.match(/(\d+)\s*\/\s*(\d+)/);
    if (!match) return;
    const ratio = Number(match[1]) / Math.max(1, Number(match[2]));
    const now = Date.now();
    if (ratio < .3 && now - lastLowHullWarning > 15000) {
      lastLowHullWarning = now;
      showComms(copy[lang].comms.low, 5200);
    }
  }, 1100);

  applyLanguage();
  renderTutorial();
})();

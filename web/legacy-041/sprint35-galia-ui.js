(() => {
  "use strict";
  const G = window.SAGGalia,
    C = G.C;
  const $ = (s) => document.querySelector(s);
  let tab = "map",
    selectedEvent = "distress";
  function sector() {
    return C.sectors.find((x) => x.id === G.state.location) || C.sectors[0];
  }
  function button(label, action, primary = false) {
    return `<button class="${primary ? "primary" : ""}" data-action="${action}" type="button">${label}</button>`;
  }
  function meter(value, max = 20) {
    return `<div class="g-meter"><i style="width:${Math.max(0, Math.min(100, (value / max) * 100))}%"></i></div>`;
  }
  function head(title, text) {
    return `<div class="g-card full"><span class="g-kicker">GALIA OPERATIONS // 0.35</span><h2>${title}</h2><p>${text}</p></div>`;
  }
  function bind(root) {
    root
      .querySelectorAll("[data-action]")
      .forEach((el) => (el.onclick = () => act(el.dataset.action)));
    root.querySelectorAll("[data-tab]").forEach(
      (el) =>
        (el.onclick = () => {
          tab = el.dataset.tab;
          render();
        }),
    );
  }
  function act(action) {
    const [a, b] = action.split(":");
    if (a === "travel") {
      const r = G.travel(b);
      window.SAGGaliaCinematic?.pulse(r.msg);
    }
    if (a === "buy" || a === "sell") G.trade(b, a);
    if (a === "upgrade") G.upgrade(b);
    if (a === "event") {
      selectedEvent = b;
      render();
    }
    if (a === "choose") G.encounter(selectedEvent, Number(b));
    if (a === "build") G.build(b);
    if (a === "campaign") G.chooseCampaign(Number(b));
    render();
  }
  function renderMap() {
    const here = sector(),
      station = C.stations.find((x) => x.sector === here.id),
      npc = C.npcs.find((x) => x.sector === here.id);
    return `${head("Sternenkarte", `Entdecke sichere Korridore, Außenzonen und politisch fragile Räume. Aktuelle Position: ${here.name}.`)}<section class="g-card wide"><div class="g-map">${C.sectors
      .map((s) => {
        const discovered = G.state.discovered.includes(s.id);
        const current = s.id === here.id;
        const title = discovered
          ? s.name
          : `${s.name} — sichere Route noch nicht entdeckt`;
        return `<button class="g-node ${discovered ? "" : "locked"} ${current ? "active" : ""}" style="left:${s.x}%;top:${s.y}%" data-action="travel:${s.id}" title="${title}" ${!discovered || current ? "disabled" : ""}>${s.name.slice(0, 2).toUpperCase()}</button>`;
      })
      .join("")}</div></section><aside class="g-card"><span class="g-kicker">AKTUELLER SEKTOR</span><h3>${here.name}</h3><p>${here.desc}</p><div class="g-row"><span>Fraktion</span><b>${here.faction}</b></div><div class="g-row"><span>Station</span><b>${station?.name || "Keine"}</b></div><p><b>${npc?.name || "Kein Kontakt"}</b><br>${npc?.line || ""}</p></aside>`;
  }
  function renderMarket() {
    const s = sector();
    return `${head("Markt & Logistik", `Lokale Preise reagieren auf Versorgungslage und Sektorprofil. Frachtraum ${G.capacity()} / ${G.state.ship.cargo}.`)}${C.goods
      .map((g) => {
        const p = Math.round(g.base * (s.market?.[g.id] || 1));
        return `<article class="g-card"><span class="g-kicker">${g.id.toUpperCase()}</span><h3>${g.name}</h3><div class="g-stat"><strong>${p} C</strong><span>Bestand: ${G.state.cargo[g.id] || 0}</span></div><div class="g-choice">${button("Kaufen", `buy:${g.id}`, true)}${button("Verkaufen", `sell:${g.id}`)}</div></article>`;
      })
      .join("")}`;
  }
  function renderShip() {
    const s = G.state.ship;
    return `${head(s.name, "Modulares Schiff für Erkundung, Handel, Hilfseinsätze und defensive Frontier-Operationen.")}<article class="g-card wide"><span class="g-kicker">SCHIFFSSTATUS</span><div class="g-grid"><div class="g-card"><b>Hülle</b>${meter(s.hull, 100)}<span>${s.hull}%</span></div><div class="g-card"><b>Treibstoff</b>${meter(s.fuel, 15)}<span>${s.fuel}</span></div><div class="g-card"><b>Fracht</b>${meter(G.capacity(), s.cargo)}<span>${G.capacity()} / ${s.cargo}</span></div></div></article><aside class="g-card"><span class="g-kicker">MODULE</span><div class="g-list">${["scanner", "engine", "shield", "ai", "stealth", "drones", "cargo"].map((k) => `<div class="g-row"><span>${k.toUpperCase()} · ${s[k] || 1}</span>${button(`${250 * ((s[k] || 0) + 1)} C`, `upgrade:${k}`)}</div>`).join("")}</div></aside>`;
  }
  function renderEvents() {
    const ev = C.events.find((x) => x.id === selectedEvent) || C.events[0];
    return `${head("Reiseereignisse", "Entscheidungen verändern Ressourcen und Ruf. Keine gewaltsame Lösung wird automatisch als beste Option behandelt.")}<nav class="g-card">${C.events.map((e) => button(e.title, `event:${e.id}`, e.id === selectedEvent)).join("")}</nav><article class="g-card wide"><span class="g-kicker">EREIGNIS</span><h3>${ev.title}</h3><p>${ev.text}</p><div class="g-choice">${ev.choices.map((c, i) => button(c.label, `choose:${i}`, i === 0)).join("")}</div></article>`;
  }
  function renderReputation() {
    return `${head("Fraktionsruf", "Dein Verhalten wird von SAG, den drei großen Fraktionen, dem Council und freien Kolonien unterschiedlich bewertet.")}${C.factions.map((f) => `<article class="g-card"><span class="g-kicker">${f.id}</span><h3>${f.name}</h3><p>${f.desc}</p><strong>${G.state.reputation[f.id] || 0}</strong>${meter((G.state.reputation[f.id] || 0) + 10, 30)}</article>`).join("")}`;
  }
  function renderDAC() {
    return `${head("SAG HQ Ausbau", "Das Hauptquartier wächst durch dokumentierte Beiträge, Handel und geteiltes Wissen – nicht durch einen automatischen Machtanspruch.")}${C.facilities
      .map((f) => {
        const built = G.state.facilities.includes(f.id);
        return `<article class="g-card"><span class="g-kicker">${built ? "AKTIV" : "AUSBAU"}</span><h3>${f.name}</h3><p>${f.desc}</p><p>${
          Object.entries(f.cost)
            .map(([k, v]) => `${v} ${k}`)
            .join(" · ") || "Startmodul"
        }</p>${built ? "<b>ONLINE</b>" : button("Bauen", `build:${f.id}`, true)}</article>`;
      })
      .join("")}`;
  }
  function renderCampaign() {
    const scene = C.campaign[G.state.campaignStep];
    if (!scene)
      return `${head("Kampagne abgeschlossen", "Die Entscheidungen sind im SAG-Dossier gespeichert. Der Ausgang ist kein Herrschaftsanspruch, sondern ein öffentliches Profil der DAC.")}<article class="g-card full"><h3>${G.state.flags.ending === "growth" ? "Expansion unter Beobachtung" : "Charta der offenen Frontier"}</h3><p>SAG bleibt eine unabhängige, spielergeführte DAC und keine offizielle Institution von Star Atlas, ATMTA oder dem Council of Peace.</p></article>`;
    return `${head(`Kapitel ${scene.chapter}: ${scene.title}`, "Eigene SAG-Kampagnenfiktion auf Grundlage klar gekennzeichneter Star-Atlas-Rahmenbegriffe.")}<article class="g-card wide"><p>${scene.text}</p><div class="g-choice">${scene.choices.map((c, i) => button(c.label, `campaign:${i}`, i === 0)).join("")}</div></article><aside class="g-card"><span class="g-kicker">FORTSCHRITT</span><strong>${G.state.campaignStep} / ${C.campaign.length}</strong>${meter(G.state.campaignStep, C.campaign.length)}<p class="g-muted">Entscheidungen können nicht durch wiederholtes Öffnen zurückgesetzt werden.</p></aside>`;
  }
  function renderLog() {
    return `${head("Operationsarchiv", "Lokales, savegame-kompatibles Protokoll aller Reisen, Käufe, Ausbauten und Entscheidungen.")}<article class="g-card full g-log">${G.state.log.map((x) => `<div>${x}</div>`).join("")}</article>`;
  }
  function render() {
    const root = $("#galiaContent");
    if (!root) return;
    const pages = {
      map: renderMap,
      market: renderMarket,
      ship: renderShip,
      events: renderEvents,
      reputation: renderReputation,
      dac: renderDAC,
      campaign: renderCampaign,
      log: renderLog,
    };
    root.innerHTML = `<div class="g-grid">${pages[tab]()}</div>`;
    document
      .querySelectorAll(".g-tab")
      .forEach((b) => b.classList.toggle("active", b.dataset.tab === tab));
    $("#galiaCredits").textContent = `${G.state.credits} C`;
    $("#galiaStatus").textContent =
      `${sector().name} · Fuel ${G.state.ship.fuel}`;
    bind(root);
  }
  function open() {
    G.load();
    $("#galiaShell").classList.remove("g-hidden");
    render();
  }
  function close() {
    $("#galiaShell").classList.add("g-hidden");
  }
  document.addEventListener("DOMContentLoaded", () => {
    $("#galiaToggle")?.addEventListener("click", open);
    $("#galiaClose")?.addEventListener("click", close);
    $("#galiaReturn")?.addEventListener("click", close);
    document.querySelectorAll(".g-tab").forEach(
      (b) =>
        (b.onclick = () => {
          tab = b.dataset.tab;
          render();
        }),
    );
    render();
  });
  window.SAGGaliaUI = { open, close, render };
})();

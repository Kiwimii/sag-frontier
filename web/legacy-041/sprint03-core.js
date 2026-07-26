'use strict';
window.SAG = (() => {
  const $ = id => document.getElementById(id);
  const S = {
    $,
    canvas: $('game'),
    ctx: $('game').getContext('2d'),
    W: innerWidth,
    H: innerHeight,
    dpr: Math.min(devicePixelRatio || 1, 2),
    state: 'start',
    player: null,
    enemies: [],
    bullets: [],
    enemyBullets: [],
    pickups: [],
    particles: [],
    stars: [],
    score: 0,
    best: Number(localStorage.getItem('sag-frontier-best-v03') || 0),
    level: 1,
    xp: 0,
    xpNeed: 30,
    elapsed: 0,
    spawnTimer: 0,
    fireTimer: 0,
    wave: 1,
    sector: 1,
    waveClock: 0,
    boss: null,
    kills: 0,
    bossesKilled: 0,
    combo: 1,
    maxCombo: 1,
    comboClock: 0,
    shake: 0,
    last: performance.now(),
    toastTimer: 0,
    keys: new Set(),
    touch: {id:null, ox:0, oy:0, x:0, y:0}
  };

  S.ui = {
    hpFill:$('hpFill'), hpText:$('hpText'), shieldRow:$('shieldRow'), shieldFill:$('shieldFill'), shieldText:$('shieldText'),
    score:$('scoreText'), time:$('timeText'), best:$('bestText'), wave:$('waveText'), combo:$('comboText'),
    level:$('levelText'), dash:$('dashText'), objective:$('objectiveText'), xpFill:$('xpFill'), xpText:$('xpText'),
    bossWrap:$('bossWrap'), bossFill:$('bossFill'), bossText:$('bossText'), toast:$('toast'), dashBtn:$('dashBtn'),
    start:$('startOverlay'), upgrade:$('upgradeOverlay'), pause:$('pauseOverlay'), over:$('gameOverOverlay'), choices:$('choices'), upgradeTitle:$('upgradeTitle'), final:$('finalText'), startBest:$('startBest'),
    sumScore:$('sumScore'), sumKills:$('sumKills'), sumBosses:$('sumBosses'), sumWave:$('sumWave'), sumCombo:$('sumCombo'), sumLevel:$('sumLevel')
  };

  S.profiles = [
    {name:'drone', color:'#ff5577', core:'#ffd36a', speed:96, hp:2, damage:12, score:10, xp:6, radius:18, weight:38, mode:'chase'},
    {name:'scout', color:'#4fe6ff', core:'#ffffff', speed:150, hp:1, damage:9, score:14, xp:8, radius:14, weight:23, mode:'swerve'},
    {name:'rusher', color:'#ff8a32', core:'#fff08a', speed:205, hp:1, damage:17, score:18, xp:10, radius:16, weight:18, mode:'charge'},
    {name:'tank', color:'#b56cff', core:'#f2bcff', speed:61, hp:7, damage:25, score:40, xp:21, radius:27, weight:12, mode:'chase'},
    {name:'gunner', color:'#6dffb3', core:'#eafff4', speed:82, hp:4, damage:13, score:30, xp:16, radius:21, weight:9, mode:'gunner'}
  ];

  S.upgrades = [
    {name:'Overclocked Cannons', desc:'Fire 14% faster.', apply:()=>S.player.fireRate=Math.max(.085,S.player.fireRate*.86)},
    {name:'Charged Payload', desc:'Projectiles deal +1 damage.', apply:()=>S.player.damage++},
    {name:'Split Targeting', desc:'Add one projectile per volley.', apply:()=>S.player.shots=Math.min(7,S.player.shots+1)},
    {name:'Vector Thrusters', desc:'Movement speed increases by 12%.', apply:()=>S.player.speed*=1.12},
    {name:'Reinforced Hull', desc:'Max hull +25 and repair 25.', apply:()=>{S.player.maxHp+=25;S.player.hp=Math.min(S.player.maxHp,S.player.hp+25)}},
    {name:'Field Repair', desc:'Immediately restore 45 hull.', apply:()=>S.player.hp=Math.min(S.player.maxHp,S.player.hp+45)},
    {name:'Accelerated Rounds', desc:'Projectile speed increases by 20%.', apply:()=>S.player.bulletSpeed*=1.2},
    {name:'Piercing Core', desc:'Projectiles pierce one additional target.', apply:()=>S.player.pierce=Math.min(5,S.player.pierce+1)},
    {name:'Recovery Protocol', desc:'Gain 20% more XP.', apply:()=>S.player.xpGain*=1.2},
    {name:'Aegis Capacitor', desc:'Gain 30 shield and +15 max shield.', apply:()=>{S.player.maxShield+=15;S.player.shield=Math.min(S.player.maxShield,S.player.shield+30)}},
    {name:'Dash Reactor', desc:'Dash cooldown reduced by 18%.', apply:()=>S.player.dashMax=Math.max(1.25,S.player.dashMax*.82)},
    {name:'Salvage Algorithms', desc:'Pickups drop 35% more often.', apply:()=>S.player.dropBoost*=1.35}
  ];

  S.resize = () => {
    S.W=innerWidth; S.H=innerHeight; S.dpr=Math.min(devicePixelRatio||1,2);
    S.canvas.width=Math.floor(S.W*S.dpr); S.canvas.height=Math.floor(S.H*S.dpr);
    S.canvas.style.width=S.W+'px'; S.canvas.style.height=S.H+'px';
    S.ctx.setTransform(S.dpr,0,0,S.dpr,0,0);
    if(S.player){S.player.x=Math.max(28,Math.min(S.W-28,S.player.x));S.player.y=Math.max(28,Math.min(S.H-28,S.player.y));}
  };

  S.formatTime = t => {const s=Math.floor(t);return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')};
  S.showToast = text => {S.ui.toast.textContent=text;S.ui.toast.classList.add('show');S.toastTimer=1.8};
  S.hideAll = () => {S.ui.start.classList.add('hidden');S.ui.upgrade.classList.add('hidden');S.ui.pause.classList.add('hidden');S.ui.over.classList.add('hidden')};

  S.resetGame = () => {
    S.player={x:S.W/2,y:S.H/2,r:20,hp:100,maxHp:100,shield:0,maxShield:0,speed:335,fireRate:.42,damage:1,shots:1,bulletSpeed:730,pierce:0,xpGain:1,dropBoost:1,angle:0,invuln:0,dash:0,dashMax:3,dashTime:0,dashDx:0,dashDy:-1,overdrive:0};
    S.enemies=[];S.bullets=[];S.enemyBullets=[];S.pickups=[];S.particles=[];S.score=0;S.level=1;S.xp=0;S.xpNeed=30;S.elapsed=0;S.spawnTimer=.2;S.fireTimer=0;S.wave=1;S.sector=1;S.waveClock=0;S.boss=null;S.kills=0;S.bossesKilled=0;S.combo=1;S.maxCombo=1;S.comboClock=0;S.shake=0;S.touch.x=S.touch.y=0;S.updateUI();
  };
  S.startGame = () => {S.resetGame();S.hideAll();S.state='running';S.showToast('SECTOR 01 // ENTERING FRONTIER');S.last=performance.now()};
  S.pauseGame = () => {if(S.state!=='running')return;S.state='paused';S.ui.pause.classList.remove('hidden')};
  S.resumeGame = () => {if(S.state!=='paused')return;S.state='running';S.ui.pause.classList.add('hidden');S.last=performance.now()};
  S.endGame = () => {
    S.state='over';S.best=Math.max(S.best,S.score);localStorage.setItem('sag-frontier-best-v03',String(S.best));
    S.ui.final.textContent=`Survived ${S.formatTime(S.elapsed)} in sector ${S.sector}.`;
    S.ui.sumScore.textContent=S.score;S.ui.sumKills.textContent=S.kills;S.ui.sumBosses.textContent=S.bossesKilled;S.ui.sumWave.textContent=S.wave;S.ui.sumCombo.textContent=S.maxCombo.toFixed(1);S.ui.sumLevel.textContent=S.level;
    S.ui.over.classList.remove('hidden');S.updateUI();
  };

  S.weightedProfile = () => {let total=S.profiles.reduce((a,p)=>a+p.weight,0),r=Math.random()*total;for(const p of S.profiles){r-=p.weight;if(r<=0)return p}return S.profiles[0]};
  S.edgePosition = (pad=50) => {const side=Math.floor(Math.random()*4);if(side===0)return{x:Math.random()*S.W,y:-pad};if(side===1)return{x:S.W+pad,y:Math.random()*S.H};if(side===2)return{x:Math.random()*S.W,y:S.H+pad};return{x:-pad,y:Math.random()*S.H}};
  S.spawnEnemy = (profile=null,nearBoss=false) => {
    const p=profile||S.weightedProfile();const pos=nearBoss&&S.boss?{x:S.boss.x+(Math.random()-.5)*140,y:S.boss.y+(Math.random()-.5)*140}:S.edgePosition();const diff=1+Math.min(2.1,S.elapsed/125)+S.wave*.045;const hp=Math.max(1,Math.round(p.hp*(.74+diff*.27)));
    S.enemies.push({x:pos.x,y:pos.y,r:p.radius,s:p.speed*Math.min(2.4,diff),hp,maxHp:hp,damage:Math.max(1,Math.round(p.damage*(.9+diff*.1))),score:p.score,xp:p.xp,color:p.color,core:p.core,name:p.name,mode:p.mode,phase:Math.random()*8,angle:0,dead:false,shoot:Math.random()*1.5+.8});
  };
  S.spawnBoss = () => {const pos=S.edgePosition(90),scale=1+(S.wave-3)*.08;S.boss={x:pos.x,y:pos.y,r:58,s:50+S.wave*2,hp:Math.round(180*scale),maxHp:Math.round(180*scale),damage:28+S.wave,angle:0,shoot:1.1,summon:4.5,phase:0,dead:false};S.ui.bossWrap.classList.add('active');S.showToast('WARNING // FRONTIER WARDEN DETECTED')};
  S.nearestEnemy = () => {let target=null,best=Infinity;if(S.boss&&!S.boss.dead){best=(S.boss.x-S.player.x)**2+(S.boss.y-S.player.y)**2;target=S.boss}for(const e of S.enemies){if(e.dead)continue;const d=(e.x-S.player.x)**2+(e.y-S.player.y)**2;if(d<best){best=d;target=e}}return target};
  S.shoot = () => {const target=S.nearestEnemy();if(!target)return;const base=Math.atan2(target.y-S.player.y,target.x-S.player.x);for(let i=0;i<S.player.shots;i++){const a=base+(i-(S.player.shots-1)/2)*.115;S.bullets.push({x:S.player.x,y:S.player.y,vx:Math.cos(a)*S.player.bulletSpeed,vy:Math.sin(a)*S.player.bulletSpeed,r:4,damage:S.player.damage,pierce:S.player.pierce,dead:false})}S.addParticles(S.player.x,S.player.y,'#75f1ff',3,90)};
  S.enemyShoot = (x,y,angle,speed=290,damage=10,color='#ff7894') => S.enemyBullets.push({x,y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,r:5,damage,color,dead:false});
  S.tryDash = () => {if(S.state!=='running'||S.player.dash>0||S.player.dashTime>0)return;let dx=(S.keys.has('d')||S.keys.has('arrowright')?1:0)-(S.keys.has('a')||S.keys.has('arrowleft')?1:0),dy=(S.keys.has('s')||S.keys.has('arrowdown')?1:0)-(S.keys.has('w')||S.keys.has('arrowup')?1:0);if(Math.hypot(S.touch.x,S.touch.y)>.05){dx=S.touch.x;dy=S.touch.y}if(Math.hypot(dx,dy)<.05){dx=Math.cos(S.player.angle-Math.PI/2);dy=Math.sin(S.player.angle-Math.PI/2)}const m=Math.hypot(dx,dy)||1;S.player.dashDx=dx/m;S.player.dashDy=dy/m;S.player.dashTime=.17;S.player.dash=S.player.dashMax;S.player.invuln=Math.max(S.player.invuln,.3);S.shake=Math.max(S.shake,5);S.addParticles(S.player.x,S.player.y,'#50e6ff',18,210)};
  S.addParticles = (x,y,color,count=10,speed=160) => {for(let i=0;i<count;i++){const a=Math.random()*Math.PI*2,v=Math.random()*speed;S.particles.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:.25+Math.random()*.45,max:.7,r:1+Math.random()*2.5,color})}};
  S.dropPickup = (x,y) => {if(Math.random()>.13*S.player.dropBoost)return;const r=Math.random(),type=r<.38?'repair':r<.7?'shield':'overdrive';S.pickups.push({x,y,type,r:11,life:12,phase:Math.random()*6})};
  S.collectPickup = p => {if(p.type==='repair'){S.player.hp=Math.min(S.player.maxHp,S.player.hp+28);S.showToast('SALVAGE // HULL +28');S.addParticles(p.x,p.y,'#68ffc2',16,170)}else if(p.type==='shield'){S.player.maxShield=Math.max(S.player.maxShield,35);S.player.shield=Math.min(S.player.maxShield,S.player.shield+35);S.showToast('AEGIS PICKUP // SHIELD +35');S.addParticles(p.x,p.y,'#9b7dff',16,170)}else{S.player.overdrive=Math.max(S.player.overdrive,8);S.showToast('OVERDRIVE // RAPID FIRE 8s');S.addParticles(p.x,p.y,'#ffd36a',16,170)}p.dead=true};
  S.gainXP = amount => {S.xp+=Math.round(amount*S.player.xpGain);if(S.xp>=S.xpNeed){S.xp-=S.xpNeed;S.level++;S.xpNeed=Math.round(30+S.level*14+S.level*S.level*1.65);S.showUpgrade()}};
  S.showUpgrade = () => {S.state='upgrade';S.ui.upgradeTitle.textContent=`LEVEL ${S.level} // SELECT SYSTEM`;S.ui.choices.innerHTML='';for(const u of [...S.upgrades].sort(()=>Math.random()-.5).slice(0,3)){const b=document.createElement('button');b.type='button';b.className='choice';b.innerHTML=`<strong>${u.name}</strong><span>${u.desc}</span><em>INSTALL SYSTEM</em>`;b.addEventListener('click',()=>{u.apply();S.ui.upgrade.classList.add('hidden');S.state='running';S.last=performance.now();S.updateUI()});S.ui.choices.appendChild(b)}S.ui.upgrade.classList.remove('hidden')};
  S.advanceWave = () => {S.wave++;S.waveClock=0;S.sector=Math.floor((S.wave-1)/3)+1;S.combo=Math.max(1,S.combo*.8);S.showToast(`SECTOR ${String(S.sector).padStart(2,'0')} // WAVE ${String(S.wave).padStart(2,'0')}`);if(S.wave%3===0&&!S.boss)S.spawnBoss()};
  S.damagePlayer = amount => {if(S.player.invuln>0||S.player.dashTime>0)return;let remaining=amount;if(S.player.shield>0){const absorbed=Math.min(S.player.shield,remaining);S.player.shield-=absorbed;remaining-=absorbed}if(remaining>0)S.player.hp=Math.max(0,S.player.hp-remaining);S.player.invuln=.55;S.shake=Math.max(S.shake,9);S.addParticles(S.player.x,S.player.y,'#ff5577',16,190);if(S.player.hp<=0)S.endGame()};
  S.killEnemy = e => {e.dead=true;S.kills++;S.combo=Math.min(8,S.combo+.16);S.maxCombo=Math.max(S.maxCombo,S.combo);S.comboClock=3.2;S.score+=Math.round(e.score*S.combo);S.gainXP(e.xp);S.dropPickup(e.x,e.y);S.addParticles(e.x,e.y,e.color,14,200);S.shake=Math.max(S.shake,3)};
  S.killBoss = () => {if(!S.boss)return;S.boss.dead=true;S.bossesKilled++;S.kills++;S.combo=Math.min(8,S.combo+1);S.maxCombo=Math.max(S.maxCombo,S.combo);S.comboClock=4.5;S.score+=Math.round((600+S.wave*80)*S.combo);S.gainXP(90+S.wave*6);S.addParticles(S.boss.x,S.boss.y,'#ff5577',60,300);S.shake=18;S.showToast('WARDEN DESTROYED // SECTOR CLEARED');S.boss=null;S.ui.bossWrap.classList.remove('active');S.player.hp=Math.min(S.player.maxHp,S.player.hp+30);S.player.shield=Math.min(S.player.maxShield,S.player.shield+25)};

  return S;
})();

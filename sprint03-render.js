'use strict';
(() => {
  const S=SAG,ctx=S.ctx;

  S.updateUI = () => {
    if(!S.player)return;const p=S.player,u=S.ui;
    u.hpText.textContent=`HULL ${Math.ceil(p.hp)} / ${p.maxHp}`;u.hpFill.style.width=Math.max(0,100*p.hp/p.maxHp)+'%';
    if(p.maxShield>0){u.shieldRow.classList.remove('hidden');u.shieldText.textContent=`SHIELD ${Math.ceil(p.shield)} / ${p.maxShield}`;u.shieldFill.style.width=Math.max(0,100*p.shield/p.maxShield)+'%'}else u.shieldRow.classList.add('hidden');
    u.score.textContent='SCORE '+String(S.score).padStart(6,'0');u.time.textContent='TIME '+S.formatTime(S.elapsed);u.best.textContent='BEST '+String(S.best).padStart(6,'0');
    u.wave.textContent=`SECTOR ${String(S.sector).padStart(2,'0')} · WAVE ${String(S.wave).padStart(2,'0')}`;u.combo.textContent=`COMBO x${S.combo.toFixed(1)}`;u.level.textContent='LEVEL '+String(S.level).padStart(2,'0');u.xpText.textContent=`XP ${S.xp} / ${S.xpNeed}`;u.xpFill.style.width=Math.min(100,100*S.xp/S.xpNeed)+'%';
    const ready=p.dash<=0;u.dash.textContent=ready?'DASH READY':`DASH ${p.dash.toFixed(1)}s`;u.dashBtn.textContent=ready?'DASH':p.dash.toFixed(1);u.dashBtn.classList.toggle('cooldown',!ready);u.objective.textContent=S.boss?'OBJECTIVE: DESTROY WARDEN':`NEXT WAVE ${Math.max(0,Math.ceil(44-S.waveClock))}s`;
    if(S.boss){u.bossFill.style.width=Math.max(0,100*S.boss.hp/S.boss.maxHp)+'%';u.bossText.textContent=`FRONTIER WARDEN ${Math.max(0,Math.ceil(100*S.boss.hp/S.boss.maxHp))}%`}
  };

  const drawShip = () => {
    const p=S.player;ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.angle);ctx.globalAlpha=p.invuln>0&&Math.floor(p.invuln*20)%2===0?.38:1;
    if(p.shield>0){ctx.strokeStyle='#9b7dff';ctx.lineWidth=2;ctx.globalAlpha=.45+.2*Math.sin(S.elapsed*6);ctx.beginPath();ctx.arc(0,0,p.r+9,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1}
    ctx.fillStyle='#50e6ff';ctx.beginPath();ctx.moveTo(0,-27);ctx.lineTo(20,19);ctx.lineTo(0,10);ctx.lineTo(-20,19);ctx.closePath();ctx.fill();ctx.fillStyle='#ffd36a';ctx.beginPath();ctx.moveTo(0,-9);ctx.lineTo(7,8);ctx.lineTo(0,4);ctx.lineTo(-7,8);ctx.closePath();ctx.fill();ctx.restore();
  };
  const drawEnemy = e => {ctx.save();ctx.translate(e.x,e.y);ctx.rotate(e.angle);ctx.fillStyle=e.color;ctx.beginPath();ctx.moveTo(0,-e.r*1.15);ctx.lineTo(e.r,e.r*.7);ctx.lineTo(0,e.r*.38);ctx.lineTo(-e.r,e.r*.7);ctx.closePath();ctx.fill();ctx.fillStyle=e.core;ctx.beginPath();ctx.arc(0,0,e.r*.28,0,Math.PI*2);ctx.fill();ctx.restore();if(e.name==='tank'||e.name==='gunner'){ctx.fillStyle='#06101f';ctx.fillRect(e.x-e.r,e.y-e.r-8,e.r*2,4);ctx.fillStyle=e.color;ctx.fillRect(e.x-e.r,e.y-e.r-8,e.r*2*Math.max(0,e.hp/e.maxHp),4)}};
  const drawBoss = () => {if(!S.boss)return;const b=S.boss;ctx.save();ctx.translate(b.x,b.y);ctx.rotate(b.angle);ctx.fillStyle='#b92f59';ctx.beginPath();for(let i=0;i<12;i++){const a=i*Math.PI/6-Math.PI/2,r=i%2===0?b.r:b.r*.72,x=Math.cos(a)*r,y=Math.sin(a)*r;if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y)}ctx.closePath();ctx.fill();ctx.strokeStyle='#ff7997';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,b.r*.62,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#ffd36a';ctx.beginPath();ctx.arc(0,0,13+Math.sin(S.elapsed*7)*2,0,Math.PI*2);ctx.fill();ctx.restore()};
  const drawPickup = p => {const colors={repair:'#68ffc2',shield:'#9b7dff',overdrive:'#ffd36a'};ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.phase);ctx.strokeStyle=colors[p.type];ctx.lineWidth=3;ctx.beginPath();ctx.rect(-8,-8,16,16);ctx.stroke();ctx.fillStyle=colors[p.type];ctx.globalAlpha=.35;ctx.fillRect(-6,-6,12,12);ctx.restore()};

  S.draw = () => {
    ctx.save();const sx=S.shake>0?(Math.random()-.5)*S.shake:0,sy=S.shake>0?(Math.random()-.5)*S.shake:0;ctx.translate(sx,sy);ctx.clearRect(-30,-30,S.W+60,S.H+60);
    for(const star of S.stars){ctx.globalAlpha=Math.max(.08,star.a+.15*Math.sin(S.elapsed*1.8+star.tw));ctx.fillStyle='#c8f3ff';ctx.fillRect(star.x*S.W,star.y*S.H,star.r,star.r)}ctx.globalAlpha=1;ctx.strokeStyle='#23608222';
    for(let x=0;x<S.W;x+=80){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,S.H);ctx.stroke()}for(let y=0;y<S.H;y+=80){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(S.W,y);ctx.stroke()}
    for(const item of S.pickups)drawPickup(item);for(const b of S.bullets){ctx.fillStyle='#75f1ff';ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,Math.PI*2);ctx.fill()}for(const b of S.enemyBullets){ctx.fillStyle=b.color;ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,Math.PI*2);ctx.fill()}for(const e of S.enemies)drawEnemy(e);drawBoss();if(S.player)drawShip();
    for(const p of S.particles){ctx.globalAlpha=Math.max(0,p.life/p.max);ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill()}ctx.globalAlpha=1;ctx.restore();
  };

  const loop = now => {const dt=Math.min(.033,(now-S.last)/1000);S.last=now;if(S.state==='running')S.update(dt);S.draw();requestAnimationFrame(loop)};
  addEventListener('resize',S.resize);S.resize();for(let i=0;i<175;i++)S.stars.push({x:Math.random(),y:Math.random(),r:Math.random()*1.6+.25,a:Math.random()*.68+.16,tw:Math.random()*5});
  addEventListener('keydown',e=>{const k=e.key.toLowerCase();if(['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d','p','escape',' '].includes(k))e.preventDefault();S.keys.add(k);if(k===' ')S.tryDash();if((k==='p'||k==='escape')&&S.state==='running')S.pauseGame();else if((k==='p'||k==='escape')&&S.state==='paused')S.resumeGame()});
  addEventListener('keyup',e=>S.keys.delete(e.key.toLowerCase()));
  S.canvas.addEventListener('pointerdown',e=>{if(S.state!=='running'||e.clientX>S.W*.72)return;S.touch.id=e.pointerId;S.touch.ox=e.clientX;S.touch.oy=e.clientY;S.canvas.setPointerCapture(e.pointerId)});
  S.canvas.addEventListener('pointermove',e=>{if(e.pointerId!==S.touch.id)return;const dx=e.clientX-S.touch.ox,dy=e.clientY-S.touch.oy,m=Math.hypot(dx,dy)||1,s=Math.min(1,m/90);S.touch.x=dx/m*s;S.touch.y=dy/m*s});
  const release=e=>{if(e.pointerId===S.touch.id){S.touch.id=null;S.touch.x=S.touch.y=0}};S.canvas.addEventListener('pointerup',release);S.canvas.addEventListener('pointercancel',release);
  S.$('startBtn').addEventListener('click',S.startGame);S.$('restartBtn').addEventListener('click',S.startGame);S.$('resumeBtn').addEventListener('click',S.resumeGame);S.ui.dashBtn.addEventListener('click',S.tryDash);
  S.ui.startBest.textContent=S.best;S.ui.best.textContent='BEST '+String(S.best).padStart(6,'0');requestAnimationFrame(loop);
})();

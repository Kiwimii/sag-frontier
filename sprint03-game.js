'use strict';
SAG.update = dt => {
  const S=SAG,p=S.player;
  S.elapsed+=dt;S.waveClock+=dt;S.spawnTimer-=dt;S.fireTimer-=dt;p.invuln=Math.max(0,p.invuln-dt);p.dash=Math.max(0,p.dash-dt);p.overdrive=Math.max(0,p.overdrive-dt);
  S.comboClock=Math.max(0,S.comboClock-dt);if(S.comboClock<=0)S.combo=Math.max(1,S.combo-dt*.9);
  S.toastTimer=Math.max(0,S.toastTimer-dt);if(S.toastTimer<=0)S.ui.toast.classList.remove('show');
  if(S.waveClock>=44&&!S.boss)S.advanceWave();

  let dx=(S.keys.has('d')||S.keys.has('arrowright')?1:0)-(S.keys.has('a')||S.keys.has('arrowleft')?1:0),dy=(S.keys.has('s')||S.keys.has('arrowdown')?1:0)-(S.keys.has('w')||S.keys.has('arrowup')?1:0);
  if(Math.hypot(S.touch.x,S.touch.y)>.05){dx=S.touch.x;dy=S.touch.y}
  const moveMag=Math.hypot(dx,dy);
  if(p.dashTime>0){p.dashTime=Math.max(0,p.dashTime-dt);p.x+=p.dashDx*980*dt;p.y+=p.dashDy*980*dt;S.addParticles(p.x,p.y,'#50e6ff',2,70)}
  else if(moveMag>.01){dx/=moveMag;dy/=moveMag;p.x+=dx*p.speed*dt;p.y+=dy*p.speed*dt;p.angle=Math.atan2(dy,dx)+Math.PI/2}
  p.x=Math.max(24,Math.min(S.W-24,p.x));p.y=Math.max(24,Math.min(S.H-24,p.y));

  if(S.spawnTimer<=0){S.spawnEnemy();const pressure=Math.min(.75,(S.wave-1)*.035);S.spawnTimer=Math.max(.22,1.04-S.elapsed*.007-pressure);if(S.wave>=4&&Math.random()<.13)S.spawnEnemy()}
  const effectiveRate=p.overdrive>0?p.fireRate*.55:p.fireRate;if(S.fireTimer<=0){S.shoot();S.fireTimer=effectiveRate}

  for(const b of S.bullets){b.x+=b.vx*dt;b.y+=b.vy*dt;if(b.x<-100||b.x>S.W+100||b.y<-100||b.y>S.H+100)b.dead=true}
  for(const b of S.enemyBullets){b.x+=b.vx*dt;b.y+=b.vy*dt;if(b.x<-120||b.x>S.W+120||b.y<-120||b.y>S.H+120)b.dead=true;if(!b.dead&&Math.hypot(b.x-p.x,b.y-p.y)<b.r+p.r){b.dead=true;S.damagePlayer(b.damage)}}

  for(const e of S.enemies){
    if(e.dead)continue;const a=Math.atan2(p.y-e.y,p.x-e.x);e.angle=a+Math.PI/2;e.shoot-=dt;
    if(e.mode==='gunner'){
      const dist=Math.hypot(p.x-e.x,p.y-e.y),desired=260,dir=dist>desired+35?1:dist<desired-35?-1:0;e.x+=Math.cos(a)*e.s*dir*dt;e.y+=Math.sin(a)*e.s*dir*dt;e.x+=Math.cos(a+Math.PI/2)*e.s*.35*dt;
      if(e.shoot<=0){S.enemyShoot(e.x,e.y,a,315,e.damage,'#6dffb3');e.shoot=1.45+Math.random()*.5}
    } else {
      const sway=e.mode==='swerve'?Math.sin(S.elapsed*5+e.phase)*.58:0,speed=e.mode==='charge'&&Math.sin(S.elapsed*2.8+e.phase)>.45?e.s*1.35:e.s;e.x+=Math.cos(a+sway)*speed*dt;e.y+=Math.sin(a+sway)*speed*dt;
    }
    if(Math.hypot(e.x-p.x,e.y-p.y)<e.r+p.r){S.damagePlayer(e.damage);e.dead=true;S.addParticles(e.x,e.y,e.color,10,170)}
  }

  if(S.boss){
    const b=S.boss,a=Math.atan2(p.y-b.y,p.x-b.x);b.angle=a+Math.PI/2;b.phase+=dt;b.shoot-=dt;b.summon-=dt;b.x+=Math.cos(a)*b.s*dt+Math.cos(b.phase*1.6)*18*dt;b.y+=Math.sin(a)*b.s*dt+Math.sin(b.phase*1.35)*18*dt;
    if(b.shoot<=0){for(let i=0;i<10;i++){const z=a+(i-4.5)*.19;S.enemyShoot(b.x,b.y,z,280+S.wave*4,10+Math.floor(S.wave/3),'#ff668b')}b.shoot=1.25}
    if(b.summon<=0){for(let i=0;i<3;i++)S.spawnEnemy(S.profiles[i%S.profiles.length],true);b.summon=5.5;S.showToast('WARDEN DEPLOYING ESCORTS')}
    if(Math.hypot(b.x-p.x,b.y-p.y)<b.r+p.r)S.damagePlayer(b.damage);
  }

  for(const shot of S.bullets){
    if(shot.dead)continue;
    if(S.boss&&!S.boss.dead&&Math.hypot(shot.x-S.boss.x,shot.y-S.boss.y)<shot.r+S.boss.r){S.boss.hp-=shot.damage;S.addParticles(shot.x,shot.y,'#ff5577',3,90);if(S.boss.hp<=0)S.killBoss();if(shot.pierce>0)shot.pierce--;else shot.dead=true;continue}
    for(const e of S.enemies){if(e.dead)continue;if(Math.hypot(shot.x-e.x,shot.y-e.y)<shot.r+e.r){e.hp-=shot.damage;S.addParticles(shot.x,shot.y,e.color,2,70);if(e.hp<=0)S.killEnemy(e);if(shot.pierce>0)shot.pierce--;else{shot.dead=true;break}}}
  }

  for(const item of S.pickups){item.life-=dt;item.phase+=dt*3;if(item.life<=0)item.dead=true;if(!item.dead&&Math.hypot(item.x-p.x,item.y-p.y)<item.r+p.r+7)S.collectPickup(item)}
  for(const part of S.particles){part.life-=dt;part.x+=part.vx*dt;part.y+=part.vy*dt;part.vx*=Math.pow(.05,dt);part.vy*=Math.pow(.05,dt)}

  S.bullets=S.bullets.filter(b=>!b.dead);S.enemyBullets=S.enemyBullets.filter(b=>!b.dead);S.enemies=S.enemies.filter(e=>!e.dead);S.pickups=S.pickups.filter(i=>!i.dead);S.particles=S.particles.filter(i=>i.life>0);S.shake=Math.max(0,S.shake-dt*28);S.updateUI();
};

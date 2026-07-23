const fs = require('fs');
const file = 'tools/build-sprint07.cjs';
let source = fs.readFileSync(file, 'utf8');

function replaceLine(prefix, value) {
  const lines = source.split('\n');
  const index = lines.findIndex(line => line.startsWith(prefix));
  if (index < 0) throw new Error(`Could not locate builder line: ${prefix}`);
  lines[index] = value;
  source = lines.join('\n');
}

// The source builder itself uses template literals. Generated runtime strings must not
// accidentally interpolate variables such as q, elapsed or boost while the builder runs.
const endRunCode = "function endRun(){if(state==='over')return;state='over';const credits=Math.max(25,Math.round((score*.055+kills*2+wave*18+bossesKilled*80)*player.creditMul)),bonusCore=Math.random()<player.coreChance?1:0,cores=bossesKilled+Math.floor(eliteKills/6)+bonusCore,skillGain=elapsed>=25?1+Math.floor(bossesKilled/2):0;save.credits+=credits;save.cores+=cores;save.skillPoints+=skillGain;save.best=Math.max(save.best,score);save.stats.runs++;save.stats.kills+=kills;save.stats.bosses+=bossesKilled;save.stats.creditsEarned+=credits;save.stats.skillPointsEarned=(save.stats.skillPointsEarned||0)+skillGain;storage.set(SAVE_KEY,JSON.stringify(save));const q=t();$('finalText').textContent=q.survived+' '+fmtTime(elapsed)+' · '+q.sector+' '+sector+' · '+q.earned;$('sumScore').textContent=score;$('sumCredits').textContent='+'+credits;$('sumCores').textContent='+'+cores;$('sumSkills').textContent='+'+skillGain;$('sumKills').textContent=kills;$('sumBosses').textContent=bossesKilled;$('sumLevel').textContent=level;$('sumScoreLabel').textContent=q.score;$('sumCreditsLabel').textContent=q.credits;$('sumCoresLabel').textContent=q.cores;$('sumSkillsLabel').textContent=q.skillPoints;$('sumKillsLabel').textContent=q.kills;$('sumBossesLabel').textContent=q.wardens;$('sumLevelLabel').textContent=q.level;$('retryBtn').textContent=q.retry;$('returnHangarBtn').textContent=q.return;$('gameOverTitle').textContent=q.lost;$('gameOverOverlay').classList.remove('hidden')}";
replaceLine("mustRegex(/^function endRun", "mustRegex(/^function endRun\\(\\).*$/m, " + JSON.stringify(endRunCode) + ", 'endRun');");

const collectCode = "function collectPickup(p){if(p.type==='repair')player.hp=Math.min(player.maxHp,player.hp+30);else if(p.type==='shield'){player.maxShield=Math.max(player.maxShield,35);player.shield=Math.min(player.maxShield,player.shield+35)}else if(p.type==='overdrive')player.overdrive=Math.max(player.overdrive,8);else{const boost=player.weaponBoost;if(boost.total<8){let key=p.chip;if(boost[key]>=4)key=['damage','rate','focus'].find(x=>boost[x]<4)||key;boost[key]++;boost.total++;player.chipPulse=.75;const label=key==='damage'?t().chipDamage:key==='rate'?t().chipRate:t().chipFocus;showToast(t().weaponChip+' // '+label+' +'+boost[key]);explosions.push({x:p.x,y:p.y,r:0,max:78,life:.42,maxLife:.42,weapon:true})}else score+=90}p.dead=true;wavePickups++;addParticles(p.x,p.y,p.type==='repair'?'#68ffc2':p.type==='shield'?'#9d82ff':p.type==='weapon'?'#55eaff':'#ffd36a',p.type==='weapon'?24:16,p.type==='weapon'?230:175);checkDirective()}";
replaceLine("mustRegex(/^function collectPickup", "mustRegex(/^function collectPickup\\(.*$/m, " + JSON.stringify(collectCode) + ", 'collectPickup');");

const hudNeedle = "$('weaponText').textContent=`${q.weaponNames[save.loadout.primary]}${save.loadout.secondary?' · '+q.weaponNames[save.loadout.secondary]:''}`;";
const hudCode = "$('weaponText').textContent=q.weaponNames[save.loadout.primary]+(save.loadout.secondary?' · '+q.weaponNames[save.loadout.secondary]:'')+(player.weaponBoost.total?' · +'+player.weaponBoost.total:'');const wait=lastMajorAt===0?Math.max(0,45-elapsed):Math.max(0,65-(elapsed-lastMajorAt));$('majorStatus').textContent=pendingMajor>0?(wait<=0?q.majorReady:q.majorIn+' '+Math.ceil(wait)+'s'):'';";
replaceLine("must(`$('weaponText').textContent=", "must(" + JSON.stringify(hudNeedle) + ", " + JSON.stringify(hudCode) + ");");

// Replace the skill-card patch block, which originally contained a nested HTML template literal.
const startMarker = "must(`function btn(text,fn,disabled=false,cls=''){`";
const endMarker = "function btn(text,fn,disabled=false,cls=''){`);";
const start = source.indexOf(startMarker);
const endStart = source.indexOf(endMarker, start);
if (start < 0 || endStart < 0) throw new Error('Could not locate skillCard patch block');
const skillCode = "function skillCard(id){const q=t(),node=skillTree[id],rank=save.skills[id]||0,locked=node.requires&&(save.skills[node.requires.id]||0)<node.requires.rank,d=document.createElement('article');d.className='card skill-node '+node.branch+(locked?' locked':'')+(rank>=node.max?' selected':'');const req=locked?'<div class=\"muted\">'+q.requires+': '+q.skillNames[node.requires.id]+' '+node.requires.rank+'</div>':'';d.innerHTML='<h3>'+q.skillNames[id]+'</h3><div class=\"level-pips\">'+'◆'.repeat(rank)+'◇'.repeat(node.max-rank)+'</div><p>'+q.skillDesc[id]+'</p>'+req+'<div class=\"muted\">'+q.rank+' '+rank+' / '+node.max+' · '+node.cost+' '+(node.cost===1?q.skillPoint:q.skillPoints)+'</div>';const a=document.createElement('div');a.className='card-actions';a.append(btn(rank>=node.max?q.max:q.learn,()=>buySkill(id),rank>=node.max||locked||save.skillPoints<node.cost,'gold'));d.append(a);return d}\nfunction btn(text,fn,disabled=false,cls=''){";
const replacement = "must(`function btn(text,fn,disabled=false,cls=''){`, " + JSON.stringify(skillCode) + ");";
source = source.slice(0, start) + replacement + source.slice(endStart + endMarker.length);

fs.writeFileSync(file, source);
console.log('Repaired Sprint 0.7 builder interpolation hazards');

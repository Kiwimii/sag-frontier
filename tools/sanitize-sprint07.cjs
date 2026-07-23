const fs = require('fs');

const file = 'sprint07-source.js';
let source = fs.readFileSync(file, 'utf8');

const projectileDraw = "for(const b of bullets){ctx.fillStyle=b.color||'#ffb35c';ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,Math.PI*2);ctx.fill()}for(const p of plasmaBolts){const glow=ctx.createRadialGradient(p.x,p.y,1,p.x,p.y,p.r*2.2);glow.addColorStop(0,'#ffffff');glow.addColorStop(.28,'#d9a5ff');glow.addColorStop(1,'#7e38b800');ctx.fillStyle=glow;ctx.beginPath();ctx.arc(p.x,p.y,p.r*2.2,0,Math.PI*2);ctx.fill()}";
const rocketDraw = 'for(const r of rockets){ctx.save();';
const drawIndex = source.indexOf('function draw(){');
if (drawIndex < 0) throw new Error('draw() not found');

let beforeDraw = source.slice(0, drawIndex).split(projectileDraw).join('');
let drawAndAfter = source.slice(drawIndex);
if (!drawAndAfter.includes(projectileDraw)) {
  if (!drawAndAfter.includes(rocketDraw)) throw new Error('rocket draw target not found');
  drawAndAfter = drawAndAfter.replace(rocketDraw, projectileDraw + rocketDraw);
}
source = beforeDraw + drawAndAfter;

const chipPulse = "if(player.chipPulse>0){ctx.strokeStyle='#55eaff';ctx.lineWidth=4;ctx.globalAlpha=player.chipPulse/.75;ctx.beginPath();ctx.arc(0,0,34+(1-player.chipPulse/.75)*25,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1}";
const shipMarker = "function drawShip(){ctx.save();ctx.translate(player.x,player.y);ctx.rotate(player.angle);ctx.globalAlpha=player.invuln>0&&Math.floor(player.invuln*20)%2===0?.38:1;";
source = source.split(chipPulse).join('');
if (!source.includes(shipMarker)) throw new Error('drawShip() marker not found');
source = source.replace(shipMarker, shipMarker + chipPulse);

const damage = source.match(/function damagePlayer\([^\n]+/u)?.[0] || '';
if (damage.includes('ctx.')) throw new Error('Rendering code remains inside damagePlayer');
const updateStart = source.indexOf('function update(dt){');
const updateEnd = source.indexOf('\nfunction updateHUD', updateStart);
const updateBlock = source.slice(updateStart, updateEnd);
if (updateBlock.includes(projectileDraw)) throw new Error('Projectile rendering remains inside update');
const drawBlock = source.slice(source.indexOf('function draw(){'), source.indexOf('\nfunction loop', source.indexOf('function draw(){')));
const drawShipBlock = source.slice(source.indexOf('function drawShip(){'), source.indexOf('\nfunction drawEnemy', source.indexOf('function drawShip(){')));
if (!drawBlock.includes(projectileDraw) || !drawShipBlock.includes(chipPulse)) throw new Error('Expected visual effects missing from render functions');

fs.writeFileSync(file, source);
console.log('Sprint 0.7 runtime sanitized', source.length);

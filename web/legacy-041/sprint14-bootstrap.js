(()=>{
  'use strict';
  const BUILD='0142';
  try{
    if('caches' in window)caches.keys().then(keys=>Promise.all(keys.map(key=>caches.delete(key)))).catch(()=>{});
    if('serviceWorker' in navigator)navigator.serviceWorker.getRegistrations().then(items=>items.forEach(item=>item.unregister())).catch(()=>{});
  }catch{}
  const openCommand=()=>{
    const toggle=document.getElementById('commandToggle');
    const center=document.getElementById('commandCenter');
    if(!toggle||!center||!center.classList.contains('hidden'))return true;
    toggle.click();
    return !center.classList.contains('hidden');
  };
  const revealCommand=()=>{
    openCommand();
    setTimeout(openCommand,150);
    setTimeout(openCommand,500);
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',revealCommand,{once:true});else revealCommand();
  window.SAG14_BUILD={version:'0.14.2',build:BUILD,reset:true,commandVisible:true};
})();

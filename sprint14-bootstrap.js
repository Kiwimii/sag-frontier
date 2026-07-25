(()=>{
  'use strict';
  const BUILD='0142';
  const ONBOARD='sag-frontier-command-onboarded-v142';
  try{
    if('caches' in window)caches.keys().then(keys=>Promise.all(keys.map(key=>caches.delete(key)))).catch(()=>{});
    if('serviceWorker' in navigator)navigator.serviceWorker.getRegistrations().then(items=>items.forEach(item=>item.unregister())).catch(()=>{});
  }catch{}
  const openCommand=()=>{
    const toggle=document.getElementById('commandToggle');
    const center=document.getElementById('commandCenter');
    if(!toggle||!center||!center.classList.contains('hidden'))return;
    toggle.click();
  };
  const firstStart=()=>{
    let seen=false;
    try{seen=localStorage.getItem(ONBOARD)==='1';localStorage.setItem(ONBOARD,'1');}catch{}
    if(!seen)setTimeout(openCommand,650);
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',firstStart,{once:true});else firstStart();
  window.SAG14_BUILD={version:'0.14.2',build:BUILD,reset:true};
})();

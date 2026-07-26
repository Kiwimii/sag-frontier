(() => {
  'use strict';

  const LOAD_TIMEOUT_MS = 20000;

  function boot(shell) {
    const frame = shell.querySelector('.sag-frontier-frame');
    const loader = shell.querySelector('.sag-frontier-loader');
    const status = shell.querySelector('.sag-frontier-status');
    const retry = shell.querySelector('.sag-frontier-retry');
    const progress = shell.querySelector('.sag-frontier-progress span');
    const gameUrl = shell.dataset.gameUrl;
    let timeoutId = 0;

    const fail = (message) => {
      window.clearTimeout(timeoutId);
      shell.classList.add('is-error');
      shell.classList.remove('is-ready');
      status.textContent = message;
      retry.hidden = false;
      progress.style.width = '100%';
    };

    const start = () => {
      shell.classList.remove('is-error', 'is-ready');
      retry.hidden = true;
      status.textContent = 'Spielkern wird geladen …';
      progress.style.width = '35%';
      frame.src = 'about:blank';

      window.requestAnimationFrame(() => {
        frame.src = `${gameUrl}?v=${Date.now()}`;
        progress.style.width = '70%';
      });

      timeoutId = window.setTimeout(() => {
        fail('Der Spielkern hat nicht rechtzeitig geantwortet. Prüfe, ob der Browser-Build im Plugin enthalten ist.');
      }, LOAD_TIMEOUT_MS);
    };

    frame.addEventListener('load', () => {
      if (frame.src === 'about:blank') return;
      window.clearTimeout(timeoutId);
      progress.style.width = '100%';
      status.textContent = 'Expedition bereit.';
      window.setTimeout(() => {
        shell.classList.add('is-ready');
        loader.setAttribute('aria-hidden', 'true');
      }, 250);
    });

    frame.addEventListener('error', () => fail('Der Spielkern konnte nicht geladen werden.'));
    retry.addEventListener('click', start);
    start();
  }

  document.querySelectorAll('.sag-frontier-shell').forEach(boot);
})();

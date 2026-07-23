(() => {
  'use strict';

  const $ = id => document.getElementById(id);
  const copy = {
    de: {
      context: 'ASCENSION-MATRIX',
      title: 'Deine Erfahrung bleibt.',
      message: 'Der Skill Tree verbessert alle zukünftigen Expeditionen. Die Boni sind bewusst klein und dauerhaft. Spezialisiere dich statt alles gleichzeitig auszubauen.',
      learnedTitle: 'Skill dauerhaft aktiviert.',
      learnedMessage: 'Die Ascension-Matrix wurde aktualisiert. Der neue Rang gilt ab dem nächsten Einsatz.'
    },
    en: {
      context: 'ASCENSION MATRIX',
      title: 'Your experience remains.',
      message: 'The skill tree improves every future expedition. Bonuses are intentionally modest and permanent. Specialize instead of upgrading everything at once.',
      learnedTitle: 'Skill permanently activated.',
      learnedMessage: 'The Ascension Matrix has been updated. The new rank applies from the next deployment.'
    }
  };

  const language = () => document.documentElement.lang === 'en' || $('langEn')?.classList.contains('active') ? 'en' : 'de';
  const skillsActive = () => $('tabSkills')?.classList.contains('active');

  function showSkillsMessage(learned = false) {
    if (!skillsActive()) return;
    const text = copy[language()];
    if ($('kiwimiContext')) $('kiwimiContext').textContent = text.context;
    if ($('kiwimiTitle')) $('kiwimiTitle').textContent = learned ? text.learnedTitle : text.title;
    if ($('kiwimiMessage')) $('kiwimiMessage').textContent = learned ? text.learnedMessage : text.message;
    $('kiwimiPanel')?.classList.add('speaking');
    setTimeout(() => $('kiwimiPanel')?.classList.remove('speaking'), 650);
  }

  $('tabSkills')?.addEventListener('click', () => requestAnimationFrame(() => showSkillsMessage(false)));
  for (const id of ['langDe', 'langEn']) $(id)?.addEventListener('click', () => requestAnimationFrame(() => showSkillsMessage(false)));
  $('skillGrid')?.addEventListener('click', event => {
    const button = event.target.closest('.card-actions button');
    if (!button || button.disabled) return;
    requestAnimationFrame(() => showSkillsMessage(true));
  });
})();

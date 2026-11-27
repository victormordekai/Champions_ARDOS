/* ABERTURA — Champions ARDOS (teste)
 * Mesmo mecanismo da Loja Everest × ARDOS.
 * Roda no <head> (sem defer) para marcar a página antes da primeira pintura e evitar piscar.
 * Acontece a cada carregamento da página inicial. Não aparece com "reduzir movimento".
 * Se este arquivo não carregar, a página abre normalmente.
 */
(function () {
  'use strict';
  var raiz = document.documentElement;
  try { if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return; } catch (e) { /* segue */ }
  raiz.classList.add('com-abertura');
  // Duração total (1,5 s + 0,18 s + 0,8 s); o CSS também esconde sozinho, por segurança.
  window.setTimeout(function () { raiz.classList.remove('com-abertura'); }, 2500);
})();

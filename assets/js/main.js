/* Navegação estática: nenhuma leitura de planilhas ou armazenamento de dados. */
(function () {
  'use strict';
  function buildTrackingUrl(value) {
    const pedido = String(value || '').trim();
    const message = pedido
      ? `Olá, equipe ARDOS! Gostaria de acompanhar o meu pedido nº ${pedido}. Podem me informar o andamento?`
      : 'Olá, equipe ARDOS! Gostaria de acompanhar meu pedido. Podem me ajudar a identificá-lo?';
    return 'https://api.whatsapp.com/send?phone=5541997650283&text=' + encodeURIComponent(message);
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { buildTrackingUrl };
  if (typeof document === 'undefined') return;
  const form = document.getElementById('pedido-form');
  if (form) form.addEventListener('submit', function (event) {
    event.preventDefault();
    const url = buildTrackingUrl(document.getElementById('pedido').value);
    // Navegação direta evita bloqueio de pop-up; nenhuma mensagem é enviada automaticamente.
    window.location.assign(url);
  });
})();

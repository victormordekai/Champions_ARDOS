/**
 * CHAMPIONS ARDOS · GRADE DO PEDIDO · tela
 *
 * Monta equipes, pessoas e peças na tela, revisa e envia ao Core_ARDOS_grade.
 * A grade NÃO sai da governança da ARDOS: a página não gera arquivo, não
 * copia, não exporta e não guarda nada no navegador. O único destino é o
 * Core (GRADE_CONFIG.endpoint). Sem endpoint, encaminha ao formulário oficial.
 * Todo texto entra por textContent/value.
 */
(function () {
  'use strict';
  var G = window.GradeModelo;
  var CFG = window.GRADE_CONFIG || { endpoint: '' };
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var estado = G.estadoInicial();
  var raizEquipes;

  function el(tag, attrs, filhos) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === 'classe') n.className = attrs[k];
      else if (k === 'texto') n.textContent = attrs[k];
      else n.setAttribute(k, attrs[k]);
    });
    (filhos || []).forEach(function (f) { if (f != null) n.appendChild(typeof f === 'string' ? document.createTextNode(f) : f); });
    return n;
  }
  function limpar(n) { while (n.firstChild) n.removeChild(n.firstChild); }

  function seletorTamanho(rotulo, valor, vazio) {
    var s = el('select', { 'aria-label': rotulo });
    s.appendChild(el('option', { value: '', texto: vazio }));
    var ad = el('optgroup', { label: 'ADULTO' });
    G.TAMANHOS_ADULTO.forEach(function (t) { ad.appendChild(el('option', { value: 'ADULTO|' + t, texto: t })); });
    var inf = el('optgroup', { label: 'INFANTIL' });
    G.TAMANHOS_INFANTIL.forEach(function (t) { inf.appendChild(el('option', { value: 'INF|' + t, texto: t + ' INF' })); });
    s.appendChild(ad); s.appendChild(inf);
    s.value = valor || '';
    return s;
  }

  // ------------------------------------------------------------ desenho

  function desenhar(foco) {
    limpar(raizEquipes);
    estado.equipes.forEach(function (eq, i) { raizEquipes.appendChild(cartaoEquipe(eq, i)); });
    atualizarTotal();
    esconderRevisao();
    if (foco) { var alvo = document.getElementById(foco); if (alvo) alvo.focus(); }
  }

  function cartaoEquipe(eq, i) {
    var card = el('section', { classe: 'gp-equipe', 'aria-labelledby': 'tit-' + eq.id });
    var nome = el('input', { id: 'nome-' + eq.id, type: 'text', maxlength: String(G.LIMITES.equipe), autocomplete: 'off', placeholder: 'NOME DO TIME OU EQUIPE' });
    nome.value = eq.nome;
    nome.addEventListener('input', function () { nome.value = nome.value.toLocaleUpperCase('pt-BR'); eq.nome = nome.value; esconderRevisao(); });
    var remover = el('button', { type: 'button', classe: 'gp-botao gp-botao--fantasma', texto: 'Remover equipe' });
    remover.addEventListener('click', function () {
      if (estado.equipes.length === 1) { aviso('Ao menos uma equipe deve permanecer na grade.'); return; }
      if (!window.confirm('Remover a equipe ' + (eq.nome || (i + 1)) + ' e todas as pessoas dela?')) return;
      estado.equipes.splice(i, 1); desenhar();
    });
    card.appendChild(el('div', { classe: 'gp-equipe-topo' }, [
      el('h3', { id: 'tit-' + eq.id, texto: 'Equipe ' + (i + 1) }),
      el('label', { classe: 'gp-campo gp-campo--nome' }, [el('span', { texto: 'Nome do time ou equipe' }), nome]),
      remover
    ]));

    // produtos
    var grupo = el('fieldset', { classe: 'gp-produtos' }, [el('legend', { texto: 'Peças desta equipe' })]);
    G.PRODUTOS.forEach(function (p) {
      var cb = el('input', { type: 'checkbox', value: p.codigo });
      cb.checked = eq.produtos.indexOf(p.codigo) >= 0;
      cb.addEventListener('change', function () {
        if (cb.checked) {
          if (eq.produtos.length >= G.LIMITES.produtosEquipe) { cb.checked = false; aviso('Máximo de ' + G.LIMITES.produtosEquipe + ' peças por equipe.'); return; }
          eq.produtos.push(p.codigo);
          eq.produtos.sort(function (a, b) { return indiceProduto(a) - indiceProduto(b); });
        } else {
          eq.produtos = eq.produtos.filter(function (x) { return x !== p.codigo; });
        }
        desenhar();
      });
      grupo.appendChild(el('label', { classe: 'gp-chip' }, [cb, el('span', { texto: p.rotulo })]));
    });
    card.appendChild(grupo);

    var mesmo = el('input', { type: 'checkbox' });
    mesmo.checked = eq.mesmoTamanho;
    mesmo.addEventListener('change', function () {
      eq.mesmoTamanho = mesmo.checked;
      eq.atletas.forEach(function (a) {
        if (eq.mesmoTamanho) {
          var v = eq.produtos.map(function (p) { return a.tamanhos[p]; }).filter(Boolean);
          a.tamanhoUnico = v.length ? v[0] : a.tamanhoUnico;
        } else { eq.produtos.forEach(function (p) { if (!a.tamanhos[p]) a.tamanhos[p] = a.tamanhoUnico; }); }
      });
      desenhar();
    });
    card.appendChild(el('label', { classe: 'gp-mesmo' }, [mesmo, el('span', { texto: 'Mesmo tamanho em todas as peças de cada pessoa' })]));
    if (!eq.produtos.length) card.appendChild(el('p', { classe: 'gp-alerta-inline', texto: 'Escolha ao menos uma peça acima.' }));

    // pessoas
    var colunasTamanho = eq.mesmoTamanho ? ['Tamanho'] : eq.produtos.map(G.rotuloProduto);
    var tabela = el('div', { classe: 'gp-tabela', role: 'table', 'aria-label': 'Pessoas da equipe ' + (i + 1) });
    var cab = el('div', { classe: 'gp-linha gp-cab', role: 'row' });
    ['#'].concat(colunasTamanho, ['Nome na peça', 'Nº', 'Posição', 'Cor / variante', '']).forEach(function (t) { cab.appendChild(el('span', { role: 'columnheader', texto: t })); });
    tabela.appendChild(cab);
    eq.atletas.forEach(function (a, j) { tabela.appendChild(linhaPessoa(eq, a, j)); });
    tabela.style.setProperty('--gp-colunas', String(colunasTamanho.length));
    card.appendChild(tabela);

    var add = el('button', { type: 'button', classe: 'gp-botao', texto: '＋ Adicionar pessoa' });
    add.addEventListener('click', function () {
      if (eq.atletas.length >= G.LIMITES.atletasEquipe) { aviso('Máximo de ' + G.LIMITES.atletasEquipe + ' pessoas por equipe.'); return; }
      var ultimo = eq.atletas[eq.atletas.length - 1];
      var novo = G.novoAtleta({ posicao: ultimo ? ultimo.posicao : 'LINHA' });
      eq.atletas.push(novo);
      desenhar('tam-' + novo.id + '-0');
    });
    card.appendChild(el('div', { classe: 'gp-acoes-equipe' }, [add, el('span', { classe: 'gp-contagem', texto: eq.atletas.length + ' pessoa(s)' })]));
    return card;
  }

  function indiceProduto(c) { for (var i = 0; i < G.PRODUTOS.length; i++) if (G.PRODUTOS[i].codigo === c) return i; return 99; }

  function linhaPessoa(eq, a, j) {
    var linha = el('div', { classe: 'gp-linha', role: 'row' });
    linha.appendChild(el('span', { classe: 'gp-n', role: 'cell', texto: String(j + 1) }));
    var rot = 'pessoa ' + (j + 1);
    if (eq.mesmoTamanho) {
      var s = seletorTamanho('Tamanho, ' + rot, a.tamanhoUnico, 'Tamanho');
      s.id = 'tam-' + a.id + '-0';
      s.addEventListener('change', function () { a.tamanhoUnico = s.value; atualizarTotal(); esconderRevisao(); });
      linha.appendChild(el('span', { role: 'cell', 'data-rotulo': 'Tamanho' }, [s]));
    } else {
      eq.produtos.forEach(function (p, k) {
        var sp = seletorTamanho(G.rotuloProduto(p) + ', ' + rot, a.tamanhos[p], 'Sem ' + G.rotuloProduto(p).toLowerCase());
        sp.id = 'tam-' + a.id + '-' + k;
        sp.addEventListener('change', function () { a.tamanhos[p] = sp.value; atualizarTotal(); esconderRevisao(); });
        linha.appendChild(el('span', { role: 'cell', 'data-rotulo': G.rotuloProduto(p) }, [sp]));
      });
    }
    var nome = el('input', { type: 'text', maxlength: String(G.LIMITES.nome), autocomplete: 'off', 'aria-label': 'Nome na peça, ' + rot, placeholder: 'NOME' });
    nome.value = a.nome;
    nome.addEventListener('input', function () { nome.value = nome.value.toLocaleUpperCase('pt-BR'); a.nome = nome.value; esconderRevisao(); });
    var num = el('input', { type: 'text', inputmode: 'numeric', maxlength: '3', autocomplete: 'off', 'aria-label': 'Número, ' + rot, placeholder: 'Nº' });
    num.value = a.numero;
    num.addEventListener('input', function () { num.value = G.numero(num.value); a.numero = num.value; esconderRevisao(); });
    var pos = el('select', { 'aria-label': 'Posição, ' + rot });
    G.POSICOES.forEach(function (p) { pos.appendChild(el('option', { value: p, texto: p })); });
    pos.value = a.posicao;
    pos.addEventListener('change', function () { a.posicao = pos.value; atualizarTotal(); esconderRevisao(); });
    var cor = el('input', { type: 'text', maxlength: String(G.LIMITES.cor), autocomplete: 'off', 'aria-label': 'Cor ou variante, ' + rot, placeholder: 'COR / VARIANTE' });
    cor.value = a.cor;
    cor.addEventListener('input', function () { cor.value = cor.value.toLocaleUpperCase('pt-BR'); a.cor = cor.value; esconderRevisao(); });
    var rem = el('button', { type: 'button', classe: 'gp-remover', 'aria-label': 'Remover ' + rot, texto: '×' });
    rem.addEventListener('click', function () {
      if (eq.atletas.length === 1) { eq.atletas[0] = G.novoAtleta(); } else { eq.atletas.splice(j, 1); }
      desenhar();
    });
    [['Nome', nome], ['Nº', num], ['Posição', pos], ['Cor / variante', cor]].forEach(function (par) {
      linha.appendChild(el('span', { role: 'cell', 'data-rotulo': par[0] }, [par[1]]));
    });
    linha.appendChild(el('span', { role: 'cell' }, [rem]));
    return linha;
  }

  function atualizarTotal() {
    var r = G.resumo(G.montarEnvio(estado).envio);
    $('#gp-total').textContent = estado.equipes.length + ' equipe(s) · ' + r.pessoas + ' pessoa(s) · ' + r.pecas + ' peça(s)';
  }

  function aviso(texto) { $('#gp-erros').textContent = texto; }

  // ------------------------------------------------------------ revisão

  function esconderRevisao() {
    $('#gp-revisao').hidden = true;
    var env = $('#gp-enviar'); if (env) env.disabled = true;
  }

  function revisar() {
    var r = G.montarEnvio(estado);
    var caixa = $('#gp-erros');
    limpar(caixa);
    if (r.erros.length) {
      caixa.appendChild(el('p', { texto: 'Corrija antes de concluir:' }));
      caixa.appendChild(el('ul', {}, r.erros.slice(0, 30).map(function (e) { return el('li', { texto: e }); })));
      caixa.focus();
      return;
    }
    var res = G.resumo(r.envio);
    var box = $('#gp-resumo');
    limpar(box);
    res.equipes.forEach(function (eq) {
      var bloco = el('article', { classe: 'gp-res-equipe' }, [
        el('h3', { texto: eq.nome }),
        el('p', { texto: eq.pessoas + ' pessoa(s) · ' + Object.keys(eq.porPosicao).map(function (p) { return p + ' ' + eq.porPosicao[p]; }).join(' · ') })
      ]);
      Object.keys(eq.porProduto).forEach(function (p) {
        var tams = G.ordenarTamanhos(Object.keys(eq.porProduto[p]));
        var total = tams.reduce(function (n, t) { return n + eq.porProduto[p][t]; }, 0);
        var chips = el('div', { classe: 'gp-chips' }, tams.map(function (t) { return el('em', { texto: G.rotuloTamanho(t) + ' × ' + eq.porProduto[p][t] }); }));
        bloco.appendChild(el('div', { classe: 'gp-res-produto' }, [el('strong', { texto: G.rotuloProduto(p) + ': ' + total }), chips]));
      });
      box.appendChild(bloco);
    });
    var avisos = $('#gp-avisos');
    limpar(avisos);
    if (r.avisos.length) avisos.appendChild(el('ul', {}, r.avisos.slice(0, 30).map(function (e) { return el('li', { texto: e }); })));
    $('#gp-revisao').hidden = false;
    var env = $('#gp-enviar'); if (env) env.disabled = !$('#gp-consentimento').checked;
    $('#gp-revisao').scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    $('#gp-revisao-titulo').focus();
  }

  function uuid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    var b = new Uint8Array(16); crypto.getRandomValues(b);
    b[6] = (b[6] & 15) | 64; b[8] = (b[8] & 63) | 128;
    var h = Array.from(b, function (x) { return ('0' + x.toString(16)).slice(-2); }).join('');
    return h.slice(0, 8) + '-' + h.slice(8, 12) + '-' + h.slice(12, 16) + '-' + h.slice(16, 20) + '-' + h.slice(20);
  }

  var envioId = null;
  function enviar() {
    var r = G.montarEnvio(estado);
    if (r.erros.length) { revisar(); return; }
    if (!$('#gp-consentimento').checked) { $('#gp-status').textContent = 'Marque a autorização para enviar.'; return; }
    envioId = envioId || uuid(); // mesmo ID em nova tentativa: o Core não duplica
    var corpo = Object.assign({}, r.envio, { envioId: envioId, consentimento: true, armadilha: $('#gp-armadilha').value });
    var botao = $('#gp-enviar');
    botao.disabled = true;
    $('#gp-status').textContent = 'Enviando…';
    fetch(CFG.endpoint, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(corpo), redirect: 'follow' })
      .then(function (resp) { return resp.json(); })
      .then(function (res) {
        if (res && res.ok) {
          $('#gp-status').textContent = 'Recebido. Protocolo ' + String(res.protocolo || '') + '. Guarde este número: a ARDOS confere a grade antes da produção.';
          envioId = null;
        } else {
          $('#gp-status').textContent = 'Não foi possível registrar: ' + String((res && res.mensagem) || 'tente de novo.');
          botao.disabled = false;
        }
      })
      .catch(function () {
        $('#gp-status').textContent = 'Sem conexão com a ARDOS agora. Mantenha esta página aberta e tente de novo em instantes.';
        botao.disabled = false;
      });
  }

  // ------------------------------------------------------------ início

  function escreverCabecalho() {
    $('#gp-codigo').value = estado.pedidoCode;
    $('#gp-modalidade').value = estado.modalidade;
    $('#gp-contato-nome').value = estado.contato.nome;
    $('#gp-contato-email').value = estado.contato.email;
    $('#gp-contato-tel').value = estado.contato.telefone;
  }

  function iniciar() {
    if (!G) return;
    raizEquipes = $('#gp-equipes');
    if (!raizEquipes) return;
    $('#gp-codigo').addEventListener('input', function (e) { e.target.value = G.codigoPedido(e.target.value); estado.pedidoCode = e.target.value; esconderRevisao(); });
    $('#gp-modalidade').addEventListener('input', function (e) { e.target.value = e.target.value.toLocaleUpperCase('pt-BR'); estado.modalidade = e.target.value; });
    $('#gp-contato-nome').addEventListener('input', function (e) { e.target.value = e.target.value.toLocaleUpperCase('pt-BR'); estado.contato.nome = e.target.value; });
    $('#gp-contato-email').addEventListener('input', function (e) { estado.contato.email = e.target.value; esconderRevisao(); });
    $('#gp-contato-tel').addEventListener('input', function (e) { estado.contato.telefone = e.target.value; });
    $('#gp-add-equipe').addEventListener('click', function () {
      if (estado.equipes.length >= G.LIMITES.equipes) { aviso('Máximo de ' + G.LIMITES.equipes + ' equipes.'); return; }
      var eq = G.novaEquipe();
      estado.equipes.push(eq);
      desenhar('nome-' + eq.id);
    });
    $('#gp-revisar').addEventListener('click', revisar);

    var envioBloco = $('#gp-envio-online');
    if (CFG.endpoint && /^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(CFG.endpoint)) {
      $('#gp-envio-indisponivel').remove();
      $('#gp-consentimento').addEventListener('change', function (e) { $('#gp-enviar').disabled = !e.target.checked || $('#gp-revisao').hidden; });
      $('#gp-enviar').addEventListener('click', enviar);
    } else {
      envioBloco.remove();
      $('#gp-envio-indisponivel').hidden = false;
    }
    desenhar();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();
})();

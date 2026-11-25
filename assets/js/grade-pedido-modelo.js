/**
 * CHAMPIONS ARDOS · GRADE DO PEDIDO · modelo (funções puras)
 *
 * O que faz: guarda as regras da grade (produtos, tamanhos, posições, limites),
 * monta o envio no contrato champions.ardos.grade-web.v1 (o mesmo que o
 * Core_ARDOS_grade valida em grade_seguranca.gs), confere erros e resume por
 * equipe/produto/tamanho.
 *
 * O que NÃO faz: não toca na tela, não envia nada, não gera nem lê arquivo,
 * não guarda nada no navegador. A grade só sai da página para o Core.
 * Validação aqui é conforto do cliente; a que vale é a do Core.
 *
 * Público (site aberto): não contém dado de cliente, pedido, planilha ou preço.
 */
(function (raiz) {
  'use strict';

  var SCHEMA = 'champions.ardos.grade-web.v1';
  var VERSAO = 'GRADE_WEB_V1.1.0';

  var TAMANHOS_ADULTO = ['PP', 'P', 'M', 'G', 'GG', 'XG', 'G1', 'G2', 'G3', 'G4', 'G5', 'G6'];
  var TAMANHOS_INFANTIL = ['02', '04', '06', '08', '10', '12', '14', '16'];

  /** Posições. TORCIDA entrou em 24/11/2026 (pedido de Victor). Ordem = ordem na tela. */
  var POSICOES = ['LINHA', 'GOLEIRO', 'TORCIDA', 'COMISSÃO TÉCNICA', 'ÁRBITRO', 'OUTRO'];

  /**
   * Produtos que o cliente pode escolher. Códigos com A-Z, 0-9 e _ (regra do Core).
   * Nomes seguem o glossário G001 do Extrator. Só peças com a grade de tamanhos
   * PP–G6 / 02–16: meião, bandeira e acessórios ficam fora até existir grade própria.
   * O Core aceita produto fora do cadastro dele e marca em OCORRENCIAS.
   */
  var PRODUTOS = [
    { codigo: 'CAMISA', rotulo: 'Camisa manga curta' },
    { codigo: 'CAMISA_ML', rotulo: 'Camisa manga longa' },
    { codigo: 'REGATA', rotulo: 'Regata' },
    { codigo: 'CAMISETA', rotulo: 'Camiseta' },
    { codigo: 'POLO', rotulo: 'Polo' },
    { codigo: 'SEGUNDA_PELE', rotulo: 'Segunda pele' },
    { codigo: 'CALCAO', rotulo: 'Calção' },
    { codigo: 'BERMUDA', rotulo: 'Bermuda' },
    { codigo: 'CALCA', rotulo: 'Calça' },
    { codigo: 'LEGGING', rotulo: 'Legging' },
    { codigo: 'CORTA_VENTO', rotulo: 'Corta-vento' },
    { codigo: 'JAQUETA', rotulo: 'Jaqueta' },
    { codigo: 'MOLETOM', rotulo: 'Moletom' },
    { codigo: 'COLETE', rotulo: 'Colete' }
  ];

  var LIMITES = { equipes: 20, atletasEquipe: 300, atletasTotal: 600, produtosEquipe: 10,
    pedidoCode: 50, equipe: 90, nome: 60, cor: 35, modalidade: 70, contatoNome: 90, email: 120, telefone: 24 };

  function rotuloProduto(codigo) {
    for (var i = 0; i < PRODUTOS.length; i++) if (PRODUTOS[i].codigo === codigo) return PRODUTOS[i].rotulo;
    return codigo;
  }

  function maiusculo(t, max) {
    var s = String(t == null ? '' : t).normalize('NFC')
      .replace(/[\u0000-\u001F\u007F-\u009F​-‏‪-‮⁠-⁤﻿]/g, '')
      .replace(/\s+/g, ' ').trim().toLocaleUpperCase('pt-BR');
    return max ? Array.from(s).slice(0, max).join('') : s;
  }

  function codigoPedido(t) { return String(t == null ? '' : t).toUpperCase().replace(/[^A-Z0-9_-]/g, '').slice(0, LIMITES.pedidoCode); }
  function numero(t) { return String(t == null ? '' : t).replace(/\D/g, '').slice(0, 3); }

  function tamanhoValido(v) {
    if (typeof v !== 'string') return false;
    var p = v.split('|');
    return p.length === 2 && ((p[0] === 'ADULTO' && TAMANHOS_ADULTO.indexOf(p[1]) >= 0) || (p[0] === 'INF' && TAMANHOS_INFANTIL.indexOf(p[1]) >= 0));
  }

  function rotuloTamanho(v) {
    if (!tamanhoValido(v)) return '';
    var p = v.split('|');
    return p[0] === 'INF' ? p[1] + ' INF' : p[1];
  }

  // ------------------------------------------------------------ estado

  var proximoId = 1;
  function novoAtleta(dados) {
    dados = dados || {};
    return { id: 'A' + (proximoId++), nome: dados.nome || '', numero: dados.numero || '', posicao: POSICOES.indexOf(dados.posicao) >= 0 ? dados.posicao : 'LINHA',
      cor: dados.cor || '', tamanhoUnico: dados.tamanhoUnico || '', tamanhos: Object.assign({}, dados.tamanhos || {}) };
  }
  function novaEquipe(dados) {
    dados = dados || {};
    return { id: 'E' + (proximoId++), nome: dados.nome || '', produtos: (dados.produtos || ['CAMISA', 'CALCAO']).slice(),
      mesmoTamanho: dados.mesmoTamanho !== false, atletas: (dados.atletas || [{}]).map(novoAtleta) };
  }
  function estadoInicial() {
    return { pedidoCode: '', modalidade: '', contato: { nome: '', email: '', telefone: '' }, equipes: [novaEquipe()] };
  }

  /** Tamanho de cada peça do atleta, aplicando "mesmo tamanho em todas as peças". */
  function tamanhosDoAtleta(eq, a) {
    var t = {};
    eq.produtos.forEach(function (p) {
      var v = eq.mesmoTamanho ? a.tamanhoUnico : a.tamanhos[p];
      if (tamanhoValido(v)) t[p] = v;
    });
    return t;
  }

  // ------------------------------------------------------------ envio

  /**
   * Monta o envio no contrato do Core. Erros impedem concluir; avisos não.
   * Nomes vão em maiúsculas; número só dígitos (zeros preservados).
   */
  function montarEnvio(estado) {
    var erros = [], avisos = [];
    var code = codigoPedido(estado.pedidoCode);
    if (!code) erros.push('Informe o código do pedido (o código que a ARDOS enviou).');
    var email = String(estado.contato.email || '').trim().slice(0, LIMITES.email);
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) erros.push('E-mail de contato inválido.');
    if (!estado.equipes.length) erros.push('Monte ao menos uma equipe.');
    if (estado.equipes.length > LIMITES.equipes) erros.push('Máximo de ' + LIMITES.equipes + ' equipes por envio.');

    var total = 0;
    var equipes = estado.equipes.map(function (eq, i) {
      var nomeEq = maiusculo(eq.nome, LIMITES.equipe);
      var ref = nomeEq || 'Equipe ' + (i + 1);
      if (!nomeEq) erros.push('Equipe ' + (i + 1) + ': informe o nome do time ou equipe.');
      if (!eq.produtos.length) erros.push(ref + ': escolha ao menos um produto.');
      if (eq.produtos.length > LIMITES.produtosEquipe) erros.push(ref + ': máximo de ' + LIMITES.produtosEquipe + ' produtos.');
      if (eq.atletas.length > LIMITES.atletasEquipe) erros.push(ref + ': máximo de ' + LIMITES.atletasEquipe + ' pessoas.');
      total += eq.atletas.length;
      var numeros = {};
      var atletas = eq.atletas.map(function (a, j) {
        var linha = ref + ' / linha ' + (j + 1);
        var t = tamanhosDoAtleta(eq, a);
        if (!Object.keys(t).length) erros.push(linha + ': escolha o tamanho de ao menos uma peça.');
        var n = numero(a.numero);
        var nome = maiusculo(a.nome, LIMITES.nome);
        if (!nome && !n && a.posicao !== 'TORCIDA') avisos.push(linha + ': sem nome e sem número (peça sem personalização).');
        if (n) { if (numeros[n]) avisos.push(ref + ': número ' + n + ' repetido.'); numeros[n] = true; }
        var tamanhos = {};
        eq.produtos.forEach(function (p) { tamanhos[p] = t[p] || ''; });
        return { nome: nome, numero: n, posicao: POSICOES.indexOf(a.posicao) >= 0 ? a.posicao : 'OUTRO', cor: maiusculo(a.cor, LIMITES.cor), tamanhos: tamanhos };
      });
      return { nome: nomeEq, produtos: eq.produtos.slice(), atletas: atletas };
    });
    if (total > LIMITES.atletasTotal) erros.push('Máximo de ' + LIMITES.atletasTotal + ' pessoas por envio. Divida em mais de um envio.');

    var envio = {
      schema: SCHEMA, versaoPagina: VERSAO, pedidoCode: code, modalidade: maiusculo(estado.modalidade, LIMITES.modalidade),
      contato: { nome: maiusculo(estado.contato.nome, LIMITES.contatoNome), email: email, telefone: String(estado.contato.telefone || '').replace(/[^0-9+() -]/g, '').slice(0, LIMITES.telefone) },
      equipes: equipes
    };
    return { envio: envio, erros: erros, avisos: avisos };
  }

  /** Contagem por equipe → produto → tamanho, e total de peças. */
  function resumo(envio) {
    var pecas = 0, pessoas = 0;
    var equipes = envio.equipes.map(function (eq) {
      var porProduto = {};
      eq.produtos.forEach(function (p) { porProduto[p] = {}; });
      var porPosicao = {};
      eq.atletas.forEach(function (a) {
        porPosicao[a.posicao] = (porPosicao[a.posicao] || 0) + 1;
        eq.produtos.forEach(function (p) {
          var v = a.tamanhos[p];
          if (v) { porProduto[p][v] = (porProduto[p][v] || 0) + 1; pecas++; }
        });
      });
      pessoas += eq.atletas.length;
      return { nome: eq.nome, pessoas: eq.atletas.length, porProduto: porProduto, porPosicao: porPosicao };
    });
    return { equipes: equipes, pessoas: pessoas, pecas: pecas };
  }

  function ordenarTamanhos(chaves) {
    var ordem = TAMANHOS_ADULTO.map(function (t) { return 'ADULTO|' + t; }).concat(TAMANHOS_INFANTIL.map(function (t) { return 'INF|' + t; }));
    return chaves.slice().sort(function (a, b) { return ordem.indexOf(a) - ordem.indexOf(b); });
  }

  var api = {
    SCHEMA: SCHEMA, VERSAO: VERSAO, TAMANHOS_ADULTO: TAMANHOS_ADULTO, TAMANHOS_INFANTIL: TAMANHOS_INFANTIL,
    POSICOES: POSICOES, PRODUTOS: PRODUTOS, LIMITES: LIMITES,
    rotuloProduto: rotuloProduto, rotuloTamanho: rotuloTamanho, tamanhoValido: tamanhoValido, maiusculo: maiusculo,
    codigoPedido: codigoPedido, numero: numero, novaEquipe: novaEquipe, novoAtleta: novoAtleta, estadoInicial: estadoInicial,
    tamanhosDoAtleta: tamanhosDoAtleta, montarEnvio: montarEnvio, resumo: resumo, ordenarTamanhos: ordenarTamanhos
  };
  raiz.GradeModelo = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);

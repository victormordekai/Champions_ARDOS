/** Testes do modelo da Grade do Pedido. Uso: node --test tests/grade_modelo.test.js */
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const G = require(path.join(__dirname, '..', 'assets', 'js', 'grade-pedido-modelo.js'));

function estadoExemplo() {
  const e = G.estadoInicial();
  e.pedidoCode = 'teste-0001';
  e.equipes[0] = G.novaEquipe({ nome: 'time alfa', produtos: ['CAMISA', 'CALCAO'], atletas: [
    { nome: 'alfa', numero: '007', posicao: 'GOLEIRO', tamanhoUnico: 'ADULTO|M' },
    { nome: 'bravo', numero: '10', posicao: 'LINHA', tamanhoUnico: 'INF|10' },
    { nome: '', numero: '', posicao: 'TORCIDA', tamanhoUnico: 'ADULTO|GG' }
  ] });
  e.equipes.push(G.novaEquipe({ nome: 'torcida alfa', produtos: ['CAMISETA', 'CORTA_VENTO'], mesmoTamanho: false, atletas: [
    { nome: 'charlie', posicao: 'TORCIDA', tamanhos: { CAMISETA: 'ADULTO|G' } },
    { nome: 'delta', posicao: 'COMISSÃO TÉCNICA', tamanhos: { CAMISETA: 'ADULTO|P', CORTA_VENTO: 'ADULTO|P' } }
  ] }));
  return e;
}

test('TORCIDA está entre as posições', () => {
  assert.ok(G.POSICOES.includes('TORCIDA'));
});

test('envio no contrato do Core: maiúsculas, zeros, tamanhos por peça', () => {
  const r = G.montarEnvio(estadoExemplo());
  assert.deepEqual(r.erros, []);
  const env = r.envio;
  assert.equal(env.schema, 'champions.ardos.grade-web.v1');
  assert.equal(env.pedidoCode, 'TESTE-0001');
  assert.equal(env.equipes[0].nome, 'TIME ALFA');
  assert.equal(env.equipes[0].atletas[0].numero, '007');
  assert.deepEqual(env.equipes[0].atletas[0].tamanhos, { CAMISA: 'ADULTO|M', CALCAO: 'ADULTO|M' });
  assert.deepEqual(env.equipes[1].atletas[0].tamanhos, { CAMISETA: 'ADULTO|G', CORTA_VENTO: '' });
  assert.ok(!r.avisos.some((a) => a.includes('linha 3')), 'torcida sem nome e número não gera aviso');
});

test('resumo por produto e tamanho', () => {
  const res = G.resumo(G.montarEnvio(estadoExemplo()).envio);
  assert.equal(res.pessoas, 5);
  assert.equal(res.pecas, 3 * 2 + 1 + 2);
  assert.deepEqual(res.equipes[0].porProduto.CAMISA, { 'ADULTO|M': 1, 'INF|10': 1, 'ADULTO|GG': 1 });
  assert.equal(res.equipes[0].porPosicao.TORCIDA, 1);
});

test('erros: sem código, sem nome de equipe, sem tamanho, e-mail inválido', () => {
  const e = G.estadoInicial();
  e.contato.email = 'x@';
  const r = G.montarEnvio(e);
  assert.ok(r.erros.some((x) => x.includes('código do pedido')));
  assert.ok(r.erros.some((x) => x.includes('nome do time')));
  assert.ok(r.erros.some((x) => x.includes('tamanho')));
  assert.ok(r.erros.some((x) => x.includes('E-mail')));
});

test('número repetido vira aviso, não erro', () => {
  const e = estadoExemplo();
  e.equipes[0].atletas[1].numero = '007';
  const r = G.montarEnvio(e);
  assert.deepEqual(r.erros, []);
  assert.ok(r.avisos.some((a) => a.includes('007')));
});

test('o modelo não lê nem gera arquivo', () => {
  assert.equal(G.importar, undefined);
});

test('limites', () => {
  const e = G.estadoInicial();
  e.pedidoCode = 'X';
  e.equipes = Array.from({ length: 21 }, (_, i) => G.novaEquipe({ nome: 'E' + i, atletas: [{ tamanhoUnico: 'ADULTO|M' }] }));
  assert.ok(G.montarEnvio(e).erros.some((x) => x.includes('20 equipes')));
});

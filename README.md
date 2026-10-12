# CHAMPIONS ARDOS — Portal de Teste V001

## 1. Visão geral

O **CHAMPIONS ARDOS — Portal de Teste V001** é a primeira versão navegável da interface web institucional do ecossistema **CHAMPIONS ARDOS**, concebido como camada de acesso ao **SGO-ARDOS — Sistema de Governança Operacional**.

Esta versão tem como objetivo validar a arquitetura visual, a navegação, a organização dos acessos e a integração do design system antes da evolução para funcionalidades operacionais mais avançadas.

O portal V001 é uma aplicação **estática**, construída com HTML semântico, CSS responsivo, JavaScript leve, componentes visuais independentes e links para ambientes Google já existentes.

Nesta fase, o portal **não substitui as planilhas, formulários, Apps Scripts ou sistemas operacionais atuais**. Ele funciona como uma camada de apresentação e navegação.

## 2. Identidade do produto

**Nome:** CHAMPIONS ARDOS  
**Definição:** Sistema de Gestão e Inteligência Operacional

**Mensagem central**

> CLIENTE SOLICITA → SGO CALCULA → COMERCIAL PROMETE → OPERAÇÃO EXECUTA.

**Lema**

> VESTIMOS IDENTIDADES. ENTREGAMOS CONFIANÇA.

A experiência foi projetada para comunicar:

**CONTROLE • CONFIABILIDADE • RASTREABILIDADE • INTELIGÊNCIA**

## 3. Objetivo do Portal V001

O Portal de Teste V001 foi criado para validar:

1. identidade visual do CHAMPIONS ARDOS;
2. arquitetura de navegação;
3. responsividade;
4. experiência de acesso para clientes e colaboradores;
5. organização dos ambientes operacionais;
6. comportamento dos componentes institucionais;
7. preparação da interface para futura evolução Full Stack.

A V001 não deve ser interpretada como versão final da plataforma operacional.

## 4. Estrutura principal

O portal é organizado inicialmente em três páginas principais.

### `index.html`

Página inicial e institucional do CHAMPIONS ARDOS.

Responsabilidades:

- apresentar a identidade da plataforma;
- contextualizar o CHAMPIONS ARDOS;
- direcionar o visitante para Cliente ou Colaborador;
- apresentar a ARDOS SPORTSWEAR;
- introduzir os princípios do SGO;
- hospedar o componente institucional **CHAMPIONS CORE HUD**.

### `cliente_ardos.html`

Área pública destinada ao atendimento do cliente.

Funções previstas na V001:

- informar opcionalmente o número do pedido;
- preparar mensagem de acompanhamento pelo WhatsApp;
- encaminhar o cliente ao formulário oficial de envio de grade.

A V001 **não consulta automaticamente o status real de pedidos**.

Não são exibidos percentuais fictícios, etapas simuladas, previsões inventadas, informações internas da produção ou dados de outros clientes.

### `dashboard.html`

Central de acesso para colaboradores.

Seu objetivo é organizar os atalhos para os ambientes operacionais da ARDOS, como:

- Champions ARDOS;
- Comercial;
- Planejamento MPS;
- Capacidade RCCP;
- Produção;
- Design;
- Impressão;
- Terceiros Produtivos;
- Estoque MP — Tecidos;
- Core SGO-ARDOS.

O portal não replica o conteúdo dessas ferramentas. Ao selecionar um ambiente, o usuário é direcionado ao arquivo ou sistema correspondente, e as permissões continuam sendo controladas pela plataforma de origem.

## 5. HERO da página inicial

O HERO da página inicial é dividido em duas áreas.

### Lado esquerdo

Apresenta a mensagem institucional:

**Identidades em campo.  
Inteligência na operação.**

Também identifica o produto como:

**CHAMPIONS ARDOS — Sistema de Gestão e Inteligência Operacional.**

### Lado direito

Recebe o componente institucional:

# CHAMPIONS CORE HUD

O HUD não deve ser tratado como uma simples animação de logo.

Ele é um **componente de sistema reutilizável da UI/UX do CHAMPIONS ARDOS**.

Sua composição representa visualmente fluxo contínuo de informação, eventos, ordens, capacidade, demanda, rastreabilidade, integração e governança.

Princípio visual:

> O HUD SE MOVE. O GLOBO SE MOVE. A INFORMAÇÃO CIRCULA. A MARCA PERMANECE ESTÁVEL.

O componente é estruturado em HTML, SVG, CSS e JavaScript modular, permitindo evolução futura para estados reais do sistema.

## 6. CHAMPIONS CORE HUD

O componente foi projetado para possuir variantes:

- `hero`;
- `standard`;
- `compact`.

E estados conceituais:

- `idle`;
- `loading`;
- `active`;
- `attention`;
- `critical`;
- `offline`.

Na V001, seu principal papel é institucional e visual. A arquitetura, entretanto, já deve permitir integração futura com eventos reais do CHAMPIONS ARDOS.

## 7. Design System

A linguagem visual do Portal V001 utiliza uma estética corporativa, industrial, tecnológica, limpa, escura e de alta legibilidade.

### Cores principais

- Fundo principal: `#07111e`
- Painéis: `#0d1c2d`
- Ciano: `#65e3df`
- Magenta ARDOS: `#ec5799`
- Texto principal: `#f2f6fb`
- Texto secundário: `#a7b6c8`

## 8. Princípios de UI/UX

A V001 segue a regra:

> COMPLEXIDADE NO MOTOR. SIMPLICIDADE PARA O OPERADOR.

Todo componente visual deve cumprir pelo menos uma função:

- informar;
- orientar;
- priorizar;
- executar;
- confirmar.

Elementos puramente decorativos devem ser evitados quando prejudicarem legibilidade, desempenho ou operação.

## 9. Responsividade

O portal foi concebido para funcionar em desktop, notebook, tablet e smartphone.

A responsividade não deve depender apenas da redução proporcional dos elementos.

No CHAMPIONS CORE HUD, telas menores podem reduzir ticks, nós secundários, microdetalhes e instrumentação periférica, preservando esfera, anéis principais, marca, separador e identificação institucional.

## 10. Acessibilidade

A V001 deve preservar:

- HTML semântico;
- navegação por teclado;
- foco visível;
- contraste adequado;
- áreas de toque confortáveis;
- labels associados aos campos;
- comportamento responsivo;
- suporte a `prefers-reduced-motion`.

Nenhuma informação essencial deve depender exclusivamente de animação.

## 11. Estrutura sugerida de arquivos

```text
/
├── index.html
├── cliente_ardos.html
├── dashboard.html
├── README.md
│
├── assets/
│   ├── css/
│   │   ├── styles.css
│   │   └── champions-core-hud.css
│   │
│   ├── js/
│   │   ├── main.js
│   │   └── champions-core-hud.js
│   │
│   └── img/
│       ├── favicon.svg
│       └── Logo_Name_Champions_Ardos.svg
│
└── docs/
```

A separação entre arquivos gerais e componentes específicos deve ser preservada para permitir reutilização em outras páginas.

## 12. Segurança e permissões

O Portal V001 é público.

Entretanto, isso **não significa que os ambientes operacionais internos sejam públicos**.

O portal apenas fornece atalhos. As permissões continuam sendo verificadas pelos serviços originais, principalmente Google Drive, Google Sheets, Google Forms e demais sistemas utilizados pela ARDOS.

A V001 não deve:

- incorporar planilhas privadas;
- publicar snapshots de dados;
- armazenar credenciais;
- utilizar tokens públicos;
- contornar permissões;
- alterar compartilhamentos;
- utilizar “Publicar na Web” para dados operacionais.

## 13. Limites da V001

Nesta versão não devem ser interpretados como implantados:

- autenticação própria do Champions;
- consulta real de pedido;
- banco de dados próprio;
- dashboards operacionais em tempo real;
- leitura automática de MPS/RCCP;
- sincronização de status;
- integração com Conta Azul;
- integração operacional com Impressão;
- eventos em tempo real;
- API própria de produção.

Esses elementos pertencem às próximas etapas de evolução da plataforma.

## 14. Relação com o Core_ARDOS

O Portal V001 é a camada visual.

O **Core_ARDOS** representa a arquitetura responsável, progressivamente, por captura, validação, identidade de eventos, integração, persistência, recuperação e governança dos movimentos operacionais.

A interface não deve duplicar regras que pertencem ao Core.

Princípio:

> uma regra de negócio deve possuir um único dono.

## 15. Próxima evolução

Prioridades naturais:

1. homologação visual do CHAMPIONS CORE HUD;
2. consolidação do Design System;
3. revisão responsiva das três páginas;
4. validação dos destinos do dashboard;
5. implantação do logotipo oficial em SVG;
6. definição das versões `hero`, `standard` e `compact` do HUD;
7. evolução da camada de serviços;
8. integração progressiva com o Core_ARDOS;
9. futura plataforma Full Stack.

Nenhuma dessas evoluções deve obrigar a reconstrução dos conceitos de identidade, evento, pedido, ordem ou governança já estabelecidos.

## 16. Status

**Projeto:** CHAMPIONS ARDOS  
**Artefato:** Portal de Teste  
**Versão:** V001  
**Natureza:** protótipo navegável / arquitetura inicial da UI/UX  
**Publicação:** somente quando autorizada  
**Operação oficial:** permanece nos sistemas atuais até homologação específica

## 17. Princípio de continuidade

Toda evolução deverá:

1. identificar a versão existente;
2. preservar o que já funciona;
3. modificar apenas o escopo autorizado;
4. manter responsabilidades separadas;
5. documentar mudanças;
6. validar responsividade e acessibilidade;
7. distinguir claramente o que está implementado, validado, proposto ou pendente.

---

# CHAMPIONS ARDOS

**SISTEMA DE GESTÃO E INTELIGÊNCIA OPERACIONAL**

**VESTIMOS IDENTIDADES. ENTREGAMOS CONFIANÇA.**

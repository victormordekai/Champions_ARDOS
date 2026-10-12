# Champions ARDOS — portal de teste V001

## Como abrir
Extraia o ZIP por completo. Abra `index.html` no navegador. Mantenha as pastas e subpastas no mesmo lugar. Não é necessário instalar programas, criar conta ou iniciar servidor. Os links externos precisam de internet.

## Páginas
- index.html: abertura institucional.
- cliente_ardos.html: pedido via WhatsApp e formulário de grade.
- dashboard.html: acesso público aos ambientes Google.
- assets/css/styles.css: identidade e responsividade.
- assets/js/main.js: mensagem de acompanhamento.
- assets/img/favicon.svg: ícone gráfico provisório.
- docs/destinos.json: inventário de links, para manutenção; as páginas usam links HTML estáticos.

## Comportamento
O campo PEDIDO é opcional. O botão abre o WhatsApp na mesma aba com mensagem específica ou genérica. A mensagem só é enviada após confirmação pelo usuário no WhatsApp. Sem JavaScript, o formulário abre mensagem genérica em outra aba.

Google verifica as permissões de cada arquivo. O portal não importa dados, não usa login, não modifica compartilhamentos e não envia eventos ao Core. O único Google Forms é a grade do cliente.

Estoque: o link de acesso não foi verificado para publicação; o cartão oferece Solicitar acesso por WhatsApp. Atualize o href em dashboard.html e o inventário docs/destinos.json quando o destino for validado. Outros links foram obtidos das leituras anteriores desta conversa, não revalidados nesta geração. Uma tela de permissão do Google não é erro do portal.

Identidade: usa assinatura textual ARDOS, não o logotipo oficial. Nenhum arquivo oficial de logo utilizável foi fornecido nesta geração. O favicon é provisório. A composição industrial é CSS/SVG, sem fotos externas nem dependências de fontes.

## GitHub Pages
Quando decidir publicar, envie o conteúdo desta pasta preservando sua estrutura e index.html na raiz escolhida para publicação. Todos os arquivos deste pacote são públicos: não acrescente credenciais ou dados privados. Nenhuma publicação foi feita nesta entrega.

## Verificação desta entrega
Verificados estrutura HTML, existência de caminhos locais, ausência de links vazios e montagem/decodificação da mensagem WhatsApp com pedido, sem pedido e com caracteres especiais. Não houve envio de mensagem, envio de formulário nem alteração de planilhas. A aparência não foi validada em navegador automatizado neste ambiente; faça o teste visual em celular/tablet/desktop.

# Barbearia Básico

Template institucional estático para pequenas barbearias. A proposta é entregar uma presença profissional na internet com baixo custo de instalação e manutenção.

## Tecnologias

- HTML5 semântico
- CSS3
- JavaScript puro
- SVG local
- Sem banco de dados
- Sem backend, API, autenticação ou painel administrativo

## Estrutura

```
barbearia-basico/
├── index.html
├── 404.html
├── README.md
├── package.json
├── estilos/
│   └── style.css
├── javascript/
│   ├── configuracao.js
│   └── script.js
└── recursos/
    ├── identidade/
    │   ├── logo.svg
    │   └── favicon.svg
    └── imagens/
```

## Personalização rápida

A personalização principal fica em **`javascript/configuracao.js`**, incluindo identidade, SEO, cores, textos, serviços, contatos, imagens e footer.

### Nome e descrição

Altere:

```js
nome: "Barbearia Básico",
descricao: "Barbearia profissional para quem valoriza estilo, cuidado e qualidade.",
heroTitle: "Seu estilo começa aqui.",
```

### WhatsApp

Troque apenas o número:

```js
whatsapp: "5500000000000",
whatsappMensagem: "Olá! Gostaria de agendar um horário na barbearia.",
```

Use o número no formato internacional, somente com números.

### Instagram, endereço, mapa e horário

Todos ficam no mesmo arquivo. O texto visual do horário é gerado automaticamente a partir de `CONFIG.funcionamento`, evitando divergência entre o horário exibido e o usado no agendamento:

```js
instagram: "@barbearia",
instagramUrl: "https://instagram.com/",
endereco: "Rua Exemplo, 123 — Centro",
mapaUrl: "https://maps.google.com/",
```

### Footer

O conteúdo da footer também fica centralizado em `CONFIG.footer`:

```js
footer: {
  texto: "Todos os direitos reservados.",
  credito: "Desenvolvido com profissionalismo.",
  creditoUrl: ""
},
```

Quando `creditoUrl` estiver preenchido, o próprio texto de crédito se torna um link e abre em nova aba.

### Serviços

Edite o array `servicos` para trocar nomes, descrições, preços e duração.

### Imagens

As imagens da galeria são definidas no array `galeria` de **`javascript/configuracao.js`**. Para uma entrega comercial, prefira baixar as fotos autorizadas do cliente para **`recursos/imagens/`** e usar caminhos locais, por exemplo `recursos/imagens/galeria-01.jpg`. Isso evita dependências externas e melhora a previsibilidade do site.

As imagens da galeria carregam de forma lazy e possuem um SVG local de fallback caso uma imagem externa não esteja disponível.

### Identidade visual

- `recursos/identidade/logo.svg`
- `recursos/identidade/favicon.svg`
- Cores principais em `CONFIG.cores`
- Imagem da capa em `CONFIG.heroImage`
- Imagem de compartilhamento em `CONFIG.ogImage`
- `estilos/style.css`

A cor do tema do navegador também acompanha `CONFIG.cores.fundo`.

## Executar localmente

Não é necessário servidor ou banco de dados para editar o template. Para testar corretamente recursos locais e externos, prefira um servidor HTTP simples. Abrir diretamente como `file://` pode gerar restrições de segurança no navegador. Use, por exemplo, `python3 -m http.server 5500` e acesse `http://localhost:5500`.

Para validar a sintaxe JavaScript com Node.js:

```bash
npm run check
```

Para uma experiência de desenvolvimento local mais próxima da hospedagem, também é possível usar qualquer servidor estático simples.

## Publicar na Vercel

1. Envie o projeto para um repositório GitHub.
2. Na Vercel, importe o repositório.
3. Não configure banco de dados ou variáveis de ambiente para este template.
4. Deixe o projeto como site estático e publique.

A Vercel consegue hospedar os arquivos HTML, CSS, JavaScript e SVG diretamente.

## Fluxo do produto

**Site → cliente escolhe serviço/data/horário → WhatsApp → barbeiro confirma.**

O template possui solicitação de agendamento pelo WhatsApp. Os horários são calculados pelo funcionamento configurado e pela duração do serviço escolhido, mas o site não registra reservas nem bloqueia conflitos.

Este template propositalmente não possui:

- banco de dados;
- PostgreSQL, Neon ou Supabase;
- login ou cadastro;
- painel administrativo;
- reserva automática;
- controle de conflitos entre clientes;
- histórico de clientes;
- pagamentos;
- Mercado Pago;
- notificações automáticas;
- backend ou API.

Esses recursos pertencem a uma solução mais completa/premium e não fazem parte da proposta econômica deste produto.

## Checklist antes de entregar a um cliente

- [ ] Trocar nome e descrição.
- [ ] Configurar WhatsApp e mensagem.
- [ ] Configurar Instagram.
- [ ] Configurar endereço, mapa e horários em `CONFIG.funcionamento`.
- [ ] Atualizar serviços e preços.
- [ ] Configurar footer.
- [ ] Substituir imagens de demonstração por fotos autorizadas.
- [ ] Atualizar logo e favicon.
- [ ] Testar menu mobile.
- [ ] Testar todos os links e botões.
- [ ] Testar WhatsApp, Instagram e Google Maps.
- [ ] Testar galeria e abertura das imagens.
- [ ] Testar em celular, tablet e desktop.
- [ ] Executar `npm run check`.
- [ ] Revisar título, descrição, imagem de compartilhamento e cores.
- [ ] Substituir imagens de demonstração externas por arquivos locais autorizados sempre que possível.


### Agendamento via WhatsApp

O botão de agendamento abre um formulário para o cliente informar **nome, serviço, data e horário**. Os horários são gerados automaticamente a partir de `CONFIG.funcionamento`, respeitando o dia da semana, o horário de abertura/fechamento e o horário atual quando a data escolhida é hoje. Dias configurados como `null` ficam fechados e não exibem horários.

A confirmação abre o WhatsApp com nome, serviço, data e horário escolhidos na mensagem para o barbeiro.


### Funcionamento do agendamento

Configure os horários por dia em `CONFIG.funcionamento`. Use `null` para dias fechados. O cliente precisa escolher o serviço, e a duração configurada em `CONFIG.servicos[].duracao` é usada para garantir que o horário de início caiba dentro do expediente. Os horários são oferecidos em intervalos de 10 minutos e, para a data atual, horários já iniciados não aparecem.

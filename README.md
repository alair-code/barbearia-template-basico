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

A maior parte da personalização fica em **`javascript/configuracao.js`**.

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

Todos ficam no mesmo arquivo:

```js
instagram: "@barbearia",
instagramUrl: "https://instagram.com/",
endereco: "Rua Exemplo, 123 — Centro",
mapaUrl: "https://maps.google.com/",
horario: "Segunda a sábado, 09h às 19h",
```

### Serviços

Edite o array `servicos` para trocar nomes, descrições, preços e duração.

### Imagens

As imagens da galeria ficam em **`recursos/imagens/`**. Para substituir uma imagem, mantenha o caminho e o formato definido em `configuracao.js`, ou atualize o campo `src`.

As imagens incluídas são SVG locais de demonstração para manter o template independente de bancos de imagens externos. Substitua-as pelas fotos reais do cliente antes da entrega comercial.

### Identidade visual

- `recursos/identidade/logo.svg`
- `recursos/identidade/favicon.svg`
- `estilos/style.css`

## Executar localmente

Não é necessário servidor ou banco de dados para editar o template. Para uma prévia simples, abra `index.html` no navegador.

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

**Site → WhatsApp → cliente combina o horário.**

Este template propositalmente não possui:

- banco de dados;
- PostgreSQL, Neon ou Supabase;
- login ou cadastro;
- painel administrativo;
- agendamento online;
- controle de disponibilidade;
- prevenção de conflitos;
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
- [ ] Configurar endereço, mapa e horário.
- [ ] Atualizar serviços e preços.
- [ ] Substituir imagens de demonstração por fotos autorizadas do cliente.
- [ ] Atualizar logo e favicon.
- [ ] Testar menu mobile.
- [ ] Testar todos os links e botões.
- [ ] Testar WhatsApp, Instagram e Google Maps.
- [ ] Testar em celular, tablet e desktop.
- [ ] Executar `npm run check`.
- [ ] Revisar título, descrição e imagem de compartilhamento.

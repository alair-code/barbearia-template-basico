// ============================================================
// CONFIGURAÇÃO DO CLIENTE
// ============================================================
// Este é o principal arquivo para personalizar uma nova barbearia.
// Na maioria dos casos, você só precisa alterar os valores abaixo.
// As CORES do site são configuradas no início de estilos/style.css.
// Não é necessário alterar o HTML para trocar os dados principais.

const CONFIG = {
  // NOME: nome que aparece no cabeçalho, rodapé e textos configuráveis.
  nome: "Barbearia Básico",
  // LOGO: caminho da logo dentro de recursos/identidade/.
  logo: "recursos/identidade/logo.svg",
  // FAVICON: ícone da aba do navegador.
  favicon: "recursos/identidade/favicon.svg",
  // DESCRIÇÃO: frase principal apresentada no topo do site.
  descricao: "Seu visual, seu estilo, sua melhor versão. Um atendimento pensado para você sair satisfeito e voltar quando quiser.",
  // TÍTULO PRINCIPAL: chamada de destaque da capa.
  heroTitle: "Seu próximo visual começa aqui.",
  // SEO: título usado no navegador e nos mecanismos de busca.
  seoTitle: "Barbearia Básico | Seu próximo visual começa aqui.",
  // SEO: descrição usada nos mecanismos de busca e compartilhamentos.
  seoDescription: "Conheça nossos serviços, veja nossos resultados e escolha seu próximo visual. Agende seu horário pelo WhatsApp.",
  // IMAGEM DE COMPARTILHAMENTO: usada quando o link for compartilhado em redes sociais.
  ogImage: "recursos/identidade/logo.svg",
  // SOBRE: título e textos da seção que apresenta a experiência da barbearia.
  sobre: {
    titulo: "Mais do que cuidar do visual, é cuidar de você.",
    textos: [
      "Um espaço para quem valoriza um bom visual, gosta de se cuidar e quer se sentir bem com o resultado.",
      "Cada atendimento é uma oportunidade de renovar a aparência, elevar a confiança e sair pronto para a próxima."
    ]
  },
  // DIFERENCIAIS: benefícios que ajudam a apresentar o serviço ao visitante.
  diferenciais: [
    { titulo: "Seu estilo em primeiro lugar", descricao: "O serviço é adaptado para valorizar o visual que combina com você." },
    { titulo: "Detalhes que fazem diferença", descricao: "Do primeiro toque ao acabamento, cada detalhe contribui para um resultado bem cuidado." },
    { titulo: "Agendamento simples", descricao: "Escolha seu serviço, encontre um horário e envie seu pedido pelo WhatsApp." }
  ],
  // CTA: chamada final para incentivar o visitante a agendar.
  ctaTitulo: "Seu próximo visual pode começar agora.",
  ctaDescricao: "Escolha o serviço que você procura e reserve alguns minutos para cuidar do seu visual.",
  // LOCALIZAÇÃO: título e descrição da área de endereço e contato.
  localTitulo: "Venha viver a experiência.",
  localDescricao: "Confira onde estamos, nossos horários e escolha o melhor momento para sua próxima visita.",
  // RODAPÉ: textos exibidos no final da página.
  footer: {
    texto: "Todos os direitos reservados.",
    credito: "Desenvolvido com profissionalismo.",
    creditoUrl: ""
  },

  // CAPA: imagem principal do topo.
  // Coloque a foto do cliente em recursos/imagens/capa/.
  // Informe SOMENTE o nome do arquivo aqui.
  // Exemplo: heroImage: "hero.svg"
  // Também aceita uma URL completa (https://...).
  heroImage: "hero.svg",
  // WHATSAPP: número com código do país, somente números. Ex.: 5533999999999.
  whatsapp: "5500000000000",
  // MENSAGEM DO WHATSAPP: texto inicial enviado quando o cliente agenda.
  whatsappMensagem: "Olá! Gostaria de agendar meu próximo horário na barbearia.",
  // INSTAGRAM: @ da barbearia exibido no contato.
  instagram: "@barbearia",
  // LINK DO INSTAGRAM: endereço completo do perfil.
  instagramUrl: "https://instagram.com/",
  // ENDEREÇO: endereço que será mostrado no site.
  endereco: "Rua Exemplo, 123 — Centro",
  // GOOGLE MAPS: cole aqui o link exato do local da barbearia.
  mapaUrl: "https://maps.google.com/",
  // HORÁRIOS: 0=domingo, 1=segunda ... 6=sábado.
  // Use null quando a barbearia estiver fechada.
  // Esses horários alimentam tanto a seção de contato quanto o agendamento.
  funcionamento: {
    0: null,
    1: { abertura: "09:00", fechamento: "19:00" },
    2: { abertura: "09:00", fechamento: "19:00" },
    3: { abertura: "09:00", fechamento: "19:00" },
    4: { abertura: "09:00", fechamento: "19:00" },
    5: { abertura: "09:00", fechamento: "19:00" },
    6: { abertura: "09:00", fechamento: "19:00" }
  },

  // SERVIÇOS: altere nome, descrição, preço e duração de cada serviço.
  // A duração é usada para calcular os horários do agendamento.
  servicos: [
    {
      nome: "Corte Masculino",
      descricao: "Corte personalizado de acordo com seu estilo.",
      preco: "R$ 40",
      duracao: "30 min"
    },
    {
      nome: "Barba",
      descricao: "Acabamento e cuidado para uma barba bem alinhada.",
      preco: "R$ 25",
      duracao: "20 min"
    },
    {
      nome: "Corte + Barba",
      descricao: "O combo essencial para renovar o visual.",
      preco: "R$ 60",
      duracao: "50 min"
    },
    {
      nome: "Sobrancelha",
      descricao: "Acabamento discreto para valorizar o rosto.",
      preco: "R$ 15",
      duracao: "10 min"
    },
    {
      nome: "Acabamento",
      descricao: "Detalhes rápidos para manter o corte em dia.",
      preco: "R$ 15",
      duracao: "10 min"
    }
  ],

  // GALERIA: coloque as fotos do cliente em recursos/imagens/galeria/.
// Informe somente o caminho local da imagem e o texto alternativo.
galeria: [
    { src: "recursos/imagens/galeria/galeria-01.svg", alt: "Corte masculino" },
    { src: "recursos/imagens/galeria/galeria-02.svg", alt: "Acabamento profissional" },
    { src: "recursos/imagens/galeria/galeria-03.svg", alt: "Ambiente da barbearia" },
    { src: "recursos/imagens/galeria/galeria-04.svg", alt: "Estilo masculino" },
    { src: "recursos/imagens/galeria/galeria-05.svg", alt: "Serviço de barba" },
    { src: "recursos/imagens/galeria/galeria-06.svg", alt: "Resultado do atendimento" }
  ]
};
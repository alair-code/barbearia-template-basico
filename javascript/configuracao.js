// Personalize o template neste único arquivo.
// Não é necessário alterar o HTML para trocar os dados principais.

const CONFIG = {
  nome: "Barbearia Básico",
  // Logo padrão ilustrativa — substitua pela logo real do cliente quando ele enviar.
  logo: "recursos/identidade/logo.svg",
  // Favicon padrão — substitua pelo favicon real do cliente quando ele enviar.
  favicon: "recursos/identidade/favicon.svg",
  descricao: "Seu visual, seu estilo, sua melhor versão. Um atendimento pensado para você sair satisfeito e voltar quando quiser.",
  heroTitle: "Seu próximo visual começa aqui.",
  seoTitle: "Barbearia Básico | Seu próximo visual começa aqui.",
  seoDescription: "Conheça nossos serviços, veja nossos resultados e escolha seu próximo visual. Agende seu horário pelo WhatsApp.",
  // Para compartilhamento social, prefira uma imagem JPG/PNG local ou uma URL absoluta.
  ogImage: "recursos/identidade/logo.svg",
  cores: {
    principal: "#c9a66b",
    fundo: "#0b0b0b",
    superficie: "#151515",
    superficieAlternativa: "#1d1d1d",
    texto: "#f5f3ee",
    textoSuave: "#aaa7a0"
  },
  sobre: {
    titulo: "Mais do que cuidar do visual, é cuidar de você.",
    textos: [
      "Um espaço para quem valoriza um bom visual, gosta de se cuidar e quer se sentir bem com o resultado.",
      "Cada atendimento é uma oportunidade de renovar a aparência, elevar a confiança e sair pronto para a próxima."
    ]
  },
  diferenciais: [
    { titulo: "Seu estilo em primeiro lugar", descricao: "O serviço é adaptado para valorizar o visual que combina com você." },
    { titulo: "Detalhes que fazem diferença", descricao: "Do primeiro toque ao acabamento, cada detalhe contribui para um resultado bem cuidado." },
    { titulo: "Agendamento simples", descricao: "Escolha seu serviço, encontre um horário e envie seu pedido pelo WhatsApp." }
  ],
  ctaTitulo: "Seu próximo visual pode começar agora.",
  ctaDescricao: "Escolha o serviço que você procura e reserve alguns minutos para cuidar do seu visual.",
  localTitulo: "Venha viver a experiência.",
  localDescricao: "Confira onde estamos, nossos horários e escolha o melhor momento para sua próxima visita.",
  footer: {
    texto: "Todos os direitos reservados.",
    credito: "Desenvolvido com profissionalismo.",
    creditoUrl: ""
  },

  heroImage: "https://images.unsplash.com/photo-1781455793310-8427c96454c7?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=82&w=2400",
  whatsapp: "5500000000000",
  whatsappMensagem: "Olá! Gostaria de agendar meu próximo horário na barbearia.",
  instagram: "@barbearia",
  instagramUrl: "https://instagram.com/",
  endereco: "Rua Exemplo, 123 — Centro",
  mapaUrl: "https://maps.google.com/",
  // Horários usados pelo agendamento. Chaves: 0=domingo, 1=segunda ... 6=sábado.
  // Use null para dia fechado.
  funcionamento: {
    0: null,
    1: { abertura: "09:00", fechamento: "19:00" },
    2: { abertura: "09:00", fechamento: "19:00" },
    3: { abertura: "09:00", fechamento: "19:00" },
    4: { abertura: "09:00", fechamento: "19:00" },
    5: { abertura: "09:00", fechamento: "19:00" },
    6: { abertura: "09:00", fechamento: "19:00" }
  },

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

  galeria: [
    { src: "https://images.pexels.com/photos/4422101/pexels-photo-4422101.jpeg?auto=compress&cs=tinysrgb&w=1200", alt: "Barbeiro realizando corte masculino" },
    { src: "https://images.pexels.com/photos/5584458/pexels-photo-5584458.jpeg?auto=compress&cs=tinysrgb&w=1200", alt: "Detalhe de acabamento de cabelo masculino" },
    { src: "https://images.pexels.com/photos/2076930/pexels-photo-2076930.jpeg?auto=compress&cs=tinysrgb&w=1200", alt: "Barbearia com atendimento profissional" },
    { src: "https://images.pexels.com/photos/7697280/pexels-photo-7697280.jpeg?auto=compress&cs=tinysrgb&w=1200", alt: "Barbeiro trabalhando no corte" },
    { src: "https://images.pexels.com/photos/7518731/pexels-photo-7518731.jpeg?auto=compress&cs=tinysrgb&w=1200", alt: "Ferramentas e ambiente de barbearia" },
    { src: "https://images.pexels.com/photos/4625639/pexels-photo-4625639.jpeg?auto=compress&cs=tinysrgb&w=1200", alt: "Estilo masculino em barbearia" }
  ]
};
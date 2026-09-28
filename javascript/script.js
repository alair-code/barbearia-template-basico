(() => {
  "use strict";

  const config = CONFIG;

  const root = document.documentElement;
  if (config.cores) {
    Object.entries({
      "--accent": config.cores.principal,
      "--bg": config.cores.fundo,
      "--surface": config.cores.superficie,
      "--surface-2": config.cores.superficieAlternativa,
      "--text": config.cores.texto,
      "--muted": config.cores.textoSuave
    }).forEach(([property, value]) => {
      if (value) root.style.setProperty(property, value);
    });
  }

  if (config.seoTitle) {
    document.title = config.seoTitle;
    const titleMeta = document.querySelector('[data-meta-config="title"]');
    if (titleMeta) titleMeta.textContent = config.seoTitle;
  }
  if (config.seoDescription) {
    const descriptionMeta = document.querySelector('[data-meta-config="description"]');
    if (descriptionMeta) descriptionMeta.setAttribute("content", config.seoDescription);
    const ogDescription = document.querySelector('[data-meta-config="og:description"]');
    if (ogDescription) ogDescription.setAttribute("content", config.seoDescription);
  }
  if (config.seoTitle) {
    const ogTitle = document.querySelector('[data-meta-config="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", config.seoTitle);
  }
  if (config.ogImage) {
    const ogImage = document.querySelector('[data-meta-config="og:image"]');
    if (ogImage) ogImage.setAttribute("content", config.ogImage);
  }

  if (config.heroImage) {
    document.documentElement.style.setProperty("--hero-image", `url("${config.heroImage.replace(/"/g, "\\\"")}")`);
  }
  const whatsappUrl = "https://wa.me/" + String(config.whatsapp).replace(/\D/g, "") +
    "?text=" + encodeURIComponent(config.whatsappMensagem);

  const setText = (key, value) => {
    document.querySelectorAll('[data-config="' + key + '"]').forEach((element) => {
      element.textContent = value;
    });
  };

  setText("nome", config.nome);

  const logo = document.querySelector(".brand img");
  if (logo && config.logo) {
    logo.src = config.logo;
  }
  const favicon = document.querySelector('link[rel="icon"]');
  if (favicon && config.favicon) {
    favicon.href = config.favicon;
  }
  setText("descricao", config.descricao);
  setText("sobreTitulo", config.sobre?.titulo || "Mais do que um corte, uma experiência.");
  setText("heroTitle", config.heroTitle);
  setText("instagram", config.instagram);
  setText("endereco", config.endereco);
  setText("horario", config.horario);
  setText("whatsappDisplay", config.whatsapp);

  const footer = config.footer || {};
  const footerCopyright = document.querySelector("[data-footer=\"copyright\"]");
  const footerCredit = document.querySelector("[data-footer=\"credit\"]");
  const footerCreditLink = document.querySelector("[data-footer=\"credit-link\"]");
  if (footerCopyright) {
    footerCopyright.textContent = footer.texto || "Todos os direitos reservados.";
  }
  if (footerCredit) {
    footerCredit.textContent = footer.credito || "";
    footerCredit.hidden = !footer.credito;
  }
  if (footerCreditLink) {
    footerCreditLink.href = footer.creditoUrl || "#";
    footerCreditLink.hidden = !footer.creditoUrl;
  }

  document.querySelectorAll("[data-whatsapp-link]").forEach((link) => {
    link.href = whatsappUrl;
  });

  document.querySelectorAll("[data-instagram-link]").forEach((link) => {
    link.href = config.instagramUrl;
  });

  const mapLink = document.querySelector("[data-map-link]");
  if (mapLink) mapLink.href = config.mapaUrl;

  const servicesList = document.querySelector("#services-list");
  servicesList.innerHTML = config.servicos.map((service) => `
    <article class="service-card">
      <div class="service-number" aria-hidden="true"></div>
      <h3>${service.nome}</h3>
      <p>${service.descricao}</p>
      <div class="service-meta">
        <strong>${service.preco}</strong>
        ${service.duracao ? `<span>${service.duracao}</span>` : ""}
      </div>
    </article>
  `).join("");

  const galleryList = document.querySelector("#gallery-list");
  galleryList.innerHTML = config.galeria.map((image, index) => `
    <button class="gallery-item" type="button" data-gallery-index="${index}" aria-label="Ampliar: ${image.alt}">
      <img src="${image.src}" alt="${image.alt}" loading="eager" decoding="async" referrerpolicy="no-referrer">
    </button>
  `).join("");

  galleryList.querySelectorAll("img").forEach((image) => {
    image.addEventListener("error", () => {
      if (image.dataset.fallbackApplied) return;
      image.dataset.fallbackApplied = "true";
      image.src = "recursos/imagens/galeria-01.svg";
    });
  });

  const aboutCopy = document.querySelector("#about-copy");
  if (aboutCopy && Array.isArray(config.sobre?.textos)) {
    aboutCopy.innerHTML = config.sobre.textos.map((paragraph) => `<p>${paragraph}</p>`).join("");
  }

  const differentialsList = document.querySelector("#differentials-list");
  if (differentialsList && Array.isArray(config.diferenciais)) {
    differentialsList.innerHTML = config.diferenciais.map((item, index) => `
      <article class="differential-card">
        <span class="differential-index">0${index + 1}</span>
        <h3>${item.titulo}</h3>
        <p>${item.descricao}</p>
      </article>
    `).join("");
  }

  const menuToggle = document.querySelector(".menu-toggle");
  const siteMenu = document.querySelector("#site-menu");

  const closeMenu = (restoreFocus = false) => {
    menuToggle.setAttribute("aria-expanded", "false");
    siteMenu.classList.remove("is-open");
    menuToggle.setAttribute("aria-label", "Abrir menu");
    if (restoreFocus) menuToggle.focus();
  };

  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    siteMenu.classList.toggle("is-open", !isOpen);
    menuToggle.setAttribute("aria-label", isOpen ? "Abrir menu" : "Fechar menu");
  });

  siteMenu.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => closeMenu()));

  const lightbox = document.querySelector("#lightbox");
  const lightboxImage = document.querySelector("#lightbox-image");
  const closeLightboxButton = document.querySelector(".lightbox-close");
  let activeGalleryTrigger = null;

  const closeLightbox = () => {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    lightboxImage.src = "";
    document.body.classList.remove("no-scroll");
    if (activeGalleryTrigger) {
      activeGalleryTrigger.focus();
      activeGalleryTrigger = null;
    }
  };

  galleryList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-gallery-index]");
    if (!button) return;
    const image = config.galeria[Number(button.dataset.galleryIndex)];
    if (!image) return;

    activeGalleryTrigger = button;
    lightboxImage.src = image.src;
    lightboxImage.alt = image.alt;
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");
    closeLightboxButton.focus();
  });

  closeLightboxButton.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) closeLightbox();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && lightbox.classList.contains("is-open")) {
      closeLightbox();
      return;
    }

    if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
      closeMenu(true);
    }
  });

  document.querySelector("#current-year").textContent = new Date().getFullYear();
})();

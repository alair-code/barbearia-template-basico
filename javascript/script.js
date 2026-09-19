(() => {
  "use strict";

  const config = window.CONFIG || CONFIG;
  const whatsappUrl = "https://wa.me/" + String(config.whatsapp).replace(/\D/g, "") +
    "?text=" + encodeURIComponent(config.whatsappMensagem);

  const setText = (key, value) => {
    document.querySelectorAll('[data-config="' + key + '"]').forEach((element) => {
      element.textContent = value;
    });
  };

  setText("nome", config.nome);
  setText("descricao", config.descricao);
  setText("heroTitle", config.heroTitle);
  setText("instagram", config.instagram);
  setText("endereco", config.endereco);
  setText("horario", config.horario);
  setText("whatsappDisplay", config.whatsapp);

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
      <img src="${image.src}" alt="${image.alt}" loading="lazy" decoding="async">
    </button>
  `).join("");

  const menuToggle = document.querySelector(".menu-toggle");
  const siteMenu = document.querySelector("#site-menu");

  const closeMenu = () => {
    menuToggle.setAttribute("aria-expanded", "false");
    siteMenu.classList.remove("is-open");
    menuToggle.setAttribute("aria-label", "Abrir menu");
  };

  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    siteMenu.classList.toggle("is-open", !isOpen);
    menuToggle.setAttribute("aria-label", isOpen ? "Abrir menu" : "Fechar menu");
  });

  siteMenu.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));

  const lightbox = document.querySelector("#lightbox");
  const lightboxImage = document.querySelector("#lightbox-image");
  const closeLightboxButton = document.querySelector(".lightbox-close");

  const closeLightbox = () => {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    lightboxImage.src = "";
    document.body.classList.remove("no-scroll");
  };

  galleryList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-gallery-index]");
    if (!button) return;
    const image = config.galeria[Number(button.dataset.galleryIndex)];
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
    if (event.key === "Escape" && lightbox.classList.contains("is-open")) closeLightbox();
  });

  document.querySelector("#current-year").textContent = new Date().getFullYear();
})();

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

    const themeColor = document.querySelector('[data-meta-config="theme-color"]');
    if (themeColor && config.cores.fundo) {
      themeColor.setAttribute("content", config.cores.fundo);
    }
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

  const whatsappNumber = String(config.whatsapp).replace(/\D/g, "");
  const bookingModal = document.querySelector("#booking-modal");
  const bookingForm = document.querySelector("#booking-form");
  const bookingName = document.querySelector("#booking-name");
  const bookingDate = document.querySelector("#booking-date");
  const bookingService = document.querySelector("#booking-service");
  const bookingTime = document.querySelector("#booking-time");
  const bookingStatus = document.querySelector("#booking-status");
  const bookingClose = document.querySelector(".booking-close");
  let activeBookingTrigger = null;

  const todayIso = () => {
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 10);
  };

  const minutesFromTime = (time) => {
    const [hours, minutes] = String(time).split(":").map(Number);
    return (hours * 60) + minutes;
  };

  const formatDate = (isoDate) => {
    const [year, month, day] = isoDate.split("-").map(Number);
    return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })
      .format(new Date(year, month - 1, day));
  };

  const getServiceDuration = () => {
    if (!bookingService) return 30;
    const service = config.servicos?.find((item) => item.nome === bookingService.value);
    const match = String(service?.duracao || "").match(/\d+/);
    return match ? Number(match[0]) : 30;
  };

  const getSchedule = (isoDate) => {
    if (!isoDate) return null;
    const [year, month, day] = isoDate.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return config.funcionamento?.[date.getDay()] || null;
  };

  const updateBookingTimes = () => {
    if (!bookingDate || !bookingTime || !bookingStatus) return;
    const selectedDate = bookingDate.value;
    const schedule = getSchedule(selectedDate);
    bookingTime.innerHTML = "";

    if (!selectedDate) {
      bookingTime.disabled = true;
      bookingTime.innerHTML = '<option value="">Selecione uma data primeiro</option>';
      bookingStatus.textContent = "Selecione uma data para ver os horários disponíveis.";
      return;
    }

    if (!schedule) {
      bookingTime.disabled = true;
      bookingTime.innerHTML = '<option value="">Barbearia fechada neste dia</option>';
      bookingStatus.textContent = "A barbearia não funciona nesta data. Escolha outro dia.";
      return;
    }

    const opening = minutesFromTime(schedule.abertura);
    const closing = minutesFromTime(schedule.fechamento);
    const selectedIsToday = selectedDate === todayIso();
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const serviceDuration = getServiceDuration();
    const slots = [];

    for (let start = opening; start + serviceDuration <= closing; start += 10) {
      if (selectedIsToday && start <= currentMinutes) continue;
      const hours = String(Math.floor(start / 60)).padStart(2, "0");
      const minutes = String(start % 60).padStart(2, "0");
      slots.push(hours + ":" + minutes);
    }

    if (!slots.length) {
      bookingTime.disabled = true;
      bookingTime.innerHTML = '<option value="">Nenhum horário disponível</option>';
      bookingStatus.textContent = selectedIsToday
        ? "Não há mais horários disponíveis hoje."
        : "Não há horários disponíveis nesta data.";
      return;
    }

    bookingTime.disabled = false;
    bookingTime.innerHTML = '<option value="">Selecione um horário</option>' +
      slots.map((slot) => '<option value="' + slot + '">' + slot + '</option>').join("");
    bookingStatus.textContent = "Horários disponíveis: " + schedule.abertura + " às " + schedule.fechamento + ".";
  };

  const openBooking = (trigger) => {
    if (!bookingModal) return;
    activeBookingTrigger = trigger || null;
    bookingModal.classList.add("is-open");
    bookingModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");
    if (bookingService) {
      bookingService.innerHTML = '<option value="">Selecione um serviço</option>' +
        (Array.isArray(config.servicos) ? config.servicos.map((service) =>
          '<option value="' + service.nome.replace(/"/g, "&quot;") + '">' +
          service.nome + (service.duracao ? " — " + service.duracao : "") +
          '</option>'
        ).join("") : "");
    }
    if (bookingDate) {
      bookingDate.min = todayIso();
      if (!bookingDate.value || bookingDate.value < bookingDate.min) bookingDate.value = bookingDate.min;
      updateBookingTimes();
    }
    bookingName?.focus();
  };

  const closeBooking = () => {
    if (!bookingModal) return;
    bookingModal.classList.remove("is-open");
    bookingModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("no-scroll");
    if (activeBookingTrigger) {
      activeBookingTrigger.focus();
      activeBookingTrigger = null;
    }
  };

  if (bookingDate) bookingDate.addEventListener("change", updateBookingTimes);
  if (bookingService) bookingService.addEventListener("change", updateBookingTimes);
  if (bookingClose) bookingClose.addEventListener("click", closeBooking);
  if (bookingModal) {
    bookingModal.addEventListener("click", (event) => {
      if (event.target === bookingModal) closeBooking();
    });
  }

  if (bookingForm) {
    bookingForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const name = bookingName?.value.trim();
      const date = bookingDate?.value;
      const time = bookingTime?.value;
      const serviceName = bookingService?.value;
      const service = config.servicos?.find((item) => item.nome === serviceName);
      const schedule = getSchedule(date);

      if (!name || !date || !time || !serviceName || !service || !schedule) return;

      const message = [
        config.whatsappMensagem || "Olá! Gostaria de agendar um horário na barbearia.",
        "",
        "Nome: " + name,
        "Serviço: " + service.nome,
        "Data: " + formatDate(date),
        "Horário: " + time
      ].join("\n");

      const whatsappUrl = "https://wa.me/" + whatsappNumber + "?text=" + encodeURIComponent(message);
      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
      closeBooking();
    });
  }

  const setText = (key, value) => {
    document.querySelectorAll('[data-config="' + key + '"]').forEach((element) => {
      element.textContent = value ?? "";
    });
  };

  setText("nome", config.nome);
  setText("descricao", config.descricao);
  setText("sobreTitulo", config.sobre?.titulo || "Mais do que um corte, uma experiência.");
  setText("heroTitle", config.heroTitle);
  setText("instagram", config.instagram);
  setText("endereco", config.endereco);
  const dayNames = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
  const formatOperatingHours = () => {
    const groups = [];
    Object.entries(config.funcionamento || {}).forEach(([day, schedule]) => {
      if (!schedule) return;
      const label = dayNames[Number(day)];
      const value = label + ": " + schedule.abertura + " às " + schedule.fechamento;
      const previous = groups[groups.length - 1];
      if (previous && previous.schedule.abertura === schedule.abertura && previous.schedule.fechamento === schedule.fechamento &&
          Number(previous.lastDay) + 1 === Number(day)) {
        previous.lastDay = day;
      } else {
        groups.push({ firstDay: day, lastDay: day, schedule });
      }
    });
    return groups.map((group) => {
      const first = dayNames[Number(group.firstDay)];
      const last = dayNames[Number(group.lastDay)];
      const dayLabel = first === last ? first : first + " a " + last;
      return dayLabel + ": " + group.schedule.abertura + " às " + group.schedule.fechamento;
    }).join(" • ");
  };
  setText("horario", formatOperatingHours() || config.horario || "Consulte os horários.");
  setText("whatsappDisplay", config.whatsapp);

  const logo = document.querySelector(".brand img");
  if (logo && config.logo) logo.src = config.logo;

  const favicon = document.querySelector('link[rel="icon"]');
  if (favicon && config.favicon) favicon.href = config.favicon;

  const footer = config.footer || {};
  const footerCopyright = document.querySelector("[data-footer=\"copyright\"]");
  const footerCredit = document.querySelector("[data-footer=\"credit\"]");
  if (footerCopyright) {
    footerCopyright.textContent = footer.texto || "Todos os direitos reservados.";
  }
  if (footerCredit) {
    footerCredit.textContent = footer.credito || "";
    footerCredit.hidden = !footer.credito;
    if (footer.creditoUrl) {
      const link = document.createElement("a");
      link.href = footer.creditoUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = footer.credito;
      footerCredit.replaceWith(link);
    }
  }

  document.querySelectorAll("[data-whatsapp-link]").forEach((link) => {
    link.href = "#agendar";
    link.addEventListener("click", (event) => {
      event.preventDefault();
      openBooking(link);
    });
  });

  document.querySelectorAll("[data-instagram-link]").forEach((link) => {
    link.href = config.instagramUrl || "#";
  });

  const mapLink = document.querySelector("[data-map-link]");
  if (mapLink) mapLink.href = config.mapaUrl || "#";

  const servicesList = document.querySelector("#services-list");
  if (servicesList && Array.isArray(config.servicos)) {
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
  }

  const galleryList = document.querySelector("#gallery-list");
  const galleryFallback = "recursos/imagens/galeria-01.svg";
  if (galleryList && Array.isArray(config.galeria)) {
    galleryList.innerHTML = config.galeria.map((image, index) => `
      <button class="gallery-item" type="button" data-gallery-index="${index}" aria-label="Ampliar: ${image.alt}">
        <img src="${image.src}" alt="${image.alt}" loading="lazy" decoding="async" referrerpolicy="no-referrer">
      </button>
    `).join("");

    galleryList.querySelectorAll("img").forEach((image) => {
      image.addEventListener("error", () => {
        if (image.dataset.fallbackApplied) return;
        image.dataset.fallbackApplied = "true";
        image.src = galleryFallback;
      });
    });
  }

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
    lightboxImage.removeAttribute("src");
    document.body.classList.remove("no-scroll");
    if (activeGalleryTrigger) {
      activeGalleryTrigger.focus();
      activeGalleryTrigger = null;
    }
  };

  if (galleryList && lightbox) {
    galleryList.addEventListener("click", (event) => {
      const button = event.target.closest("[data-gallery-index]");
      if (!button) return;
      const image = config.galeria[Number(button.dataset.galleryIndex)];
      const thumbnail = button.querySelector("img");
      if (!image) return;

      activeGalleryTrigger = button;
      lightboxImage.src = thumbnail?.currentSrc || thumbnail?.src || image.src;
      lightboxImage.alt = image.alt;
      lightboxImage.onerror = () => {
        lightboxImage.onerror = null;
        lightboxImage.src = galleryFallback;
      };
      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.classList.add("no-scroll");
      closeLightboxButton.focus();
    });
  }

  closeLightboxButton.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) closeLightbox();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && lightbox.classList.contains("is-open")) {
      closeLightbox();
      return;
    }

    if (event.key === "Escape" && bookingModal?.classList.contains("is-open")) {
      closeBooking();
      return;
    }

    if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
      closeMenu(true);
    }
  });

  document.querySelector("#current-year").textContent = new Date().getFullYear();
})();
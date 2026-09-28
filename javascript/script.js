(() => {
  "use strict";

  // ============================================================
  // INICIALIZAÇÃO
  // ============================================================
  // O CONFIG vem de javascript/configuracao.js.
  // Para personalizar o cliente, prefira alterar configuracao.js
  // e o início de estilos/style.css, sem mexer nesta lógica.
  const config = CONFIG;

  // ============================================================
  // SEO E IMAGEM PRINCIPAL
  // ============================================================
  // Atualiza título, descrição e imagem usados pelo navegador e
  // pelos compartilhamentos sociais.
  // TÍTULO SEO
  // TÍTULO DO COMPARTILHAMENTO
  if (config.seoTitle) {
    document.title = config.seoTitle;
    const titleMeta = document.querySelector('[data-meta-config="title"]');
    if (titleMeta) titleMeta.textContent = config.seoTitle;
  }
  // DESCRIÇÃO SEO
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
  // IMAGEM DO COMPARTILHAMENTO
  if (config.ogImage) {
    const ogImage = document.querySelector('[data-meta-config="og:image"]');
    if (ogImage) ogImage.setAttribute("content", config.ogImage);
  }

  // IMAGEM DA CAPA
  // Resolve o caminho a partir da pasta do site (document.baseURI).
  // Isso evita que o navegador interprete a imagem como se estivesse
  // dentro de estilos/ quando a variável CSS for aplicada.
  if (config.heroImage) {
    const configuredHero = String(config.heroImage).trim();
    const heroImage = /^(https?:|data:|file:|\/)/i.test(configuredHero)
      ? configuredHero
      : "recursos/imagens/capa/" + configuredHero.replace(/^\.\//, "");
    const resolvedHeroImage = new URL(heroImage, document.baseURI).href;
    const safeHeroImage = resolvedHeroImage.replace(/"/g, '\\"');
    document.documentElement.style.setProperty("--hero-image", 'url("' + safeHeroImage + '")');
  }

  // ============================================================
  // AGENDAMENTO PELO WHATSAPP
  // ============================================================
  // Esta parte calcula horários conforme o dia, expediente e duração do serviço.
  const whatsappNumber = String(config.whatsapp).replace(/\D/g, "");
  const bookingModal = document.querySelector("#booking-modal");
  const bookingForm = document.querySelector("#booking-form");
  const bookingName = document.querySelector("#booking-name");
  const bookingDate = document.querySelector("#booking-date");
  const bookingService = document.querySelector("#booking-service");
  const bookingTime = document.querySelector("#booking-time");
  const bookingStatus = document.querySelector("#booking-status");
  const bookingDateContext = document.querySelector("#booking-date-context");
  const bookingClose = document.querySelector(".booking-close");
  const bookingDateActions = document.querySelectorAll("[data-booking-date-action]");
  let activeBookingTrigger = null;

  // Converte a data atual para YYYY-MM-DD usando o horário local.
  const todayIso = () => {
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 10);
  };

  // Converte "09:30" em minutos para facilitar os cálculos.
  const minutesFromTime = (time) => {
    const [hours, minutes] = String(time).split(":").map(Number);
    return (hours * 60) + minutes;
  };

  // Formata a data para a mensagem enviada ao barbeiro.
  const formatDate = (isoDate) => {
    const [year, month, day] = isoDate.split("-").map(Number);
    return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })
      .format(new Date(year, month - 1, day));
  };

  // Lê a duração configurada no serviço selecionado.
  const getServiceDuration = () => {
    if (!bookingService) return 30;
    const service = config.servicos?.find((item) => item.nome === bookingService.value);
    const match = String(service?.duracao || "").match(/\d+/);
    return match ? Number(match[0]) : 30;
  };

  // Busca o horário de funcionamento correspondente à data escolhida.
  const getSchedule = (isoDate) => {
    if (!isoDate) return null;
    const [year, month, day] = isoDate.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return config.funcionamento?.[date.getDay()] || null;
  };

  // Procura o próximo dia em que a barbearia funciona.
  const findNextOpenDate = (fromDate) => {
    if (!fromDate) return null;
    const [year, month, day] = fromDate.split("-").map(Number);
    const cursor = new Date(year, month - 1, day);
    for (let offset = 1; offset <= 31; offset += 1) {
      cursor.setDate(cursor.getDate() + 1);
      const iso = [cursor.getFullYear(), String(cursor.getMonth() + 1).padStart(2, "0"), String(cursor.getDate()).padStart(2, "0")].join("-");
      if (getSchedule(iso)) return iso;
    }
    return null;
  };

  const formatBookingDateLabel = (isoDate) => {
    if (!isoDate) return "";
    const [year, month, day] = isoDate.split("-").map(Number);
    return new Intl.DateTimeFormat("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric"
    }).format(new Date(year, month - 1, day));
  };

  const setBookingDateContext = (isoDate) => {
    if (!bookingDateContext) return;
    bookingDateContext.textContent = isoDate
      ? "Você está escolhendo horários para " + formatBookingDateLabel(isoDate) + "."
      : "Escolha o dia do atendimento. Os horários serão calculados para a data selecionada.";
  };

  const addDaysToIso = (isoDate, days) => {
    const [year, month, day] = isoDate.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    date.setDate(date.getDate() + days);
    return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
  };

  // Mostra uma ação clara para continuar o agendamento em outro dia.
  const showNextDateOption = (fromDate) => {
    const existing = bookingStatus?.parentElement?.querySelector(".booking-next-day");
    existing?.remove();
    const nextDate = findNextOpenDate(fromDate);
    if (!bookingStatus || !nextDate) return;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "booking-next-day";
    button.textContent = "Ver próximo dia disponível";
    button.addEventListener("click", () => {
      bookingDate.value = nextDate;
      updateBookingTimes();
      bookingDate.focus();
    });
    bookingStatus.insertAdjacentElement("afterend", button);
  };

  // Recalcula a lista de horários sempre que serviço ou data mudar.
  const updateBookingTimes = () => {
    if (!bookingDate || !bookingTime || !bookingStatus) return;
    const selectedDate = bookingDate.value;
    setBookingDateContext(selectedDate);
    const schedule = getSchedule(selectedDate);
    bookingTime.replaceChildren();
    bookingStatus.parentElement?.querySelector(".booking-next-day")?.remove();

    if (!selectedDate) {
      bookingTime.disabled = true;
      const option = document.createElement("option");
      option.value = "";
      option.textContent = "Selecione uma data primeiro";
      bookingTime.appendChild(option);
      bookingStatus.textContent = "Selecione uma data para ver os horários disponíveis.";
      return;
    }

    if (!schedule) {
      bookingTime.disabled = true;
      const option = document.createElement("option");
      option.value = "";
      option.textContent = "Barbearia fechada neste dia";
      bookingTime.appendChild(option);
      bookingStatus.textContent = "A barbearia não funciona nesta data. Escolha outro dia.";
      showNextDateOption(selectedDate);
      return;
    }

    if (!bookingService?.value) {
      bookingTime.disabled = true;
      const option = document.createElement("option");
      option.value = "";
      option.textContent = "Selecione um serviço primeiro";
      bookingTime.appendChild(option);
      bookingStatus.textContent = "Escolha o serviço para calcular os horários disponíveis.";
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
      const option = document.createElement("option");
      option.value = "";
      option.textContent = "Nenhum horário disponível";
      bookingTime.appendChild(option);
      bookingStatus.textContent = selectedIsToday
        ? "Não há mais horários disponíveis hoje. Escolha outra data para agendar."
        : "Não há horários disponíveis nesta data. Escolha outra data para agendar.";
      showNextDateOption(selectedDate);
      return;
    }

    bookingTime.disabled = false;
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Selecione um horário";
    bookingTime.appendChild(placeholder);
    slots.forEach((slot) => {
      const option = document.createElement("option");
      option.value = slot;
      option.textContent = slot;
      bookingTime.appendChild(option);
    });
    bookingStatus.textContent = "Horários disponíveis: " + schedule.abertura + " às " + schedule.fechamento + ".";
  };

  // Abre o formulário de agendamento e preenche os serviços disponíveis.
  const openBooking = (trigger) => {
    if (!bookingModal) return;
    activeBookingTrigger = trigger || null;
    bookingModal.classList.add("is-open");
    bookingModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");
    if (bookingService) {
      bookingService.replaceChildren();
      const placeholder = document.createElement("option");
      placeholder.value = "";
      placeholder.textContent = "Selecione um serviço";
      bookingService.appendChild(placeholder);
      if (Array.isArray(config.servicos)) {
        config.servicos.forEach((service) => {
          const option = document.createElement("option");
          option.value = service.nome;
          option.textContent = service.nome + (service.duracao ? " — " + service.duracao : "");
          bookingService.appendChild(option);
        });
      }
    }
    if (bookingDate) {
      bookingDate.min = todayIso();
      if (!bookingDate.value || bookingDate.value < bookingDate.min) bookingDate.value = bookingDate.min;
      updateBookingTimes();
    }
    setBookingDateContext(bookingDate?.value || "");
    bookingName?.focus();
  };

  // Fecha o formulário e devolve o foco ao botão que abriu a janela.
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

  // Mantém a navegação pelo teclado dentro das janelas abertas.
  const trapFocus = (modal, event) => {
    if (event.key !== "Tab" || !modal?.classList.contains("is-open")) return false;
    const focusable = Array.from(modal.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )).filter((element) => !element.hasAttribute("hidden") && element.getAttribute("aria-hidden") !== "true");
    if (!focusable.length) return false;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
      return true;
    }
    if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
      return true;
    }
    return false;
  };

  if (bookingDate) bookingDate.addEventListener("change", updateBookingTimes);
  if (bookingService) bookingService.addEventListener("change", updateBookingTimes);

  bookingDateActions.forEach((button) => {
    button.addEventListener("click", () => {
      if (!bookingDate) return;
      const action = button.dataset.bookingDateAction;
      const today = todayIso();
      let targetDate = today;

      if (action === "tomorrow") {
        targetDate = addDaysToIso(today, 1);
      } else if (action === "next") {
        targetDate = findNextOpenDate(today) || today;
      }

      bookingDate.value = targetDate;
      updateBookingTimes();
      bookingDate.focus();
    });
  });
  if (bookingClose) bookingClose.addEventListener("click", closeBooking);
  if (bookingModal) {
    bookingModal.addEventListener("click", (event) => {
      if (event.target === bookingModal) closeBooking();
    });
  }

  // Confere novamente o horário antes de enviar, evitando seleções inválidas.
  const isBookingSlotValid = (date, time, service) => {
    const schedule = getSchedule(date);
    if (!schedule || !service || !time) return false;
    const start = minutesFromTime(time);
    const opening = minutesFromTime(schedule.abertura);
    const closing = minutesFromTime(schedule.fechamento);
    const match = String(service.duracao || "").match(/\d+/);
    const duration = match ? Number(match[0]) : 30;
    if (!Number.isFinite(start) || !Number.isFinite(duration)) return false;
    if (start < opening || start + duration > closing) return false;
    if (date === todayIso()) {
      const now = new Date();
      if (start <= now.getHours() * 60 + now.getMinutes()) return false;
    }
    return start % 10 === 0;
  };

  // Envia nome, serviço, data e horário para o WhatsApp.
  if (bookingForm) {
    bookingForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const name = bookingName?.value.trim();
      const date = bookingDate?.value;
      const time = bookingTime?.value;
      const serviceName = bookingService?.value;
      const service = config.servicos?.find((item) => item.nome === serviceName);
      const schedule = getSchedule(date);

      if (!name || !date || !time || !serviceName || !service || !schedule || date < todayIso() || !isBookingSlotValid(date, time, service)) {
        bookingStatus.textContent = "Revise o serviço, a data e o horário selecionados.";
        return;
      }

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

  // ============================================================
  // APLICAÇÃO DOS DADOS CONFIGURÁVEIS
  // ============================================================
  // Os elementos com data-config recebem os valores de configuracao.js.
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
  setText("horario", formatOperatingHours() || "Consulte os horários.");
  setText("whatsappDisplay", config.whatsapp);

  // LOGO E FAVICON
  const logo = document.querySelector(".brand img");
  if (logo && config.logo) logo.src = config.logo;

  const favicon = document.querySelector('link[rel="icon"]');
  if (favicon && config.favicon) favicon.href = config.favicon;

  // RODAPÉ
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

  // LINKS DE WHATSAPP
  document.querySelectorAll("[data-whatsapp-link]").forEach((link) => {
    link.href = "#agendar";
    link.addEventListener("click", (event) => {
      event.preventDefault();
      openBooking(link);
    });
  });

  // LINK DO INSTAGRAM
  document.querySelectorAll("[data-instagram-link]").forEach((link) => {
    link.href = config.instagramUrl || "#";
  });

  // LINK DO GOOGLE MAPS
  const mapLink = document.querySelector("[data-map-link]");
  if (mapLink) mapLink.href = config.mapaUrl || "#";

  // ============================================================
  // SERVIÇOS
  // ============================================================
  // Os cards são criados automaticamente a partir de CONFIG.servicos.
  const servicesList = document.querySelector("#services-list");
  if (servicesList && Array.isArray(config.servicos)) {
    const fragment = document.createDocumentFragment();
    config.servicos.forEach((service) => {
      const article = document.createElement("article");
      article.className = "service-card";

      const number = document.createElement("div");
      number.className = "service-number";
      number.setAttribute("aria-hidden", "true");

      const title = document.createElement("h3");
      title.textContent = service.nome || "";

      const description = document.createElement("p");
      description.textContent = service.descricao || "";

      const meta = document.createElement("div");
      meta.className = "service-meta";

      const price = document.createElement("strong");
      price.textContent = service.preco || "";

      meta.appendChild(price);
      if (service.duracao) {
        const duration = document.createElement("span");
        duration.textContent = service.duracao;
        meta.appendChild(duration);
      }

      article.append(number, title, description, meta);
      fragment.appendChild(article);
    });
    servicesList.replaceChildren(fragment);
  }

  // ============================================================
  // GALERIA
  // ============================================================
  // As imagens vêm de CONFIG.galeria.
  const galleryList = document.querySelector("#gallery-list");
  const galleryFallback = "recursos/imagens/galeria/galeria-01.svg";
  if (galleryList && Array.isArray(config.galeria)) {
    const fragment = document.createDocumentFragment();
    config.galeria.forEach((image, index) => {
      const button = document.createElement("button");
      button.className = "gallery-item";
      button.type = "button";
      button.dataset.galleryIndex = String(index);
      button.setAttribute("aria-label", "Ampliar: " + (image.alt || "imagem"));

      const img = document.createElement("img");
      const configuredImage = String(image?.src || "").trim();
      const imagePath = /^(https?:|data:|file:|\/)/i.test(configuredImage)
        ? configuredImage
        : configuredImage;
      img.src = imagePath || galleryFallback;
      img.alt = image.alt || "";
      img.loading = "lazy";
      img.decoding = "async";
      img.referrerPolicy = "no-referrer";

      button.appendChild(img);
      fragment.appendChild(button);

      img.addEventListener("error", () => {
        if (img.dataset.fallbackApplied) return;
        img.dataset.fallbackApplied = "true";
        img.src = galleryFallback;
      });
    });
    galleryList.replaceChildren(fragment);
  }

  // TEXTO DA SEÇÃO SOBRE
  const aboutCopy = document.querySelector("#about-copy");
  if (aboutCopy && Array.isArray(config.sobre?.textos)) {
    const fragment = document.createDocumentFragment();
    config.sobre.textos.forEach((paragraph) => {
      const element = document.createElement("p");
      element.textContent = paragraph || "";
      fragment.appendChild(element);
    });
    aboutCopy.replaceChildren(fragment);
  }

  // DIFERENCIAIS
  const differentialsList = document.querySelector("#differentials-list");
  if (differentialsList && Array.isArray(config.diferenciais)) {
    const fragment = document.createDocumentFragment();
    config.diferenciais.forEach((item, index) => {
      const article = document.createElement("article");
      article.className = "differential-card";

      const number = document.createElement("span");
      number.className = "differential-index";
      number.textContent = String(index + 1).padStart(2, "0");

      const title = document.createElement("h3");
      title.textContent = item.titulo || "";

      const description = document.createElement("p");
      description.textContent = item.descricao || "";

      article.append(number, title, description);
      fragment.appendChild(article);
    });
    differentialsList.replaceChildren(fragment);
  }

  // ============================================================
  // MENU RESPONSIVO
  // ============================================================
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

  // ============================================================
  // GALERIA AMPLIADA (LIGHTBOX)
  // ============================================================
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

  // TECLADO: ESC fecha janelas abertas e o menu; TAB permanece dentro das janelas.
  document.addEventListener("keydown", (event) => {
    if (trapFocus(lightbox, event) || trapFocus(bookingModal, event)) return;

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
(() => {
  "use strict";

  const config = CONFIG;
  const BOOKINGS_STORAGE_KEY = "barbearia-agendamentos";

  // ============================================================
  // HELPERS
  // ============================================================
  const whatsappNumber = String(config.whatsapp || "").replace(/\D/g, "");
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

  const todayIso = () => {
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 10);
  };

  const addDaysToIso = (isoDate, days) => {
    const [year, month, day] = String(isoDate).split("-").map(Number);
    const date = new Date(year, month - 1, day);
    date.setDate(date.getDate() + days);
    return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
  };

  const minutesFromTime = (time) => {
    const [hours, minutes] = String(time).split(":").map(Number);
    return (hours * 60) + minutes;
  };

  const timeFromMinutes = (minutes) => {
    return String(Math.floor(minutes / 60)).padStart(2, "0") + ":" + String(minutes % 60).padStart(2, "0");
  };

  const formatDate = (isoDate) => {
    const [year, month, day] = isoDate.split("-").map(Number);
    return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })
      .format(new Date(year, month - 1, day));
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

  const getSchedule = (isoDate) => {
    if (!isoDate) return null;
    const [year, month, day] = isoDate.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return config.funcionamento?.[date.getDay()] || null;
  };

  const getService = (name) => config.servicos?.find((item) => item.nome === name) || null;

  const getServiceDuration = (service) => {
    const match = String(service?.duracao || "").match(/\d+/);
    const duration = match ? Number(match[0]) : NaN;
    return Number.isFinite(duration) && duration > 0 ? duration : null;
  };

  const readBookings = () => {
    try {
      const stored = localStorage.getItem(BOOKINGS_STORAGE_KEY);
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const writeBookings = (bookings) => {
    localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(bookings));
  };

  const getBookingInterval = (booking) => {
    const service = getService(booking.servico);
    const duration = getServiceDuration(service) || Number(booking.duracaoMinutos);
    if (!booking.data || !booking.horario || !duration) return null;
    const start = minutesFromTime(booking.horario);
    return { start, end: start + duration };
  };

  const hasConflict = (date, start, duration, ignoreId = null) => {
    const newEnd = start + duration;
    return readBookings().some((booking) => {
      if (booking.data !== date || booking.id === ignoreId) return false;
      const interval = getBookingInterval(booking);
      if (!interval) return false;
      return start < interval.end && newEnd > interval.start;
    });
  };

  const isBookingSlotValid = (date, time, service) => {
    const schedule = getSchedule(date);
    const duration = getServiceDuration(service);
    if (!schedule || !service || !duration || !time) return false;

    const start = minutesFromTime(time);
    const opening = minutesFromTime(schedule.abertura);
    const closing = minutesFromTime(schedule.fechamento);

    if (!Number.isFinite(start) || start < opening || start + duration > closing) return false;
    if (start % 10 !== 0) return false;

    if (date === todayIso()) {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      if (start <= currentMinutes) return false;
    }

    return !hasConflict(date, start, duration);
  };

  const findNextOpenDate = (fromDate) => {
    if (!fromDate) return null;
    let cursor = fromDate;
    for (let offset = 1; offset <= 366; offset += 1) {
      cursor = addDaysToIso(cursor, 1);
      if (getSchedule(cursor)) return cursor;
    }
    return null;
  };

  const setBookingDateContext = (isoDate) => {
    if (!bookingDateContext) return;
    bookingDateContext.textContent = isoDate
      ? "Você está escolhendo horários para " + formatBookingDateLabel(isoDate) + "."
      : "Escolha o dia do atendimento. Os horários serão calculados para a data selecionada.";
  };

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

  // ============================================================
  // RESUMO DO AGENDAMENTO
  // ============================================================
  let bookingSummary = document.querySelector("#booking-summary");
  if (!bookingSummary && bookingForm) {
    bookingSummary = document.createElement("div");
    bookingSummary.id = "booking-summary";
    bookingSummary.className = "booking-summary";
    bookingSummary.setAttribute("aria-live", "polite");
    bookingSummary.innerHTML = "<strong>Resumo do agendamento</strong><div class=\"booking-summary-content\"></div>";
    bookingForm.querySelector("button[type=\"submit\"]")?.before(bookingSummary);
  }

  const updateBookingSummary = () => {
    if (!bookingSummary) return;
    const content = bookingSummary.querySelector(".booking-summary-content");
    if (!content) return;

    const service = getService(bookingService?.value);
    const date = bookingDate?.value;
    const time = bookingTime?.value;
    const complete = service && date && time;

    if (!complete) {
      bookingSummary.classList.remove("is-ready");
      content.textContent = "Selecione serviço, data e horário para visualizar o resumo.";
      return;
    }

    const duration = getServiceDuration(service);
    content.innerHTML = "";
    [
      ["Serviço", service.nome],
      ["Preço", service.preco || "Consultar"],
      ["Duração", duration ? duration + " min" : service.duracao || "Consultar"],
      ["Data", formatDate(date)],
      ["Horário", time]
    ].forEach(([label, value]) => {
      const row = document.createElement("div");
      row.className = "booking-summary-row";
      const key = document.createElement("span");
      key.textContent = label;
      const val = document.createElement("strong");
      val.textContent = value;
      row.append(key, val);
      content.appendChild(row);
    });
    bookingSummary.classList.add("is-ready");
  };

  // ============================================================
  // HORÁRIOS
  // ============================================================
  const updateBookingTimes = () => {
    if (!bookingDate || !bookingTime || !bookingStatus) return;

    const selectedDate = bookingDate.value;
    setBookingDateContext(selectedDate);
    const schedule = getSchedule(selectedDate);
    bookingTime.replaceChildren();
    bookingStatus.parentElement?.querySelector(".booking-next-day")?.remove();

    if (!selectedDate) {
      bookingTime.disabled = true;
      bookingTime.append(new Option("Selecione uma data primeiro", ""));
      bookingStatus.textContent = "Escolha a data para ver os horários disponíveis.";
      updateBookingSummary();
      return;
    }

    if (!schedule) {
      bookingTime.disabled = true;
      bookingTime.append(new Option("Barbearia fechada neste dia", ""));
      bookingStatus.textContent = "A barbearia não funciona nesta data. Escolha outro dia.";
      showNextDateOption(selectedDate);
      updateBookingSummary();
      return;
    }

    const service = getService(bookingService?.value);
    const duration = getServiceDuration(service);

    if (!service || !duration) {
      bookingTime.disabled = true;
      bookingTime.append(new Option("Selecione um serviço primeiro", ""));
      bookingStatus.textContent = "Escolha um serviço para ver os horários.";
      updateBookingSummary();
      return;
    }

    const opening = minutesFromTime(schedule.abertura);
    const closing = minutesFromTime(schedule.fechamento);
    const selectedIsToday = selectedDate === todayIso();
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const slots = [];

    for (let start = opening; start + duration <= closing; start += 10) {
      if (selectedIsToday && start <= currentMinutes) continue;
      if (hasConflict(selectedDate, start, duration)) continue;
      slots.push(timeFromMinutes(start));
    }

    if (!slots.length) {
      bookingTime.disabled = true;
      bookingTime.append(new Option("Nenhum horário disponível", ""));
      bookingStatus.textContent = selectedIsToday
        ? "Não há mais horários disponíveis hoje. Escolha outra data."
        : "Não há horários disponíveis nesta data. Escolha outra data.";
      showNextDateOption(selectedDate);
      updateBookingSummary();
      return;
    }

    bookingTime.disabled = false;
    bookingTime.append(new Option("Selecione um horário", ""));
    slots.forEach((slot) => bookingTime.append(new Option(slot, slot)));
    bookingStatus.textContent = "Horários disponíveis: " + schedule.abertura + " às " + schedule.fechamento + ".";
    updateBookingSummary();
  };

  // ============================================================
  // MODAL
  // ============================================================
  const populateServices = (selectedService = "") => {
    if (!bookingService) return;
    bookingService.replaceChildren(new Option("Selecione um serviço", ""));
    if (Array.isArray(config.servicos)) {
      config.servicos.forEach((service) => {
        const label = service.nome + (service.duracao ? " — " + service.duracao : "");
        bookingService.append(new Option(label, service.nome));
      });
    }
    if (selectedService && getService(selectedService)) bookingService.value = selectedService;
  };

  const openBooking = (trigger, selectedService = "") => {
    if (!bookingModal) return;
    activeBookingTrigger = trigger || null;
    bookingModal.classList.add("is-open");
    bookingModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");

    populateServices(selectedService);

    if (bookingDate) {
      bookingDate.min = todayIso();
      if (!bookingDate.value || bookingDate.value < bookingDate.min) bookingDate.value = bookingDate.min;
    }

    if (bookingTime) bookingTime.value = "";
    updateBookingTimes();
    updateBookingSummary();
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

  bookingDate?.addEventListener("change", updateBookingTimes);
  bookingService?.addEventListener("change", updateBookingTimes);
  bookingTime?.addEventListener("change", updateBookingSummary);

  bookingDateActions.forEach((button) => {
    button.addEventListener("click", () => {
      if (!bookingDate) return;
      const action = button.dataset.bookingDateAction;
      const today = todayIso();
      let targetDate = today;

      if (action === "tomorrow") targetDate = addDaysToIso(today, 1);
      if (action === "next") targetDate = findNextOpenDate(today) || today;

      bookingDate.value = targetDate;
      updateBookingTimes();
      bookingDate.focus();
    });
  });

  bookingClose?.addEventListener("click", closeBooking);
  bookingModal?.addEventListener("click", (event) => {
    if (event.target === bookingModal) closeBooking();
  });

  // ============================================================
  // SEO
  // ============================================================
  if (config.seoTitle) {
    document.title = config.seoTitle;
    document.querySelector('[data-meta-config="title"]')?.replaceChildren(document.createTextNode(config.seoTitle));
    document.querySelector('[data-meta-config="og:title"]')?.setAttribute("content", config.seoTitle);
  }
  if (config.seoDescription) {
    document.querySelector('[data-meta-config="description"]')?.setAttribute("content", config.seoDescription);
    document.querySelector('[data-meta-config="og:description"]')?.setAttribute("content", config.seoDescription);
  }
  if (config.ogImage) document.querySelector('[data-meta-config="og:image"]')?.setAttribute("content", config.ogImage);

  // ============================================================
  // DADOS CONFIGURÁVEIS
  // ============================================================
  const setText = (key, value) => {
    document.querySelectorAll('[data-config="' + key + '"]').forEach((element) => {
      element.textContent = value ?? "";
    });
  };

  setText("nome", config.nome);
  setText("descricao", config.descricao);
  setText("sobreTitulo", config.sobre?.titulo || "Mais do que um corte, uma experiência.");
  setText("heroTitle", config.heroTitle);
  setText("ctaTitulo", config.ctaTitulo);
  setText("ctaDescricao", config.ctaDescricao);
  setText("localTitulo", config.localTitulo);
  setText("localDescricao", config.localDescricao);
  setText("instagram", config.instagram);
  setText("endereco", config.endereco);
  setText("whatsappDisplay", config.whatsapp);

  const dayNames = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
  const formatOperatingHours = () => {
    const groups = [];
    Object.entries(config.funcionamento || {}).forEach(([day, schedule]) => {
      if (!schedule) return;
      const previous = groups[groups.length - 1];
      if (previous && previous.schedule.abertura === schedule.abertura &&
          previous.schedule.fechamento === schedule.fechamento &&
          Number(previous.lastDay) + 1 === Number(day)) {
        previous.lastDay = day;
      } else {
        groups.push({ firstDay: day, lastDay: day, schedule });
      }
    });
    return groups.map((group) => {
      const first = dayNames[Number(group.firstDay)];
      const last = dayNames[Number(group.lastDay)];
      const label = first === last ? first : first + " a " + last;
      return label + ": " + group.schedule.abertura + " às " + group.schedule.fechamento;
    }).join(" • ");
  };
  setText("horario", formatOperatingHours() || "Consulte os horários.");

  const logo = document.querySelector(".brand img");
  if (logo && config.logo) logo.src = config.logo;
  const favicon = document.querySelector('link[rel="icon"]');
  if (favicon && config.favicon) favicon.href = config.favicon;

  const footer = config.footer || {};
  const footerCopyright = document.querySelector('[data-footer="copyright"]');
  const footerCredit = document.querySelector('[data-footer="credit"]');
  if (footerCopyright) footerCopyright.textContent = footer.texto || "Todos os direitos reservados.";
  if (footerCredit) {
    footerCredit.textContent = footer.credito || "";
    footerCredit.hidden = !footer.credito;
    if (footer.creditoUrl && footer.credito) {
      const link = document.createElement("a");
      link.href = footer.creditoUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = footer.credito;
      footerCredit.replaceWith(link);
    }
  }

  // ============================================================
  // LINKS
  // ============================================================
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

  // ============================================================
  // JURÍDICO
  // ============================================================
  const legalConfig = footer.juridico || {};
  const legalModal = document.querySelector("#legal-modal");
  const legalTitle = document.querySelector("#legal-title");
  const legalContent = document.querySelector("#legal-content");
  const legalClose = document.querySelector(".legal-close");
  let activeLegalTrigger = null;

  const legalSections = {
    termos: legalConfig.termos,
    privacidade: legalConfig.privacidade,
    avisoLegal: legalConfig.avisoLegal
  };

  const openLegal = (key, trigger) => {
    const section = legalSections[key];
    if (!legalModal || !section) return;
    activeLegalTrigger = trigger || null;
    legalTitle.textContent = section.titulo || "Informações legais";
    legalContent.replaceChildren();
    String(section.texto || "").split(/\n\s*\n|\n{2,}/).filter(Boolean).forEach((paragraph) => {
      const p = document.createElement("p");
      p.textContent = paragraph.trim();
      legalContent.appendChild(p);
    });
    legalModal.classList.add("is-open");
    legalModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");
    legalClose?.focus();
  };

  const closeLegal = () => {
    if (!legalModal) return;
    legalModal.classList.remove("is-open");
    legalModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("no-scroll");
    activeLegalTrigger?.focus();
    activeLegalTrigger = null;
  };

  document.querySelectorAll("[data-legal-link]").forEach((link) => {
    const key = link.dataset.legalLink;
    const section = legalSections[key];
    if (!legalConfig.habilitado || !section) {
      link.hidden = true;
      return;
    }
    link.href = section.url || ("#" + key);
    link.addEventListener("click", (event) => {
      event.preventDefault();
      openLegal(key, link);
    });
  });

  if (!legalConfig.habilitado) document.querySelector(".footer-links")?.remove();
  legalClose?.addEventListener("click", closeLegal);
  legalModal?.addEventListener("click", (event) => {
    if (event.target === legalModal) closeLegal();
  });

  // ============================================================
  // SERVIÇOS + AGENDAMENTO DIRETO
  // ============================================================
  const servicesList = document.querySelector("#services-list");
  if (servicesList && Array.isArray(config.servicos)) {
    const fragment = document.createDocumentFragment();

    config.servicos.forEach((service, index) => {
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
      price.textContent = service.preco || "Consultar";
      meta.appendChild(price);

      if (service.duracao) {
        const duration = document.createElement("span");
        duration.textContent = service.duracao;
        meta.appendChild(duration);
      }

      const button = document.createElement("button");
      button.type = "button";
      button.className = "button service-booking-button";
      button.textContent = "Agendar este serviço";
      button.dataset.serviceName = service.nome || "";
      button.addEventListener("click", () => openBooking(button, service.nome));

      article.append(number, title, description, meta, button);
      fragment.appendChild(article);
    });

    servicesList.replaceChildren(fragment);
  }

  // ============================================================
  // SOBRE + DIFERENCIAIS
  // ============================================================
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
  // GALERIA
  // ============================================================
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
      img.src = String(image?.src || "").trim() || galleryFallback;
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

  // ============================================================
  // MENU
  // ============================================================
  const menuToggle = document.querySelector(".menu-toggle");
  const siteMenu = document.querySelector("#site-menu");

  const closeMenu = (restoreFocus = false) => {
    if (!menuToggle || !siteMenu) return;
    menuToggle.setAttribute("aria-expanded", "false");
    siteMenu.classList.remove("is-open");
    menuToggle.setAttribute("aria-label", "Abrir menu");
    if (restoreFocus) menuToggle.focus();
  };

  menuToggle?.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    siteMenu?.classList.toggle("is-open", !isOpen);
    menuToggle.setAttribute("aria-label", isOpen ? "Abrir menu" : "Fechar menu");
  });

  siteMenu?.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => closeMenu()));

  // ============================================================
  // LIGHTBOX
  // ============================================================
  const lightbox = document.querySelector("#lightbox");
  const lightboxImage = document.querySelector("#lightbox-image");
  const closeLightboxButton = document.querySelector(".lightbox-close");
  let activeGalleryTrigger = null;

  const closeLightbox = () => {
    if (!lightbox) return;
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    lightboxImage?.removeAttribute("src");
    document.body.classList.remove("no-scroll");
    activeGalleryTrigger?.focus();
    activeGalleryTrigger = null;
  };

  if (galleryList && lightbox && lightboxImage) {
    galleryList.addEventListener("click", (event) => {
      const button = event.target.closest("[data-gallery-index]");
      if (!button) return;
      const image = config.galeria[Number(button.dataset.galleryIndex)];
      const thumbnail = button.querySelector("img");
      if (!image) return;

      activeGalleryTrigger = button;
      lightboxImage.src = thumbnail?.currentSrc || thumbnail?.src || image.src;
      lightboxImage.alt = image.alt || "";
      lightboxImage.onerror = () => {
        lightboxImage.onerror = null;
        lightboxImage.src = galleryFallback;
      };
      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.classList.add("no-scroll");
      closeLightboxButton?.focus();
    });
  }

  closeLightboxButton?.addEventListener("click", closeLightbox);
  lightbox?.addEventListener("click", (event) => {
    if (event.target === lightbox) closeLightbox();
  });

  // ============================================================
  // ENVIO + DUPLA VALIDAÇÃO + LOCALSTORAGE
  // ============================================================
  bookingForm?.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = bookingName?.value.trim();
    const date = bookingDate?.value;
    const time = bookingTime?.value;
    const serviceName = bookingService?.value;
    const service = getService(serviceName);
    const schedule = getSchedule(date);
    const duration = getServiceDuration(service);

    if (!name || !date || !time || !serviceName || !service || !schedule || !duration || date < todayIso()) {
      bookingStatus.textContent = "Revise o nome, serviço, data e horário selecionados.";
      updateBookingSummary();
      return;
    }

    // Validação final: expediente, duração, horário passado e conflito.
    if (!isBookingSlotValid(date, time, service)) {
      bookingStatus.textContent = "Esse horário acabou de ser reservado. Escolha outro horário.";
      updateBookingTimes();
      return;
    }

    const booking = {
      id: (crypto?.randomUUID ? crypto.randomUUID() : Date.now() + "-" + Math.random().toString(36).slice(2)),
      nome: name,
      servico: service.nome,
      preco: service.preco || "Consultar",
      duracao: service.duracao || (duration + " min"),
      duracaoMinutos: duration,
      data: date,
      horario: time,
      criadoEm: new Date().toISOString()
    };

    try {
      const bookings = readBookings();

      // Segunda checagem imediatamente antes da gravação.
      const start = minutesFromTime(time);
      if (hasConflict(date, start, duration)) {
        bookingStatus.textContent = "Esse horário acabou de ser reservado. Escolha outro horário.";
        updateBookingTimes();
        return;
      }

      bookings.push(booking);
      writeBookings(bookings);
    } catch {
      bookingStatus.textContent = "Não foi possível salvar o agendamento neste navegador. Tente novamente.";
      return;
    }

    const message = [
      config.whatsappMensagem || "Olá! Gostaria de agendar um horário na barbearia.",
      "",
      "Nome: " + booking.nome,
      "Serviço: " + booking.servico,
      "Preço: " + booking.preco,
      "Duração: " + booking.duracao,
      "",
      "Data: " + formatDate(booking.data),
      "Horário: " + booking.horario
    ].join("\n");

    const whatsappUrl = "https://wa.me/" + whatsappNumber + "?text=" + encodeURIComponent(message);

    if (!whatsappNumber || whatsappNumber.length < 10) {
      bookingStatus.textContent = "O WhatsApp da barbearia ainda não foi configurado.";
      return;
    }

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    closeBooking();
  });

  // ============================================================
  // TECLADO
  // ============================================================
  document.addEventListener("keydown", (event) => {
    if (trapFocus(legalModal, event) || trapFocus(lightbox, event) || trapFocus(bookingModal, event)) return;

    if (event.key !== "Escape") return;

    if (legalModal?.classList.contains("is-open")) {
      closeLegal();
      return;
    }

    if (lightbox?.classList.contains("is-open")) {
      closeLightbox();
      return;
    }

    if (bookingModal?.classList.contains("is-open")) {
      closeBooking();
      return;
    }

    if (menuToggle?.getAttribute("aria-expanded") === "true") closeMenu(true);
  });

  const currentYear = document.querySelector("#current-year");
  if (currentYear) currentYear.textContent = new Date().getFullYear();
})();
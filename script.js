(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  $("#year").textContent = String(new Date().getFullYear());

  const header = $("[data-header]");
  const onScroll = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 24);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const headerH = () => header?.getBoundingClientRect().height ?? 72;
  const smoothTo = (id) => {
    const el = $(id);
    if (!el) return;
    const y = window.scrollY + el.getBoundingClientRect().top - headerH() - 10;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href^='#']");
    if (!a) return;
    const href = a.getAttribute("href");
    if (!href || href === "#") return;
    e.preventDefault();
    smoothTo(href);
  });

  $(".hero__scroll")?.addEventListener("click", () => smoothTo("#about"));

  const toggleBtn = $(".nav__toggle");
  const panel = $("#navPanel");

  const setMenuOpen = (open) => {
    toggleBtn?.setAttribute("aria-expanded", String(open));
    panel?.classList.toggle("is-open", open);
    panel?.setAttribute("aria-hidden", String(!open));

    const lines = $(".nav__toggleLines");
    if (!lines) return;
    if (open) {
      lines.style.background = "transparent";
      document.body.classList.add("nav-open");
    } else {
      document.body.classList.remove("nav-open");
      lines.style.background = "rgba(255,255,255,.9)";
    }
  };

  const style = document.createElement("style");
  style.textContent = `
    body.nav-open .nav__toggleLines{ background: transparent !important; }
    body.nav-open .nav__toggleLines::before{ top: 0 !important; transform: rotate(45deg) !important; }
    body.nav-open .nav__toggleLines::after{ top: 0 !important; transform: rotate(-45deg) !important; }
  `;
  document.head.appendChild(style);

  toggleBtn?.addEventListener("click", () => setMenuOpen(!panel.classList.contains("is-open")));
  $$(".navPanel__link", panel).forEach((a) => a.addEventListener("click", () => setMenuOpen(false)));

  document.addEventListener("click", (e) => {
    if (!panel?.classList.contains("is-open")) return;
    if (panel.contains(e.target) || toggleBtn.contains(e.target)) return;
    setMenuOpen(false);
  });

  document.addEventListener("pointerdown", (e) => {
    const btn = e.target.closest("[data-ripple]");
    if (!btn) return;

    const rect = btn.getBoundingClientRect();
    const ink = document.createElement("span");
    ink.className = "ripple__ink";

    const size = Math.max(rect.width, rect.height);
    ink.style.width = ink.style.height = `${size}px`;

    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    ink.style.left = `${x}px`;
    ink.style.top = `${y}px`;

    btn.appendChild(ink);
    ink.addEventListener("animationend", () => ink.remove());
  });

  const slides = $$("[data-hero-slide]");
  let heroIndex = 0;
  let heroTimer = null;

  const setHero = (idx) => {
    slides.forEach((s, i) => s.classList.toggle("is-active", i === idx));
    heroIndex = idx;
  };

  const startHero = () => {
    if (slides.length <= 1) return;
    stopHero();
    heroTimer = window.setInterval(() => {
      setHero((heroIndex + 1) % slides.length);
    }, 5600);
  };
  const stopHero = () => {
    if (heroTimer) window.clearInterval(heroTimer);
    heroTimer = null;
  };

  startHero();

  const revealEls = $$(".reveal");
  const io = new IntersectionObserver(
    (entries) => {
      for (const ent of entries) {
        if (ent.isIntersecting) {
          ent.target.classList.add("in");
          io.unobserve(ent.target);
        }
      }
    },
    { threshold: 0.14 }
  );
  revealEls.forEach((el) => io.observe(el));

  const toast = $("#toast");
  const toastText = $("#toastText");
  let toastTimer = null;

  const showToast = (msg) => {
    if (!toast) return;
    toastText.textContent = msg;
    toast.classList.add("is-show");
    if (toastTimer) window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("is-show"), 2200);
  };

  const tabs = $$("[data-tab]");
  const panels = $$("[data-panel]");
  const setTab = (name) => {
    tabs.forEach((t) => {
      const active = t.dataset.tab === name;
      t.classList.toggle("is-active", active);
      t.setAttribute("aria-selected", String(active));
    });
    panels.forEach((p) => p.classList.toggle("is-hidden", p.dataset.panel !== name));
  };

  tabs.forEach((t) => t.addEventListener("click", () => setTab(t.dataset.tab)));
  setTab("mains");

  $$(".js-fav").forEach((b) => b.addEventListener("click", () => showToast("Saved to favorites.")));

  const menuModal = $("#menuModal");
  const openMenuBtns = $$(".js-open-menu");
  const closeModalBtns = $$("[data-close-modal]");

  const openModal = () => {
    menuModal.classList.add("is-open");
    menuModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    $("[data-close-modal]", menuModal)?.focus();
  };

  const closeModal = () => {
    if (!menuModal.classList.contains("is-open")) return;
    menuModal.classList.remove("is-open");
    menuModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };

  openMenuBtns.forEach((b) => b.addEventListener("click", openModal));
  closeModalBtns.forEach((b) => b.addEventListener("click", closeModal));

  menuModal.addEventListener("click", (e) => {
    if (e.target.matches("[data-close-modal]")) closeModal();
  });

  const lb = $("#lightbox");
  const lbImg = $("#lightboxImg");
  const lbCap = $("#lightboxCap");
  const lbOpeners = $$(".js-lightbox");
  const lbCloseEls = $$("[data-close-lightbox]");

  const galleryItems = lbOpeners.map((btn) => ({
    src: btn.getAttribute("data-src"),
    alt: btn.getAttribute("data-alt") || "",
  }));

  let lbIndex = 0;

  const openLightbox = (idx) => {
    lbIndex = idx;
    const item = galleryItems[lbIndex];
    lbImg.src = item.src;
    lbImg.alt = item.alt;
    lbCap.textContent = item.alt;

    lb.classList.add("is-open");
    lb.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    $(".lightbox__close")?.focus();
  };

  const closeLightbox = () => {
    if (!lb.classList.contains("is-open")) return;
    lb.classList.remove("is-open");
    lb.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };

  const step = (dir) => {
    lbIndex = (lbIndex + dir + galleryItems.length) % galleryItems.length;
    const item = galleryItems[lbIndex];
    lbImg.src = item.src;
    lbImg.alt = item.alt;
    lbCap.textContent = item.alt;
  };

  lbOpeners.forEach((btn, i) => btn.addEventListener("click", () => openLightbox(i)));
  lbCloseEls.forEach((el) => el.addEventListener("click", closeLightbox));
  $(".lightbox__nav--prev")?.addEventListener("click", () => step(-1));
  $(".lightbox__nav--next")?.addEventListener("click", () => step(1));
  lb.addEventListener("click", (e) => { if (e.target.matches("[data-close-lightbox]")) closeLightbox(); });

  const reviews = $$(".review");
  let rIndex = 0;
  const setReview = (idx) => {
    reviews.forEach((r, i) => r.classList.toggle("is-active", i === idx));
    rIndex = idx;
  };
  setReview(0);
  $(".js-next-review")?.addEventListener("click", () => setReview((rIndex + 1) % reviews.length));
  $(".js-prev-review")?.addEventListener("click", () => setReview((rIndex - 1 + reviews.length) % reviews.length));

  $(".js-copy-address")?.addEventListener("click", async () => {
    const addr = "21 Rue des Arts, Downtown, Tunis, Tunisia";
    try { await navigator.clipboard.writeText(addr); showToast("Address copied."); }
    catch { showToast("Copy not supported in this browser."); }
  });
  $(".js-open-maps")?.addEventListener("click", () => showToast("In production: open Google Maps link."));

  const qr = $("#quickReserve");
  const qrDate = $("#qrDate");
  const qrTime = $("#qrTime");
  const qrGuests = $("#qrGuests");
  const quickHint = $("#quickHint");

  const setQuickHint = (msg, isErr = false) => {
    quickHint.textContent = msg;
    quickHint.style.color = isErr ? "rgba(255,170,170,.95)" : "rgba(170,255,220,.95)";
  };

  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  if (qrDate && !qrDate.value) qrDate.value = `${yyyy}-${mm}-${dd}`;
  if (qrTime && !qrTime.value) qrTime.value = "20:00";

  qr?.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!qrDate.value || !qrTime.value || !qrGuests.value) {
      setQuickHint("Please select date, time, and guests.", true);
      return;
    }
    setQuickHint("Available — continue below to confirm.");
    showToast("Availability found (demo).");
    smoothTo("#reserve");
  });

  const form = $("#reserveForm");
  const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const setFieldError = (input, msg) => {
    const field = input.closest(".field");
    const hint = $(".hint", field);
    hint.textContent = msg || "";
    input.setAttribute("aria-invalid", msg ? "true" : "false");
  };

  const validate = () => {
    const name = $("#name");
    const email = $("#email");
    const date = $("#date");
    const time = $("#time");
    const guests = $("#guests");

    let ok = true;

    if (name.value.trim().length < 2) { setFieldError(name, "Please enter your full name."); ok = false; }
    else setFieldError(name, "");

    if (!isValidEmail(email.value.trim())) { setFieldError(email, "Please enter a valid email."); ok = false; }
    else setFieldError(email, "");

    if (!date.value) { setFieldError(date, "Choose a date."); ok = false; }
    else setFieldError(date, "");

    if (!time.value) { setFieldError(time, "Choose a time."); ok = false; }
    else {
      const [hh, m] = time.value.split(":").map(Number);
      const minutes = hh * 60 + m;
      const open = 18 * 60;
      const close = 23 * 60 + 45;
      if (minutes < open || minutes > close) { setFieldError(time, "Reservations 18:00–23:45."); ok = false; }
      else setFieldError(time, "");
    }

    if (!guests.value) { setFieldError(guests, "Select guests."); ok = false; }
    else setFieldError(guests, "");

    return ok;
  };

  const dateEl = $("#date");
  const timeEl = $("#time");
  if (dateEl && !dateEl.value) dateEl.value = `${yyyy}-${mm}-${dd}`;
  if (timeEl && !timeEl.value) timeEl.value = "20:00";

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validate()) {
      showToast("Please fix highlighted fields.");
      $("[aria-invalid='true']", form)?.focus();
      return;
    }
    showToast("Reservation confirmed (demo). See you tonight ✦");
    form.animate(
      [
        { transform: "translateY(0)" },
        { transform: "translateY(-2px)" },
        { transform: "translateY(0)" }
      ],
      { duration: 700, easing: "cubic-bezier(.2,.8,.2,1)" }
    );
    form.reset();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (panel?.classList.contains("is-open")) setMenuOpen(false);
    if (menuModal?.classList.contains("is-open")) closeModal();
    if (lb?.classList.contains("is-open")) closeLightbox();
  });

})();

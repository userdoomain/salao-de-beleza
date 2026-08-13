/* ============================================================
   Bella Donna — Salão de Beleza
   Interações (vanilla JS, sem dependências)
   ============================================================ */

(function () {
  "use strict";

  var $ = function (id) { return document.getElementById(id); };

  /* ---------- Rodapé: ano atual ---------- */
  var anoEl = $("ano");
  if (anoEl) anoEl.textContent = new Date().getFullYear();

  /* ---------- Navbar: sombra ao rolar + menu mobile ---------- */
  var navbar = $("navbar");
  var navToggle = $("navToggle");
  var navMenu = $("navMenu");

  function onScroll() {
    if (navbar) navbar.classList.toggle("scrolled", window.scrollY > 40);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  function closeMenu() {
    if (!navMenu || !navToggle) return;
    navMenu.classList.remove("open");
    navToggle.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Abrir menu");
    document.body.style.overflow = "";
  }

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", function () {
      var isOpen = navMenu.classList.toggle("open");
      navToggle.classList.toggle("open", isOpen);
      navToggle.setAttribute("aria-expanded", String(isOpen));
      navToggle.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
      document.body.style.overflow = isOpen ? "hidden" : "";
    });

    navMenu.addEventListener("click", function (e) {
      if (e.target.closest("a")) closeMenu();
    });

    window.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMenu();
    });
  }

  /* ---------- Link ativo conforme a rolagem ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav-link"));
  var sections = document.querySelectorAll("main section[id]");

  if ("IntersectionObserver" in window) {
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          navLinks.forEach(function (link) {
            link.classList.toggle("active", link.getAttribute("href") === "#" + entry.target.id);
          });
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach(function (s) { spy.observe(s); });
  } else {
    var inView = window.location.hash || "#inicio";
    navLinks.forEach(function (link) {
      if (link.getAttribute("href") === inView) link.classList.add("active");
    });
  }

  /* ---------- Animação de entrada (reveal) ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var revealObs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            revealObs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach(function (el) { revealObs.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("visible"); });
  }

  /* ---------- Slider de depoimentos ---------- */
  var track = $("sliderTrack");
  var prevBtn = $("prevBtn");
  var nextBtn = $("nextBtn");
  var dotsWrap = $("sliderDots");

  if (track && dotsWrap) {
    var slides = Array.prototype.slice.call(track.children);
    var total = slides.length;
    var idx = 0;
    var timer = null;
    var dots = [];

    slides.forEach(function (_, i) {
      var dot = document.createElement("button");
      dot.type = "button";
      dot.className = "dot" + (i === 0 ? " active" : "");
      dot.setAttribute("aria-label", "Ver depoimento " + (i + 1));
      dot.addEventListener("click", function () { goTo(i); restart(); });
      dotsWrap.appendChild(dot);
      dots.push(dot);
    });

    function goTo(i) {
      idx = (i + total) % total;
      track.style.transform = "translateX(-" + idx * 100 + "%)";
      dots.forEach(function (dot, d) { dot.classList.toggle("active", d === idx); });
    }

    function next() { goTo(idx + 1); }
    function restart() {
      if (timer) clearInterval(timer);
      timer = setInterval(next, 6000);
    }

    if (nextBtn) nextBtn.addEventListener("click", function () { next(); restart(); });
    if (prevBtn) prevBtn.addEventListener("click", function () { goTo(idx - 1); restart(); });

    var slider = $("slider");
    slider.addEventListener("mouseenter", function () { if (timer) clearInterval(timer); });
    slider.addEventListener("mouseleave", restart);
    restart();
  }

  /* ---------- Máscara de telefone ---------- */
  var telefone = $("telefone");
  if (telefone) {
    telefone.addEventListener("input", function () {
      var v = telefone.value.replace(/\D/g, "").slice(0, 11);
      if (v.length > 10) {
        v = v.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
      } else if (v.length > 6) {
        v = v.replace(/^(\d{2})(\d{4})(\d{0,4})$/, "($1) $2-$3");
      } else if (v.length > 2) {
        v = v.replace(/^(\d{2})(\d{0,5})$/, "($1) $2");
      } else if (v.length > 0) {
        v = v.replace(/^(\d{0,2})$/, "($1)");
      }
      telefone.value = v;
    });
  }

  /* ---------- Helpers ---------- */
  function isEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
  }

  function setFieldError(input, hasError) {
    var group = input.closest(".form-group");
    if (group) group.classList.toggle("invalid", hasError);
  }

  function showMsg(el, text, type) {
    if (!el) return;
    el.textContent = text;
    el.className = "form-msg" + (type ? " " + type : "");
    if (type === "success" && el.scrollIntoView) {
      el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }

  /* ---------- Formulário de agendamento ---------- */
  var formAgenda = $("formAgenda");
  if (formAgenda) {
    var msg = $("formMsg");

    var validators = {
      nome: function (v) { return v.trim().length >= 3; },
      telefone: function (v) {
        var d = v.replace(/\D/g, "");
        return d.length >= 10 && d.length <= 11;
      },
      email: isEmail,
      servico: function (v) { return v !== ""; },
      data: function (v) { return v !== ""; },
      hora: function (v) { return v !== ""; }
    };

    var fields = ["nome", "telefone", "email", "servico", "data", "hora"];

    fields.forEach(function (id) {
      var input = $(id);
      if (!input) return;
      input.addEventListener("input", function () { setFieldError(input, false); });
      input.addEventListener("change", function () {
        if (input.value !== "" && !validators[id](input.value)) {
          setFieldError(input, true);
        }
      });
    });

    formAgenda.addEventListener("submit", function (e) {
      e.preventDefault();
      var allValid = true;
      var firstInvalid = null;

      fields.forEach(function (id) {
        var input = $(id);
        if (!input) return;
        var ok = validators[id](input.value);
        setFieldError(input, !ok);
        if (!ok) {
          allValid = false;
          firstInvalid = firstInvalid || input;
        }
      });

      if (!allValid) {
        showMsg(msg, "Preencha corretamente os campos destacados.", "error");
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      formAgenda.reset();
      msg.className = "form-msg";
      showMsg(msg, "Pedido enviado! Em breve confirmamos seu horário pelo WhatsApp. Obrigada!", "success");
    });
  }

  /* ---------- Newsletter ---------- */
  var formNews = $("formNews");
  if (formNews) {
    var newsInput = $("newsEmail");
    var newsMsg = $("newsMsg");

    formNews.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!isEmail(newsInput.value)) {
        showMsg(newsMsg, "Informe um e-mail válido.", "error");
        newsInput.focus();
        return;
      }
      newsInput.value = "";
      showMsg(newsMsg, "Cadastro realizado com sucesso!", "success");
    });
  }
})();
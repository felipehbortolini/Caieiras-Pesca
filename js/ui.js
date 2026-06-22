/* =============================================================
   Caieiras Pesca — UI
   Monta o "chrome" compartilhado (header, footer, carrinho, modal),
   renderiza produtos/carrosséis e a cena animada do Hero.
   ============================================================= */
(function () {
  "use strict";

  const DATA = window.CAIEIRAS_DATA || { produtos: [], categorias: [] };
  const brl = window.brl;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const esc = (s) =>
    String(s || "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* ---- Dados da loja (edite com o endereço real) ---- */
  const STORE = {
    name: "Caieiras Pesca",
    tagline: "Feito por filhos de pescador, pra quem vive a pesca.",
    phoneDisplay: "(27) 99620-9785",
    phoneRaw: "5527996209785",
    addressLine: "Grande Vitória — Espírito Santo",
    addressDetail: "Atualize aqui o endereço completo da loja",
    hours: "Seg a Sáb · 08h às 18h",
    // TODO: troque pelas coordenadas reais da loja
    lat: -20.3155,
    lng: -40.3128,
    get mapsUrl() {
      return `https://www.google.com/maps/search/?api=1&query=${this.lat},${this.lng}`;
    },
  };

  const CAT_META = {
    varas: { icon: "compass", desc: "Ação rápida, média e pesada" },
    molinetes: { icon: "anchor", desc: "Molinetes e carretilhas" },
    iscas: { icon: "fish", desc: "Artificiais e naturais" },
    linhas: { icon: "waves", desc: "Multifilamento e nylon" },
    vestuario: { icon: "heart", desc: "Camisas, bonés e proteção" },
    facas: { icon: "shield", desc: "Corte e filetagem" },
    coolers: { icon: "truck", desc: "Caixas térmicas" },
    "acessorios-de-pesca": { icon: "sparkles", desc: "Tudo para sua pescaria" },
  };

  const countByCat = {};
  DATA.produtos.forEach((p) => (countByCat[p.categoriaSlug] = (countByCat[p.categoriaSlug] || 0) + 1));
  const catName = {};
  DATA.categorias.forEach((c) => (catName[c.slug] = c.nome));

  /* =========================================================
     CHROME COMPARTILHADO
     ========================================================= */
  function buildHeader() {
    const home = document.body.dataset.page === "home";
    const header = document.createElement("header");
    header.className = "site-header" + (home ? " on-hero" : "");
    header.id = "site-header";

    const dd = DATA.categorias
      .map((c) => {
        const m = CAT_META[c.slug] || { icon: "anchor", desc: "" };
        const n = countByCat[c.slug] || 0;
        const sub = n > 0 ? `${n} ${n === 1 ? "produto" : "produtos"}` : `<span class="soon">Em breve</span>`;
        return `<a href="${c.slug}.html">
          <span class="dd-icon">${ICON(m.icon)}</span>
          <span class="dd-text"><strong>${esc(c.nome)}</strong><span>${m.desc} · ${sub}</span></span>
        </a>`;
      })
      .join("");

    header.innerHTML = `
      <div class="header-inner">
        <a class="brand" href="index.html" aria-label="Caieiras Pesca — início">
          <img class="logo-dark" src="assets/logo/logo-horizontal.png" alt="Caieiras Pesca" width="180" height="42">
          <img class="logo-light" src="assets/logo/logo-horizontal-branco.png" alt="Caieiras Pesca" width="180" height="42">
        </a>
        <nav class="nav" aria-label="Principal">
          <a class="nav-link" href="index.html">Início</a>
          <div class="nav-item">
            <button class="nav-link nav-trigger" aria-haspopup="true">Categorias ${ICON("chevronDown")}</button>
            <div class="dropdown">${dd}</div>
          </div>
          <a class="nav-link" href="index.html#depoimentos">Depoimentos</a>
          <a class="nav-link" href="index.html#mapa">Onde estamos</a>
        </nav>
        <div class="header-actions">
          <button class="icon-btn desktop-only" data-search-open aria-label="Buscar produtos">${ICON("search")}</button>
          <button class="icon-btn" data-cart-open aria-label="Abrir carrinho">${ICON("cart")}<span class="cart-count" aria-live="polite"></span></button>
          <button class="icon-btn hamburger" data-menu-open aria-label="Abrir menu">${ICON("menu")}</button>
        </div>
      </div>`;
    document.body.prepend(header);
  }

  function buildMobileSheet() {
    const links = DATA.categorias
      .map((c) => {
        const n = countByCat[c.slug] || 0;
        const tag = n > 0 ? `<span class="text-muted">${n}</span>` : `<span class="soon">Em breve</span>`;
        return `<a href="${c.slug}.html">${esc(c.nome)} ${tag}</a>`;
      })
      .join("");
    const sheet = document.createElement("aside");
    sheet.className = "mobile-sheet";
    sheet.id = "mobile-sheet";
    sheet.innerHTML = `
      <div class="sheet-top">
        <img src="assets/logo/logo-horizontal.png" alt="Caieiras Pesca">
        <button class="icon-btn" data-menu-close aria-label="Fechar menu">${ICON("close")}</button>
      </div>
      <nav class="mobile-nav" aria-label="Categorias">
        <a href="index.html">Início</a>
        ${links}
        <a href="index.html#depoimentos">Depoimentos</a>
        <a href="index.html#mapa">Onde estamos</a>
      </nav>
      <a class="btn btn-whats btn-block" style="margin-top:auto" href="https://wa.me/${STORE.phoneRaw}" target="_blank" rel="noopener">${ICON("whatsapp")} Falar no WhatsApp</a>`;
    document.body.appendChild(sheet);
  }

  function buildFooter() {
    const catLinks = DATA.categorias
      .map((c) => {
        const n = countByCat[c.slug] || 0;
        return `<a href="${c.slug}.html">${esc(c.nome)}${n === 0 ? ' <span class="soon">· em breve</span>' : ""}</a>`;
      })
      .join("");
    const footer = document.createElement("footer");
    footer.className = "site-footer";
    footer.innerHTML = `
      <div class="container">
        <div class="footer-grid">
          <div class="footer-brand">
            <img src="assets/logo/logo-horizontal-branco.png" alt="Caieiras Pesca">
            <p>${STORE.tagline} Equipamentos selecionados, atendimento de quem entende e a paixão pela pesca em cada detalhe.</p>
            <div class="footer-social">
              <a href="https://wa.me/${STORE.phoneRaw}" target="_blank" rel="noopener" aria-label="WhatsApp">${ICON("whatsapp")}</a>
              <a href="#" aria-label="Instagram">${ICON("instagram")}</a>
              <a href="#" aria-label="Facebook">${ICON("facebook")}</a>
            </div>
          </div>
          <div class="footer-col"><h4>Categorias</h4>${catLinks}</div>
          <div class="footer-col">
            <h4>A loja</h4>
            <a href="index.html#sobre">Quem somos</a>
            <a href="index.html#depoimentos">Depoimentos</a>
            <a href="index.html#mapa">Onde estamos</a>
            <a href="https://wa.me/${STORE.phoneRaw}" target="_blank" rel="noopener">Contato</a>
          </div>
          <div class="footer-col">
            <h4>Atendimento</h4>
            <a href="https://wa.me/${STORE.phoneRaw}" target="_blank" rel="noopener">${STORE.phoneDisplay}</a>
            <a href="index.html#mapa">${STORE.addressLine}</a>
            <a href="index.html#mapa">${STORE.hours}</a>
          </div>
        </div>
        <div class="footer-bottom">
          <span>© ${new Date().getFullYear()} Caieiras Pesca. Todos os direitos reservados.</span>
          <span>Pesque com responsabilidade · Respeite o defeso 🐟</span>
        </div>
      </div>`;
    document.body.appendChild(footer);
  }

  function buildCartChrome() {
    const wrap = document.createElement("div");
    wrap.innerHTML = `
      <button class="cart-fab" data-cart-open aria-label="Abrir carrinho">${ICON("cart")}<span class="cart-count" aria-live="polite"></span></button>

      <div class="scrim" id="scrim"></div>

      <aside class="cart-drawer" id="cart-drawer" aria-label="Carrinho de compras" aria-modal="true" role="dialog">
        <div class="cart-top">
          <h3>${ICON("cart")} Seu carrinho</h3>
          <button class="icon-btn" data-cart-close aria-label="Fechar carrinho">${ICON("close")}</button>
        </div>
        <div class="cart-items" id="cart-body"></div>
        <div class="cart-foot" id="cart-foot">
          <div class="row"><span class="text-muted">Itens</span><span id="cart-total-count">0 itens</span></div>
          <div class="row total"><span>Total</span><strong id="cart-total-value">R$ 0,00</strong></div>
          <div class="cart-actions">
            <button class="btn btn-whats btn-block" data-checkout>${ICON("whatsapp")} Finalizar no WhatsApp</button>
            <button class="btn btn-ghost btn-block" data-cart-close>Continuar comprando</button>
          </div>
        </div>
      </aside>

      <div class="modal-wrap" id="checkout-modal" role="dialog" aria-modal="true" aria-labelledby="checkout-title">
        <div class="modal-bg" data-checkout-close></div>
        <div class="modal">
          <button class="modal-close" data-checkout-close aria-label="Fechar">${ICON("close")}</button>
          <div class="modal-icon">${ICON("user")}</div>
          <h3 id="checkout-title">Quase lá!</h3>
          <p>Como podemos te chamar? Vamos usar seu nome para iniciar o atendimento no WhatsApp.</p>
          <div class="modal-summary" id="checkout-summary"></div>
          <label for="checkout-name">Seu nome</label>
          <input id="checkout-name" type="text" placeholder="Ex.: João Pescador" autocomplete="name" maxlength="60">
          <div class="field-error" id="checkout-error" aria-live="assertive"></div>
          <div class="modal-actions">
            <button class="btn btn-outline" data-checkout-close>Voltar</button>
            <button class="btn btn-whats btn-block" data-checkout-confirm>${ICON("send")} Enviar pedido</button>
          </div>
        </div>
      </div>

      <div class="modal-wrap" id="search-overlay" role="dialog" aria-modal="true" aria-label="Buscar produtos">
        <div class="modal-bg" data-search-close></div>
        <div class="modal" style="max-width:560px">
          <button class="modal-close" data-search-close aria-label="Fechar">${ICON("close")}</button>
          <h3>Buscar produtos</h3>
          <div style="position:relative;margin-top:16px">
            <input id="search-input" type="search" placeholder="Digite o nome do produto..." autocomplete="off" style="padding-left:46px">
            <span style="position:absolute;left:16px;top:50%;transform:translateY(-50%);color:var(--ink-faint)">${ICON("search")}</span>
          </div>
          <div id="search-results" style="margin-top:18px;max-height:50vh;overflow:auto;display:flex;flex-direction:column;gap:8px"></div>
        </div>
      </div>

      <div class="toast" id="toast" role="status"></div>`;
    document.body.appendChild(wrap);
  }

  /* =========================================================
     PRODUTOS
     ========================================================= */
  function productCard(p) {
    const imgs = p.imagens && p.imagens.length ? p.imagens : ["assets/logo/isotipo.png"];
    const multi = imgs.length > 1;
    return `<article class="product-card" id="${p.id}" data-id="${p.id}">
      <div class="pc-media">
        ${imgs.map((src, i) => `<img class="${i === 0 ? "active" : ""}" data-idx="${i}" src="${src}" alt="${esc(p.nome)}" loading="lazy">`).join("")}
        <span class="pc-cat">${esc(p.categoria)}</span>
        ${multi ? `<button class="pc-imgnav prev" data-img="prev" aria-label="Imagem anterior">${ICON("chevronLeft")}</button>
        <button class="pc-imgnav next" data-img="next" aria-label="Próxima imagem">${ICON("chevronRight")}</button>
        <div class="pc-dots">${imgs.map((_, i) => `<button data-dot="${i}" class="${i === 0 ? "active" : ""}" aria-label="Imagem ${i + 1}"></button>`).join("")}</div>` : ""}
      </div>
      <div class="pc-body">
        <h4>${esc(p.nome)}</h4>
        <p>${esc(p.descricao)}</p>
        <div class="pc-foot">
          <div class="pc-price">${brl(p.valor)}<small>à vista</small></div>
          <button class="pc-add" data-add="${p.id}" aria-label="Adicionar ${esc(p.nome)} ao carrinho">${ICON("plus")}</button>
        </div>
      </div>
    </article>`;
  }

  function carousel(products) {
    return `<div class="carousel">
      <button class="carousel-btn prev" data-scroll="prev" aria-label="Anterior">${ICON("chevronLeft")}</button>
      <div class="carousel-track">${products.map(productCard).join("")}</div>
      <button class="carousel-btn next" data-scroll="next" aria-label="Próximo">${ICON("chevronRight")}</button>
    </div>`;
  }

  function renderHomeCategories() {
    const host = $("#home-categories");
    if (!host) return;
    const blocks = DATA.categorias
      .filter((c) => countByCat[c.slug] > 0)
      .map((c) => {
        const prods = DATA.produtos.filter((p) => p.categoriaSlug === c.slug);
        return `<div class="cat-block reveal">
          <div class="cat-head">
            <h3>${esc(c.nome)} <span class="chip">${prods.length} ${prods.length === 1 ? "item" : "itens"}</span></h3>
            <a class="cat-link" href="${c.slug}.html">Ver categoria ${ICON("arrowRight")}</a>
          </div>
          ${carousel(prods)}
        </div>`;
      })
      .join("");
    host.innerHTML = blocks;
    initCarousels(host);
  }

  function renderCategoryPage() {
    const host = $("#category-content");
    if (!host) return;
    const slug = document.body.dataset.categoria;
    const nome = catName[slug] || "Categoria";
    const meta = CAT_META[slug] || { desc: "" };
    const prods = DATA.produtos.filter((p) => p.categoriaSlug === slug);

    const head = $("#cat-hero-head");
    if (head) {
      head.innerHTML = `
        <div class="crumbs"><a href="index.html">Início</a> / ${esc(nome)}</div>
        <span class="eyebrow">${meta.desc || "Catálogo"}</span>
        <h1>${esc(nome)}</h1>
        <p>${prods.length > 0
          ? `${prods.length} ${prods.length === 1 ? "produto disponível" : "produtos disponíveis"} — adicione ao carrinho e finalize pelo WhatsApp.`
          : "Estamos preparando esta categoria com muito carinho."}</p>`;
      document.title = `${nome} · Caieiras Pesca`;
    }

    if (prods.length === 0) {
      host.innerHTML = `<div class="empty-state reveal">
        <div class="es-icon">${ICON(meta.icon || "anchor")}</div>
        <h3>Em breve por aqui</h3>
        <p>Ainda não cadastramos produtos em <strong>${esc(nome)}</strong>. Fale com a gente no WhatsApp — talvez já tenhamos o que você procura na loja!</p>
        <a class="btn btn-whats" href="https://wa.me/${STORE.phoneRaw}" target="_blank" rel="noopener">${ICON("whatsapp")} Perguntar no WhatsApp</a>
      </div>`;
    } else {
      host.innerHTML = `<div class="product-grid">${prods.map(productCard).join("")}</div>`;
    }
  }

  /* ---- Carrosséis (scroll + estado dos botões) ---- */
  function initCarousels(scope) {
    $$(".carousel", scope).forEach((car) => {
      const track = $(".carousel-track", car);
      const prev = $(".carousel-btn.prev", car);
      const next = $(".carousel-btn.next", car);
      const update = () => {
        const max = track.scrollWidth - track.clientWidth - 2;
        prev.disabled = track.scrollLeft <= 2;
        next.disabled = track.scrollLeft >= max;
      };
      const step = () => Math.max(280, track.clientWidth * 0.8);
      prev.addEventListener("click", () => track.scrollBy({ left: -step(), behavior: "smooth" }));
      next.addEventListener("click", () => track.scrollBy({ left: step(), behavior: "smooth" }));
      track.addEventListener("scroll", update, { passive: true });
      window.addEventListener("resize", update);
      update();
    });
  }

  /* ---- Carrossel de imagens dentro do card ---- */
  function cardImageNav(card, dir) {
    const imgs = $$(".pc-media img", card);
    const dots = $$(".pc-dots button", card);
    let cur = imgs.findIndex((i) => i.classList.contains("active"));
    if (cur < 0) cur = 0;
    let nxt = dir === "next" ? (cur + 1) % imgs.length : (cur - 1 + imgs.length) % imgs.length;
    setCardImage(imgs, dots, nxt);
  }
  function setCardImage(imgs, dots, idx) {
    imgs.forEach((im, i) => im.classList.toggle("active", i === idx));
    dots.forEach((d, i) => d.classList.toggle("active", i === idx));
  }

  /* =========================================================
     BUSCA
     ========================================================= */
  function runSearch(q) {
    const box = $("#search-results");
    if (!box) return;
    const term = q.trim().toLowerCase();
    if (!term) {
      box.innerHTML = `<p class="text-muted" style="text-align:center;padding:20px">Digite para buscar entre ${DATA.produtos.length} produtos.</p>`;
      return;
    }
    const hits = DATA.produtos.filter(
      (p) => p.nome.toLowerCase().includes(term) || p.categoria.toLowerCase().includes(term) || (p.descricao || "").toLowerCase().includes(term)
    );
    if (!hits.length) {
      box.innerHTML = `<p class="text-muted" style="text-align:center;padding:20px">Nenhum produto encontrado para "${esc(q)}".</p>`;
      return;
    }
    box.innerHTML = hits
      .map(
        (p) => `<div style="display:flex;align-items:center;gap:14px;padding:10px;border-radius:14px;border:1px solid var(--line)">
          <img src="${(p.imagens && p.imagens[0]) || "assets/logo/isotipo.png"}" alt="" style="width:54px;height:54px;border-radius:10px;object-fit:cover;flex-shrink:0">
          <div style="flex:1;min-width:0">
            <a href="${p.categoriaSlug}.html#${p.id}" style="font-weight:600;color:var(--ink)">${esc(p.nome)}</a>
            <div class="text-muted" style="font-size:.85rem">${esc(p.categoria)} · ${brl(p.valor)}</div>
          </div>
          <button class="pc-add" style="width:40px;height:40px" data-add="${p.id}" aria-label="Adicionar">${ICON("plus")}</button>
        </div>`
      )
      .join("");
  }

  /* =========================================================
     HERO — céu, pôr do sol interativo, mar e pescador
     ========================================================= */
  function initHero() {
    const canvas = $(".hero-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let W = 0, H = 0, horizon = 0, dpr = 1;
    let stars = [];
    const mouse = { x: 0, y: 0, tx: 0, ty: 0, active: false };

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = canvas.getBoundingClientRect();
      W = r.width; H = r.height; horizon = H * 0.66;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // estrelas só na faixa do céu
      const count = Math.round((W * H) / 9000);
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * W,
        y: Math.random() * horizon * 0.9,
        r: Math.random() * 1.4 + 0.3,
        tw: Math.random() * Math.PI * 2,
        sp: Math.random() * 0.6 + 0.2,
      }));
      if (!mouse.active) { mouse.tx = W * 0.5; mouse.ty = horizon * 0.42; mouse.x = mouse.tx; mouse.y = mouse.ty; }
    }

    function sky(t) {
      const g = ctx.createLinearGradient(0, 0, 0, horizon);
      g.addColorStop(0, "#081726");
      g.addColorStop(0.42, "#123150");
      g.addColorStop(0.74, "#2c5a86");
      g.addColorStop(0.92, "#7a6a86");
      g.addColorStop(1, "#d98a48");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, horizon + 1);

      // estrelas
      for (const s of stars) {
        const a = (0.5 + 0.5 * Math.sin(t * 0.001 * s.sp + s.tw)) * (1 - s.y / (horizon * 0.95));
        ctx.globalAlpha = Math.max(0, a) * 0.9;
        ctx.fillStyle = "#fdf6e8";
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    function sun() {
      const sx = W * 0.74, sy = horizon - H * 0.05, R = Math.max(46, H * 0.085);
      const halo = ctx.createRadialGradient(sx, sy, R * 0.3, sx, sy, R * 4);
      halo.addColorStop(0, "rgba(238,200,29,0.55)");
      halo.addColorStop(0.4, "rgba(211,127,39,0.22)");
      halo.addColorStop(1, "rgba(211,127,39,0)");
      ctx.fillStyle = halo;
      ctx.fillRect(sx - R * 4, sy - R * 4, R * 8, R * 8);
      const core = ctx.createRadialGradient(sx, sy, 0, sx, sy, R);
      core.addColorStop(0, "#fde9a0");
      core.addColorStop(0.6, "#eec81d");
      core.addColorStop(1, "#e3a83b");
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(sx, sy, R, 0, Math.PI * 2);
      ctx.fill();
      return { sx, sy, R };
    }

    // Pôr do sol que segue o mouse (brilho de fundo — não é botão/componente)
    function mouseGlow() {
      ctx.globalCompositeOperation = "lighter";
      const R = Math.max(W, H) * 0.42;
      const g = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, R);
      g.addColorStop(0, "rgba(238,200,29,0.18)");
      g.addColorStop(0.35, "rgba(211,127,39,0.12)");
      g.addColorStop(1, "rgba(211,127,39,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, horizon);
      ctx.globalCompositeOperation = "source-over";
    }

    function sea(t, sunPos) {
      const g = ctx.createLinearGradient(0, horizon, 0, H);
      g.addColorStop(0, "#2f5f8c");
      g.addColorStop(0.5, "#27557f");
      g.addColorStop(1, "#173851");
      ctx.fillStyle = g;
      ctx.fillRect(0, horizon, W, H - horizon);

      // reflexo do sol
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, horizon, W, H - horizon);
      ctx.clip();
      for (let i = 0; i < 22; i++) {
        const yy = horizon + i * ((H - horizon) / 22) + 4;
        const wob = Math.sin(t * 0.002 + i * 0.6) * (6 + i);
        const w = (12 + i * 5);
        ctx.globalAlpha = 0.16 * (1 - i / 26);
        ctx.fillStyle = i % 2 ? "#eec81d" : "#e7a85f";
        ctx.fillRect(sunPos.sx - w / 2 + wob, yy, w, 3);
      }
      ctx.globalAlpha = 1;

      // ondas
      ctx.strokeStyle = "rgba(203,222,242,0.18)";
      ctx.lineWidth = 1.4;
      for (let l = 0; l < 4; l++) {
        ctx.beginPath();
        const base = horizon + 26 + l * (H - horizon) * 0.22;
        for (let x = 0; x <= W; x += 8) {
          const y = base + Math.sin(x * 0.018 + t * 0.0016 + l) * (3 + l) + Math.sin(x * 0.05 - t * 0.002) * 1.5;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.restore();
    }

    // Pescador no barco (silhueta inspirada na logo) com balanço do vento
    // e anzol que entra e sai do mar.
    function fisherman(t) {
      const scale = Math.max(0.7, Math.min(1.5, H / 700));
      const cx = W * 0.58;
      const baseY = horizon + 6;
      const bob = Math.sin(t * 0.0016) * 4 * scale;
      const sway = Math.sin(t * 0.0012) * 0.025;
      const cy = baseY + bob;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(sway);
      ctx.scale(scale, scale);
      ctx.fillStyle = "#3a2a12";
      ctx.strokeStyle = "#3a2a12";

      // casco do barco
      ctx.beginPath();
      ctx.moveTo(-92, -6);
      ctx.quadraticCurveTo(0, 30, 92, -6);
      ctx.quadraticCurveTo(70, 6, 0, 8);
      ctx.quadraticCurveTo(-70, 6, -92, -6);
      ctx.fill();

      // corpo sentado
      ctx.beginPath();
      ctx.moveTo(8, -8);
      ctx.quadraticCurveTo(2, -42, 16, -50);
      ctx.lineTo(26, -50);
      ctx.quadraticCurveTo(34, -36, 30, -8);
      ctx.closePath();
      ctx.fill();
      // cabeça
      ctx.beginPath();
      ctx.arc(22, -58, 7, 0, Math.PI * 2);
      ctx.fill();
      // chapéu
      ctx.beginPath();
      ctx.ellipse(22, -64, 14, 3.4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(22, -67, 6.5, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      // braço + vara
      const rodTipX = -52, rodTipY = -54;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(18, -34);
      ctx.lineTo(2, -42);
      ctx.stroke();
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.moveTo(4, -40);
      ctx.quadraticCurveTo(-28, -52, rodTipX, rodTipY);
      ctx.stroke();

      // linha + anzol entrando/saindo do mar
      const dip = Math.sin(t * 0.0022);
      const surfaceY = -6;
      const hookY = surfaceY + 14 + dip * 18; // oscila acima/abaixo da linha d'água
      const hookX = rodTipX - 6 + Math.sin(t * 0.0012) * 4;
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(58,42,18,0.85)";
      ctx.beginPath();
      ctx.moveTo(rodTipX, rodTipY);
      ctx.quadraticCurveTo(rodTipX - 4, (rodTipY + hookY) / 2, hookX, hookY);
      ctx.stroke();
      ctx.fillStyle = "#eec81d";
      ctx.beginPath();
      ctx.arc(hookX, hookY, 2.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // respingo quando o anzol mergulha
      if (dip > 0.86) {
        const wx = cx + (hookX) * scale, wy = baseY + bob + 8 * scale;
        ctx.strokeStyle = "rgba(203,222,242,0.5)";
        ctx.lineWidth = 1.2;
        const rr = (dip - 0.86) * 60;
        ctx.beginPath();
        ctx.ellipse(wx, wy, rr, rr * 0.35, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    let raf = null;
    function frame(t) {
      mouse.x += (mouse.tx - mouse.x) * 0.06;
      mouse.y += (mouse.ty - mouse.y) * 0.06;
      ctx.clearRect(0, 0, W, H);
      sky(t);
      const sp = sun();
      mouseGlow();
      sea(t, sp);
      fisherman(t);
      raf = requestAnimationFrame(frame);
    }
    function stop() { if (raf) cancelAnimationFrame(raf), (raf = null); }
    function start() { if (!raf && !reduce) raf = requestAnimationFrame(frame); }

    resize();
    window.addEventListener("resize", () => { resize(); if (reduce) drawStatic(); });

    window.addEventListener("mousemove", (e) => {
      const r = canvas.getBoundingClientRect();
      if (e.clientY > r.bottom) return;
      mouse.active = true;
      mouse.tx = e.clientX - r.left;
      mouse.ty = Math.min(e.clientY - r.top, horizon);
    });

    function drawStatic() {
      mouse.x = W * 0.5; mouse.y = horizon * 0.4;
      ctx.clearRect(0, 0, W, H);
      sky(1200); const sp = sun(); mouseGlow(); sea(1200, sp); fisherman(700);
    }

    if (reduce) { drawStatic(); return; }

    // pausa quando hero sai da tela
    const io = new IntersectionObserver(
      (ents) => ents.forEach((en) => (en.isIntersecting ? start() : stop())),
      { threshold: 0 }
    );
    io.observe(canvas);
    start();
  }

  /* =========================================================
     MAPA (Leaflet)
     ========================================================= */
  function initMap() {
    const elMap = $("#map");
    if (!elMap || typeof L === "undefined") return;
    const map = L.map("map", { scrollWheelZoom: false, attributionControl: true }).setView([STORE.lat, STORE.lng], 14);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 19,
    }).addTo(map);
    const icon = L.divIcon({
      className: "cp-pin",
      html: `<div style="width:42px;height:42px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:#d37f27;border:3px solid #fff;box-shadow:0 6px 18px rgba(0,0,0,.3)"></div>`,
      iconSize: [42, 42],
      iconAnchor: [21, 42],
    });
    L.marker([STORE.lat, STORE.lng], { icon })
      .addTo(map)
      .bindPopup(`<strong>${STORE.name}</strong><br>${STORE.addressLine}`);
    map.on("click", () => map.scrollWheelZoom.enable());
  }

  /* =========================================================
     REVEAL
     ========================================================= */
  function initReveal() {
    const els = $$(".reveal");
    if (!("IntersectionObserver" in window) || !els.length) {
      els.forEach((e) => e.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver(
      (ents, obs) => ents.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); obs.unobserve(en.target); } }),
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    els.forEach((e) => io.observe(e));
  }

  /* =========================================================
     INTERAÇÕES GLOBAIS
     ========================================================= */
  function openMenu() { $("#mobile-sheet")?.classList.add("open"); $("#scrim")?.classList.add("show"); document.body.style.overflow = "hidden"; }
  function closeMenu() {
    $("#mobile-sheet")?.classList.remove("open");
    if (!$(".cart-drawer.open")) { $("#scrim")?.classList.remove("show"); document.body.style.overflow = ""; }
  }
  function openSearch() {
    $("#search-overlay")?.classList.add("open");
    document.body.style.overflow = "hidden";
    runSearch("");
    setTimeout(() => $("#search-input")?.focus(), 200);
  }
  function closeSearch() { $("#search-overlay")?.classList.remove("open"); if (!$(".cart-drawer.open")) document.body.style.overflow = ""; }

  function wireEvents() {
    document.addEventListener("click", (e) => {
      const t = e.target.closest("[data-add],[data-cart-open],[data-cart-close],[data-checkout],[data-checkout-close],[data-checkout-confirm],[data-menu-open],[data-menu-close],[data-search-open],[data-search-close],[data-scroll],[data-img],[data-dot],[data-act]");
      if (!t) return;

      if (t.hasAttribute("data-add")) {
        Cart.add(t.getAttribute("data-add"), 1);
        if (t.classList.contains("pc-add")) {
          t.classList.add("added"); t.innerHTML = ICON("check");
          setTimeout(() => { t.classList.remove("added"); t.innerHTML = ICON("plus"); }, 1200);
        }
        return;
      }
      if (t.hasAttribute("data-cart-open")) return Cart.open();
      if (t.hasAttribute("data-cart-close")) return Cart.close();
      if (t.hasAttribute("data-checkout")) return Cart.startCheckout();
      if (t.hasAttribute("data-checkout-close")) return Cart.closeCheckout();
      if (t.hasAttribute("data-checkout-confirm")) return Cart.confirmCheckout();
      if (t.hasAttribute("data-menu-open")) return openMenu();
      if (t.hasAttribute("data-menu-close")) return closeMenu();
      if (t.hasAttribute("data-search-open")) return openSearch();
      if (t.hasAttribute("data-search-close")) return closeSearch();

      // carrossel de imagens do card
      if (t.hasAttribute("data-img")) { cardImageNav(t.closest(".product-card"), t.getAttribute("data-img")); return; }
      if (t.hasAttribute("data-dot")) {
        const card = t.closest(".product-card");
        setCardImage($$(".pc-media img", card), $$(".pc-dots button", card), +t.getAttribute("data-dot"));
        return;
      }

      // qty / remove no carrinho
      if (t.hasAttribute("data-act")) {
        const id = t.closest(".cart-item")?.getAttribute("data-id");
        if (!id) return;
        const act = t.getAttribute("data-act");
        if (act === "inc") Cart.inc(id);
        else if (act === "dec") Cart.dec(id);
        else if (act === "remove") Cart.remove(id);
      }
    });

    // fechar pelo scrim
    $("#scrim")?.addEventListener("click", () => { Cart.close(); closeMenu(); });

    // busca: input
    document.addEventListener("input", (e) => { if (e.target.id === "search-input") runSearch(e.target.value); });
    $("#checkout-name")?.addEventListener("keydown", (e) => { if (e.key === "Enter") Cart.confirmCheckout(); });

    // ESC fecha tudo
    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      Cart.close(); closeMenu(); Cart.closeCheckout(); closeSearch();
    });

    // header scroll
    const header = $("#site-header");
    const onScroll = () => header && header.classList.toggle("is-scrolled", window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* =========================================================
     BOOT
     ========================================================= */
  function boot() {
    buildHeader();
    buildMobileSheet();
    buildCartChrome();
    renderHomeCategories();
    renderCategoryPage();
    buildFooter();
    wireEvents();
    Cart.render();
    initHero();
    initReveal();
    initMap();

    // deep-link para produto (ex.: varas.html#albatroz-agata)
    if (location.hash.length > 1) {
      const target = document.getElementById(location.hash.slice(1));
      if (target && target.classList.contains("product-card")) {
        setTimeout(() => {
          target.scrollIntoView({ behavior: "smooth", block: "center" });
          target.style.transition = "box-shadow .4s";
          target.style.boxShadow = "0 0 0 3px var(--orange)";
          setTimeout(() => (target.style.boxShadow = ""), 1800);
        }, 400);
      }
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();

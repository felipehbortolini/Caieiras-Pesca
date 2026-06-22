/* =============================================================
   Carrinho Caieiras Pesca
   - Estado persistido em localStorage (continua entre abas/páginas)
   - Finalização via WhatsApp com a mensagem-padrão do pedido
   ============================================================= */
(function () {
  "use strict";

  const STORAGE_KEY = "caieiras_cart_v1";
  const WHATSAPP_PHONE = "5527996209785"; // 55 (BR) + 27 (DDD) + número

  const brl = (n) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n || 0);
  window.brl = brl;

  const DATA = window.CAIEIRAS_DATA || { produtos: [], categorias: [] };
  const byId = {};
  DATA.produtos.forEach((p) => (byId[p.id] = p));

  // Preço efetivo: usa promoção quando houver
  const priceOf = (p) => (p && p.precoPromo ? p.precoPromo : p ? p.valor : 0);
  window.priceOf = priceOf;

  const OBS_KEY = "caieiras_obs_v1";
  let items = load();
  let obs = localStorage.getItem(OBS_KEY) || "";

  function load() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      if (!Array.isArray(raw)) return [];
      return raw.filter((it) => it && byId[it.id]).map((it) => ({ id: it.id, qty: Math.max(1, +it.qty || 1) }));
    } catch (e) {
      return [];
    }
  }
  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }

  const Cart = {
    phone: WHATSAPP_PHONE,
    product: (id) => byId[id],
    items: () => items.slice(),
    count: () => items.reduce((s, it) => s + it.qty, 0),
    total: () => items.reduce((s, it) => s + priceOf(byId[it.id]) * it.qty, 0),
    priceOf: (id) => priceOf(byId[id]),

    add(id, qty = 1) {
      if (!byId[id]) return;
      if (byId[id].tag === "indisponivel") {
        this.toast("Produto indisponível no momento");
        return;
      }
      const found = items.find((it) => it.id === id);
      if (found) found.qty += qty;
      else items.push({ id, qty });
      persist();
      this.render(true);
      this.bumpFab();
      const p = byId[id];
      this.toast(`${p.nome} adicionado ao carrinho`);
    },
    setQty(id, qty) {
      const found = items.find((it) => it.id === id);
      if (!found) return;
      found.qty = qty;
      if (found.qty <= 0) items = items.filter((it) => it.id !== id);
      persist();
      this.render();
    },
    inc(id) { const it = items.find((i) => i.id === id); this.setQty(id, (it ? it.qty : 0) + 1); },
    dec(id) { const it = items.find((i) => i.id === id); if (it) this.setQty(id, it.qty - 1); },
    remove(id) { items = items.filter((it) => it.id !== id); persist(); this.render(); },
    clear() { items = []; persist(); this.render(); },
    setObs(v) { obs = v; localStorage.setItem(OBS_KEY, obs); },
    getObs() { return obs; },

    /* ---------- Drawer ---------- */
    open() {
      document.getElementById("cart-drawer")?.classList.add("open");
      document.getElementById("scrim")?.classList.add("show");
      document.body.style.overflow = "hidden";
    },
    close() {
      document.getElementById("cart-drawer")?.classList.remove("open");
      if (!document.querySelector(".mobile-sheet.open")) {
        document.getElementById("scrim")?.classList.remove("show");
        document.body.style.overflow = "";
      }
    },
    toggle() {
      const d = document.getElementById("cart-drawer");
      d && d.classList.contains("open") ? this.close() : this.open();
    },

    bumpFab() {
      const fab = document.querySelector(".cart-fab");
      if (!fab) return;
      fab.classList.remove("bump");
      void fab.offsetWidth;
      fab.classList.add("bump");
    },

    toast(msg) {
      const t = document.getElementById("toast");
      if (!t) return;
      t.innerHTML = ICON("check") + "<span>" + msg + "</span>";
      t.classList.add("show");
      clearTimeout(this._tt);
      this._tt = setTimeout(() => t.classList.remove("show"), 2600);
    },

    /* ---------- Render ---------- */
    render(justAdded) {
      const count = this.count();
      document.querySelectorAll(".cart-count").forEach((el) => {
        el.textContent = count;
        el.classList.toggle("show", count > 0);
      });
      const obsEl = document.getElementById("cart-obs");
      if (obsEl && document.activeElement !== obsEl) obsEl.value = obs;
      const body = document.getElementById("cart-body");
      const foot = document.getElementById("cart-foot");
      if (!body) return;

      if (!items.length) {
        body.innerHTML = `<div class="cart-empty">${ICON("bag")}
          <div><strong>Seu carrinho está vazio</strong><br>
          <span class="text-muted">Adicione produtos para começar o pedido.</span></div>
          <button class="btn btn-outline" data-cart-close>Explorar produtos</button></div>`;
        if (foot) foot.style.display = "none";
        return;
      }
      if (foot) foot.style.display = "block";

      body.innerHTML = items
        .map((it) => {
          const p = byId[it.id];
          const img = (p.imagens && p.imagens[0]) || "";
          return `<div class="cart-item" data-id="${p.id}">
            <img src="${img}" alt="${esc(p.nome)}" loading="lazy">
            <div class="ci-info">
              <h4>${esc(p.nome)}</h4>
              <div class="ci-unit">${brl(priceOf(p))} / un.${p.precoPromo ? ` <s>${brl(p.valor)}</s>` : ""}</div>
              <div class="ci-bottom">
                <div class="qty">
                  <button data-act="dec" aria-label="Diminuir">${ICON("minus")}</button>
                  <span>${it.qty}</span>
                  <button data-act="inc" aria-label="Aumentar">${ICON("plus")}</button>
                </div>
                <div class="ci-line">${brl(priceOf(p) * it.qty)}</div>
              </div>
              <button class="ci-remove" data-act="remove">${ICON("trash")} Remover</button>
            </div>
          </div>`;
        })
        .join("");

      const total = this.total();
      const tv = document.getElementById("cart-total-value");
      const tc = document.getElementById("cart-total-count");
      if (tv) tv.textContent = brl(total);
      if (tc) tc.textContent = `${count} ${count === 1 ? "item" : "itens"}`;
    },

    /* ---------- Checkout ---------- */
    startCheckout() {
      if (!items.length) { this.open(); return; }
      const sum = document.getElementById("checkout-summary");
      if (sum) {
        sum.innerHTML =
          items
            .map((it) => {
              const p = byId[it.id];
              return `<div class="ms-row"><span>${it.qty}× ${esc(p.nome)}</span><span>${brl(
                p.valor * it.qty
              )}</span></div>`;
            })
            .join("") +
          `<div class="ms-row t"><span>Total (${this.count()} ${
            this.count() === 1 ? "item" : "itens"
          })</span><span>${brl(this.total())}</span></div>`;
      }
      const err = document.getElementById("checkout-error");
      if (err) err.textContent = "";
      document.getElementById("checkout-modal")?.classList.add("open");
      document.body.style.overflow = "hidden";
      setTimeout(() => document.getElementById("checkout-name")?.focus(), 250);
    },
    closeCheckout() {
      document.getElementById("checkout-modal")?.classList.remove("open");
      if (!document.querySelector(".cart-drawer.open")) document.body.style.overflow = "";
    },
    confirmCheckout() {
      const input = document.getElementById("checkout-name");
      const err = document.getElementById("checkout-error");
      const name = (input?.value || "").trim();
      if (!name) {
        if (err) err.textContent = "Por favor, informe seu nome para continuar.";
        input?.focus();
        return;
      }
      if (!items.length) return;
      window.open(this.whatsappURL(name), "_blank");
      this.closeCheckout();
      this.close();
    },

    buildMessage(name) {
      const lines = [];
      lines.push(`Bem vindo ${name}, segue descritivo do seu pedido:`);
      lines.push("");
      items.forEach((it) => {
        const p = byId[it.id];
        const promo = p.precoPromo ? " (promo)" : "";
        lines.push(
          `• ${p.nome}${promo} | ${it.qty} un. | ${brl(priceOf(p))} | ${brl(priceOf(p) * it.qty)}`
        );
      });
      lines.push("");
      lines.push(
        `Total do pedido: ${this.count()} ${
          this.count() === 1 ? "item" : "itens"
        } | ${brl(this.total())}`
      );
      if (obs && obs.trim()) {
        lines.push("");
        lines.push(`Observação: ${obs.trim()}`);
      }
      lines.push("");
      lines.push(
        "Aguarde que vamos finalizar sua compra e decidirmos qual será a forma de pagamento"
      );
      return lines.join("\n");
    },
    whatsappURL(name) {
      return `https://wa.me/${this.phone}?text=${encodeURIComponent(this.buildMessage(name))}`;
    },
  };

  function esc(s) {
    return String(s || "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  }

  // Sincroniza entre abas
  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEY) { items = load(); Cart.render(); }
  });

  window.Cart = Cart;
})();

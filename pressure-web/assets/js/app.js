/* ==========================================================================
   PRESSURE — app.js
   Shell compartido (anuncios, header, menú, búsqueda, bolsa, footer) y la
   lógica de cada página según <body data-page="...">.
   Sin dependencias ni build: se sirve tal cual desde cualquier hosting.
   ========================================================================== */
(() => {
  "use strict";

  const CFG = window.PRESSURE_CONFIG;
  const PRODUCTS = window.PRESSURE_CATALOG.products;
  const PAGE = document.body.dataset.page;
  const CURRENT_DROP = CFG.collections[0].handle; // el primer expediente del config es el "nuevo"

  /* ---------- Utilidades ---------- */
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const params = new URLSearchParams(location.search);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const money = (n) => "$" + Math.round(n).toLocaleString("es-CO").replace(/,/g, ".");
  const store = {
    get(k, fb) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch { return fb; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* modo privado */ } },
  };
  const norm = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

  const byHandle = (h) => PRODUCTS.find((p) => p.handle === h);
  const collection = (h) => CFG.collections.find((c) => c.handle === h);
  const type = (h) => CFG.types.find((t) => t.handle === h);
  const isAvailable = (p) => (p.sizes.length ? p.sizes.some((s) => s.available) : p.available !== false);
  const sizeAvailable = (p, size) => !p.sizes.length || p.sizes.some((s) => s.name === size && s.available);
  const newest = () => [...PRODUCTS].sort((a, b) => b.date.localeCompare(a.date));

  const ICON = {
    menu: '<svg viewBox="0 0 24 24"><path d="M3 7h18M3 12h18M3 17h18"/></svg>',
    search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 5 5"/></svg>',
    bag: '<svg viewBox="0 0 24 24"><path d="M5 8h14l-1 13H6L5 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',
    close: '<svg viewBox="0 0 24 24"><path d="m5 5 14 14M19 5 5 19"/></svg>',
    left: '<svg viewBox="0 0 24 24"><path d="M15 5 8 12l7 7"/></svg>',
    right: '<svg viewBox="0 0 24 24"><path d="m9 5 7 7-7 7"/></svg>',
  };

  const productUrl = (p) => `producto.html?p=${encodeURIComponent(p.handle)}`;
  const collectionUrl = (h) => `coleccion.html?c=${encodeURIComponent(h)}`;
  const typeUrl = (h) => `coleccion.html?tipo=${encodeURIComponent(h)}`;
  const waUrl = (text) => `https://wa.me/${CFG.store.whatsapp}?text=${encodeURIComponent(text)}`;

  /* ---------- Bolsa (carrito) ---------- */
  const Cart = {
    key: "pressure_cart_v1",
    items() {
      // descarta productos que ya no existen en el catálogo
      return store.get(this.key, []).filter((i) => byHandle(i.handle));
    },
    save(items) { store.set(this.key, items); renderCart(); updateBagCount(); },
    add(handle, size, qty = 1) {
      const items = this.items();
      const found = items.find((i) => i.handle === handle && i.size === size);
      if (found) found.qty = Math.min(10, found.qty + qty);
      else items.push({ handle, size, qty });
      this.save(items);
    },
    setQty(idx, qty) {
      const items = this.items();
      if (!items[idx]) return;
      if (qty <= 0) items.splice(idx, 1); else items[idx].qty = Math.min(10, qty);
      this.save(items);
    },
    clear() { this.save([]); },
    count() { return this.items().reduce((n, i) => n + i.qty, 0); },
    subtotal() { return this.items().reduce((n, i) => n + byHandle(i.handle).price * i.qty, 0); },
  };

  /* ---------- Shell: anuncios, header, drawers, footer ---------- */
  function renderShell() {
    const overlay = PAGE === "home";
    const ann = CFG.announcements.map((a) => `<span>${esc(a)}</span>`).join("");
    const top = `
      <a class="sr-only" href="#main">Saltar al contenido</a>
      <div class="ann" role="region" aria-label="Anuncios"><div class="ann__track">${ann}${ann}</div></div>
      <header class="header ${overlay ? "header--overlay" : ""}" id="header">
        <div class="header__left">
          <button class="icon-btn" data-open="menu" aria-label="Abrir menú">${ICON.menu}<span class="lbl">Menú</span></button>
          <button class="icon-btn" data-open="search" aria-label="Buscar">${ICON.search}<span class="lbl">Buscar</span></button>
        </div>
        <a href="index.html" class="logo" aria-label="PRESSURE — inicio"><img src="assets/img/editorial/pressure_logo_sin_fondo.webp" alt="PRESSURE" width="1800" height="1800"></a>
        <div class="header__right">
          <button class="icon-btn" data-open="cart" aria-label="Abrir bolsa"><span class="lbl">Bolsa</span>${ICON.bag}<span class="bag-count" id="bagCount">0</span></button>
        </div>
      </header>`;
    document.body.insertAdjacentHTML("afterbegin", top);

    const colLinks = CFG.collections.map((c) => `<li><a href="${collectionUrl(c.handle)}"><span>${esc(c.title)}${c.handle === CURRENT_DROP ? '<span class="menu-new">NUEVO</span>' : ""}</span><small>${esc(c.file)}</small></a></li>`).join("");
    const typeLinks = CFG.types.map((t) => `<li><a href="${typeUrl(t.handle)}">${esc(t.title)}<small>${PRODUCTS.filter((p) => p.type === t.handle).length}</small></a></li>`).join("");
    const lookLinks = CFG.collections.filter((c) => c.lookbook).map((c) => `<li><a href="archivo.html#${c.handle}">Lookbook ${esc(c.title)}</a></li>`).join("");

    const shell = `
      <div class="scrim" id="scrim"></div>

      <aside class="drawer drawer--left" id="menu" aria-label="Menú" aria-hidden="true">
        <div class="drawer__head">
          <span class="mono">Índice del archivo</span>
          <button class="close-x" data-close aria-label="Cerrar menú">${ICON.close}</button>
        </div>
        <div class="menu-tabs" role="tablist">
          <button class="menu-tab is-active" role="tab" data-tab="m-col">Colecciones</button>
          <button class="menu-tab" role="tab" data-tab="m-type">Prendas</button>
        </div>
        <div class="drawer__body">
          <div class="menu-panel is-active" id="m-col">
            <div class="menu-group"><ul class="menu-list">
              <li><a href="coleccion.html?c=novedades">Novedades</a></li>
              <li><a href="coleccion.html?c=all">Ver todo<small>${PRODUCTS.length}</small></a></li>
            </ul></div>
            <div class="menu-group"><h4>Expedientes</h4><ul class="menu-list">${colLinks}</ul></div>
            <div class="menu-group"><h4>Inspírate</h4><ul class="menu-list menu-list--sm">
              <li><a href="archivo.html">El Archivo PRESSURE</a></li>${lookLinks}
            </ul></div>
          </div>
          <div class="menu-panel" id="m-type">
            <div class="menu-group"><h4>Prendas</h4><ul class="menu-list">${typeLinks}</ul></div>
            <div class="menu-group"><h4>Ayuda</h4><ul class="menu-list menu-list--sm">
              <li><a href="info.html?doc=envios">Envíos</a></li>
              <li><a href="info.html?doc=cambios">Cambios y devoluciones</a></li>
              <li><a href="info.html?doc=tallas">Guía de tallas</a></li>
              <li><a href="info.html?doc=faq">Preguntas frecuentes</a></li>
              <li><a href="info.html?doc=contacto">Contacto</a></li>
            </ul></div>
          </div>
        </div>
        <div class="drawer__foot menu-foot">
          <a class="link-u" href="${CFG.store.instagram}" target="_blank" rel="noopener">Instagram</a>
          <a class="link-u" href="${CFG.store.tiktok}" target="_blank" rel="noopener">TikTok</a>
          <a class="link-u" href="${waUrl("Hola PRESSURE 👋")}" target="_blank" rel="noopener">WhatsApp</a>
        </div>
      </aside>

      <aside class="drawer drawer--right" id="cart" aria-label="Bolsa" aria-hidden="true">
        <div class="drawer__head">
          <strong>Bolsa <span class="mono" id="cartCount"></span></strong>
          <button class="close-x" data-close aria-label="Cerrar bolsa">${ICON.close}</button>
        </div>
        <div class="drawer__body" id="cartBody"></div>
        <div class="drawer__foot" id="cartFoot"></div>
      </aside>

      <div class="search" id="search" aria-hidden="true">
        <div class="search__bar">
          ${ICON.search.replace("<svg", '<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.4"')}
          <input type="search" id="searchInput" placeholder="Buscar gorras, camisetas, colores…" aria-label="Buscar productos" autocomplete="off">
          <button class="close-x" data-close aria-label="Cerrar búsqueda">${ICON.close}</button>
        </div>
        <div class="search__body">
          <p class="search__hint mono" id="searchHint">Sugerencias</p>
          <div class="grid" style="--cols:5" id="searchResults"></div>
        </div>
      </div>

      <div class="modal" id="modal" aria-hidden="true"><div class="scrim is-open" data-close></div><div class="modal__card" id="modalCard"></div></div>
      <div class="toast" id="toast" role="status" aria-live="polite"></div>`;
    document.body.insertAdjacentHTML("beforeend", shell);

    const footer = `
      <footer class="footer">
        <div class="footer__top">
          <div class="footer__brand">
            <a href="index.html" class="logo" aria-label="PRESSURE"><img src="assets/img/editorial/pressure_logo_sin_fondo.webp" alt="" width="1800" height="1800" loading="lazy"></a>
            <p>Ropa hecha desde lo interno. Diseñada y empacada a mano en ${esc(CFG.store.city)}.</p>
          </div>
          <div><h4>Comprar</h4><ul>
            <li><a href="coleccion.html?c=novedades">Novedades</a></li>
            ${CFG.collections.map((c) => `<li><a href="${collectionUrl(c.handle)}">${esc(c.title)}</a></li>`).join("")}
            <li><a href="coleccion.html?c=all">Ver todo</a></li>
          </ul></div>
          <div><h4>Ayuda</h4><ul>
            <li><a href="info.html?doc=envios">Envíos</a></li>
            <li><a href="info.html?doc=cambios">Cambios y devoluciones</a></li>
            <li><a href="info.html?doc=tallas">Guía de tallas</a></li>
            <li><a href="info.html?doc=faq">Preguntas frecuentes</a></li>
            <li><a href="info.html?doc=contacto">Contacto</a></li>
          </ul></div>
          <div><h4>PRESSURE</h4><ul>
            <li><a href="archivo.html">El Archivo</a></li>
            <li><a href="${CFG.store.instagram}" target="_blank" rel="noopener">Instagram</a></li>
            <li><a href="${CFG.store.tiktok}" target="_blank" rel="noopener">TikTok</a></li>
            <li><a href="${CFG.store.facebook}" target="_blank" rel="noopener">Facebook</a></li>
            <li><a href="mailto:${CFG.store.email}">${esc(CFG.store.email)}</a></li>
          </ul></div>
        </div>
        <div class="footer__bottom mono">
          <span>© ${new Date().getFullYear()} PRESSURE · ${esc(CFG.store.city)}</span>
          <span><a href="info.html?doc=privacidad">Privacidad</a> · <a href="info.html?doc=terminos">Términos</a></span>
        </div>
        <div class="footer__mega" aria-hidden="true"><div class="display">Pressure</div></div>
      </footer>`;
    const main = $("#main");
    main.insertAdjacentHTML("afterend", footer);

    // Header: estado al hacer scroll
    const header = $("#header");
    const onScroll = () => header.classList.toggle("is-scrolled", scrollY > (overlay ? innerHeight * 0.6 : 4));
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // Abrir / cerrar paneles
    document.addEventListener("click", (e) => {
      const opener = e.target.closest("[data-open]");
      if (opener) { e.preventDefault(); openPanel(opener.dataset.open); return; }
      if (e.target.closest("[data-close]") || e.target.id === "scrim") closeAll();
      const tab = e.target.closest("[data-tab]");
      if (tab) {
        $$(".menu-tab").forEach((t) => t.classList.toggle("is-active", t === tab));
        $$(".menu-panel").forEach((p) => p.classList.toggle("is-active", p.id === tab.dataset.tab));
      }
    });
    addEventListener("keydown", (e) => { if (e.key === "Escape") closeAll(); });

    // Búsqueda
    const input = $("#searchInput");
    input.addEventListener("input", () => renderSearch(input.value));
    renderSearch("");
  }

  let lastFocus = null;
  function openPanel(id) {
    closeAll(true);
    const el = document.getElementById(id);
    if (!el) return;
    lastFocus = document.activeElement;
    el.classList.add("is-open");
    el.setAttribute("aria-hidden", "false");
    if (id !== "modal") $("#scrim").classList.add("is-open");
    document.body.classList.add("no-scroll");
    if (id === "search") setTimeout(() => $("#searchInput").focus(), 200);
    if (id === "cart") renderCart();
  }
  function closeAll(silent) {
    $$(".drawer.is-open, .search.is-open, .modal.is-open").forEach((el) => { el.classList.remove("is-open"); el.setAttribute("aria-hidden", "true"); });
    $("#scrim")?.classList.remove("is-open");
    document.body.classList.remove("no-scroll");
    if (!silent && lastFocus) lastFocus.focus?.();
  }
  function openModal(html, cls = "") {
    $("#modal").className = "modal " + cls;
    $("#modalCard").innerHTML = `<button class="close-x" data-close aria-label="Cerrar">${ICON.close}</button>${html}`;
    openPanel("modal");
  }

  let toastTimer;
  function toast(html) {
    const t = $("#toast");
    t.innerHTML = html;
    t.classList.add("is-open");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("is-open"), 3200);
  }

  function updateBagCount() {
    const n = Cart.count();
    const el = $("#bagCount");
    if (el) el.textContent = n ? `(${n})` : "";
  }

  function shippingInfo(subtotal, city = "") {
    const free = CFG.shipping.freeThreshold;
    if (city && norm(city).includes(norm(CFG.shipping.freeCity))) return { free: true, label: "Gratis en " + CFG.shipping.freeCity };
    if (subtotal >= free) return { free: true, label: "Gratis" };
    return { free: false, label: "Se confirma por WhatsApp" };
  }

  function renderCart() {
    const body = $("#cartBody"), foot = $("#cartFoot");
    if (!body) return;
    const items = Cart.items();
    $("#cartCount").textContent = items.length ? `(${Cart.count()})` : "";
    if (!items.length) {
      body.innerHTML = `<div class="cart-empty"><span class="stamp stamp--ink">Vacía</span><p>Tu bolsa está vacía. Revisa el archivo y encuentra tu próxima pieza.</p><a class="btn" href="coleccion.html?c=novedades">Ver novedades</a></div>`;
      foot.innerHTML = "";
      return;
    }
    const sub = Cart.subtotal();
    const free = CFG.shipping.freeThreshold;
    const pct = Math.min(100, (sub / free) * 100);
    const missing = free - sub;
    body.innerHTML = `
      <div class="ship-bar">
        <span class="mono">${missing > 0 ? `Te faltan ${money(missing)} para envío gratis a toda Colombia` : "Tienes envío gratis a toda Colombia"}</span>
        <div class="ship-bar__track"><div class="ship-bar__fill" style="width:${pct}%"></div></div>
      </div>
      ${items.map((i, idx) => {
        const p = byHandle(i.handle);
        return `<div class="line">
          <a class="line__img" href="${productUrl(p)}"><img src="${p.images[0]}" alt="${esc(p.title)}" loading="lazy"></a>
          <div class="line__info">
            <span class="mono">${p.ref}</span>
            <a class="line__title" href="${productUrl(p)}">${esc(p.title)}</a>
            <span class="card__meta">${esc(p.color)}${i.size ? " · Talla " + esc(i.size) : ""}</span>
            <div class="line__bottom">
              <div class="qty" aria-label="Cantidad">
                <button data-qty="${idx}" data-d="-1" aria-label="Quitar uno">−</button><span>${i.qty}</span><button data-qty="${idx}" data-d="1" aria-label="Agregar uno">+</button>
              </div>
              <strong>${money(p.price * i.qty)}</strong>
            </div>
            <button class="line__remove" data-remove="${idx}">Eliminar</button>
          </div>
        </div>`;
      }).join("")}`;
    foot.innerHTML = `
      <div class="totals">
        <div><span>Subtotal</span><span>${money(sub)}</span></div>
        <div class="mono"><span>Envío</span><span>${shippingInfo(sub).label}</span></div>
      </div>
      <a class="btn btn--block" href="checkout.html">Finalizar pedido</a>`;
    body.querySelectorAll("[data-qty]").forEach((b) => b.addEventListener("click", () => {
      const idx = +b.dataset.qty; Cart.setQty(idx, Cart.items()[idx].qty + +b.dataset.d);
    }));
    body.querySelectorAll("[data-remove]").forEach((b) => b.addEventListener("click", () => Cart.setQty(+b.dataset.remove, 0)));
  }

  function addToBag(p, size, { silent = false } = {}) {
    if (p.sizes.length && !size) return false;
    if (!sizeAvailable(p, size)) return false;
    Cart.add(p.handle, size || "");
    if (!silent) toast(`<span>${esc(p.title)}${size ? " · " + esc(size) : ""} añadida a la bolsa</span><a href="#" data-open="cart">Ver bolsa</a>`);
    return true;
  }

  function renderSearch(q) {
    const res = $("#searchResults"), hint = $("#searchHint");
    const terms = norm(q.trim()).split(/\s+/).filter(Boolean);
    let list;
    if (!terms.length) { list = newest().slice(0, 5); hint.textContent = "Sugerencias · Lo más nuevo"; }
    else {
      list = PRODUCTS.filter((p) => {
        const hay = norm([p.title, p.color, p.type, collection(p.collection)?.title, p.description, p.ref].join(" "));
        return terms.every((t) => hay.includes(t));
      });
      hint.textContent = list.length ? `${list.length} resultado${list.length > 1 ? "s" : ""}` : "Sin resultados. Prueba con “gorra”, “negra” o “testamentos”.";
    }
    res.innerHTML = list.map((p) => card(p, { quick: false })).join("");
  }

  /* ---------- Tarjeta de producto ---------- */
  function badge(p) {
    if (!isAvailable(p)) return '<span class="stamp">Agotado</span>';
    if (p.sizes.length && p.sizes.some((s) => !s.available)) return '<span class="stamp stamp--indigo">Pocas tallas</span>';
    if (p.collection === CURRENT_DROP) return '<span class="stamp stamp--ink">Nuevo</span>';
    return "";
  }
  function card(p, { quick = true, lazy = true } = {}) {
    const alt = p.images[1] ? `<img class="alt" src="${p.images[1]}" alt="" loading="lazy">` : "";
    const avail = isAvailable(p);
    let q = "";
    if (quick && avail) {
      q = p.sizes.length
        ? p.sizes.map((s) => `<button data-quick="${p.handle}" data-size="${esc(s.name)}" ${s.available ? "" : "disabled"} aria-label="Añadir talla ${esc(s.name)}">${esc(s.name)}</button>`).join("")
        : `<button data-quick="${p.handle}" data-size="">Añadir +</button>`;
    }
    return `<article class="card ${avail ? "" : "is-soldout"}">
      <a href="${productUrl(p)}" class="card__media" aria-label="${esc(p.title)}">
        <img src="${p.images[0]}" alt="${esc(p.title)} — ${esc(p.color)}" ${lazy ? 'loading="lazy"' : ""}>
        ${alt}
        <span class="card__stamp">${badge(p)}</span>
        <span class="card__ref mono">${p.ref}</span>
      </a>
      ${q ? `<div class="card__quick">${q}</div>` : ""}
      <div class="card__info">
        <a href="${productUrl(p)}" class="card__title">${esc(p.title)}</a>
        <div class="card__row">
          <span class="card__price">${money(p.price)}</span>
          <span class="card__meta mono"><span class="swatch" style="background:${p.swatch}"></span> <span class="card__col">${esc(collection(p.collection)?.title || "")}</span></span>
        </div>
      </div>
    </article>`;
  }
  // Añadido rápido desde la tarjeta (delegado)
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-quick]");
    if (!b) return;
    e.preventDefault();
    const p = byHandle(b.dataset.quick);
    if (p) addToBag(p, b.dataset.size);
  });

  function rail(list, id) {
    return `<div class="rail"><div class="rail__track" id="${id}">${list.map((p) => card(p)).join("")}</div></div>`;
  }
  function railNav(id) {
    return `<div class="rail__nav"><button data-rail="${id}" data-dir="-1" aria-label="Anterior">${ICON.left}</button><button data-rail="${id}" data-dir="1" aria-label="Siguiente">${ICON.right}</button></div>`;
  }
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-rail]");
    if (!b) return;
    const t = document.getElementById(b.dataset.rail);
    t.scrollBy({ left: t.clientWidth * 0.8 * +b.dataset.dir, behavior: "smooth" });
  });

  function reveal() {
    if (!("IntersectionObserver" in window)) { $$(".reveal").forEach((el) => el.classList.add("is-in")); return; }
    const io = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
    }), { rootMargin: "0px 0px -8% 0px" });
    $$(".reveal").forEach((el) => io.observe(el));
  }

  function setMeta(title, desc) {
    document.title = title;
    let m = $('meta[name="description"]');
    if (!m) { m = document.createElement("meta"); m.name = "description"; document.head.appendChild(m); }
    m.content = desc;
  }

  /* ==========================================================================
     Páginas
     ========================================================================== */

  /* ---------- Inicio ---------- */
  function pageHome() {
    const [a, b] = CFG.collections.filter((c) => c.video);
    const main = $("#main");
    const panel = (c) => `
      <a class="split__panel" href="${collectionUrl(c.handle)}">
        <video src="${c.video}" poster="${c.poster}" autoplay muted loop playsinline preload="metadata" aria-hidden="true"></video>
        <div class="split__file"><span class="stamp">${esc(c.file)} · ${esc(c.kicker)}</span></div>
        <div class="split__inner">
          <span class="tag-file">${esc(c.tagline)}</span>
          <h2 class="split__title display">${esc(c.title)}</h2>
          <span class="btn btn--light">Ver expediente</span>
        </div>
      </a>`;

    const folders = [
      ...CFG.types.map((t) => ({ href: typeUrl(t.handle), tab: "Prenda", title: t.title, img: t.cover, n: PRODUCTS.filter((p) => p.type === t.handle).length })),
      { href: collectionUrl("basicas"), tab: collection("basicas").file, title: "Básicas", img: "assets/img/editorial/img_5393.webp", n: PRODUCTS.filter((p) => p.collection === "basicas").length },
    ];

    const orb = collection(CURRENT_DROP);
    const testa = collection("testamentos");
    const basics = PRODUCTS.filter((p) => p.collection === "basicas");
    const street = [
      ["assets/img/editorial/img_5241.webp", "Calle 52"],
      ["assets/img/editorial/20260313_204738.webp", "13.03.26"],
      ["assets/img/editorial/img_007.webp", "Puerto"],
      ["assets/img/editorial/img_023.webp", "Órbita / Cielo"],
    ];

    main.innerHTML = `
      <section class="split" aria-label="Colecciones destacadas">${panel(a)}${panel(b)}</section>

      <section class="section--tight wrap" aria-label="Categorías">
        <div class="section-head reveal"><h2>Comprar por<br>categoría</h2><span class="mono">Índice · ${PRODUCTS.length} referencias</span></div>
        <div class="folders">
          ${folders.map((f) => `<a class="folder reveal" href="${f.href}">
            <span class="folder__tab">${esc(f.tab)}</span>
            <div class="folder__body">
              <div class="folder__img"><img src="${f.img}" alt="" loading="lazy"></div>
              <div class="folder__label"><strong>${esc(f.title)}</strong><span class="mono">${String(f.n).padStart(2, "0")} piezas</span></div>
            </div>
          </a>`).join("")}
        </div>
      </section>

      <section class="section--tight" aria-label="Novedades">
        <div class="section-head wrap reveal"><div><span class="tag-file">Recién archivado</span><h2 style="margin-top:12px">Novedades</h2></div>${railNav("railNew")}</div>
        ${rail(newest().slice(0, 8), "railNew")}
      </section>

      <section class="section wrap" aria-label="${esc(orb.title)}">
        <div class="editorial">
          <div class="editorial__text reveal">
            <div><span class="stamp">${esc(orb.file)}</span></div>
            <div>
              <h2 class="display">${esc(orb.title)}</h2>
              <p class="mono" style="margin:14px 0 18px;color:var(--red)">${esc(orb.tagline)}</p>
              <p>${esc(orb.description)}</p>
            </div>
            <div style="display:flex;gap:10px;flex-wrap:wrap"><a class="btn" href="${collectionUrl(orb.handle)}">Comprar ${esc(orb.title)}</a><a class="btn btn--ghost" href="archivo.html#${orb.handle}">Lookbook</a></div>
          </div>
          <figure class="e-a reveal"><img src="${orb.lookbook[0]}" alt="Gorra ${esc(orb.title)} en uso" loading="lazy"><figcaption class="mono">Tierra</figcaption></figure>
          <figure class="e-b reveal"><img src="${orb.lookbook[1]}" alt="" loading="lazy"><figcaption class="mono">Astro</figcaption></figure>
          <figure class="e-c reveal"><img src="${orb.lookbook[2]}" alt="" loading="lazy"><figcaption class="mono">Cielo</figcaption></figure>
          <figure class="e-d reveal"><img src="${orb.lookbook[5]}" alt="" loading="lazy"><figcaption class="mono">Astro / Studio</figcaption></figure>
        </div>
      </section>

      <section class="dark section" aria-label="${esc(testa.title)}">
        <div class="wrap testa">
          <div class="reveal">
            <span class="tag-file">${esc(testa.file)} · ${esc(testa.kicker)}</span>
            <div class="testa__brackets" style="margin-top:22px"><div class="testa__word">TES<br>TA<br>MEN<br>TOS</div></div>
            <p class="testa__quote">“${esc(testa.description.split(".")[0])}.”</p>
            <a class="btn btn--light" href="${collectionUrl(testa.handle)}">Ver la colección</a>
          </div>
          <div>
            <div class="testa__grid">${PRODUCTS.filter((p) => p.collection === "testamentos").map((p) => card(p)).join("")}</div>
            <div class="testa__video reveal"><video src="${testa.video}" poster="${testa.poster}" muted loop playsinline preload="none" data-autoplay aria-label="Video de la colección Testamentos"></video></div>
          </div>
        </div>
      </section>

      <section class="section--tight" aria-label="Básicas">
        <div class="section-head wrap reveal" style="margin-top:28px"><div><span class="tag-file">${esc(collection("basicas").file)} · Esenciales</span><h2 style="margin-top:12px">Básicas</h2></div><a class="link-u" href="${collectionUrl("basicas")}">Ver todo</a></div>
        <div class="grid" style="--cols:3">${basics.map((p) => card(p)).join("")}</div>
      </section>

      <section class="section wrap" aria-label="Desde la calle">
        <div class="section-head reveal"><div><span class="tag-file">Archivo de calle</span><h2 style="margin-top:12px">Desde<br>Barrancabermeja</h2></div><a class="link-u" href="${CFG.store.instagram}" target="_blank" rel="noopener">@lapressure__</a></div>
        <div class="archive-strip">${street.map(([src, cap], i) => `<figure class="polaroid reveal" style="margin:0"><img src="${src}" alt="" loading="lazy"><p class="mono"><span>N° ${String(i + 1).padStart(3, "0")}</span><span>${esc(cap)}</span></p></figure>`).join("")}</div>
      </section>

      <section class="services" aria-label="Servicios">
        <div class="service"><strong>Envío gratis en ${esc(CFG.shipping.freeCity)}</strong><span>Siempre, sin mínimo de compra.</span></div>
        <div class="service"><strong>Envío gratis a Colombia</strong><span>Desde ${money(CFG.shipping.freeThreshold)} COP.</span></div>
        <div class="service"><strong>Pedido por WhatsApp</strong><span>Te confirmamos stock y pago al instante.</span></div>
        <div class="service"><strong>Cambios fáciles</strong><span><a href="info.html?doc=cambios" style="text-decoration:underline">Ver política de cambios</a></span></div>
      </section>
      ${newsletterBlock()}`;

    // El video de Testamentos solo se reproduce cuando está en pantalla
    const v = $("[data-autoplay]");
    if (v && "IntersectionObserver" in window) {
      new IntersectionObserver(([en]) => { en.isIntersecting ? v.play().catch(() => {}) : v.pause(); }, { threshold: 0.25 }).observe(v);
    }
    bindNewsletter();
  }

  function newsletterBlock() {
    if (!CFG.newsletter.klaviyoCompanyId || !CFG.newsletter.klaviyoListId) return "";
    return `<section class="section wrap" aria-label="Newsletter"><div class="news">
      <div><span class="tag-file">Lista de correo</span><h2 style="margin-top:12px">Primero en saber.<br>Primero en comprar.</h2></div>
      <div>
        <p style="margin-bottom:18px;color:var(--ink-2)">Entérate antes que nadie de nuevos expedientes y ofertas especiales.</p>
        <form id="newsForm"><label class="sr-only" for="newsEmail">Correo electrónico</label><input id="newsEmail" type="email" required placeholder="tu@correo.com"><button class="btn" type="submit">Registrarme</button></form>
        <p class="news__msg mono" id="newsMsg"></p>
      </div></div></section>`;
  }
  function bindNewsletter() {
    const f = $("#newsForm");
    if (!f) return;
    f.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = $("#newsEmail").value.trim(), msg = $("#newsMsg");
      msg.textContent = "Enviando…";
      try {
        const r = await fetch(`https://a.klaviyo.com/client/subscriptions/?company_id=${CFG.newsletter.klaviyoCompanyId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json", revision: "2024-10-15" },
          body: JSON.stringify({ data: { type: "subscription", attributes: { profile: { data: { type: "profile", attributes: { email } } } }, relationships: { list: { data: { type: "list", id: CFG.newsletter.klaviyoListId } } } } }),
        });
        if (!r.ok) throw new Error(r.status);
        msg.textContent = "¡Listo! Ya estás en la lista.";
        f.reset();
      } catch {
        msg.textContent = "No pudimos registrarte. Intenta de nuevo en un momento.";
      }
    });
  }

  /* ---------- Colección / listado ---------- */
  function pageCollection() {
    const c = params.get("c") || (params.get("tipo") ? "" : "all");
    const t = params.get("tipo");
    const col = collection(c);
    const typ = type(t);
    let list, title, kicker, desc, hero;

    if (col) {
      list = PRODUCTS.filter((p) => p.collection === col.handle);
      title = col.title; kicker = `${col.file} · ${col.kicker}`; desc = col.description;
      const media = col.video
        ? `<video src="${col.video}" poster="${col.poster}" autoplay muted loop playsinline preload="metadata" aria-hidden="true"></video>`
        : `<img src="${col.cover}" alt="">`;
      hero = `<section class="col-hero">
        <div class="col-hero__text">
          <div class="col-hero__ticks mono"><span>${esc(kicker)}</span><span>${list.length} piezas</span></div>
          <div><span class="stamp">${esc(col.tagline)}</span><h1 class="display" style="margin:18px 0 22px">${esc(title)}</h1><p>${esc(desc)}</p></div>
          ${col.lookbook ? `<a class="link-u" href="archivo.html#${col.handle}" style="align-self:start">Ver lookbook</a>` : "<span></span>"}
        </div>
        <div class="col-hero__media">${media}</div>
      </section>`;
    } else {
      if (typ) { list = PRODUCTS.filter((p) => p.type === typ.handle); title = typ.title; kicker = "Prenda"; }
      else if (c === "novedades") { list = newest().slice(0, 8); title = "Novedades"; kicker = "Recién archivado"; }
      else { list = [...PRODUCTS]; title = "Ver todo"; kicker = "Archivo completo"; }
      desc = `${list.length} referencias`;
      hero = `<section class="col-hero col-hero--simple"><div class="col-hero__text">
        <span class="tag-file">${esc(kicker)}</span><h1 class="display">${esc(title)}</h1><span class="mono" style="color:var(--ink-soft)">${esc(desc)}</span>
      </div></section>`;
    }
    setMeta(`${title} | PRESSURE`, col ? col.description : `${title} — PRESSURE, ropa desde Barrancabermeja.`);

    // Chips de navegación hermana
    const chips = typ || t
      ? [{ href: "coleccion.html?c=all", label: "Ver todo" }, ...CFG.types.map((x) => ({ href: typeUrl(x.handle), label: x.title, active: x.handle === t }))]
      : [{ href: "coleccion.html?c=all", label: "Ver todo", active: c === "all" }, { href: "coleccion.html?c=novedades", label: "Novedades", active: c === "novedades" },
         ...CFG.collections.map((x) => ({ href: collectionUrl(x.handle), label: x.title, active: x.handle === c }))];

    const hasSizes = list.some((p) => p.sizes.length);
    const state = Object.assign({ sort: "rec", onlyAvail: false, sizes: [] }, {});
    const view = store.get("pressure_view", { d: 4, m: 2 });

    $("#main").innerHTML = `${hero}
      <div class="toolbar">
        <nav class="toolbar__chips" aria-label="Secciones">${chips.map((x) => `<a class="chip ${x.active ? "is-active" : ""}" href="${x.href}">${esc(x.label)}</a>`).join("")}</nav>
        <div class="toolbar__right">
          <span class="count mono" id="count"></span>
          <div class="view-switch" role="group" aria-label="Vista">
            <span class="mono">Vista</span>
            <span class="vd" style="display:contents">${[2, 3, 4].map((n) => `<button data-view="${n}" class="${view.d === n ? "is-active" : ""}" aria-label="${n} columnas">${n}</button>`).join("")}</span>
          </div>
          <button class="link-u" data-open="filters">Filtrar</button>
        </div>
      </div>
      <div class="grid" id="grid" style="--cols:${view.d};--cols-m:${view.m}"></div>

      <aside class="drawer drawer--right" id="filters" aria-label="Filtros" aria-hidden="true">
        <div class="drawer__head"><strong>Filtrar y ordenar</strong><button class="close-x" data-close aria-label="Cerrar filtros">${ICON.close}</button></div>
        <div class="drawer__body">
          <div class="filter-block"><h4 class="mono">Ordenar por</h4><div class="opt-list">
            ${[["rec", "Recomendados"], ["new", "Más nuevos"], ["asc", "Precio: menor a mayor"], ["desc", "Precio: mayor a menor"]].map(([v, l]) => `<label class="opt"><input type="radio" name="sort" value="${v}" ${v === "rec" ? "checked" : ""}><span>${l}</span></label>`).join("")}
          </div></div>
          <div class="filter-block"><h4 class="mono">Disponibilidad</h4><div class="opt-list"><label class="opt"><input type="checkbox" name="avail"><span>Solo disponibles</span></label></div></div>
          ${hasSizes ? `<div class="filter-block"><h4 class="mono">Talla</h4><div class="opt-list">${["S", "M", "L", "XL"].map((s) => `<label class="opt"><input type="checkbox" name="size" value="${s}"><span>${s}</span></label>`).join("")}</div></div>` : ""}
        </div>
        <div class="drawer__foot" style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          <button class="btn btn--ghost" id="fReset">Limpiar</button><button class="btn" data-close>Ver resultados</button>
        </div>
      </aside>`;

    // Mover el drawer de filtros junto a los demás overlays
    document.body.appendChild($("#filters"));

    const order = { orbita: 0, testamentos: 1, basicas: 2, accesorios: 3 };
    function draw() {
      let out = list.filter((p) => (!state.onlyAvail || isAvailable(p)) && (!state.sizes.length || state.sizes.some((s) => sizeAvailable(p, s) && p.sizes.length)));
      if (state.sort === "new") out.sort((a, b) => b.date.localeCompare(a.date));
      else if (state.sort === "asc") out.sort((a, b) => a.price - b.price);
      else if (state.sort === "desc") out.sort((a, b) => b.price - a.price);
      else out.sort((a, b) => (isAvailable(b) - isAvailable(a)) || ((order[a.collection] ?? 9) - (order[b.collection] ?? 9)));
      $("#count").textContent = `${out.length} ${out.length === 1 ? "pieza" : "piezas"}`;
      $("#grid").innerHTML = out.length
        ? out.map((p, i) => card(p, { lazy: i > 7 })).join("")
        : `<div class="empty" style="grid-column:1/-1"><span class="stamp">Sin resultados</span><p>No hay piezas con esos filtros.</p><button class="btn btn--ghost" id="fReset2">Limpiar filtros</button></div>`;
      $("#fReset2")?.addEventListener("click", reset);
    }
    function reset() {
      state.sort = "rec"; state.onlyAvail = false; state.sizes = [];
      $$("#filters input").forEach((i) => { i.checked = i.name === "sort" && i.value === "rec"; });
      draw();
    }
    $("#filters").addEventListener("change", () => {
      state.sort = $('#filters input[name="sort"]:checked').value;
      state.onlyAvail = $('#filters input[name="avail"]').checked;
      state.sizes = $$('#filters input[name="size"]:checked').map((i) => i.value);
      draw();
    });
    $("#fReset").addEventListener("click", reset);
    $$("[data-view]").forEach((b) => b.addEventListener("click", () => {
      const n = +b.dataset.view;
      $$("[data-view]").forEach((x) => x.classList.toggle("is-active", x === b));
      // en móvil la vista alterna entre 1 y 2 columnas
      view.d = n; view.m = n === 2 ? 1 : 2;
      $("#grid").style.setProperty("--cols", n);
      $("#grid").style.setProperty("--cols-m", view.m);
      store.set("pressure_view", view);
    }));
    draw();
  }

  /* ---------- Ficha de producto ---------- */
  function pageProduct() {
    const p = byHandle(params.get("p"));
    const main = $("#main");
    if (!p) { pageNotFound(); return; }
    const col = collection(p.collection);
    const avail = isAvailable(p);
    setMeta(`${p.title} | PRESSURE`, p.description);

    // Datos estructurados para Google (precio, stock, imagen)
    const ld = document.createElement("script");
    ld.type = "application/ld+json";
    ld.textContent = JSON.stringify({
      "@context": "https://schema.org", "@type": "Product", name: p.title, sku: p.ref, description: p.description,
      image: p.images.map((i) => new URL(i, location.href).href), brand: { "@type": "Brand", name: "PRESSURE" },
      offers: { "@type": "Offer", priceCurrency: "COP", price: p.price, availability: avail ? "https://schema.org/InStock" : "https://schema.org/OutOfStock", url: location.href },
    });
    document.head.appendChild(ld);

    const sizes = p.sizes.length ? `
      <div>
        <div class="sizes-head"><span class="mono">Talla</span><button class="link-u" id="sizeGuide">Guía de tallas</button></div>
        <div class="sizes" role="radiogroup" aria-label="Talla">${p.sizes.map((s) => `<button class="size-btn" role="radio" aria-checked="false" data-size="${esc(s.name)}" ${s.available ? "" : "disabled"}>${esc(s.name)}</button>`).join("")}</div>
      </div>` : "";

    const look = PRODUCTS.filter((x) => x.type !== p.type && isAvailable(x)).slice(0, 8);
    const same = PRODUCTS.filter((x) => x.collection === p.collection && x.handle !== p.handle);

    main.innerHTML = `
      <nav class="crumbs mono" aria-label="Ruta"><a href="index.html">Inicio</a><span>/</span><a href="${collectionUrl(col.handle)}">${esc(col.title)}</a><span>/</span><span>${esc(p.title)}</span></nav>
      <section class="pdp">
        <div>
          <div class="gallery" id="gallery">${p.images.map((src, i) => `<figure data-zoom="${src}"><img src="${src}" alt="${esc(p.title)} — imagen ${i + 1}" ${i ? 'loading="lazy"' : ""}></figure>`).join("")}</div>
          <div class="gallery__dots" id="dots">${p.images.map((_, i) => `<span class="${i ? "" : "is-active"}"></span>`).join("")}</div>
        </div>
        <div class="pdp__panel">
          <div class="pdp__file mono"><span>${esc(col.file)} · ${esc(col.title)}</span><span>REF. ${p.ref}</span></div>
          <div>
            ${badge(p)}
            <h1 class="pdp__title" style="margin-top:${badge(p) ? "14px" : "0"}">${esc(p.title)}</h1>
            <p class="pdp__price">${money(p.price)} <span class="mono" style="color:var(--ink-soft)">COP</span>${p.compareAt && p.compareAt > p.price ? `<s>${money(p.compareAt)}</s>` : ""}</p>
          </div>
          <div class="pdp__color"><span class="swatch" style="background:${p.swatch};width:16px;height:16px"></span><span>${esc(p.color)}</span></div>
          ${sizes}
          <div class="pdp__actions">
            <button class="btn btn--block" id="addBtn" ${avail ? "" : "disabled"}>${avail ? (p.sizes.length ? "Selecciona una talla" : "Añadir a la bolsa") : "Agotado"}</button>
            <a class="btn btn--ghost btn--block" id="waBtn" target="_blank" rel="noopener" href="${waUrl(`Hola PRESSURE, me interesa: ${p.title} (${p.ref}).`)}">${avail ? "Preguntar por WhatsApp" : "Avísame cuando vuelva"}</a>
            <p class="pdp__msg mono" id="pdpMsg" role="status"></p>
          </div>
          <div class="pdp__ship">
            <div>Envío gratis en ${esc(CFG.shipping.freeCity)}.</div>
            <div>Envío gratis a toda Colombia desde ${money(CFG.shipping.freeThreshold)}.</div>
            <div>Preparado y empacado a mano desde Colombia.</div>
          </div>
          <div class="acc">
            <details open><summary>Descripción</summary><div class="acc__body"><p>${esc(p.description)}</p></div></details>
            <details><summary>Composición y cuidados</summary><div class="acc__body"><p>${esc(CFG.care[p.type] || "")}</p></div></details>
            <details><summary>Envíos y cambios</summary><div class="acc__body">
              <p>Todos los pedidos son preparados y empacados cuidadosamente desde Colombia. Los tiempos de entrega varían según la ciudad de destino.</p>
              <p><a class="link-u" href="info.html?doc=envios">Envíos</a> &nbsp; <a class="link-u" href="info.html?doc=cambios">Cambios y devoluciones</a></p>
            </div></details>
          </div>
        </div>
      </section>
      ${same.length ? `<section class="section--tight"><div class="section-head wrap" style="margin-top:24px"><div><span class="tag-file">${esc(col.file)}</span><h2 style="margin-top:12px">Del mismo expediente</h2></div>${railNav("railSame")}</div>${rail(same, "railSame")}</section>` : ""}
      ${look.length ? `<section class="section--tight"><div class="section-head wrap"><div><span class="tag-file">Combínalo</span><h2 style="margin-top:12px">Completa tu look</h2></div>${railNav("railLook")}</div>${rail(look, "railLook")}</section>` : ""}`;

    // Selección de talla
    let size = "";
    const addBtn = $("#addBtn"), msg = $("#pdpMsg");
    $$(".size-btn").forEach((b) => b.addEventListener("click", () => {
      size = b.dataset.size;
      $$(".size-btn").forEach((x) => { x.classList.toggle("is-active", x === b); x.setAttribute("aria-checked", x === b); });
      addBtn.textContent = `Añadir a la bolsa · ${size}`;
      msg.textContent = "";
      $("#waBtn").href = waUrl(`Hola PRESSURE, me interesa: ${p.title} (${p.ref}), talla ${size}.`);
    }));
    addBtn.addEventListener("click", () => {
      if (p.sizes.length && !size) { msg.textContent = "Elige una talla para continuar."; return; }
      if (addToBag(p, size, { silent: true })) openPanel("cart");
    });
    $("#sizeGuide")?.addEventListener("click", () => openModal(sizeGuideHtml()));

    // Zoom y puntos de galería (móvil)
    $$("#gallery figure").forEach((f) => f.addEventListener("click", () => openModal(`<img src="${f.dataset.zoom}" alt="${esc(p.title)}">`, "modal--zoom")));
    const g = $("#gallery");
    g.addEventListener("scroll", () => {
      const i = Math.round(g.scrollLeft / g.clientWidth);
      $$("#dots span").forEach((d, k) => d.classList.toggle("is-active", k === i));
    }, { passive: true });
  }

  function sizeGuideHtml() {
    const sg = CFG.sizeGuide;
    const table = sg.rows.length
      ? `<table class="size-table"><thead><tr>${sg.columns.map((c) => `<th>${esc(c)}</th>`).join("")}</tr></thead><tbody>${sg.rows.map((r) => `<tr>${r.map((v) => `<td>${esc(v)}</td>`).join("")}</tr>`).join("")}</tbody></table>`
      : "";
    return `<span class="tag-file">Guía de tallas</span><h3 style="font-size:28px">Fit oversize</h3><p>${esc(sg.note)}</p>${table}
      <p class="mono" style="color:var(--ink-soft)">¿Dudas con tu talla? <a href="${waUrl("Hola PRESSURE, ¿me ayudan con mi talla?")}" target="_blank" rel="noopener" style="text-decoration:underline">Escríbenos por WhatsApp</a></p>`;
  }

  /* ---------- Checkout: pago en línea (Wompi) o pedido por WhatsApp ---------- */
  const PAY_ONLINE = !!(CFG.payments && CFG.payments.wompi);
  const PENDING_KEY = "pressure_pending_order";

  function orderLines(items) {
    return items.filter((i) => byHandle(i.handle)).map((i) => {
      const p = byHandle(i.handle);
      return `• ${p.title} (${p.ref})${i.size ? " — Talla " + i.size : ""} x${i.qty} — ${money(p.price * i.qty)}`;
    });
  }
  function customerLines(data) {
    return [
      "*Datos de envío*",
      `Nombre: ${data.name}`, `Celular: ${data.phone}`, data.email ? `Correo: ${data.email}` : null, data.doc ? `Cédula: ${data.doc}` : null,
      `Ciudad: ${data.city}${data.dept ? ", " + data.dept : ""}`, `Dirección: ${data.address}`,
      data.notes ? `Notas: ${data.notes}` : null,
    ];
  }

  // Pide la firma al servidor y envía al cliente al Web Checkout de Wompi
  async function payOnline(data, btn) {
    const label = btn.textContent;
    btn.disabled = true; btn.textContent = "Conectando con Wompi…";
    $("#coMsg").textContent = "";
    try {
      const items = Cart.items();
      let res, pay;
      try {
        res = await fetch(CFG.payments.endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items, customer: data }) });
        pay = await res.json();
      } catch { throw new Error("No pudimos conectar con el servidor de pagos."); }
      if (!res.ok || !pay.signature) throw new Error(pay.error || "No pudimos iniciar el pago.");
      store.set(PENDING_KEY, { reference: pay.reference, amountInCents: pay.amountInCents, items, customer: data });
      const phone = data.phone.replace(/\D/g, "").replace(/^57(?=\d{10}$)/, "");
      const fields = {
        "public-key": pay.publicKey,
        currency: pay.currency,
        "amount-in-cents": pay.amountInCents,
        reference: pay.reference,
        "signature:integrity": pay.signature,
        // Wompi rechaza redirect-url en localhost: en pruebas locales muestra su propio resultado
        "redirect-url": /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname) ? "" : new URL("pago.html", location.href).href,
        "customer-data:full-name": data.name,
        "customer-data:phone-number": phone,
        "customer-data:email": data.email,
        "customer-data:legal-id": data.doc,
        "customer-data:legal-id-type": data.doc ? "CC" : "",
        "shipping-address:address-line-1": data.address,
        "shipping-address:city": data.city,
        "shipping-address:region": data.dept || data.city,
        "shipping-address:country": "CO",
        "shipping-address:phone-number": phone,
      };
      const form = document.createElement("form");
      form.method = "GET"; form.action = pay.checkoutUrl; form.hidden = true;
      Object.entries(fields).forEach(([name, value]) => {
        if (value === "" || value == null) return;
        const input = document.createElement("input");
        input.type = "hidden"; input.name = name; input.value = value;
        form.appendChild(input);
      });
      document.body.appendChild(form);
      form.submit();
    } catch (err) {
      $("#coMsg").textContent = err.message + " También puedes enviar tu pedido por WhatsApp.";
      btn.disabled = false; btn.textContent = label;
    }
  }

  function pageCheckout() {
    const main = $("#main");
    const items = Cart.items();
    if (!items.length) {
      main.innerHTML = `<div class="notfound"><div><span class="stamp stamp--ink">Bolsa vacía</span><h1 class="display" style="font-size:clamp(56px,9vw,130px);margin:18px 0">Nada por aquí</h1><a class="btn" href="coleccion.html?c=all">Ver el archivo</a></div></div>`;
      return;
    }
    const saved = store.get("pressure_customer", {});
    const field = (id, label, type = "text", extra = "", full = false) =>
      `<div class="field ${full ? "field--full" : ""}"><label for="${id}">${label}</label><input id="${id}" name="${id}" type="${type}" placeholder=" " value="${esc(saved[id] || "")}" ${extra}></div>`;

    main.innerHTML = `
      <section class="checkout">
        <form class="checkout__form" id="coForm" novalidate>
          <div><span class="tag-file">Paso final</span><h1 class="display" style="font-size:clamp(48px,6vw,96px);margin-top:14px">Tu pedido</h1></div>
          <div class="note"><strong>¿Cómo funciona?</strong><span>${PAY_ONLINE
            ? "Completa tus datos y paga en línea con tarjeta, PSE, Nequi o Bancolombia a través de Wompi. Si prefieres, envía el pedido por WhatsApp y coordinamos el pago por chat."
            : "Completa tus datos y envía el pedido por WhatsApp. Te confirmamos disponibilidad, costo de envío y los medios de pago disponibles."}</span></div>
          <fieldset style="border:0;padding:0;margin:0;display:grid;gap:14px">
            <legend class="mono" style="margin-bottom:14px">Datos de contacto</legend>
            <div class="fields">
              ${field("name", "Nombre completo", "text", 'required autocomplete="name"', true)}
              ${field("phone", "Celular", "tel", 'required autocomplete="tel" pattern="[0-9 +]{10,15}"')}
              ${field("doc", "Cédula (para la guía)", "text", 'autocomplete="off"')}
              ${field("email", "Correo (para el comprobante)", "email", 'autocomplete="email"', true)}
            </div>
          </fieldset>
          <fieldset style="border:0;padding:0;margin:0;display:grid;gap:14px">
            <legend class="mono" style="margin-bottom:14px">Envío</legend>
            <div class="fields">
              ${field("city", "Ciudad / municipio", "text", 'required autocomplete="address-level2"')}
              ${field("dept", "Departamento", "text", 'autocomplete="address-level1"')}
              ${field("address", "Dirección", "text", 'required autocomplete="street-address"', true)}
              <div class="field field--full"><label for="notes">Notas (opcional)</label><textarea id="notes" name="notes" placeholder=" ">${esc(saved.notes || "")}</textarea></div>
            </div>
          </fieldset>
          <p class="pdp__msg mono" id="coMsg" role="alert"></p>
          <div class="co-actions">
            ${PAY_ONLINE ? `<button class="btn btn--block" type="submit" data-via="wompi">Pagar en línea</button>
            <p class="mono co-actions__note" id="coPayNote"></p>` : ""}
            <button class="btn btn--block ${PAY_ONLINE ? "btn--ghost" : ""}" type="submit" data-via="whatsapp">Enviar pedido por WhatsApp</button>
          </div>
          <p class="mono" style="color:var(--ink-soft)">Al continuar aceptas los <a href="info.html?doc=terminos" style="text-decoration:underline">términos</a> y la <a href="info.html?doc=privacidad" style="text-decoration:underline">política de privacidad</a>.</p>
        </form>
        <aside class="checkout__summary" aria-label="Resumen">
          <div class="section-head" style="margin-bottom:8px"><strong>Resumen</strong><a class="link-u" href="#" data-open="cart">Editar</a></div>
          <div id="coLines"></div>
          <div class="totals" style="margin-top:18px">
            <div><span>Subtotal</span><span id="coSub"></span></div>
            <div class="mono"><span>Envío</span><span id="coShip"></span></div>
            <div class="grand" style="margin-top:10px"><span>Total</span><span id="coTotal"></span></div>
          </div>
          <div id="coDone"></div>
        </aside>
      </section>`;

    function drawSummary() {
      const items = Cart.items();
      if (!items.length) { location.reload(); return; }
      const sub = Cart.subtotal();
      const ship = shippingInfo(sub, $("#city").value);
      $("#coLines").innerHTML = items.map((i) => {
        const p = byHandle(i.handle);
        return `<div class="line" style="grid-template-columns:64px 1fr"><div class="line__img"><img src="${p.images[0]}" alt=""></div>
          <div class="line__info"><span class="line__title">${esc(p.title)}</span><span class="card__meta">${i.size ? "Talla " + esc(i.size) + " · " : ""}x${i.qty}</span><strong>${money(p.price * i.qty)}</strong></div></div>`;
      }).join("");
      $("#coSub").textContent = money(sub);
      $("#coShip").textContent = ship.label;
      $("#coTotal").textContent = money(sub) + (ship.free ? "" : " + envío");
      if (PAY_ONLINE) {
        $("#coPayNote").textContent = `Pagas ${money(sub)} en Wompi.` + (ship.free ? " Envío incluido." : " El costo del envío lo coordinamos por WhatsApp.");
      }
    }
    drawSummary();
    $("#city").addEventListener("input", drawSummary);
    // si la bolsa cambia desde el drawer, se actualiza el resumen
    document.addEventListener("cart:change", drawSummary);

    $("#coForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const f = e.target;
      const bad = [...f.querySelectorAll("input")].find((i) => !i.checkValidity());
      if (bad) { $("#coMsg").textContent = "Revisa el campo: " + f.querySelector(`label[for="${bad.id}"]`).textContent; bad.focus(); return; }
      $("#coMsg").textContent = "";
      const data = Object.fromEntries(new FormData(f));
      store.set("pressure_customer", data);
      if (e.submitter && e.submitter.dataset.via === "wompi") { payOnline(data, e.submitter); return; }
      const items = Cart.items();
      const sub = Cart.subtotal();
      const ship = shippingInfo(sub, data.city);
      const text = [
        "*NUEVO PEDIDO — PRESSURE*", "",
        ...orderLines(items), "",
        `Subtotal: ${money(sub)}`, `Envío: ${ship.label}`, "",
        ...customerLines(data),
      ].filter((l) => l !== null).join("\n");
      window.open(waUrl(text), "_blank", "noopener");
      $("#coDone").innerHTML = `<div class="note" style="margin-top:22px"><strong>Pedido enviado a WhatsApp</strong><span>Si no se abrió la conversación, <a href="${waUrl(text)}" target="_blank" rel="noopener" style="text-decoration:underline">toca aquí</a>. Cuando confirmemos tu pedido puedes vaciar la bolsa.</span><button class="btn btn--ghost" id="coClear" style="margin-top:8px">Vaciar bolsa</button></div>`;
      $("#coClear").addEventListener("click", () => { Cart.clear(); location.href = "index.html"; });
    });
  }

  /* ---------- Resultado del pago (redirect-url de Wompi: pago.html?id=...) ---------- */
  function pagePayment() {
    const main = $("#main");
    const id = params.get("id");
    const pending = store.get(PENDING_KEY, null);
    const view = ({ stamp, title, text, rows = [], actions = "", tone = "" }) => {
      main.innerHTML = `<section class="payres"><div class="payres__box">
        <span class="stamp ${tone}">${esc(stamp)}</span>
        <h1 class="display">${esc(title)}</h1>
        ${text ? `<p>${text}</p>` : ""}
        ${rows.length ? `<dl class="payres__rows">${rows.map(([k, v]) => `<div><dt class="mono">${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>` : ""}
        ${actions ? `<div class="co-actions">${actions}</div>` : ""}
      </div></section>`;
    };
    const waButton = (text, label, ghost) => `<a class="btn btn--block ${ghost ? "btn--ghost" : ""}" href="${waUrl(text)}" target="_blank" rel="noopener">${label}</a>`;

    if (!id) {
      setMeta("Pago | PRESSURE", "Resultado del pago.");
      view({ stamp: "Sin pago", tone: "stamp--ink", title: "Sin datos", text: "Este enlace no trae información de un pago.", actions: `<a class="btn btn--block" href="checkout.html">Volver a la bolsa</a>` });
      return;
    }
    setMeta("Verificando pago | PRESSURE", "Resultado del pago.");
    view({ stamp: "Wompi", tone: "stamp--ink", title: "Verificando…", text: "Estamos consultando el estado de tu pago." });

    let tries = 0;
    async function check() {
      let tx;
      try {
        const res = await fetch(`api/transaccion.php?id=${encodeURIComponent(id)}`, { cache: "no-store" });
        tx = await res.json();
        if (!res.ok) throw new Error(tx.error);
      } catch (err) {
        setMeta("Pago | PRESSURE", "Resultado del pago.");
        view({ stamp: "Sin respuesta", title: "No pudimos verificar", text: esc((err && err.message) || "No pudimos consultar el estado del pago.") + " Si ya pagaste, escríbenos con este código: <strong>" + esc(id) + "</strong>",
          actions: `<button class="btn btn--block" id="payRetry">Consultar de nuevo</button>${waButton(`Hola PRESSURE, hice un pago con Wompi y no pude ver la confirmación. Transacción: ${id}`, "Escribir por WhatsApp", true)}` });
        $("#payRetry").addEventListener("click", () => { tries = 0; check(); });
        return;
      }

      const mine = pending && pending.reference === tx.reference ? pending : null;
      const rows = [["Referencia", tx.reference], ["Transacción", tx.id], ["Valor", money(tx.amountInCents / 100) + " " + tx.currency]];
      const METHODS = { CARD: "Tarjeta", PSE: "PSE", NEQUI: "Nequi", BANCOLOMBIA_TRANSFER: "Botón Bancolombia", BANCOLOMBIA_QR: "QR Bancolombia", DAVIPLATA: "Daviplata" };
      if (tx.paymentMethod) rows.push(["Medio", METHODS[tx.paymentMethod] || tx.paymentMethod.replace(/_/g, " ")]);
      const sandbox = tx.sandbox ? " · Modo pruebas" : "";
      const summary = (header) => [
        header, "",
        `Referencia: ${tx.reference}`, `Transacción Wompi: ${tx.id}`, `Valor: ${money(tx.amountInCents / 100)}`, "",
        ...(mine ? [...orderLines(mine.items), "", ...customerLines(mine.customer)] : []),
      ].filter((l) => l !== null).join("\n");

      if (tx.status === "PENDING") {
        view({ stamp: "Pendiente" + sandbox, tone: "stamp--ink", title: "En proceso", rows,
          text: tries < 20 ? "Tu banco aún no confirma el pago. Esta página se actualiza sola." : "Tu banco aún no confirma el pago. Te avisaremos cuando se apruebe; puedes consultar de nuevo más tarde.",
          actions: tries < 20 ? "" : `<button class="btn btn--block" id="payRetry">Consultar de nuevo</button>` });
        if (tries++ < 20) setTimeout(check, 4000);
        else $("#payRetry").addEventListener("click", () => { tries = 0; check(); });
        return;
      }

      if (tx.status === "APPROVED" && tx.orderMatches) {
        setMeta("Pago aprobado | PRESSURE", "Pago aprobado.");
        if (mine) { Cart.clear(); store.set(PENDING_KEY, null); }
        view({ stamp: "Pagado" + sandbox, title: "¡Gracias!", rows,
          text: "Tu pago fue aprobado y tu pedido quedó registrado. Te escribiremos para coordinar el envío; si quieres agilizarlo, envíanos el comprobante por WhatsApp.",
          actions: `${waButton(summary("*PEDIDO PAGADO EN LÍNEA — PRESSURE*"), "Enviar comprobante por WhatsApp")}<a class="btn btn--block btn--ghost" href="index.html">Seguir comprando</a>` });
        return;
      }

      if (tx.status === "APPROVED") {
        // Pago aprobado que no coincide con un pedido registrado (monto o referencia distintos)
        view({ stamp: "Revisión" + sandbox, title: "Pago en revisión", rows,
          text: "Recibimos el pago, pero no coincide con un pedido registrado. Escríbenos por WhatsApp para confirmarlo manualmente.",
          actions: waButton(summary("Hola PRESSURE, mi pago quedó en revisión."), "Escribir por WhatsApp") });
        return;
      }

      setMeta("Pago no aprobado | PRESSURE", "El pago no fue aprobado.");
      const reason = { DECLINED: "El pago fue rechazado.", VOIDED: "El pago fue anulado.", ERROR: "Hubo un error procesando el pago." }[tx.status] || "El pago no se completó.";
      const detail = tx.statusMessage ? " " + tx.statusMessage.replace(/([^.!?])$/, "$1.") : "";
      view({ stamp: "No aprobado" + sandbox, title: "Pago no aprobado", rows,
        text: esc(reason + detail) + (tx.status === "VOIDED" ? "" : " No se realizó ningún cobro.") + " Tu bolsa sigue guardada.",
        actions: `<a class="btn btn--block" href="checkout.html">Intentar de nuevo</a>${waButton(summary("Hola PRESSURE, quiero hacer este pedido (el pago en línea no pasó)."), "Pedir por WhatsApp", true)}` });
    }
    check();
  }

  /* ---------- Páginas informativas ---------- */
  function pageInfo() {
    const docs = $$("[data-doc]");
    const id = params.get("doc") || docs[0].dataset.doc;
    let active = docs.find((d) => d.dataset.doc === id) || docs[0];
    docs.forEach((d) => { d.hidden = d !== active; });
    $$(".doc__nav a").forEach((a) => a.classList.toggle("is-active", a.getAttribute("href").endsWith("=" + active.dataset.doc)));
    setMeta(`${$("h1", active).textContent} | PRESSURE`, `${$("h1", active).textContent} — PRESSURE`);
    // Rellena datos de contacto desde la configuración
    $$("[data-cfg]").forEach((el) => {
      const k = el.dataset.cfg;
      if (k === "whatsapp") { el.href = waUrl("Hola PRESSURE 👋"); }
      else if (k === "email") { el.href = "mailto:" + CFG.store.email; }
      else if (CFG.store[k]) { el.href = CFG.store[k]; }
    });
    $$("[data-cfg-text]").forEach((el) => { el.textContent = CFG.store[el.dataset.cfgText] ?? ""; });
    $$("[data-threshold]").forEach((el) => { el.textContent = money(CFG.shipping.freeThreshold); });
    const sg = $("#sizeGuideSlot");
    if (sg) sg.innerHTML = sizeGuideHtml();
  }

  /* ---------- Archivo (marca + lookbooks) ---------- */
  function pageArchive() {
    const list = $("#timeline");
    const sorted = [...CFG.collections].sort((a, b) => a.file.localeCompare(b.file));
    list.innerHTML = sorted.map((c) => `<a href="${collectionUrl(c.handle)}"><span class="mono">${esc(c.file)}</span><strong>${esc(c.title)}</strong><span class="mono">${esc(c.kicker)} →</span></a>`).join("");
    $("#lookbooks").innerHTML = CFG.collections.filter((c) => c.lookbook).map((c) => `
      <section class="section--tight" id="${c.handle}" style="scroll-margin-top:80px">
        <div class="section-head wrap"><div><span class="tag-file">${esc(c.file)} · Lookbook</span><h2 style="margin-top:12px">${esc(c.title)}</h2></div><a class="link-u" href="${collectionUrl(c.handle)}">Comprar ${esc(c.title)}</a></div>
        <div class="grid" style="--cols:${Math.min(4, c.lookbook.length)};--cols-m:2">${c.lookbook.map((src) => `<figure class="reveal" style="margin:0;aspect-ratio:3/4;overflow:hidden"><img src="${src}" alt="" loading="lazy" style="width:100%;height:100%;object-fit:cover"></figure>`).join("")}</div>
      </section>`).join("");
  }

  function pageNotFound() {
    setMeta("Página no encontrada | PRESSURE", "La página que buscas no existe.");
    $("#main").innerHTML = `<div class="notfound"><div>
      <img src="assets/img/editorial/pressure_personaje_solo_cabeza.webp" alt="" width="160" height="160">
      <span class="stamp">Expediente perdido</span>
      <h1 class="display" style="margin:18px 0 10px">404</h1>
      <p style="margin-bottom:24px;color:var(--ink-2)">Este archivo no existe o fue retirado del índice.</p>
      <a class="btn" href="coleccion.html?c=all">Volver al archivo</a>
    </div></div>`;
  }

  /* ---------- Arranque ---------- */
  renderShell();
  updateBagCount();
  // Notifica a la página cuando cambia la bolsa
  const _save = Cart.save.bind(Cart);
  Cart.save = (items) => { _save(items); document.dispatchEvent(new Event("cart:change")); };

  ({ home: pageHome, collection: pageCollection, product: pageProduct, checkout: pageCheckout, payment: pagePayment, info: pageInfo, archive: pageArchive, notfound: pageNotFound }[PAGE] || (() => {}))();
  reveal();
})();

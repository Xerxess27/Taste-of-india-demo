const translations = {
  en: {
    announcementTitle: "Lunch menu from €9.50",
    announcementText: " · Mon & Wed–Sun, 11:00–14:30",
    discover: "Discover",
    navStory: "Our kitchen",
    navMenu: "Menu",
    navLunch: "Lunch",
    navVisit: "Visit",
    reserve: "Reserve",
    heroEyebrow: "Authentic. Fresh. Full of soul.",
    heroTitle: "India begins<br />with the first bite.",
    heroText: "Traditional recipes, carefully chosen spices and genuine hospitality – right here in Neuenstadt.",
    exploreMenu: "Explore the menu",
    bookTable: "Book a table",
    today: "Today",
    address: "Address",
    service: "Service",
    serviceValue: "Dine in · Pick-up · Delivery",
    directions: "Get directions",
    storyEyebrow: "Our philosophy",
    storyTitle: "Where spices tell stories.",
    storyLead: "Our kitchen brings the warmth of India to the Kocher – with recipes that deserve time, care and honest ingredients.",
    storyBody: "From slow-cooked curries to smoky tandoori specialties: we cook for flavor that stays with you.",
    spiceCard: "Every dish is cooked fresh with our own blend of spices.",
    fresh: "freshly prepared",
    spices: "spices & aromas",
    hospitality: "true hospitality",
    menuEyebrow: "Complete menu",
    menuTitle: "A full journey through India.",
    menuIntro: "All 120 dishes and drinks from the current online menu, with fresh menu photography for every item.",
    todaySpecial: "Today’s special",
    todaySpecialText: "Creamy, aromatic and one of our most-loved classics.",
    moreDishes: "The complete menu is now inside the site.",
    menuNote: " Prices and availability were taken from the current online ordering menu.",
    fullMenu: "Full menu & online ordering",
    reviewsEyebrow: "Guest voices",
    reviewsTitle: "Hospitality that stays with you.",
    reviewsIntro: "A calm, elegant review section for trust – without making the page heavy.",
    reviewOne: "“Aromatic, friendly and freshly cooked. Exactly what you hope for from Indian cuisine.”",
    reviewTwo: "“Butter Chicken and naan were fantastic. Warm ambience and quick service.”",
    reviewThree: "“Great selection, lovely vegetarian dishes and beautifully balanced spices.”",
    lunchEyebrow: "India at lunchtime",
    lunchTitle: "A little journey<br />in your lunch break.",
    lunchText: "Selected dishes including rice – fresh, quick and full of flavor.",
    vegSpecials: "Vegetarian specialties",
    chickenSpecials: "Chicken specialties",
    lambSpecials: "Lamb specialties",
    lunchFine: "Dine-in with no minimum order. Delivery or pick-up from €30. Lunch offers can be ordered in person or by phone.",
    callOrder: "Order by phone",
    visitEyebrow: "Come visit",
    visitTitle: "Your table is waiting.",
    visitText: "Dinner with friends or a quick lunch – we look forward to welcoming you.",
    hours: "Opening hours",
    daysOpen: "Mon & Wed–Sun",
    tuesdayClosed: "Tuesday closed",
    contact: "Contact",
    openMaps: "Open in Google Maps ↗",
    reservationEyebrow: "Reservation",
    reservationTitle: "Time for a good evening.",
    reservationText: "Send us your reservation request. We will personally confirm your table.",
    name: "Name",
    date: "Date",
    time: "Time",
    guests: "Guests",
    phone: "Phone",
    requestTable: "Request a table",
    formNote: "Demo request – connect to email or a reservation system before launch.",
    footerLine: "Authentic Indian cuisine.<br />Cooked with love, served with joy.",
    explore: "Explore",
    visitUs: "Visit",
    order: "Order",
    delivery: "Delivery",
    pickup: "Pick-up",
    yourOrder: "Your order",
    cart: "Cart",
    emptyCart: "Your cart is still empty.",
    chooseDish: "Choose a dish",
    subtotal: "Subtotal",
    continueOrder: "Continue order",
    checkoutNote: "The final order is completed in the existing ordering system."
  }
};

const menuCategories = window.MENU_CATEGORIES || [];
const menuItems = window.MENU_ITEMS || [];
const orderingUrl = window.MENU_SOURCE || "https://www.tasteofindia-neuenstadt.de/en/";
const categoryMap = new Map(menuCategories.map(category => [category.id, category]));
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const popularDishIds = new Set(["370", "376", "405", "411", "354", "440", "428", "497"]);
const dailySpecialIds = ["370", "376", "405", "441", "428", "411", "497"];

let currentLanguage = "de";
let activeFilter = "all";
let cart = [];

document.body.classList.add("page-loading");

const euro = value => new Intl.NumberFormat(currentLanguage === "de" ? "de-DE" : "en-DE", {
  style: "currency",
  currency: "EUR"
}).format(value);

const label = (de, en) => currentLanguage === "de" ? de : en;

const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, char => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  "\"": "&quot;",
  "'": "&#039;"
}[char]));

const getCategoryLabel = categoryId => {
  const category = categoryMap.get(categoryId);
  if (!category) return categoryId;
  return currentLanguage === "de" ? category.label : category.labelEn;
};

const getMenuSearch = () => document.querySelector("#menu-search");
const getMenuGrid = () => document.querySelector("#menu-grid");
const getMenuTabs = () => document.querySelector(".menu-tabs");

function toast(message) {
  const el = document.querySelector(".toast");
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => el.classList.remove("show"), 2600);
}

function finishLoader() {
  document.body.classList.add("loaded");
  document.body.classList.remove("page-loading");
}

function getDailySpecial() {
  const dayIndex = Math.floor(Date.now() / 86400000) % dailySpecialIds.length;
  const item = menuItems.find(menuItem => menuItem.id === dailySpecialIds[dayIndex]);
  return item || menuItems.find(menuItem => menuItem.id === "370") || menuItems[0];
}

function updateDailySpecial() {
  const panel = document.querySelector(".daily-special");
  const item = getDailySpecial();
  if (!panel || !item) return;
  panel.querySelector("strong").textContent = item.name;
  const text = panel.querySelector("span:last-child");
  if (text) text.textContent = item.description;
}

function setLanguage(language) {
  document.body.classList.add("lang-fading");
  currentLanguage = language;
  document.documentElement.lang = language;

  document.querySelectorAll("[data-i18n]").forEach(el => {
    if (!el.dataset.original) el.dataset.original = el.innerHTML;
    const value = language === "en" ? translations.en[el.dataset.i18n] : el.dataset.original;
    if (value) el.innerHTML = value;
  });

  document.querySelectorAll(".lang-toggle span").forEach(span => {
    span.classList.toggle("active", span.textContent.toLowerCase() === language);
  });

  const search = getMenuSearch();
  if (search) {
    search.placeholder = label("Gericht, Nummer oder Kategorie suchen …", "Search dish, number or category …");
  }

  renderMenuTabs();
  renderMenu();
  updateDailySpecial();
  updateOpenStatus();
  renderCart();
  window.setTimeout(() => document.body.classList.remove("lang-fading"), 220);
}

function updateOpenStatus() {
  const now = new Date();
  const berlinParts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Berlin",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).formatToParts(now);
  const get = type => berlinParts.find(part => part.type === type)?.value;
  const day = get("weekday");
  const time = Number(get("hour")) * 60 + Number(get("minute"));
  const openDay = day !== "Tue";
  const openNow = openDay && ((time >= 660 && time < 870) || (time >= 1020 && time < 1350));
  const lunchEnd = 870;
  const eveningStart = 1020;
  const eveningEnd = 1350;
  let status;

  if (openNow) {
    const close = time < lunchEnd ? "14:30" : "22:30";
    status = label(`Geöffnet bis ${close} Uhr`, `Open until ${close}`);
  } else if (day === "Tue") {
    status = label("Heute Ruhetag", "Closed today");
  } else if (time < 660) {
    status = label("Öffnet um 11:00 Uhr", "Opens at 11:00");
  } else if (time < eveningStart) {
    status = label("Öffnet wieder um 17:00 Uhr", "Reopens at 17:00");
  } else if (time >= eveningEnd) {
    status = day === "Mon"
      ? label("Mittwoch ab 11:00 Uhr", "Wednesday from 11:00")
      : label("Morgen ab 11:00 Uhr", "Tomorrow from 11:00");
  } else {
    status = label("Derzeit geschlossen", "Currently closed");
  }

  document.querySelector(".open-status").textContent = status;
  document.querySelector(".status-block").classList.toggle("closed", !openNow);
}

function renderMenuTabs() {
  const tabs = getMenuTabs();
  if (!tabs) return;

  const counts = menuItems.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {});

  const allTab = `
    <button class="menu-tab ${activeFilter === "all" ? "active" : ""}" data-filter="all" role="tab" aria-selected="${activeFilter === "all"}">
      <span>${label("Alle", "All")}</span><small>${menuItems.length}</small>
    </button>
  `;

  const categoryTabs = menuCategories.map(category => {
    const active = activeFilter === category.id;
    const tabLabel = currentLanguage === "de" ? category.label : category.labelEn;
    return `
      <button class="menu-tab ${active ? "active" : ""}" data-filter="${category.id}" role="tab" aria-selected="${active}">
        <span>${escapeHtml(tabLabel)}</span><small>${counts[category.id] || 0}</small>
      </button>
    `;
  }).join("");

  tabs.innerHTML = allTab + categoryTabs;
}

function getFilteredMenuItems() {
  const query = (getMenuSearch()?.value || "").toLowerCase().trim();
  return menuItems.filter(item => {
    const categoryMatch = activeFilter === "all" || item.category === activeFilter;
    const searchable = [
      item.id,
      item.name,
      item.description,
      getCategoryLabel(item.category)
    ].join(" ").toLowerCase();
    return categoryMatch && (!query || searchable.includes(query));
  });
}

function renderMenuSkeleton() {
  const grid = getMenuGrid();
  if (!grid) return;
  grid.innerHTML = Array.from({ length: 9 }, () => `<div class="menu-skeleton" aria-hidden="true"></div>`).join("");
}

function renderMenu() {
  const grid = getMenuGrid();
  if (!grid) return;

  const filtered = getFilteredMenuItems();
  const count = document.querySelector("#menu-count");
  const categoryName = document.querySelector("#menu-category-name");
  const currentCategory = activeFilter === "all" ? null : categoryMap.get(activeFilter);

  if (count) {
    count.textContent = label(
      `${filtered.length} von ${menuItems.length} Gerichten & Getränken`,
      `${filtered.length} of ${menuItems.length} dishes & drinks`
    );
  }

  if (categoryName) {
    categoryName.textContent = currentCategory
      ? label(currentCategory.label, currentCategory.labelEn)
      : label("Live aus der aktuellen Speisekarte", "From the current online menu");
  }

  if (!filtered.length) {
    grid.innerHTML = `<div class="menu-empty">${label("Kein Gericht gefunden. Probiere eine andere Suche.", "No dish found. Try another search.")}</div>`;
    return;
  }

  grid.innerHTML = filtered.map(item => {
    const category = getCategoryLabel(item.category);
    const isPopular = popularDishIds.has(item.id);
    const price = item.soldOut ? label("Ausverkauft", "Sold out") : euro(item.price);
    const buttonText = item.soldOut ? label("Ausverkauft", "Sold out") : label("Hinzufügen", "Add to order");
    const buttonLabel = item.soldOut
      ? label(`${item.name} ist ausverkauft`, `${item.name} is sold out`)
      : label(`${item.name} hinzufügen`, `Add ${item.name}`);

    return `
      <article class="dish-card ${item.soldOut ? "sold-out" : ""}" data-category="${escapeHtml(item.category)}" data-name="${escapeHtml(item.name)}">
        <div class="dish-visual">
          <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" loading="lazy" width="900" height="900" />
          <span class="badge">${escapeHtml(category)}</span>
          ${isPopular ? `<span class="badge badge-popular">${label("Beliebt", "Most ordered")}</span>` : ""}
          ${item.soldOut ? `<span class="badge badge-muted">${label("Ausverkauft", "Sold out")}</span>` : ""}
        </div>
        <div class="dish-body">
          <div class="dish-title">
            <h3>${escapeHtml(item.name)}</h3>
            <strong>${escapeHtml(price)}</strong>
          </div>
          <p>${escapeHtml(item.description)}</p>
          <div class="dish-rating" aria-label="${label("Bewertung fünf von fünf Sternen", "Rating five out of five stars")}"><span>★★★★★</span><small>${isPopular ? label("Meist bestellt", "Guest favorite") : label("Hausgemacht", "Made fresh")}</small></div>
          <div class="dish-footer">
            <span class="dish-meta"><small>#${escapeHtml(item.id)}</small><small>${escapeHtml(category)}</small></span>
            <button class="add-item" type="button" data-id="${escapeHtml(item.id)}" aria-label="${escapeHtml(buttonLabel)}" ${item.soldOut ? "disabled" : ""}><span>${escapeHtml(buttonText)}</span></button>
          </div>
        </div>
      </article>
    `;
  }).join("");
}

function addMenuItemToCart(itemId, button) {
  const item = menuItems.find(menuItem => menuItem.id === itemId);
  if (!item || item.soldOut || item.price === null) return;

  const existing = cart.find(line => line.id === item.id);
  if (existing) existing.quantity += 1;
  else cart.push({ id: item.id, name: item.name, price: item.price, quantity: 1 });

  renderCart();
  toast(label(`${item.name} hinzugefügt`, `${item.name} added`));

  if (button) {
    button.classList.add("added");
    button.innerHTML = `<span>✓</span>`;
    setTimeout(() => {
      button.classList.remove("added");
      button.innerHTML = `<span>${label("Hinzufügen", "Add to order")}</span>`;
    }, 900);
  }
}

function renderCart() {
  const items = document.querySelector(".cart-items");
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.querySelector(".cart-count").textContent = count;
  document.querySelector(".cart-total").textContent = euro(total);

  if (!cart.length) {
    items.innerHTML = `<div class="empty-cart"><span>✦</span><p>${label("Dein Warenkorb ist noch leer.", "Your cart is still empty.")}</p><a href="#menu">${label("Gericht auswählen", "Choose a dish")}</a></div>`;
    return;
  }

  items.innerHTML = cart.map((item, index) => `
    <div class="cart-line">
      <strong>${escapeHtml(item.name)}</strong>
      <small>${euro(item.price * item.quantity)}</small>
      <div class="cart-line-controls">
        <button type="button" data-action="minus" data-index="${index}" aria-label="Minus">−</button>
        <span>${item.quantity}</span>
        <button type="button" data-action="plus" data-index="${index}" aria-label="Plus">+</button>
        <button class="remove" type="button" data-action="remove" data-index="${index}">${label("Entfernen", "Remove")}</button>
      </div>
    </div>
  `).join("");
}

function openCart() {
  document.querySelector(".cart-drawer").classList.add("open");
  document.querySelector(".drawer-backdrop").classList.add("open");
  document.querySelector(".cart-drawer").setAttribute("aria-hidden", "false");
  document.body.classList.add("no-scroll");
}

function closeCart() {
  document.querySelector(".cart-drawer").classList.remove("open");
  document.querySelector(".drawer-backdrop").classList.remove("open");
  document.querySelector(".cart-drawer").setAttribute("aria-hidden", "true");
  document.body.classList.remove("no-scroll");
}

function addRipple(event) {
  const target = event.target.closest(".button, .add-item, .menu-tab, .bottom-nav a, .bottom-nav button");
  if (!target || target.disabled) return;
  const rect = target.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const ripple = document.createElement("span");
  ripple.className = "ripple";
  ripple.style.width = `${size}px`;
  ripple.style.height = `${size}px`;
  ripple.style.left = `${event.clientX - rect.left}px`;
  ripple.style.top = `${event.clientY - rect.top}px`;
  target.append(ripple);
  ripple.addEventListener("animationend", () => ripple.remove(), { once: true });
}

const sectionLinks = [...document.querySelectorAll('.desktop-nav a[href^="#"], .mobile-nav a[href^="#"]')];
const sections = sectionLinks
  .map(link => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

function updateScrollEffects() {
  const y = window.scrollY;
  document.querySelector(".site-header").classList.toggle("sticky", y > 120);
  document.querySelector(".scroll-top").classList.toggle("show", y > 640);

  if (!prefersReducedMotion) {
    const parallax = Math.min(52, y * 0.055);
    document.documentElement.style.setProperty("--hero-parallax", `${parallax}px`);
  }

  let activeId = "";
  for (const section of sections) {
    if (section.getBoundingClientRect().top <= 140) activeId = section.id;
  }
  sectionLinks.forEach(link => {
    const isActive = link.getAttribute("href") === `#${activeId}`;
    link.classList.toggle("active", isActive);
    if (isActive) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
}

let scrollTicking = false;
function requestScrollUpdate() {
  if (scrollTicking) return;
  scrollTicking = true;
  requestAnimationFrame(() => {
    updateScrollEffects();
    scrollTicking = false;
  });
}

function rotateReviews() {
  const cards = [...document.querySelectorAll(".review-card")];
  if (cards.length < 2 || prefersReducedMotion) return;
  let index = 0;
  window.setInterval(() => {
    cards[index].classList.remove("active");
    index = (index + 1) % cards.length;
    cards[index].classList.add("active");
  }, 4200);
}

document.querySelector(".lang-toggle").addEventListener("click", () => setLanguage(currentLanguage === "de" ? "en" : "de"));

document.querySelector(".menu-toggle").addEventListener("click", event => {
  const nav = document.querySelector(".mobile-nav");
  const open = nav.classList.toggle("open");
  event.currentTarget.setAttribute("aria-expanded", String(open));
  nav.setAttribute("aria-hidden", String(!open));
});

document.querySelectorAll(".mobile-nav a").forEach(link => link.addEventListener("click", () => {
  document.querySelector(".mobile-nav").classList.remove("open");
  document.querySelector(".menu-toggle").setAttribute("aria-expanded", "false");
}));

getMenuTabs()?.addEventListener("click", event => {
  const tab = event.target.closest(".menu-tab");
  if (!tab) return;
  activeFilter = tab.dataset.filter;
  renderMenuTabs();
  renderMenu();
});

document.querySelector(".menu-search-toggle").addEventListener("click", () => {
  const wrap = document.querySelector(".search-wrap");
  wrap.classList.toggle("open");
  if (wrap.classList.contains("open")) getMenuSearch().focus();
});

getMenuSearch()?.addEventListener("input", renderMenu);

getMenuGrid()?.addEventListener("click", event => {
  const button = event.target.closest(".add-item");
  if (!button) return;
  addMenuItemToCart(button.dataset.id, button);
});

document.querySelector(".cart-items").addEventListener("click", event => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const index = Number(button.dataset.index);
  if (!cart[index]) return;
  if (button.dataset.action === "plus") cart[index].quantity += 1;
  if (button.dataset.action === "minus") cart[index].quantity -= 1;
  if (button.dataset.action === "remove" || cart[index]?.quantity === 0) cart.splice(index, 1);
  renderCart();
});

document.querySelector(".cart-button").addEventListener("click", openCart);
document.querySelector(".bottom-order")?.addEventListener("click", openCart);
document.querySelector(".drawer-close").addEventListener("click", closeCart);
document.querySelector(".drawer-backdrop").addEventListener("click", closeCart);
document.addEventListener("keydown", event => { if (event.key === "Escape") closeCart(); });
document.addEventListener("click", addRipple);
document.querySelector(".scroll-top").addEventListener("click", () => window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" }));

document.querySelector(".cart-items").addEventListener("click", event => {
  if (event.target.closest(".empty-cart a")) closeCart();
});

document.querySelector(".checkout-button").addEventListener("click", () => {
  if (!cart.length) {
    toast(label("Bitte zuerst ein Gericht auswählen.", "Please choose a dish first."));
    return;
  }
  window.open(orderingUrl, "_blank", "noopener");
});

document.querySelector(".reservation-form").addEventListener("submit", event => {
  event.preventDefault();
  const form = event.currentTarget;
  const date = new Date(`${form.elements.date.value}T12:00:00`);
  if (date.getDay() === 2) {
    toast(label("Dienstag ist Ruhetag – bitte wähle einen anderen Tag.", "Tuesday is closed – please choose another day."));
    return;
  }
  toast(label("Anfrage vorgemerkt – bitte Backend verbinden.", "Request saved – connect the backend before launch."));
  form.reset();
});

document.querySelectorAll(".reserve-trigger").forEach(link => link.addEventListener("click", () => {
  setTimeout(() => document.querySelector(".reservation-form input").focus(), 500);
}));

const observer = new IntersectionObserver(entries => entries.forEach(entry => {
  if (entry.isIntersecting) {
    entry.target.classList.add("visible");
    observer.unobserve(entry.target);
  }
}), { threshold: .12 });

document.querySelectorAll(".reveal").forEach(el => observer.observe(el));

window.addEventListener("scroll", requestScrollUpdate, { passive: true });
window.addEventListener("load", finishLoader, { once: true });
window.setTimeout(finishLoader, 1400);

document.querySelector('input[type="date"]').min = new Date().toISOString().split("T")[0];
document.querySelector("#year").textContent = new Date().getFullYear();

renderMenuTabs();
renderMenuSkeleton();
window.setTimeout(renderMenu, 360);
updateDailySpecial();
updateOpenStatus();
updateScrollEffects();
rotateReviews();
renderCart();

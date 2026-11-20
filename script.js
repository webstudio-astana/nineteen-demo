// Nineteen — демо. Без библиотек.
document.documentElement.classList.add("js");

const el = (tag, cls, text) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
};

// ---------- Вкладки прайса ----------
const tabs = [...document.querySelectorAll(".tab")];
function showTab(tab) {
  tabs.forEach((t) => {
    const on = t === tab;
    t.classList.toggle("is-on", on);
    t.setAttribute("aria-selected", String(on));
    t.tabIndex = on ? 0 : -1;
    const pan = document.getElementById(t.getAttribute("aria-controls"));
    pan.hidden = !on;
    pan.classList.toggle("is-on", on);
  });
  // листаем только ряд вкладок, страницу не трогаем
  const row = tab.parentElement;
  row.scrollTo({ left: tab.offsetLeft - row.offsetLeft - 16, behavior: "smooth" });
}
tabs.forEach((t, i) => {
  t.addEventListener("click", () => showTab(t));
  t.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const n = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
    showTab(n);
    n.focus();
  });
});

// ---------- Выбор услуг для записи ----------
const sum = document.getElementById("svcSum");
const svcBtn = document.getElementById("svcBtn");
const rows = [...document.querySelectorAll(".price li")];
rows.forEach((li) => {
  li.tabIndex = 0;
  li.setAttribute("role", "checkbox");
  li.setAttribute("aria-checked", "false");
  const toggle = () => {
    const on = li.classList.toggle("is-picked");
    li.setAttribute("aria-checked", String(on));
    updateSum();
  };
  li.addEventListener("click", toggle);
  li.addEventListener("keydown", (e) => {
    if (e.key === " " || e.key === "Enter") { e.preventDefault(); toggle(); }
  });
});
function updateSum() {
  const picked = rows.filter((li) => li.classList.contains("is-picked"));
  if (!picked.length) {
    sum.textContent = "Нажмите на услугу, чтобы выбрать";
    svcBtn.textContent = "Записаться";
    return;
  }
  let total = 0, from = false;
  picked.forEach((li) => {
    const t = li.querySelector("b").textContent;
    if (t.includes("от")) from = true;
    total += parseInt(t.replace(/\D/g, ""), 10) || 0;
  });
  const n = picked.length;
  const word = n === 1 ? "услуга" : n < 5 ? "услуги" : "услуг";
  const money = total.toLocaleString("ru-RU").replace(/\s/g, " ");
  sum.textContent = "";
  const b = el("b", null, "Выбрано: " + n + " " + word + " · " + (from ? "от " : "") + money + " ₸");
  sum.append(b);
  svcBtn.textContent = "Записаться на выбранное";
}

// ---------- Демо-окошко вместо WhatsApp ----------
const modal = document.getElementById("modal");
let lastFocus = null;
document.querySelectorAll(".js-wa").forEach((b) =>
  b.addEventListener("click", (e) => {
    e.preventDefault();
    lastFocus = b;
    modal.hidden = false;
    document.getElementById("modalClose").focus();
  })
);
function closeModal() { modal.hidden = true; if (lastFocus) lastFocus.focus(); }
document.getElementById("modalClose").addEventListener("click", closeModal);
modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !modal.hidden) closeModal(); });

// ---------- Шапка и плавающая кнопка ----------
const head = document.getElementById("head");
const floatBook = document.getElementById("floatBook");
const hero = document.querySelector(".hero");
// плавающую кнопку прячем, пока на экране видна другая кнопка записи
const seen = new Set();
const btnIo = new IntersectionObserver((entries) => {
  entries.forEach((en) => (en.isIntersecting ? seen.add(en.target) : seen.delete(en.target)));
  onScroll();
});
document.querySelectorAll("main .js-wa, .foot .js-wa").forEach((b) => { if (!b.closest(".hero")) btnIo.observe(b); });
function onScroll() {
  const y = window.scrollY;
  head.classList.toggle("is-scrolled", y > 40);
  floatBook.classList.toggle("is-on", y > hero.offsetHeight * 0.8 && seen.size === 0);
}
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

// ---------- Первый экран: смена кадров на телефоне ----------
const strips = [...document.querySelectorAll(".strip")];
const dots = [...document.querySelectorAll(".hero__dots i")];
let frame = 0;
setInterval(() => {
  if (!window.matchMedia("(max-width: 767px)").matches || document.hidden) return;
  frame = (frame + 1) % strips.length;
  strips.forEach((s, i) => s.classList.toggle("is-on", i === frame));
  dots.forEach((d, i) => d.classList.toggle("is-on", i === frame));
}, 4500);

// ---------- Появление блоков и счёт цифр ----------
function countUp(b) {
  const target = b.dataset.count;
  const dec = target.includes(".") ? 1 : 0;
  const end = parseFloat(target);
  const t0 = performance.now();
  const step = (t) => {
    const k = Math.min(1, (t - t0) / 1400);
    const v = end * (1 - Math.pow(1 - k, 3));
    b.textContent = v.toFixed(dec);
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
const io = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (!en.isIntersecting) return;
    en.target.classList.add("is-in");
    en.target.querySelectorAll("[data-count]").forEach(countUp);
    io.unobserve(en.target);
  });
}, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
document.querySelectorAll(".reveal").forEach((r) => io.observe(r));

// ---------- Колода отзывов: листается сама ----------
const deck = document.getElementById("deck");
const COUNT = 5;
const LINES = [[96, 100, 82, 58], [100, 88, 94, 40], [90, 100, 70], [100, 92, 86, 64], [84, 100, 76, 50]];
const cards = [];
for (let i = 0; i < COUNT; i++) {
  const c = el("div", "rcard");
  c.setAttribute("aria-hidden", "true");
  c.append(el("span", "stars", "★★★★★"));
  LINES[i].forEach((w) => { const ln = el("span", "ln"); ln.style.width = w + "%"; c.append(ln); });
  const who = el("span", "who");
  who.append(el("i"), el("span"));
  c.append(who);
  deck.append(c);
  cards.push(c);
}
let front = 0;
let busy = false;
const counter = document.getElementById("deckCount");
function layout() {
  cards.forEach((c, i) => { c.dataset.pos = String((i - front + COUNT) % COUNT); });
  counter.textContent = front + 1 + " / " + COUNT;
}
function next(dir = 1) {
  if (busy) return;
  busy = true;
  if (dir > 0) {
    const leaving = cards[front];
    leaving.classList.add("is-leaving");
    setTimeout(() => {
      front = (front + 1) % COUNT;
      leaving.classList.remove("is-leaving");
      layout();
      busy = false;
    }, 420);
  } else {
    front = (front - 1 + COUNT) % COUNT;
    layout();
    setTimeout(() => (busy = false), 450);
  }
}
layout();
let paused = false;
deck.addEventListener("click", () => next(1));
document.getElementById("deckNext").addEventListener("click", () => next(1));
document.getElementById("deckPrev").addEventListener("click", () => next(-1));
const reviewsBox = document.querySelector(".reviews__in");
reviewsBox.addEventListener("mouseenter", () => (paused = true));
reviewsBox.addEventListener("mouseleave", () => (paused = false));
reviewsBox.addEventListener("focusin", () => (paused = true));
reviewsBox.addEventListener("focusout", () => (paused = false));
setInterval(() => { if (!paused && !document.hidden) next(1); }, 4200);

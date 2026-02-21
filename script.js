/* 🔥 PALSKILEN CREATOR v4.4 - NO SCROLLBAR EDITION 🔥 */

const app = document.getElementById("app");
const backBtn = document.getElementById("backBtn");
const moviesData = window.movieData;
const searchInput = document.getElementById("searchInput");
const platformButtonsEl = document.getElementById("platformButtons");

let viewStack = [];
let activePlatformTag = "ALL";

const PLATFORM_LIST = [
    { tag: "Netflix", label: "Netflix" },
    { tag: "Max", label: "Max" },
    { tag: "Disney+", label: "Disney+" },
    { tag: "Prime Video", label: "Prime Video" },
    { tag: "SkyShowtime", label: "SkyShowtime" },
    { tag: "Crunchyroll", label: "Crunchyroll" },
];

// CSS: Wywalamy paski, naprawiamy szerokość i blokujemy scroll poziomy
const styleKill = document.createElement("style");
styleKill.textContent = `
    * { box-sizing: border-box; }
    body { overflow-x: hidden; width: 100vw; margin: 0; padding: 0; }
    
    .section { margin-bottom: 50px; width: 100%; overflow: hidden; }
    .section-header { 
        text-align: center; color: #fff; 
        font-size: clamp(1.5rem, 3vw, 2.2rem); 
        text-transform: uppercase; margin-bottom: 10px;
    }
    .section-separator { 
        width: 80%; height: 2px; 
        background: linear-gradient(90deg, transparent, #dc2626, transparent); 
        margin: 0 auto 30px auto;
    }
    
    #searchInput { flex: 1; min-width: 150px; }
    .search-wrapper, header, .top-bar { 
        display: flex !important; align-items: center !important; 
        gap: 15px !important; width: 100%; padding: 0 20px;
    }
    #platformButtons { display: flex !important; gap: 8px; flex-wrap: wrap; }
    .platform-btn { white-space: nowrap; padding: 6px 12px; font-size: 0.9rem; }

    .palskilen-auto-grid {
        display: grid !important;
        width: 100% !important;
        max-width: 100% !important;
        justify-content: center !important;
        margin: 0 auto !important;
    }
`;
document.head.appendChild(styleKill);

/* =================================================
   PLATFORM FILTER
================================================= */
function buildPlatformButtons() {
    if (!platformButtonsEl || !searchInput) return;
    searchInput.before(platformButtonsEl);

    platformButtonsEl.innerHTML = "";
    const tpl = document.createElement("button");
    tpl.className = "platform-btn";

    const allBtn = tpl.cloneNode(true);
    allBtn.classList.add("all");
    allBtn.dataset.tag = "ALL";
    allBtn.textContent = "Wszystkie";
    platformButtonsEl.appendChild(allBtn);

    PLATFORM_LIST.forEach(({ tag, label }) => {
        const b = tpl.cloneNode(true);
        b.dataset.tag = tag;
        b.textContent = label;
        platformButtonsEl.appendChild(b);
    });

    const setActive = (tag) => {
        activePlatformTag = tag || "ALL";
        platformButtonsEl.querySelectorAll(".platform-btn").forEach(btn => {
            btn.classList.toggle("active", btn.dataset.tag === activePlatformTag);
        });
    };

    platformButtonsEl.onclick = (e) => {
        const btn = e.target.closest(".platform-btn");
        if (!btn) return;
        setActive(btn.dataset.tag);
        if (isHomeView()) renderHomeWithFilter(searchInput?.value || "");
    };

    setActive("ALL");
}

function passesPlatformFilter(info) {
    if (activePlatformTag === "ALL") return true;
    const tags = Array.isArray(info.tags) ? info.tags : [];
    return tags.includes(activePlatformTag);
}

/* =================================================
   GRID ENGINE (NAPRAWIONY ROZMIAR)
================================================= */
function calculateOptimalCardSize() {
    const containerWidth = document.documentElement.clientWidth - 40; // marginesy
    let baseSize = 280; // mniejsze karty = brak paska
    
    const gap = 20;
    const cols = Math.max(1, Math.floor(containerWidth / (baseSize + gap)));
    
    return { width: baseSize, gap: gap, cols: cols };
}

function updateGridStyles() {
    const optimal = calculateOptimalCardSize();
    const styleId = "palskilen-dynamic-styles";
    let style = document.getElementById(styleId);
    if (style) style.remove();

    style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
        .palskilen-auto-grid {
            grid-template-columns: repeat(${optimal.cols}, ${optimal.width}px) !important;
            gap: ${optimal.gap}px !important;
        }
        .palskilen-auto-card { width: ${optimal.width}px !important; }
        @media (max-width: 600px) {
            .palskilen-auto-grid { 
                grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)) !important; 
                padding: 10px !important;
            }
        }
    `;
    document.head.appendChild(style);
}

window.addEventListener("resize", updateGridStyles);
updateGridStyles();

/* =================================================
   HOME RENDERER
================================================= */
function buildHomeContainer(query = "") {
    const container = document.createElement("div");
    container.style.cssText = "width: 100%; padding: 20px 0; box-sizing: border-box;";

    Object.entries(moviesData).forEach(([categoryName, itemsObj]) => {
        const itemsList = Object.values(itemsObj);
        const filteredItems = itemsList.filter(info => passesPlatformFilter(info) && matchesQuery(info.name, query));

        if (filteredItems.length > 0) {
            const section = document.createElement("div");
            section.className = "section";

            const header = document.createElement("div");
            header.className = "section-header";
            header.innerText = categoryName;

            const separator = document.createElement("div");
            separator.className = "section-separator";

            const grid = document.createElement("div");
            grid.className = "palskilen-auto-grid";
            
            filteredItems.forEach(info => {
                const isFilm = info.type === "Film";
                grid.appendChild(createCard(info.name, info, isFilm ? "Oglądaj" : "Otwórz", isFilm ? openMovie : openSerial));
            });

            section.append(header, separator, grid);
            container.appendChild(section);
        }
    });

    return container;
}

function renderHomeWithFilter(query) { render(buildHomeContainer(query)); }
function showHome() { viewStack = []; pushView(buildHomeContainer("")); }

/* =================================================
   CORE UTILS
================================================= */
function normalizeText(str) { return (str ?? "").toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, ""); }
function matchesQuery(title, query) { return !query || normalizeText(title).includes(normalizeText(query)); }
function isHomeView() { return viewStack.length === 1; }

if (searchInput) {
    searchInput.addEventListener("input", () => {
        if (isHomeView()) renderHomeWithFilter(searchInput.value);
    });
}

function createCard(title, info, buttonText, callback) {
    const card = document.createElement("div");
    card.className = "card palskilen-auto-card";
    card.onclick = () => callback(info);
    
    const poster = document.createElement("div");
    poster.className = "poster";
    if (info.screen) {
        const img = document.createElement("img");
        img.src = info.screen;
        img.style.cssText = "width:100%; height:100%; object-fit:cover;";
        poster.appendChild(img);
    }
    if (info.duration) {
        const badge = document.createElement("div");
        badge.className = "duration-badge"; badge.innerText = info.duration;
        poster.appendChild(badge);
    }

    const tDiv = document.createElement("div");
    tDiv.className = "card-title"; tDiv.innerText = title;
    
    const sDiv = document.createElement("div");
    sDiv.className = "card-subtitle";
    sDiv.innerText = `${info.year || ""} ${info.genre ? "• " + info.genre : ""}`;

    const btn = document.createElement("button");
    btn.innerText = buttonText;

    card.append(poster, tDiv, sDiv, btn);
    return card;
}

function pushView(view) { render(view); viewStack.push(view); backBtn.style.display = viewStack.length > 1 ? "block" : "none"; }
function goBack() { if (viewStack.length > 1) { viewStack.pop(); render(viewStack[viewStack.length - 1]); } backBtn.style.display = viewStack.length > 1 ? "block" : "none"; }
backBtn.onclick = goBack;
function render(content) { app.innerHTML = ""; app.appendChild(content); }

function openMovie(info, ep = null) { createPlayerView(ep ? `Odcinek ${ep} - ${info.name}` : info.name, info.URL); }
function openSerial(info) {
    const container = document.createElement("div");
    const header = document.createElement("h2");
    header.innerText = `${info.name} - Sezony`; header.style.textAlign = "center";
    container.appendChild(header);
    const grid = document.createElement("div");
    grid.className = "palskilen-auto-grid";
    Object.entries(info).filter(([k]) => k.startsWith("Season")).forEach(([, v]) => grid.appendChild(createCard(v.name, v, "Otwórz", openSeason)));
    container.appendChild(grid); pushView(container);
}
function openSeason(season) {
    const container = document.createElement("div");
    const header = document.createElement("h2");
    header.innerText = `${season.name} - Odcinki`; header.style.textAlign = "center";
    container.appendChild(header);
    const grid = document.createElement("div");
    grid.className = "palskilen-auto-grid";
    Object.entries(season).filter(([k]) => k.startsWith("Odcinek")).forEach(([k, v]) => {
        let num = k.replace(/\D/g, ""); grid.appendChild(createCard(v.name, v, "Oglądaj", (inf) => openMovie(inf, num)));
    });
    container.appendChild(grid); pushView(container);
}

function createPlayerView(title, url) {
    const container = document.createElement("div");
    container.style.cssText = "position:fixed; top:0; left:0; width:100vw; height:100vh; background:#000; z-index:9999; display:flex; flex-direction:column; padding:20px; box-sizing:border-box;";
    const top = document.createElement("div");
    top.style.cssText = "display:flex; align-items:center; gap:15px; margin-bottom:20px; border-bottom:2px solid #333; padding-bottom:10px;";
    const b = document.createElement("button");
    b.innerText = "← Powrót"; b.onclick = goBack;
    b.style.cssText = "background:rgba(255,255,255,0.1); color:white; border:1px solid #444; padding:10px 20px; border-radius:20px; cursor:pointer;";
    const h = document.createElement("h2");
    h.innerText = title; h.style.cssText = "flex:1; color:white; text-align:center; margin:0;";
    top.append(b, h);
    const p = document.createElement("div");
    p.style.cssText = "flex:1; background:#111; border-radius:12px; overflow:hidden;";
    if (url && url !== "URL") {
        const f = document.createElement("iframe");
        f.src = url; f.width="100%"; f.height="100%"; f.frameBorder="0"; f.allowFullscreen=true;
        p.appendChild(f);
    } else { p.innerHTML = "<div style='color:red; text-align:center; padding:50px;'>Brak linku!</div>"; }
    container.append(top, p); pushView(container);
}

buildPlatformButtons();
showHome();

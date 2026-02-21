/* 🔥 PALSKILEN CREATOR v3.3 + SEARCH v1.0 + PLATFORM FILTER v1.0 🔥 */

const app = document.getElementById("app");
const backBtn = document.getElementById("backBtn");
const moviesData = window.movieData;
const searchInput = document.getElementById("searchInput");
const platformButtonsEl = document.getElementById("platformButtons");

let viewStack = [];

/* =========================
   PLATFORM FILTER
========================= */
const PLATFORM_LIST = [
    { tag: "netflix", label: "Netflix" },
    { tag: "disney", label: "Disney" },
    { tag: "HBO", label: "HBO" },
    { tag: "Prime Video", label: "Prime Video" },
    { tag: "SkyShowtime", label: "SkyShowtime" },
    { tag: "Crunchyroll", label: "Crunchyroll" }
];

let activePlatformTag = "ALL";

function buildPlatformButtons() {
    if (!platformButtonsEl) return;

    platformButtonsEl.innerHTML = "";

    const tpl = document.createElement("button");
    tpl.className = "platform-btn";
    tpl.type = "button";

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
        platformButtonsEl.querySelectorAll(".platform-btn").forEach((btn) => {
            btn.classList.toggle("active", btn.dataset.tag === activePlatformTag);
        });
    };

    platformButtonsEl.addEventListener("click", (e) => {
        const btn = e.target.closest(".platform-btn");
        if (!btn) return;

        setActive(btn.dataset.tag);

        // filtr działa tylko na HOME
        if (isHomeView()) renderHomeWithFilter(searchInput?.value || "");
    });

    setActive("ALL");
}

function passesPlatformFilter(info) {
    if (activePlatformTag === "ALL") return true;
    const tags = Array.isArray(info.tags) ? info.tags : [];
    return tags.includes(activePlatformTag);
}

/* =========================
   NAV
========================= */
function pushView(view) {
    viewStack.push(view);
    render(view);
    backBtn.style.display = viewStack.length > 1 ? "block" : "none";
}

function goBack() {
    if (viewStack.length > 1) {
        viewStack.pop();
        render(viewStack[viewStack.length - 1]);
    }
    backBtn.style.display = viewStack.length > 1 ? "block" : "none";
}

backBtn.onclick = goBack;

function render(content) {
    app.innerHTML = "";
    app.appendChild(content);
}

/* =========================
   🧠 AUTO-CALCULATE CARD SIZE
========================= */
function calculateOptimalCardSize() {
    const container = document.documentElement; // full viewport
    const containerWidth = container.clientWidth;

    // Magiczny algorytm Palskilen - idealny rozmiar karty
    let baseSize = Math.floor(containerWidth / 8); // cel: ~8 kart
    baseSize = Math.max(330, Math.min(320, baseSize)); // granice

    const marginTotal = 10; // 5px z każdej strony x2
    const gap = 20; // gap między kartami

    return {
        width: baseSize,
        margin: "5px",
        gap: `${gap}px`,
        cols: Math.floor((containerWidth - 40) / (baseSize + gap + marginTotal))
    };
}

/* =========================
   🔄 Dynamiczne style na resize
========================= */
function updateGridStyles() {
    const optimal = calculateOptimalCardSize();

    const style = document.getElementById("palskilen-dynamic-styles");
    if (style) style.remove();

    const newStyle = document.createElement("style");
    newStyle.id = "palskilen-dynamic-styles";
    newStyle.textContent = `
        .palskilen-auto-grid {
            display: grid !important;
            grid-template-columns: repeat(${optimal.cols}, ${optimal.width}px) !important;
            gap: ${optimal.gap} !important;
            width: 100% !important;
            justify-content: center !important;
            max-width: calc(100vw - 40px) !important;
        }
        .palskilen-auto-card {
            width: ${optimal.width}px !important;
            margin: ${optimal.margin} !important;
            flex-shrink: 0 !important;
        }
        @media (max-width: 768px) {
            .palskilen-auto-grid {
                grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)) !important;
            }
        }
    `;

    document.head.appendChild(newStyle);

    // Update wszystkich istniejących gridów
    document.querySelectorAll(".palskilen-auto-grid").forEach((grid) => {
        grid.style.gridTemplateColumns = `repeat(${optimal.cols}, ${optimal.width}px)`;
        grid.style.gap = optimal.gap;
    });
}

window.addEventListener("resize", updateGridStyles);
updateGridStyles(); // initial call

/* =========================
   SEARCH (HOME ONLY)
========================= */
function normalizeText(str) {
    return (str ?? "")
        .toString()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // akcenty
        .replace(/[^a-z0-9]/g, ""); // wywala spacje, myślniki, :, znaki specjalne
}

function matchesQuery(title, query) {
    const t = normalizeText(title);
    const q = normalizeText(query);
    if (!q) return true;
    return t.includes(q); // zachowuje kolejność
}

function isHomeView() {
    return viewStack.length === 1;
}

if (searchInput) {
    searchInput.addEventListener("input", () => {
        if (!isHomeView()) return; // nie filtruj w sezonach/playerze
        renderHomeWithFilter(searchInput.value);
    });
}

/* =========================
   UI ELEMENTS
========================= */
function createCard(title, info, buttonText, callback) {
    const card = document.createElement("div");
    card.className = "card palskilen-auto-card"; // AUTO CLASS
    card.style.cursor = "pointer";
    card.style.boxSizing = "border-box";

    const poster = document.createElement("div");
    poster.className = "poster";
    if (info.screen) {
        const img = document.createElement("img");
        img.src = info.screen;
        img.alt = title;
        img.style.objectFit = "cover";
        img.style.width = "100%";
        img.style.height = "100%";
        poster.appendChild(img);
    } else {
        poster.innerText = "FOTO";
    }

    if (info.duration) {
        const durationBadge = document.createElement("div");
        durationBadge.className = "duration-badge";
        durationBadge.innerText = info.duration;
        poster.appendChild(durationBadge);
    }

    const titleDiv = document.createElement("div");
    titleDiv.className = "card-title";
    titleDiv.innerText = title;

    const subtitleDiv = document.createElement("div");
    subtitleDiv.className = "card-subtitle";
    let subtitle = "";
    if (info.year) subtitle += info.year;
    if (info.genre) subtitle += (subtitle ? " • " : "") + info.genre;
    subtitleDiv.innerText = subtitle;

    const btn = document.createElement("button");
    btn.innerText = buttonText;
    btn.onclick = (e) => {
        e.stopPropagation();
        e.preventDefault();
        callback(info);
    };

    card.onclick = (e) => {
        e.stopPropagation();
        callback(info);
    };

    card.appendChild(poster);
    card.appendChild(titleDiv);
    card.appendChild(subtitleDiv);
    card.appendChild(btn);

    return card;
}

// 🚀 SMART GRID - SAM LICZY I UKŁADA!
function createSmartGrid(items) {
    const grid = document.createElement("div");
    grid.className = "palskilen-auto-grid"; // AUTO GRID CLASS

    grid.style.padding = "20px";
    grid.style.boxSizing = "border-box";

    items.forEach((item) => grid.appendChild(item));
    return grid;
}

console.log("🔥 PALSKILEN v3.3 + SEARCH v1.0 + PLATFORM FILTER v1.0 - AKTYWNY!");
console.log("📐 Rozmiar okna:", window.innerWidth, "→ Karty:", calculateOptimalCardSize());

/* =========================
   HOME (normal + filtered)
========================= */
function buildHomeContainer(query = "") {
    const container = document.createElement("div");
    container.style.cssText = "width: 100%; padding: 20px; box-sizing: border-box;";

    Object.entries(moviesData).forEach(([studio, movies]) => {
        const list = Object.values(movies);

        // 1) filtr platform
        const platformFiltered = list.filter((info) => passesPlatformFilter(info));

        // 2) filtr wyszukiwarki
        const filtered = query
            ? platformFiltered.filter((info) => matchesQuery(info.name, query))
            : platformFiltered;

        if (filtered.length === 0) return;

        const section = document.createElement("div");
        section.className = "section";
        section.style.marginBottom = "40px";

        const header = document.createElement("h2");
        header.innerText = studio;
        header.style.cssText =
            "margin-bottom: 25px; font-size: clamp(1.8rem, 4vw, 2.8rem); color: #fff; text-align: center;";
        section.appendChild(header);

        const items = filtered.map((info) => {
            const isFilm = info.type === "Film";
            const btnText = isFilm ? "Oglądaj" : "Otwórz";
            const action = isFilm ? openMovie : openSerial;
            return createCard(info.name, info, btnText, action);
        });

        section.appendChild(createSmartGrid(items));
        container.appendChild(section);
    });

    return container;
}

function showHome() {
    pushView(buildHomeContainer(""));
}

function renderHomeWithFilter(query) {
    render(buildHomeContainer(query));
}

/* =========================
   OPEN MOVIE/SERIAL
========================= */
function openMovie(info, episodeNumber = null) {
    let displayTitle = info.name;
    if (episodeNumber !== null) displayTitle = `Odcinek ${episodeNumber} - ${info.name}`;
    createPlayerView(displayTitle, info.URL, info);
}

function openSerial(info) {
    const container = document.createElement("div");
    const header = document.createElement("h2");
    header.innerText = `${info.name} - Sezony`;
    header.style.marginBottom = "30px";
    header.style.textAlign = "center";
    header.style.fontSize = "clamp(1.6rem, 4vw, 2.4rem)";
    container.appendChild(header);

    const seasonItems = Object.entries(info)
        .filter(([key]) => key.startsWith("Season"))
        .map(([, value]) => createCard(value.name, value, "Otwórz", openSeason));

    container.appendChild(createSmartGrid(seasonItems));
    pushView(container);
}

function openSeason(season) {
    const container = document.createElement("div");
    const header = document.createElement("h2");
    header.innerText = `${season.name} - Odcinki`;
    header.style.marginBottom = "30px";
    header.style.textAlign = "center";
    header.style.fontSize = "clamp(1.6rem, 4vw, 2.4rem)";
    container.appendChild(header);

    const episodeItems = Object.entries(season)
        .filter(([key]) => key.startsWith("Odcinek"))
        .map(([key, value]) => {
            let episodeNumber = key.replace("Odcinek_", "").replace("Odcinek ", "");
            return createCard(value.name, value, "Oglądaj", (info) => openMovie(info, episodeNumber));
        });

    container.appendChild(createSmartGrid(episodeItems));
    pushView(container);
}

/* =========================
   PLAYER
========================= */
function createPlayerView(title, url, info) {
    const container = document.createElement("div");
    container.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: #000;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        padding: clamp(15px, 3vw, 30px);
        box-sizing: border-box;
        overflow: hidden;
    `;

    // 🔙 TOP BAR Z POWROTEM
    const topBar = document.createElement("div");
    topBar.style.cssText = `
        display: flex;
        align-items: center;
        gap: 15px;
        margin-bottom: 20px;
        padding-bottom: 15px;
        border-bottom: 2px solid #333;
        flex-shrink: 0;
    `;

    // PRZYCISK POWRÓT
    const backBtnPlayer = document.createElement("button");
    backBtnPlayer.innerHTML = "← Powrót";
    backBtnPlayer.onclick = (e) => {
        e.stopPropagation();
        goBack();
    };
    backBtnPlayer.style.cssText = `
        background: rgba(255,255,255,0.1);
        color: white;
        border: 1px solid #444;
        padding: 8px 16px;
        border-radius: 25px;
        font-weight: bold;
        font-size: clamp(0.9rem, 2vw, 1.1rem);
        cursor: pointer;
        backdrop-filter: blur(10px);
        transition: all 0.3s;
        display: flex;
        align-items: center;
        gap: 6px;
    `;
    backBtnPlayer.onmouseover = () => {
        backBtnPlayer.style.background = "rgba(255,255,255,0.2)";
        backBtnPlayer.style.transform = "scale(1.05)";
    };
    backBtnPlayer.onmouseout = () => {
        backBtnPlayer.style.background = "rgba(255,255,255,0.1)";
        backBtnPlayer.style.transform = "scale(1)";
    };

    // TYTUŁ
    const header = document.createElement("h2");
    header.innerText = title;
    header.style.cssText = `
        margin: 0;
        flex: 1;
        font-size: clamp(1.3rem, 3vw, 2rem);
        color: white;
        text-align: center;
        line-height: 1.2;
    `;

    // POBIERZ
    const downloadBtn = document.createElement("button");
    downloadBtn.innerText = "⬇️";
    downloadBtn.onclick = (e) => {
        e.stopPropagation();
        e.preventDefault();
        if (url && url.includes("drive.google.com/file/d/")) {
            const fileId = url.split("/d/")[1].split("/")[0];
            const a = document.createElement("a");
            a.href = `https://drive.google.com/uc?export=download&id=${fileId}`;
            a.download = "";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } else alert("Pobieranie tylko dla Google Drive!");
    };
    downloadBtn.style.cssText = `
        background: linear-gradient(45deg, #dc2626, #b91c1c);
        color: white;
        border: none;
        padding: 10px 14px;
        border-radius: 50%;
        font-size: clamp(1rem, 2.5vw, 1.3rem);
        font-weight: bold;
        cursor: pointer;
        box-shadow: 0 4px 15px rgba(220,38,38,0.4);
        transition: all 0.3s;
        width: 45px;
        height: 45px;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    downloadBtn.onmouseover = () => (downloadBtn.style.transform = "scale(1.1)");
    downloadBtn.onmouseout = () => (downloadBtn.style.transform = "scale(1)");

    topBar.appendChild(backBtnPlayer);
    topBar.appendChild(header);
    topBar.appendChild(downloadBtn);

    // 🎥 PLAYER
    const player = document.createElement("div");
    player.style.cssText = `
        flex: 1;
        width: 100%;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #111;
        border-radius: 12px;
        overflow: hidden;
    `;

    if (url && url !== "URL") {
        let embedUrl = url.includes("bysesukior.com/e/")
            ? url
            : url.includes("drive.google.com/file/d/")
            ? `https://drive.google.com/file/d/${url.split("/d/")[1].split("/")[0]}/preview`
            : url.includes("youtube.com/watch?v=") || url.includes("youtu.be/")
            ? `https://www.youtube.com/embed/${
                  url.includes("watch?v=")
                      ? url.split("watch?v=")[1].split("&")[0]
                      : url.split("youtu.be/")[1].split("?")[0]
              }`
            : url;

        if (embedUrl.includes("bysesukior.com") || embedUrl.includes("youtube.com/embed") || embedUrl.includes("drive.google.com")) {
            const iframe = document.createElement("iframe");
            iframe.src = embedUrl;
            iframe.width = "100%";
            iframe.height = "100%";
            iframe.frameBorder = "0";
            iframe.style.cssText = "border-radius: inherit; border: none;";
            iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen";
            iframe.allowFullscreen = true;
            player.appendChild(iframe);
        } else {
            const video = document.createElement("video");
            video.src = embedUrl;
            video.controls = true;
            video.width = "100%";
            video.height = "100%";
            video.style.cssText = "border-radius: inherit; object-fit: contain; background: #000;";
            video.autoplay = true;
            player.appendChild(video);
        }
    } else {
        const error = document.createElement("div");
        error.style.cssText = `
            color: #ff6b6b;
            font-weight: bold;
            text-align: center;
            padding: 40px;
            font-size: clamp(1.2rem, 4vw, 1.8rem);
        `;
        error.innerText = "❌ Brak linku do filmu!";
        player.appendChild(error);
    }

    container.appendChild(topBar);
    container.appendChild(player);

    // ESC
    container.onkeydown = (e) => {
        if (e.key === "Escape") goBack();
    };
    player.onclick = (e) => {};

    pushView(container);
}

/* =========================
   START
========================= */
buildPlatformButtons();
showHome();

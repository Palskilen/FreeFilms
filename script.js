/* 🔥 PALSKILEN CREATOR v3.1 - MIN WIDTH -60% (200px zamiast 320px)! */
const app = document.getElementById("app");
const backBtn = document.getElementById("backBtn");
const moviesData = window.movieData;
let viewStack = [];

// 🔥 🔥 🔥 LIMIT DO ZMIANY - ZMNIEJSZONY O 60%! 🔥 🔥 🔥
const GRID_CONFIG = {
    DESKTOP_MIN: 270,      // Było 320px → TERAZ 200px (~6-8 w rzędzie!)
    TABLET_MIN: 280,       // Było 280px → 180px
    MOBILE_MIN: 260,       // Było 260px → 160px  
    MOBILE_SINGLE: 0       // 1 kolumna na telefonie
};

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

function createCard(title, info, buttonText, callback) {
    const card = document.createElement("div");
    card.className = "card";
    card.style.cursor = "pointer";

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

// 🔥 RESPONSIVE GRID - ZMNIEJSZONE LIMITY!
function createResponsiveGrid(items) {
    const grid = document.createElement("div");
    grid.className = "palskilen-grid-v3";
    
    grid.style.cssText = `
        display: grid;
        gap: 20px;           /* Zmniejszony gap o 20% */
        max-width: 100%;
        padding: 20px;       /* Zmniejszony padding */
        box-sizing: border-box;
    `;
    
    const style = document.createElement("style");
    style.id = "palskilen-grid-styles";
    style.textContent = `
        .palskilen-grid-v3 {
            grid-template-columns: repeat(auto-fit, minmax(${GRID_CONFIG.DESKTOP_MIN}px, 1fr));
        }
        @media (max-width: 1400px) {
            .palskilen-grid-v3 { grid-template-columns: repeat(auto-fit, minmax(${GRID_CONFIG.TABLET_MIN}px, 1fr)); }
        }
        @media (max-width: 900px) {
            .palskilen-grid-v3 { grid-template-columns: repeat(auto-fit, minmax(${GRID_CONFIG.MOBILE_MIN}px, 1fr)); }
        }
        @media (max-width: 600px) {
            .palskilen-grid-v3 { 
                grid-template-columns: ${GRID_CONFIG.MOBILE_SINGLE === 0 ? '1fr' : 'repeat(auto-fit, minmax(' + GRID_CONFIG.MOBILE_SINGLE + 'px, 1fr))'};
                padding: 15px; gap: 15px;
            }
        }
        @media (max-width: 400px) { .palskilen-grid-v3 { padding: 10px; gap: 12px; } }
    `;
    
    const oldStyle = document.getElementById("palskilen-grid-styles");
    if (oldStyle) oldStyle.remove();
    document.head.appendChild(style);
    
    items.forEach(item => grid.appendChild(item));
    return grid;
}

console.log("🔥 PALSKILEN v3.1 - NOWE LIMITY (-60%):", GRID_CONFIG);
console.log("📱 Desktop: ~6-8 kart w rzędzie | Mobile: 1 kolumna");

function showHome() {
    const container = document.createElement("div");
    Object.entries(moviesData).forEach(([studio, movies]) => {
        const section = document.createElement("div");
        section.className = "section";
        section.style.marginBottom = "40px";
        
        const header = document.createElement("h2");
        header.innerText = studio;
        header.style.cssText = "margin-bottom: 20px; font-size: 26px; color: #fff;";
        section.appendChild(header);
        
        const items = Object.values(movies).map(info => {
            const isFilm = info.type === "Film";
            const btnText = isFilm ? "Oglądaj" : "Otwórz";
            const action = isFilm ? openMovie : openSerial;
            return createCard(info.name, info, btnText, action);
        });
        section.appendChild(createResponsiveGrid(items));
        container.appendChild(section);
    });
    pushView(container);
}

// 🔥 SKRÓCONE FUNKCJE (bez zmian logiki)
function openMovie(info, episodeNumber = null) {
    let displayTitle = info.name;
    if (episodeNumber !== null) displayTitle = `Odcinek ${episodeNumber} - ${info.name}`;
    createPlayerView(displayTitle, info.URL, info);
}

function openSerial(info) {
    const container = document.createElement("div");
    const header = document.createElement("h2");
    header.innerText = `${info.name} - Sezony`;
    header.style.marginBottom = "20px";
    container.appendChild(header);
    const seasonItems = Object.entries(info)
        .filter(([key]) => key.startsWith("Season"))
        .map(([, value]) => createCard(value.name, value, "Otwórz", openSeason));
    container.appendChild(createResponsiveGrid(seasonItems));
    pushView(container);
}

function openSeason(season) {
    const container = document.createElement("div");
    const header = document.createElement("h2");
    header.innerText = `${season.name} - Odcinki`;
    header.style.marginBottom = "20px";
    container.appendChild(header);
    const episodeItems = Object.entries(season)
        .filter(([key]) => key.startsWith("Odcinek"))
        .map(([key, value]) => {
            let episodeNumber = key.replace("Odcinek_", "").replace("Odcinek ", "");
            return createCard(value.name, value, "Oglądaj", (info) => openMovie(info, episodeNumber));
        });
    container.appendChild(createResponsiveGrid(episodeItems));
    pushView(container);
}

function createPlayerView(title, url, info) {
    const container = document.createElement("div");
    const headerContainer = document.createElement("div");
    headerContainer.style.cssText = "position: relative; margin-bottom: 25px; padding-bottom: 20px; border-bottom: 3px solid #333;";
    
    const header = document.createElement("h2");
    header.innerText = title;
    header.style.cssText = "margin: 0; display: inline-block; font-size: 24px;";
    
    const downloadBtn = document.createElement("button");
    downloadBtn.innerText = "⬇️ Pobierz";
    downloadBtn.onclick = (e) => {
        e.stopPropagation(); e.preventDefault();
        if (url && url.includes("drive.google.com/file/d/")) {
            const fileId = url.split("/d/")[1].split("/")[0];
            const a = document.createElement("a");
            a.href = `https://drive.google.com/uc?export=download&id=${fileId}`;
            a.download = ""; document.body.appendChild(a); a.click(); document.body.removeChild(a);
        } else alert("Pobieranie tylko dla Google Drive!");
    };
    downloadBtn.style.cssText = "position: absolute; top: 0; right: 0; background: linear-gradient(45deg, #dc2626, #b91c1c); color: white; border: none; padding: 12px 20px; border-radius: 25px; font-weight: bold; font-size: 15px; cursor: pointer; box-shadow: 0 6px 20px rgba(220,38,38,0.5); transition: all 0.3s ease;";
    downloadBtn.onmouseover = () => downloadBtn.style.transform = "scale(1.05)";
    downloadBtn.onmouseout = () => downloadBtn.style.transform = "scale(1)";

    headerContainer.appendChild(header);
    headerContainer.appendChild(downloadBtn);

    const player = document.createElement("div");
    player.style.cssText = "position: relative; width: 100%;";

    if (url && url !== "URL") {
        let embedUrl = url.includes("bysesukior.com/e/") ? url :
            url.includes("drive.google.com/file/d/") ? `https://drive.google.com/file/d/${url.split("/d/")[1].split("/")[0]}/preview` :
            url.includes("youtube.com/watch?v=") || url.includes("youtu.be/") ? 
            `https://www.youtube.com/embed/${url.includes("watch?v=") ? url.split("watch?v=")[1].split("&")[0] : url.split("youtu.be/")[1].split("?")[0]}` : url;

        if (embedUrl.includes("bysesukior.com") || embedUrl.includes("youtube.com/embed") || embedUrl.includes("drive.google.com")) {
            const iframe = document.createElement("iframe");
            Object.assign(iframe, {src: embedUrl, width: "100%", height: "75vh", frameBorder: "0", style: {borderRadius: "12px"}});
            iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
            iframe.allowFullscreen = true; player.appendChild(iframe);
        } else {
            const video = document.createElement("video");
            Object.assign(video, {src: embedUrl, controls: true, width: "100%", height: "75vh", style: {borderRadius: "12px", objectFit: "contain"}, autoplay: true});
            player.appendChild(video);
        }
    } else {
        const error = document.createElement("div");
        error.style.cssText = "color:#ff6b6b;font-weight:bold;text-align:center;padding:150px;font-size:20px;";
        error.innerText = "Brak linku do filmu!"; player.appendChild(error);
    }

    container.appendChild(headerContainer);
    container.appendChild(player);
    pushView(container);
}

showHome();

/* 🔥 PALSKILEN CREATOR v3.3 - AUTO-SIZING KART (Palskilen Style!) 🔥 */

const app = document.getElementById("app");
const backBtn = document.getElementById("backBtn");
const moviesData = window.movieData;
let viewStack = [];

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

// 🧠 AUTO-CALCULATE CARD SIZE
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
        margin: '5px',
        gap: `${gap}px`,
        cols: Math.floor((containerWidth - 40) / (baseSize + gap + marginTotal))
    };
}

// 🔄 Dynamiczne style na resize
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
    document.querySelectorAll('.palskilen-auto-grid').forEach(grid => {
        grid.style.gridTemplateColumns = `repeat(${optimal.cols}, ${optimal.width}px)`;
        grid.style.gap = optimal.gap;
    });
}

// 👇 Listener na resize okna
window.addEventListener('resize', updateGridStyles);
updateGridStyles(); // initial call

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
    
    // Debounce dla perf
    const optimal = calculateOptimalCardSize();
    grid.style.padding = "20px";
    grid.style.boxSizing = "border-box";
    
    items.forEach(item => grid.appendChild(item));
    return grid;
}

console.log("🔥 PALSKILEN v3.3 - PALSKILEN AUTO-SIZING AKTYWNY!");
console.log("📐 Rozmiar okna:", window.innerWidth, "→ Karty:", calculateOptimalCardSize());

function showHome() {
    const container = document.createElement("div");
    container.style.cssText = "width: 100%; padding: 20px; box-sizing: border-box;";
    
    Object.entries(moviesData).forEach(([studio, movies]) => {
        const section = document.createElement("div");
        section.className = "section";
        section.style.marginBottom = "40px";
        
        const header = document.createElement("h2");
        header.innerText = studio;
        header.style.cssText = "margin-bottom: 25px; font-size: clamp(1.8rem, 4vw, 2.8rem); color: #fff; text-align: center;";
        section.appendChild(header);
        
        const items = Object.values(movies).map(info => {
            const isFilm = info.type === "Film";
            const btnText = isFilm ? "Oglądaj" : "Otwórz";
            const action = isFilm ? openMovie : openSerial;
            return createCard(info.name, info, btnText, action);
        });
        
        section.appendChild(createSmartGrid(items)); // SMART GRID!
        container.appendChild(section);
    });
    pushView(container);
}

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
    
    container.appendChild(createSmartGrid(seasonItems)); // SMART!
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
    
    container.appendChild(createSmartGrid(episodeItems)); // SMART!
    pushView(container);
}

function createPlayerView(title, url, info) {
    const container = document.createElement("div");
    container.style.cssText = "width: 100vw; height: 100vh; padding: clamp(25px, 5vw, 50px); display: flex; flex-direction: column; box-sizing: border-box; overflow: hidden;";
    
    const headerContainer = document.createElement("div");
    headerContainer.style.cssText = "position: relative; margin-bottom: 25px; padding-bottom: 20px; border-bottom: 3px solid #333;";
    
    const header = document.createElement("h2");
    header.innerText = title;
    header.style.cssText = "margin: 0; display: inline-block; font-size: clamp(1.5rem, 4vw, 2.5rem);";
    
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
    player.style.cssText = "position: relative; width: 100%; flex: 1; display: flex; align-items: center; justify-content: center;";

    if (url && url !== "URL") {
        let embedUrl = url.includes("bysesukior.com/e/") ? url :
            url.includes("drive.google.com/file/d/") ? `https://drive.google.com/file/d/${url.split("/d/")[1].split("/")[0]}/preview` :
            url.includes("youtube.com/watch?v=") || url.includes("youtu.be/") ? 
            `https://www.youtube.com/embed/${url.includes("watch?v=") ? url.split("watch?v=")[1].split("&")[0] : url.split("youtu.be/")[1].split("?")[0]}` : url;

        if (embedUrl.includes("bysesukior.com") || embedUrl.includes("youtube.com/embed") || embedUrl.includes("drive.google.com")) {
            const iframe = document.createElement("iframe");
            Object.assign(iframe, {src: embedUrl, width: "100%", height: "100%", frameBorder: "0", style: {borderRadius: "12px"}});
            iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
            iframe.allowFullscreen = true; player.appendChild(iframe);
        } else {
            const video = document.createElement("video");
            Object.assign(video, {src: embedUrl, controls: true, width: "100%", height: "100%", style: {borderRadius: "12px", objectFit: "contain"}, autoplay: true});
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

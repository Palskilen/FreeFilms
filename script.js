/* 🔥 PALSKILEN CREATOR - TERABOX + YOUTUBE + BYSESUKIOR + WSZYSTKO! */
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

/* 🔥 KARTA PALSKILEN CREATOR */
function createCard(title, info, buttonText, callback) {
    const card = document.createElement("div");
    card.className = "card";

    // POSTER
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

    // DURATION GÓRA PRAWY
    if (info.duration) {
        const durationBadge = document.createElement("div");
        durationBadge.className = "duration-badge";
        durationBadge.innerText = info.duration;
        poster.appendChild(durationBadge);
    }

    // TITLE
    const titleDiv = document.createElement("div");
    titleDiv.className = "card-title";
    titleDiv.innerText = title;

    // INFO POD TITLE
    const subtitleDiv = document.createElement("div");
    subtitleDiv.className = "card-subtitle";
    let subtitle = "";
    if (info.year) subtitle += info.year;
    if (info.genre) subtitle += (subtitle ? " • " : "") + info.genre;
    subtitleDiv.innerText = subtitle;

    // BUTTON
    const btn = document.createElement("button");
    btn.innerText = buttonText;
    btn.onclick = (e) => { e.stopPropagation(); callback(info); };
    card.onclick = () => callback(info);

    card.appendChild(poster);
    card.appendChild(titleDiv);
    card.appendChild(subtitleDiv);
    card.appendChild(btn);

    return card;
}

function showHome() {
    const container = document.createElement("div");
    Object.entries(moviesData).forEach(([studio, movies]) => {
        const section = document.createElement("div");
        section.className = "section";
        const header = document.createElement("h2");
        header.innerText = studio;
        section.appendChild(header);
        const grid = document.createElement("div");
        grid.className = "grid";
        Object.values(movies).forEach(info => {
            const isFilm = info.type === "Film";
            const btnText = isFilm ? "Oglądaj" : "Otwórz";
            const action = isFilm ? openMovie : openSerial;
            const card = createCard(info.name, info, btnText, action);
            grid.appendChild(card);
        });
        section.appendChild(grid);
        container.appendChild(section);
    });
    pushView(container);
}

function openMovie(info, episodeNumber = null) {
    // 🔥 JEŚLI TO ODCINEK - dodaj numer odcinka do tytułu
    let displayTitle = info.name;
    if (episodeNumber !== null) {
        displayTitle = `Odcinek ${episodeNumber} - ${info.name}`;
    }
    createPlayerView(displayTitle, info.URL, info);
}

function openSerial(info) {
    const container = document.createElement("div");
    container.className = "section";
    const header = document.createElement("h2");
    header.innerText = `${info.name} - Sezony`;
    container.appendChild(header);
    const grid = document.createElement("div");
    grid.className = "grid";
    Object.entries(info).forEach(([key, value]) => {
        if (key.startsWith("Season")) {
            const card = createCard(value.name, value, "Otwórz", openSeason);
            grid.appendChild(card);
        }
    });
    container.appendChild(grid);
    pushView(container);
}

function openSeason(season) {
    const container = document.createElement("div");
    container.className = "section";
    const header = document.createElement("h2");
    header.innerText = `${season.name} - Odcinki`;
    container.appendChild(header);
    const grid = document.createElement("div");
    grid.className = "grid";
    Object.entries(season).forEach(([key, value]) => {
        if (key.startsWith("Odcinek")) {
            // 🔥 CZYSTO WYCIĄGNIJ NUMER odcinka (bez "Odcinek_")
            let episodeNumber = key.replace("Odcinek_", "").replace("Odcinek ", "");
            const card = createCard(value.name, value, "Oglądaj", (info) => openMovie(info, episodeNumber));
            grid.appendChild(card);
        }
    });
    container.appendChild(grid);
    pushView(container);
}

/* 🔥 PLAYER - GOOGLE DRIVE + BYSESUKIOR + YOUTUBE + TERABOX + MP4 */
function createPlayerView(title, url, info) {
    const container = document.createElement("div");
    
    // 🔥 HEADER Z TYTUŁEM + PRZYCISKIEM POBRANIA W JEDNEJ LINIJCE
    const headerContainer = document.createElement("div");
    headerContainer.style.cssText = `
        position: relative;
        margin-bottom: 20px;
        padding-bottom: 15px;
        border-bottom: 2px solid #333;
    `;
    
    const header = document.createElement("h2");
    header.innerText = title;
    header.style.cssText = `
        margin: 0;
        display: inline-block;
    `;
    
    // 🔥 PRZYCISK POBRANIA - CZERWONY, W PRAWOJ GÓRNEJ CZĘŚCI LINII Z TYTUŁEM
    const downloadBtn = document.createElement("button");
    downloadBtn.innerText = "⬇️ Pobierz";
    downloadBtn.id = "downloadBtn";
    downloadBtn.style.cssText = `
        position: absolute;
        top: -5px;
        right: 0;
        background: #dc2626;
        color: white;
        border: none;
        padding: 10px 16px;
        border-radius: 20px;
        font-weight: bold;
        font-size: 14px;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(220,38,38,0.4);
        transition: all 0.3s;
    `;
    downloadBtn.onmouseover = () => downloadBtn.style.background = "#b91c1c";
    downloadBtn.onmouseout = () => downloadBtn.style.background = "#dc2626";
    downloadBtn.onclick = (e) => {
        e.stopPropagation();
        if (url && url.includes("drive.google.com/file/d/")) {
            const fileId = url.split("/d/")[1].split("/")[0];
            const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
            const a = document.createElement("a");
            a.href = downloadUrl;
            a.download = "";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } else {
            alert("Pobieranie dostępne tylko dla Google Drive!");
        }
    };

    headerContainer.appendChild(header);
    headerContainer.appendChild(downloadBtn);

    const player = document.createElement("div");
    player.className = "player-container";
    player.style.position = "relative";

    if (url && url !== "URL") {
        let embedUrl = "";

        // 🔥 BYSESUKIOR - nowe wsparcie!
        if (url.includes("bysesukior.com/e/")) {
            embedUrl = url;
        }
        // 🔥 GOOGLE DRIVE - TYLKO file/d/ linki
        else if (url.includes("drive.google.com/file/d/")) {
            const fileId = url.split("/d/")[1].split("/")[0];
            embedUrl = `https://drive.google.com/file/d/${fileId}/preview`;
        }
        // YOUTUBE
        else if (url.includes("youtube.com/watch?v=") || url.includes("youtu.be/")) {
            let videoId = "";
            if (url.includes("watch?v=")) {
                videoId = url.split("watch?v=")[1].split("&")[0];
            } else {
                videoId = url.split("youtu.be/")[1].split("?")[0];
            }
            embedUrl = `https://www.youtube.com/embed/${videoId}`;
        } 
        // TERABOX / DIRECT MP4
        else {
            embedUrl = url;
        }

        // 🔥 IFRAME dla BYSESUKIOR + YouTube + Google Drive
        if (embedUrl.includes("bysesukior.com") || 
            embedUrl.includes("youtube.com/embed") || 
            embedUrl.includes("drive.google.com")) {
            const iframe = document.createElement("iframe");
            iframe.src = embedUrl;
            iframe.width = "100%";
            iframe.height = "700";
            iframe.frameBorder = "0";
            iframe.style.borderRadius = "8px";
            iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
            iframe.allowFullscreen = true;
            player.appendChild(iframe);
        } else {
            // 🔥 DIRECT MP4 (Terabox, Cloudinary, itp.)
            const video = document.createElement("video");
            video.src = embedUrl;
            video.controls = true;
            video.width = "100%";
            video.height = "700";
            video.style.borderRadius = "8px";
            video.style.objectFit = "contain";
            video.autoplay = true;
            player.appendChild(video);
        }

    } else {
        const error = document.createElement("div");
        error.style.cssText = "color:#ff6b6b;font-weight:bold;text-align:center;padding:100px;font-size:18px;";
        error.innerText = "Brak linku do filmu!";
        player.appendChild(error);
    }

    // 🔥 UKŁAD: TYTUŁ + POBIERZ (w jednej linii z paskiem) -> PLAYER
    container.appendChild(headerContainer);
    container.appendChild(player);
    
    pushView(container);
}

showHome();

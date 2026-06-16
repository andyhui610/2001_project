// ==========================================================================
// 《2001 太空漫遊》逐幀分析儀表板 - 前端邏輯 (JavaScript)
// ==========================================================================

let metadata = null;
let activeShotIndex = 0; // 0-based index of shots array
let activeScriptPage = 1;
let saveTimeout = null;
const isEditMode = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

// 視聽語言分析模板
const ANALYSIS_TEMPLATE = `# 視聽語言分析筆記

## 1. 畫面構圖與攝影 (Composition & Cinematography)
* **鏡頭運動**：[如：靜態固定鏡頭、緩慢推進、追蹤鏡頭]
* **景深與焦距**：[如：深景深、淺景深、廣角鏡頭]
* **構圖美學**：[如：單點透視、三分法則、對稱構圖]

## 2. 色彩與光影美學 (Color & Lighting)
* **色彩基調**：[如：太空艙冰冷的藍白色調、紅色警示光、強烈黑白對比]
* **光影設計**：[如：舞台高對比頂光、柔和均勻背光]

## 3. 聲音與音樂設計 (Sound & Music)
* **配樂選用**：[如：Ligeti - Requiem、Strauss - Blue Danube、無聲/純真空靜音]
* **音效細節**：[如：太空衣內的沉重呼吸聲、太空艙的低頻運作聲]

## 4. 剪輯與劇本變更 (Editing & Script Adaptation)
* **剪輯節奏**：[如：慢節奏沉思長鏡頭、動態蒙太奇]
* **劇本對應分析**：[在此分析電影畫面與劇本文字描述的巨大轉變，如透明立方體改為黑石碑，或刪除的旁白]
`;

// DOM 元素
const shotListEl = document.getElementById("shot-list");
const searchInput = document.getElementById("search-input");
const sequenceSelect = document.getElementById("sequence-select");

const currentShotTitle = document.getElementById("current-shot-title");
const currentShotSeq = document.getElementById("current-shot-seq");
const currentShotTimecode = document.getElementById("current-shot-timecode");
const currentShotDuration = document.getElementById("current-shot-duration");

const framesGrid = document.getElementById("frames-grid");
const screenplayBox = document.getElementById("screenplay-box");
const scriptPageRange = document.getElementById("script-page-range");

const noteTextarea = document.getElementById("note-textarea");
const previewContent = document.getElementById("preview-content");
const saveStatus = document.getElementById("save-status");

const tabWrite = document.getElementById("tab-write");
const tabPreview = document.getElementById("tab-preview");
const editorWriteWrapper = document.getElementById("editor-write-wrapper");
const editorPreviewWrapper = document.getElementById("editor-preview-wrapper");

const btnSave = document.getElementById("btn-save");
const btnInsertTemplate = document.getElementById("btn-insert-template");
const btnPrevPage = document.getElementById("btn-prev-page");
const btnNextPage = document.getElementById("btn-next-page");

const lightboxModal = document.getElementById("lightbox-modal");
const lightboxImg = document.getElementById("lightbox-img");
const lightboxCaption = document.getElementById("lightbox-caption");
const lightboxClose = document.getElementById("lightbox-close");

// 根據鏡頭編號取得對應的筆記檔名
function getNoteFilename(shotNum) {
    if (shotNum >= 2 && shotNum <= 11) return "scene_002_to_011.md";
    if (shotNum >= 13 && shotNum <= 19) return "scene_013_to_019.md";
    if (shotNum >= 20 && shotNum <= 25) return "scene_020_to_025.md";
    if (shotNum >= 26 && shotNum <= 34) return "scene_026_to_034.md";
    if (shotNum >= 35 && shotNum <= 44) return "scene_035_to_044.md";
    if (shotNum >= 45 && shotNum <= 48) return "scene_045_to_048.md";
    if (shotNum >= 49 && shotNum <= 61) return "scene_049_to_061.md";
    if (shotNum >= 62 && shotNum <= 81) return "scene_062_to_081.md";
    if (shotNum >= 84 && shotNum <= 103) return "scene_084_to_103.md";
    if (shotNum >= 106 && shotNum <= 108) return "scene_106_to_108.md";
    if (shotNum >= 109 && shotNum <= 118) return "scene_109_to_118.md";
    if (shotNum >= 119 && shotNum <= 130) return "scene_119_to_130.md";
    if (shotNum >= 131 && shotNum <= 137) return "scene_131_to_137.md";
    if (shotNum >= 138 && shotNum <= 144) return "scene_138_to_144.md";
    if (shotNum >= 145 && shotNum <= 152) return "scene_145_to_152.md";
    if (shotNum >= 153 && shotNum <= 161) return "scene_153_to_161.md";
    if (shotNum >= 162 && shotNum <= 174) return "scene_162_to_174.md";
    if (shotNum >= 175 && shotNum <= 181) return "scene_175_to_181.md";
    if (shotNum >= 182 && shotNum <= 195) return "scene_182_to_195.md";
    if (shotNum >= 196 && shotNum <= 203) return "scene_196_to_203.md";
    if (shotNum >= 204 && shotNum <= 215) return "scene_204_to_215.md";
    if (shotNum >= 216 && shotNum <= 226) return "scene_216_to_226.md";
    if (shotNum >= 227 && shotNum <= 234) return "scene_227_to_234.md";
    if (shotNum >= 235 && shotNum <= 248) return "scene_235_to_248.md";
    if (shotNum >= 249 && shotNum <= 266) return "scene_249_to_266.md";
    if (shotNum >= 267 && shotNum <= 273) return "scene_267_to_273.md";
    if (shotNum >= 274 && shotNum <= 285) return "scene_274_to_285.md";
    if (shotNum >= 286 && shotNum <= 295) return "scene_286_to_295.md";
    if (shotNum >= 296 && shotNum <= 315) return "scene_296_to_315.md";
    if (shotNum >= 316 && shotNum <= 340) return "scene_316_to_340.md";
    if (shotNum >= 341 && shotNum <= 355) return "scene_341_to_355.md";
    if (shotNum >= 356 && shotNum <= 380) return "scene_356_to_380.md";
    if (shotNum >= 381 && shotNum <= 400) return "scene_381_to_400.md";
    if (shotNum >= 401 && shotNum <= 425) return "scene_401_to_425.md";
    if (shotNum >= 426 && shotNum <= 450) return "scene_426_to_450.md";
    if (shotNum >= 451 && shotNum <= 461) return "scene_451_to_461.md";
    if (shotNum >= 462 && shotNum <= 475) return "scene_462_to_475.md";
    if (shotNum >= 476 && shotNum <= 495) return "scene_476_to_495.md";
    if (shotNum >= 496 && shotNum <= 540) return "scene_496_to_540.md";
    if (shotNum >= 541 && shotNum <= 555) return "scene_541_to_555.md";
    if (shotNum >= 556 && shotNum <= 580) return "scene_556_to_580.md";
    if (shotNum >= 581 && shotNum <= 605) return "scene_581_to_605.md";
    if (shotNum >= 606 && shotNum <= 625) return "scene_606_to_625.md";
    if (shotNum >= 626 && shotNum <= 643) return "scene_626_to_643.md";
    return "scene_" + String(shotNum).padStart(3, '0') + ".md";
}

// 套用唯讀瀏覽模式的介面調整
function applyReadOnlyMode() {
    // 隱藏編輯與模板等按鈕
    const tabButtons = document.querySelector(".tab-buttons");
    const editorActions = document.querySelector(".editor-actions");
    if (tabButtons) tabButtons.style.display = "none";
    if (editorActions) editorActions.style.display = "none";
    
    // 在面板標頭插入唯讀的分析筆記標題
    const editorHeader = document.querySelector(".editor-header");
    if (editorHeader) {
        const titleEl = document.createElement("h3");
        titleEl.className = "section-title";
        titleEl.style.margin = "0";
        titleEl.style.fontSize = "1.1rem";
        titleEl.innerHTML = `<i class="fa-solid fa-book-open"></i> 視聽語言分析筆記`;
        editorHeader.insertBefore(titleEl, editorHeader.firstChild);
    }
    
    // 隱藏寫作 textarea，顯示預覽 markdown
    if (editorWriteWrapper) editorWriteWrapper.classList.add("hidden");
    if (editorPreviewWrapper) editorPreviewWrapper.classList.remove("hidden");
}

// 初始化應用
async function init() {
    // 檢查是否為唯讀模式並套用介面調整
    if (!isEditMode) {
        applyReadOnlyMode();
    }

    try {
        console.log("Loading metadata.json...");
        const response = await fetch("metadata.json");
        if (!response.ok) throw new Error("無法讀取 metadata.json 檔案");
        metadata = await response.json();
        console.log("Metadata loaded successfully:", metadata);

        // 渲染側邊欄鏡頭列表
        renderShotList();
        
        // 載入預設的第一個鏡頭
        selectShot(0);

        // 註冊事件監聽器
        setupEventListeners();
    } catch (err) {
        console.error("Initialization error:", err);
        shotListEl.innerHTML = `<div class="loading-spinner" style="color:var(--color-accent-orange)"><i class="fa-solid fa-triangle-exclamation"></i> 載入失敗: ${err.message}</div>`;
    }
}

// 側邊欄鏡頭列表渲染
function renderShotList() {
    const filter = sequenceSelect.value;
    const searchVal = searchInput.value.toLowerCase().trim();
    
    shotListEl.innerHTML = "";
    
    let filteredShots = metadata.shots;
    
    // 1. 段落過濾
    if (filter !== "all") {
        filteredShots = filteredShots.filter(shot => {
            const num = shot.shot_num;
            if (filter === "part1_all") return num <= 82;
            if (filter === "part2_all") return 83 <= num && num <= 130;
            if (filter === "part2_base") return 131 <= num && num <= 195;
            if (filter === "part2_tma") return 196 <= num && num <= 226;
            if (filter === "part3_discovery") return 227 <= num && num <= 266;
            if (filter === "part3_eva") return 267 <= num && num <= 380;
            if (filter === "part3_hal") return 381 <= num && num <= 450;
            if (filter === "part3_stargate") return 451 <= num;
            return true;
        });
    }
    
    // 2. 搜尋過濾
    if (searchVal) {
        filteredShots = filteredShots.filter(shot => {
            return shot.shot_num.toString().includes(searchVal) || 
                   shot.sequence_name.toLowerCase().includes(searchVal);
        });
    }

    if (filteredShots.length === 0) {
        shotListEl.innerHTML = `<div class="loading-spinner"><i class="fa-solid fa-magnifying-glass"></i> 沒有找到相符的鏡頭</div>`;
        return;
    }

    // 3. 產生 DOM 節點
    filteredShots.forEach(shot => {
        const itemIndex = metadata.shots.findIndex(s => s.shot_num === shot.shot_num);
        
        const item = document.createElement("div");
        item.className = `shot-item ${itemIndex === activeShotIndex ? 'active' : ''}`;
        item.dataset.index = itemIndex;
        
        item.innerHTML = `
            <div class="shot-item-info">
                <div class="shot-item-title">鏡頭 #${shot.shot_num}</div>
                <div class="shot-item-meta">
                    <span>${shot.start_timecode}</span>
                    <span>${shot.duration_seconds.toFixed(1)}s</span>
                </div>
            </div>
        `;
        
        item.addEventListener("click", () => {
            // 移除舊的 active
            const currentActive = shotListEl.querySelector(".shot-item.active");
            if (currentActive) currentActive.classList.remove("active");
            
            // 設為 active
            item.classList.add("active");
            selectShot(itemIndex);
        });
        
        shotListEl.appendChild(item);
    });
}

// 選擇鏡頭並載入詳情
async function selectShot(index) {
    if (!metadata || index < 0 || index >= metadata.shots.length) return;
    
    activeShotIndex = index;
    const shot = metadata.shots[index];
    
    // 1. 更新 Banner 資訊
    currentShotTitle.textContent = `鏡頭 #${shot.shot_num}`;
    currentShotSeq.textContent = shot.sequence_name;
    currentShotTimecode.textContent = `${shot.start_timecode} - ${shot.end_timecode}`;
    currentShotDuration.textContent = `${shot.duration_seconds.toFixed(2)} 秒`;
    
    // 2. 渲染影格 (3張圖片)
    framesGrid.innerHTML = "";
    shot.images.forEach((imgName, fIdx) => {
        const card = document.createElement("div");
        card.className = "frame-card";
        card.innerHTML = `
            <img src="${imgName}" alt="鏡頭 #${shot.shot_num} 影格 ${fIdx+1}">
            <div class="frame-badge">幀 ${fIdx+1}</div>
        `;
        
        // 點擊影格放大 (Lightbox)
        card.addEventListener("click", () => {
            openLightbox(imgName, `鏡頭 #${shot.shot_num} - 影格 ${fIdx+1} (${shot.sequence_name})`);
        });
        
        framesGrid.appendChild(card);
    });
    
    // 3. 載入對照劇本
    activeScriptPage = shot.page_start;
    renderScriptPage();
    
    // 4. 載入並渲染對應的寫作筆記
    await loadNote(shot.shot_num);
}

// 渲染劇本視窗中的指定頁面文字
function renderScriptPage() {
    const shot = metadata.shots[activeShotIndex];
    scriptPageRange.textContent = activeScriptPage;
    
    const pageObj = metadata.screenplay.find(p => p.page_num === activeScriptPage);
    if (pageObj) {
        // highlight 劇本中的一些關鍵標題
        let textHtml = pageObj.text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
            
        // 將 INT. / EXT. / TITLE CARD 標記上高亮色彩
        textHtml = textHtml.replace(/^(INT\..+|EXT\..+|INT\s*\/\s*EXT\..+|TITLE CARD:.*)$/gm, '<span style="color:var(--color-accent-blue);font-weight:600;">$1</span>');
        // 將人名高亮
        textHtml = textHtml.replace(/^([A-Z\s]+)$/gm, (match) => {
            const clean = match.trim();
            if (clean.length > 2 && !clean.includes("PAGE") && !clean.includes("2001")) {
                return `<span style="color:var(--color-accent-orange);font-weight:600;">${match}</span>`;
            }
            return match;
        });

        screenplayBox.innerHTML = textHtml;
    } else {
        screenplayBox.innerHTML = `<div class="script-placeholder">此頁劇本無文字</div>`;
    }
}

// 載入筆記 API
async function loadNote(shotNum) {
    try {
        saveStatus.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> 載入筆記中...`;
        
        const filename = getNoteFilename(shotNum);
        // 使用相對路徑與時間戳記避免瀏覽器快取
        const res = await fetch(`analysis_notes/${filename}?t=${Date.now()}`);
        
        let content = "";
        if (res.ok) {
            content = await res.text();
            saveStatus.innerHTML = isEditMode ? 
                `<i class="fa-solid fa-cloud-arrow-up"></i> 筆記已載入` : 
                `<i class="fa-solid fa-eye"></i> 唯讀預覽模式`;
        } else if (res.status === 404) {
            content = "*（目前此鏡頭尚無分析筆記）*";
            saveStatus.innerHTML = isEditMode ? 
                `<i class="fa-solid fa-cloud-arrow-up"></i> 尚未建立筆記` : 
                `<i class="fa-solid fa-eye"></i> 唯讀預覽模式`;
        } else {
            throw new Error("載入失敗");
        }
        
        noteTextarea.value = content;
        updatePreview();
    } catch (err) {
        console.error("Error loading note:", err);
        saveStatus.innerHTML = `<i class="fa-solid fa-circle-exclamation" style="color:var(--color-accent-orange)"></i> 載入筆記失敗`;
    }
}

// 保存筆記 API
async function saveNote(shotNum, content, isAuto = false) {
    if (!isEditMode) return; // 唯讀模式下不儲存
    
    try {
        saveStatus.innerHTML = isAuto ? 
            `<i class="fa-solid fa-spinner fa-spin"></i> 自動儲存中...` : 
            `<i class="fa-solid fa-spinner fa-spin"></i> 正在儲存...`;
            
        const res = await fetch("/api/save_note", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                shot_num: shotNum,
                content: content
            })
        });

        if (!res.ok) throw new Error("儲存失敗");
        const data = await res.json();
        
        if (data.status === "success") {
            saveStatus.innerHTML = isAuto ? 
                `<i class="fa-solid fa-cloud-arrow-up" style="color:hsl(140,80%,60%)"></i> 已自動儲存` : 
                `<i class="fa-solid fa-circle-check" style="color:hsl(140,80%,60%)"></i> 儲存成功`;
        }
    } catch (err) {
        console.error("Error saving note:", err);
        saveStatus.innerHTML = `<i class="fa-solid fa-triangle-exclamation" style="color:var(--color-accent-orange)"></i> 儲存失敗`;
    }
}

// 更新 Markdown 預覽
function updatePreview() {
    const rawMarkdown = noteTextarea.value;
    if (rawMarkdown.trim() === "") {
        previewContent.innerHTML = `<p class="preview-placeholder">您的分析預覽會在這裡顯示...</p>`;
    } else {
        previewContent.innerHTML = marked.parse(rawMarkdown);
    }
}

// 註責按鈕與輸入事件監聽器
function setupEventListeners() {
    // 側邊欄過濾與搜尋
    sequenceSelect.addEventListener("change", renderShotList);
    searchInput.addEventListener("input", renderShotList);
    
    // 翻頁按鈕
    btnPrevPage.addEventListener("click", () => {
        if (activeScriptPage > 1) {
            activeScriptPage--;
            renderScriptPage();
        }
    });
    
    btnNextPage.addEventListener("click", () => {
        if (metadata && activeScriptPage < metadata.screenplay.length) {
            activeScriptPage++;
            renderScriptPage();
        }
    });

    // 編輯器 Tab 切換
    tabWrite.addEventListener("click", () => {
        tabWrite.classList.add("active");
        tabPreview.classList.remove("active");
        editorWriteWrapper.classList.remove("hidden");
        editorPreviewWrapper.classList.add("hidden");
    });

    tabPreview.addEventListener("click", () => {
        tabPreview.classList.add("active");
        tabWrite.classList.remove("active");
        editorPreviewWrapper.classList.remove("hidden");
        editorWriteWrapper.classList.add("hidden");
        updatePreview();
    });

    // 儲存按鈕
    btnSave.addEventListener("click", () => {
        const shot = metadata.shots[activeShotIndex];
        saveNote(shot.shot_num, noteTextarea.value, false);
    });

    // 載入模板按鈕
    btnInsertTemplate.addEventListener("click", () => {
        if (noteTextarea.value.trim() !== "") {
            const conf = confirm("載入模板會覆蓋您目前的輸入，確定要覆蓋嗎？");
            if (!conf) return;
        }
        noteTextarea.value = ANALYSIS_TEMPLATE;
        updatePreview();
        // 觸發自動存檔
        triggerAutoSave();
    });

    // 自動儲存觸發 (Debounced)
    noteTextarea.addEventListener("input", () => {
        saveStatus.innerHTML = `<i class="fa-solid fa-pen-nib"></i> 正在輸入...`;
        triggerAutoSave();
    });

    // Lightbox modal close
    lightboxClose.addEventListener("click", () => {
        lightboxModal.style.display = "none";
    });
    
    lightboxModal.addEventListener("click", (e) => {
        if (e.target === lightboxModal) {
            lightboxModal.style.display = "none";
        }
    });
}

function triggerAutoSave() {
    if (!isEditMode) return;
    if (saveTimeout) clearTimeout(saveTimeout);
    
    saveTimeout = setTimeout(() => {
        const shot = metadata.shots[activeShotIndex];
        saveNote(shot.shot_num, noteTextarea.value, true);
    }, 2000); // 停止輸入 2 秒後自動存檔
}

// 開啟 Lightbox 放大影格
function openLightbox(src, caption) {
    lightboxModal.style.display = "block";
    lightboxImg.src = src;
    lightboxCaption.textContent = caption;
}

// 頁面載入完成後啟動
window.addEventListener("DOMContentLoaded", init);

// ==========================================================================
// 《2001 太空漫遊》逐幀分析儀表板 - 英文版前端邏輯 (JavaScript)
// ==========================================================================

let metadata = null;
let activeShotIndex = 0; // 0-based index of shots array
let activeScriptPage = 1;
let saveTimeout = null;
const isEditMode = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

// 英文視聽語言分析模板
const ANALYSIS_TEMPLATE = `# Audio-Visual Analysis Notes

## 1. Composition & Cinematography
* **Camera Movement**: [e.g., Static shot, Slow push-in, Tracking shot]
* **Depth of Field & Focal Length**: [e.g., Deep focus, Shallow focus, Wide-angle lens]
* **Compositional Aesthetics**: [e.g., One-point perspective, Rule of thirds, Symmetrical composition]

## 2. Color & Lighting Aesthetics
* **Color Palette**: [e.g., Cold blue-white cabin tone, Red warning light, High contrast black & white]
* **Lighting Design**: [e.g., High-contrast top lighting, Soft even backlighting]

## 3. Sound & Music Design
* **Music Selection**: [e.g., Ligeti - Requiem, Strauss - Blue Danube, Silence/Pure vacuum silence]
* **Sound Effects**: [e.g., Heavy breathing inside space suit, Low frequency hum of space cabin]

## 4. Editing & Script Adaptation
* **Editing Rhythm**: [e.g., Slow contemplative long take, Dynamic montage]
* **Script Comparison**: [Analyze the transformation between screenplay description and actual film frame here, such as transparent cube changed to black monolith, or deleted voiceover]
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

// Get filename based on shot number
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

// Apply read-only mode UI adjustments
function applyReadOnlyMode() {
    // Hide write and action buttons
    const tabButtons = document.querySelector(".tab-buttons");
    const editorActions = document.querySelector(".editor-actions");
    if (tabButtons) tabButtons.style.display = "none";
    if (editorActions) editorActions.style.display = "none";
    
    // Insert title
    const editorHeader = document.querySelector(".editor-header");
    if (editorHeader) {
        const titleEl = document.createElement("h3");
        titleEl.className = "section-title";
        titleEl.style.margin = "0";
        titleEl.style.fontSize = "1.1rem";
        titleEl.innerHTML = `<i class="fa-solid fa-book-open"></i> Audio-Visual Analysis Notes`;
        editorHeader.insertBefore(titleEl, editorHeader.firstChild);
    }
    
    // Hide write textarea and show preview area
    if (editorWriteWrapper) editorWriteWrapper.classList.add("hidden");
    if (editorPreviewWrapper) editorPreviewWrapper.classList.remove("hidden");
}

// 初始化應用程式
async function init() {
    if (!isEditMode) {
        applyReadOnlyMode();
    }

    try {
        console.log("Loading metadata.json...");
        const response = await fetch("metadata.json");
        if (!response.ok) throw new Error("Unable to read metadata.json");
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
        shotListEl.innerHTML = `<div class="loading-spinner" style="color:var(--color-accent-orange)"><i class="fa-solid fa-triangle-exclamation"></i> Loading failed: ${err.message}</div>`;
    }
}

// 側邊欄鏡頭列表渲染與過濾
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
        shotListEl.innerHTML = `<div class="loading-spinner"><i class="fa-solid fa-magnifying-glass"></i> No matching shots found</div>`;
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
                <div class="shot-item-title">Shot #${shot.shot_num}</div>
                <div class="shot-item-meta">
                    <span>${shot.start_timecode}</span>
                    <span>${shot.duration_seconds.toFixed(1)}s</span>
                </div>
            </div>
        `;
        
        item.addEventListener("click", () => {
            // 移除舊的 active 項目樣式
            const currentActive = shotListEl.querySelector(".shot-item.active");
            if (currentActive) currentActive.classList.remove("active");
            
            // 將目前項目設為 active
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
    currentShotTitle.textContent = `Shot #${shot.shot_num}`;
    currentShotSeq.textContent = shot.sequence_name;
    currentShotTimecode.textContent = `${shot.start_timecode} - ${shot.end_timecode}`;
    currentShotDuration.textContent = `${shot.duration_seconds.toFixed(2)} seconds`;
    
    // 2. 渲染影格 (每鏡頭 3 張圖片)
    framesGrid.innerHTML = "";
    shot.images.forEach((imgName, fIdx) => {
        const card = document.createElement("div");
        card.className = "frame-card";
        card.innerHTML = `
            <img src="${imgName}" alt="Shot #${shot.shot_num} Frame ${fIdx+1}">
            <div class="frame-badge">Frame ${fIdx+1}</div>
        `;
        
        // 點擊影格放大 (Lightbox 效果)
        card.addEventListener("click", () => {
            openLightbox(imgName, `Shot #${shot.shot_num} - Frame ${fIdx+1} (${shot.sequence_name})`);
        });
        
        framesGrid.appendChild(card);
    });
    
    // 3. 載入對照劇本頁數
    activeScriptPage = shot.page_start;
    renderScriptPage();
    
    // 4. 載入並渲染對應的寫作筆記 (向 8001 連接埠的英文版 API 請求)
    await loadNote(shot.shot_num);
}

// 渲染劇本視窗中的指定頁面文字
function renderScriptPage() {
    const shot = metadata.shots[activeShotIndex];
    scriptPageRange.textContent = activeScriptPage;
    
    const pageObj = metadata.screenplay.find(p => p.page_num === activeScriptPage);
    if (pageObj) {
        // 高亮劇本中的關鍵標題與角色名稱
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
        screenplayBox.innerHTML = `<div class="script-placeholder">No text on this screenplay page</div>`;
    }
}

// 載入筆記 API
async function loadNote(shotNum) {
    try {
        saveStatus.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Loading notes...`;
        
        const filename = getNoteFilename(shotNum);
        // Use relative path and cache buster
        const res = await fetch(`analysis_notes_en/${filename}?t=${Date.now()}`);
        
        let content = "";
        if (res.ok) {
            content = await res.text();
            saveStatus.innerHTML = isEditMode ? 
                `<i class="fa-solid fa-cloud-arrow-up"></i> Notes loaded` : 
                `<i class="fa-solid fa-eye"></i> Read-only mode`;
        } else if (res.status === 404) {
            content = "*(No analysis note for this shot yet)*";
            saveStatus.innerHTML = isEditMode ? 
                `<i class="fa-solid fa-cloud-arrow-up"></i> No note created yet` : 
                `<i class="fa-solid fa-eye"></i> Read-only mode`;
        } else {
            throw new Error("Load failed");
        }
        
        noteTextarea.value = content;
        updatePreview();
    } catch (err) {
        console.error("Error loading note:", err);
        saveStatus.innerHTML = `<i class="fa-solid fa-circle-exclamation" style="color:var(--color-accent-orange)"></i> Failed to load notes`;
    }
}

// 保存筆記 API
async function saveNote(shotNum, content, isAuto = false) {
    if (!isEditMode) return; // Do not save in read-only mode
    
    try {
        saveStatus.innerHTML = isAuto ? 
            `<i class="fa-solid fa-spinner fa-spin"></i> Auto-saving...` : 
            `<i class="fa-solid fa-spinner fa-spin"></i> Saving...`;
            
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

        if (!res.ok) throw new Error("Save failed");
        const data = await res.json();
        
        if (data.status === "success") {
            saveStatus.innerHTML = isAuto ? 
                `<i class="fa-solid fa-cloud-arrow-up" style="color:hsl(140,80%,60%)"></i> Auto-saved` : 
                `<i class="fa-solid fa-circle-check" style="color:hsl(140,80%,60%)"></i> Saved successfully`;
        }
    } catch (err) {
        console.error("Error saving note:", err);
        saveStatus.innerHTML = `<i class="fa-solid fa-triangle-exclamation" style="color:var(--color-accent-orange)"></i> Saving failed`;
    }
}

// 更新 Markdown 即時預覽
function updatePreview() {
    const rawMarkdown = noteTextarea.value;
    if (rawMarkdown.trim() === "") {
        previewContent.innerHTML = `<p class="preview-placeholder">Your analysis preview will be displayed here...</p>`;
    } else {
        previewContent.innerHTML = marked.parse(rawMarkdown);
    }
}

// 註冊所有按鈕與輸入事件監聽器
function setupEventListeners() {
    // 側邊欄過濾與搜尋
    sequenceSelect.addEventListener("change", renderShotList);
    searchInput.addEventListener("input", renderShotList);
    
    // 劇本翻頁按鈕
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

    // 編輯器分頁切換 (寫作與預覽)
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

    // 手動儲存按鈕
    btnSave.addEventListener("click", () => {
        const shot = metadata.shots[activeShotIndex];
        saveNote(shot.shot_num, noteTextarea.value, false);
    });

    // 載入英文分析模板按鈕
    btnInsertTemplate.addEventListener("click", () => {
        if (noteTextarea.value.trim() !== "") {
            const conf = confirm("Loading the template will overwrite your current input. Are you sure you want to proceed?");
            if (!conf) return;
        }
        noteTextarea.value = ANALYSIS_TEMPLATE;
        updatePreview();
        // 觸發自動存檔
        triggerAutoSave();
    });

    // 鍵入字元時自動存檔 (防抖動 Debounced)
    noteTextarea.addEventListener("input", () => {
        saveStatus.innerHTML = `<i class="fa-solid fa-pen-nib"></i> Typing...`;
        triggerAutoSave();
    });

    // Lightbox modal 關閉事件
    lightboxClose.addEventListener("click", () => {
        lightboxModal.style.display = "none";
    });
    
    lightboxModal.addEventListener("click", (e) => {
        if (e.target === lightboxModal) {
            lightboxModal.style.display = "none";
        }
    });
}

// 停止輸入 2 秒後自動觸發存檔
function triggerAutoSave() {
    if (!isEditMode) return;
    if (saveTimeout) clearTimeout(saveTimeout);
    
    saveTimeout = setTimeout(() => {
        const shot = metadata.shots[activeShotIndex];
        saveNote(shot.shot_num, noteTextarea.value, true);
    }, 2000);
}

// 開啟 Lightbox 放大影格圖片
function openLightbox(src, caption) {
    lightboxModal.style.display = "block";
    lightboxImg.src = src;
    lightboxCaption.textContent = caption;
}

// 頁面載入完成後啟動初始化
window.addEventListener("DOMContentLoaded", init);

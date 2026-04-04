const API_URL =
    "https://kimhoancamau.vn/web_erp/web_erpv3/phpjquery/index.php?apikey=0123kSKmsdfrtl234sd&m=home_index&act=idx&nod=reload";

const STORAGE_KEYS = {
    PRICES: "goldPriceData",
    LAST_TIME: "goldPriceLastTime",
    AUTO_UPDATE: "goldPriceAutoUpdate",
};

let autoUpdateTimer = null;
let isAutoUpdateEnabled = false;
const activeAutoRequestControllers = new Set();

function updateCurrentTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const seconds = now.getSeconds().toString().padStart(2, "0");
    const day = now.getDate().toString().padStart(2, "0");
    const month = (now.getMonth() + 1).toString().padStart(2, "0");
    const year = now.getFullYear();

    const weekdays = [
        "Chủ Nhật",
        "Thứ Hai",
        "Thứ Ba",
        "Thứ Tư",
        "Thứ Năm",
        "Thứ Sáu",
        "Thứ Bảy",
    ];

    const dateElement = document.getElementById("currentDate");
    const timeElement = document.getElementById("currentTime");

    if (dateElement) {
        dateElement.textContent = `📅 ${weekdays[now.getDay()]}, ${day}/${month}/${year}`;
    }

    if (timeElement) {
        timeElement.textContent = `${getTimeIcon(now.getHours())} ${hours}:${minutes}:${seconds}`;
    }
}

function getTimeIcon(hour) {
    if (hour >= 6 && hour < 12) return "🌅";
    if (hour >= 12 && hour < 18) return "☀️";
    if (hour >= 18 && hour < 22) return "🌆";
    return "🌙";
}

function formatDisplayPrice(value) {
    const numberValue = Number(value || 0);
    if (!Number.isFinite(numberValue)) return "0";
    return numberValue.toLocaleString("vi-VN");
}

function rowsToTableData(rows) {
    return {
        "row1-col1": rows[0].quality,
        "row1-col2": formatDisplayPrice(rows[0].market_buy),
        "row1-col3": formatDisplayPrice(rows[0].market_sell),
        "row2-col1": rows[1].quality,
        "row2-col2": formatDisplayPrice(rows[1].market_buy),
        "row2-col3": formatDisplayPrice(rows[1].market_sell),
        "row3-col1": rows[2].quality,
        "row3-col2": formatDisplayPrice(rows[2].market_buy),
        "row3-col3": formatDisplayPrice(rows[2].market_sell),
        "row4-col1": rows[3].quality,
        "row4-col2": formatDisplayPrice(rows[3].market_buy),
        "row4-col3": formatDisplayPrice(rows[3].market_sell),
    };
}

function updateTableData(data) {
    Object.keys(data).forEach((key) => {
        const element = document.getElementById(key);
        if (!element) return;

        const oldValue = element.textContent;
        const newValue = data[key];

        if (oldValue !== newValue) {
            element.style.background = "rgba(255, 215, 0, 0.5)";
            element.style.transform = "scale(1.05)";
            element.style.transition = "all 0.3s ease";
            element.textContent = newValue;

            setTimeout(() => {
                element.style.background = "";
                element.style.transform = "scale(1)";
            }, 500);
        } else {
            element.textContent = newValue;
        }
    });
}

function showNotification(message, type = "info") {
    const notification = document.createElement("div");

    const backgroundColor =
        type === "success"
            ? "linear-gradient(135deg, #4CAF50, #45a049)"
            : type === "error"
              ? "linear-gradient(135deg, #f44336, #d32f2f)"
              : "linear-gradient(135deg, #2196F3, #1976D2)";

    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: ${backgroundColor};
        color: white;
        padding: 12px 24px;
        border-radius: 25px;
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
        z-index: 3000;
        font-weight: bold;
        font-size: 14px;
        opacity: 0;
        transform: translateX(100px);
        transition: all 0.4s ease;
        max-width: 360px;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.opacity = "1";
        notification.style.transform = "translateX(0)";
    }, 100);

    setTimeout(() => {
        notification.style.opacity = "0";
        notification.style.transform = "translateX(100px)";
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 2800);
}

function parseApiTextResponse(rawText) {
    const separatorIndex = rawText.indexOf("##");
    const jsonText = separatorIndex >= 0 ? rawText.slice(separatorIndex + 2) : rawText;
    return JSON.parse(jsonText);
}

function normalizeRowsFromApi(lPrice = []) {
    const requiredQualities = ["980", "960", "680", "610"];

    return requiredQualities.map((quality) => {
        const item = lPrice.find((entry) => String(entry.quality) === quality);
        return {
            quality,
            market_buy: item?.market_buy || "0",
            market_sell: item?.market_sell || "0",
        };
    });
}

async function fetchLatestGoldData({ signal } = {}) {
    const response = await fetch(API_URL, {
        method: "POST",
        mode: "cors",
        signal,
        headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        },
        body: "",
    });

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }

    const rawText = await response.text();
    const parsed = parseApiTextResponse(rawText);

    if (!parsed || parsed.status !== 200 || !parsed?.data?.lPrice) {
        throw new Error("Du lieu API khong hop le");
    }

    return {
        rows: normalizeRowsFromApi(parsed.data.lPrice),
        time: parsed?.data?.time || "",
    };
}

function saveToLocal(rows, timeText) {
    localStorage.setItem(STORAGE_KEYS.PRICES, JSON.stringify(rows));
    localStorage.setItem(STORAGE_KEYS.LAST_TIME, timeText || "");
}

function loadFromLocal() {
    try {
        const savedRows = localStorage.getItem(STORAGE_KEYS.PRICES);
        if (!savedRows) return false;

        const rows = JSON.parse(savedRows);
        if (!Array.isArray(rows) || rows.length < 4) return false;

        updateTableData(rowsToTableData(rows));
        return true;
    } catch (error) {
        return false;
    }
}

async function updatePricesFromApi({ silent = false, source = "manual" } = {}) {
    if (source === "auto" && !isAutoUpdateEnabled) {
        return;
    }

    const controller = new AbortController();
    if (source === "auto") {
        activeAutoRequestControllers.add(controller);
    }

    try {
        const result = await fetchLatestGoldData({ signal: controller.signal });

        if (source === "auto" && !isAutoUpdateEnabled) {
            return;
        }

        updateTableData(rowsToTableData(result.rows));
        saveToLocal(result.rows, result.time);

        if (!silent) {
            const timeText = result.time ? ` (${result.time})` : "";
            console.log(`✅ Cập nhật giá từ API thành công${timeText}`, "success");
        }
    } catch (error) {
        if (error?.name === "AbortError") {
            return;
        }
        if (!silent) {
            showNotification("❌ Không thể cập nhật giá từ API", "error");
        }
    } finally {
        if (source === "auto") {
            activeAutoRequestControllers.delete(controller);
        }
    }
}

function cancelPendingAutoUpdateJobs() {
    if (autoUpdateTimer) {
        clearInterval(autoUpdateTimer);
        autoUpdateTimer = null;
    }

    activeAutoRequestControllers.forEach((controller) => {
        controller.abort();
    });
    activeAutoRequestControllers.clear();
}

function setAutoUpdateEnabled(enabled, { silent = false } = {}) {
    localStorage.setItem(STORAGE_KEYS.AUTO_UPDATE, String(enabled));
    isAutoUpdateEnabled = enabled;

    cancelPendingAutoUpdateJobs();

    if (enabled) {
        autoUpdateTimer = setInterval(() => {
            if (!isAutoUpdateEnabled) return;
            updatePricesFromApi({ silent: true, source: "auto" });
        }, 2000);
        if (!silent) showNotification("🔄 Auto update: Bật", "info");
    } else if (!silent) {
        showNotification("⏸️ Auto update: Tắt", "info");
    }
}

function getSavedAutoUpdateState() {
    return localStorage.getItem(STORAGE_KEYS.AUTO_UPDATE) === "true";
}

function openModal() {
    const modal = document.getElementById("priceModal");
    if (!modal) return;

    fillModalFormFromTable();
    modal.style.display = "block";
}

function closeModal() {
    const modal = document.getElementById("priceModal");
    if (!modal) return;
    modal.style.display = "none";
}

function fillModalFormFromTable() {
    for (let i = 1; i <= 4; i += 1) {
        const qualityCell = document.getElementById(`row${i}-col1`);
        const buyCell = document.getElementById(`row${i}-col2`);
        const sellCell = document.getElementById(`row${i}-col3`);

        const qualityInput = document.getElementById(`row${i}-col1-input`);
        const buyInput = document.getElementById(`row${i}-col2-input`);
        const sellInput = document.getElementById(`row${i}-col3-input`);

        if (qualityInput && qualityCell) qualityInput.value = qualityCell.textContent.trim();
        if (buyInput && buyCell) buyInput.value = buyCell.textContent.trim();
        if (sellInput && sellCell) sellInput.value = sellCell.textContent.trim();
    }

    const autoToggle = document.getElementById("autoUpdateToggle");
    if (autoToggle) {
        autoToggle.checked = getSavedAutoUpdateState();
    }
}

function sanitizePriceInput(rawValue) {
    const digits = String(rawValue || "").replace(/[^\d]/g, "");
    return digits.length > 0 ? digits : "0";
}

function saveManualData() {
    const rows = [];

    for (let i = 1; i <= 4; i += 1) {
        const quality = document.getElementById(`row${i}-col1-input`)?.value.trim() || "";
        const marketBuyRaw = document.getElementById(`row${i}-col2-input`)?.value || "";
        const marketSellRaw = document.getElementById(`row${i}-col3-input`)?.value || "";

        if (!quality || !marketBuyRaw.trim() || !marketSellRaw.trim()) {
            showNotification("❌ Vui lòng nhập đủ 4 dòng giá", "error");
            return;
        }

        rows.push({
            quality,
            market_buy: sanitizePriceInput(marketBuyRaw),
            market_sell: sanitizePriceInput(marketSellRaw),
        });
    }

    updateTableData(rowsToTableData(rows));
    saveToLocal(rows, `Thủ công ${new Date().toLocaleString("vi-VN")}`);
    closeModal();
    showNotification("✅ Đã lưu giá thủ công", "success");
}

document.addEventListener("DOMContentLoaded", async () => {
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);

    const manualButton = document.getElementById("manualUpdateBtn");
    const closeModalBtn = document.getElementById("closeModalBtn");
    const cancelModalBtn = document.getElementById("cancelModalBtn");
    const saveManualBtn = document.getElementById("saveManualBtn");
    const autoToggle = document.getElementById("autoUpdateToggle");
    const modal = document.getElementById("priceModal");

    if (manualButton) manualButton.addEventListener("click", openModal);
    if (closeModalBtn) closeModalBtn.addEventListener("click", closeModal);
    if (cancelModalBtn) cancelModalBtn.addEventListener("click", closeModal);
    if (saveManualBtn) saveManualBtn.addEventListener("click", saveManualData);

    if (modal) {
        modal.addEventListener("click", (event) => {
            if (event.target === modal) closeModal();
        });
    }

    if (autoToggle) {
        autoToggle.checked = getSavedAutoUpdateState();
        autoToggle.addEventListener("change", (event) => {
            setAutoUpdateEnabled(event.target.checked);
        });
    }

    loadFromLocal();
    await updatePricesFromApi({ silent: false });

    if (getSavedAutoUpdateState()) {
        setAutoUpdateEnabled(true, { silent: true });
    }
});

// Biến lưu dữ liệu hiện tại
let currentData = {};

// Hàm mở modal
function openModal() {
    const modal = document.getElementById("priceModal");
    modal.style.display = "block";

    // Load dữ liệu hiện tại vào form
    loadCurrentDataToForm();

    // Thêm event listener để đóng modal khi click bên ngoài
    modal.onclick = function (event) {
        if (event.target === modal) {
            closeModal();
        }
    };
}

// Hàm đóng modal
function closeModal() {
    const modal = document.getElementById("priceModal");
    modal.style.display = "none";
}

// Hàm load dữ liệu hiện tại vào form
function loadCurrentDataToForm() {
    Object.keys(currentData).forEach((key) => {
        const input = document.getElementById(key + "-input");
        if (input) {
            input.value = currentData[key];
        }
    });
}

// Hàm lưu dữ liệu
async function saveData() {
    try {
        // Thu thập dữ liệu từ form
        const newData = {};
        const inputs = document.querySelectorAll("#priceUpdateForm input");

        inputs.forEach((input) => {
            const key = input.id.replace("-input", "");
            newData[key] = input.value.trim();
        });

        // Validate dữ liệu
        if (!validateData(newData)) {
            showDataLoadNotification("❌ Vui lòng điền đầy đủ thông tin!", "error");
            return;
        }

        // Hiển thị loading
        showDataLoadNotification("⏳ Đang lưu dữ liệu...", "info");

        // Gửi dữ liệu lên server (GitHub Pages doesn't support PHP, so we'll use localStorage)
        // const response = await fetch("save-data.php", {
        //     method: "POST",
        //     headers: {
        //         "Content-Type": "application/json",
        //     },
        //     body: JSON.stringify(newData),
        // });

        // if (response.ok) {
        //     // Cập nhật dữ liệu local
        //     currentData = newData;
        //     updateTableData(newData);

        //     // Đóng modal
        //     closeModal();

        //     // Hiển thị thông báo thành công
        //     showDataLoadNotification("✅ Dữ liệu đã được lưu thành công!", "success");

        //     console.log("💾 Dữ liệu đã được lưu:", newData);
        // } else {
        //     throw new Error("Không thể lưu dữ liệu");
        // }

        // For GitHub Pages - save to localStorage only
        localStorage.setItem("goldPriceData", JSON.stringify(newData));
        currentData = newData;
        updateTableData(newData);
        closeModal();
        showDataLoadNotification("✅ Dữ liệu đã được lưu thành công!", "success");
        console.log("💾 Dữ liệu đã được lưu:", newData);
    } catch (error) {
        console.error("❌ Lỗi khi lưu dữ liệu:", error);

        // Fallback: Lưu vào localStorage
        try {
            localStorage.setItem("goldPriceData", JSON.stringify(newData));
            currentData = newData;
            updateTableData(newData);
            closeModal();
            showDataLoadNotification("✅ Dữ liệu đã được lưu!", "success");
        } catch (localError) {
            showDataLoadNotification("❌ Không thể lưu dữ liệu!", "error");
        }
    }
}

// Hàm validate dữ liệu
function validateData(data) {
    const requiredFields = [
        "row1-col1",
        "row1-col2",
        "row1-col3",
        "row2-col1",
        "row2-col2",
        "row2-col3",
        "row3-col1",
        "row3-col2",
        "row3-col3",
        "row4-col1",
        "row4-col2",
        "row4-col3",
    ];

    return requiredFields.every((field) => data[field] && data[field].length > 0);
}
// Hàm load dữ liệu từ JSON
async function loadGoldPriceData() {
    try {
        // Thử load từ localStorage trước
        const localData = localStorage.getItem("goldPriceData");
        if (localData) {
            const data = JSON.parse(localData);
            currentData = data;
            updateTableData(data);
            showDataLoadNotification("📱 Đã load dữ liệu từ bộ nhớ tạm!", "info");
            console.log("📱 Dữ liệu từ localStorage:", data);
            return;
        }

        // Nếu không có localStorage, load từ JSON
        const response = await fetch("data.json");
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        // Lưu vào biến global và cập nhật bảng
        currentData = data;
        updateTableData(data);

        // Hiển thị thông báo thành công
        showDataLoadNotification("✅ Dữ liệu đã được tải thành công!", "success");

        console.log("📊 Dữ liệu giá vàng đã được load:", data);
    } catch (error) {
        console.error("❌ Lỗi khi load dữ liệu:", error);
        showDataLoadNotification("❌ Không thể tải dữ liệu!", "error");
    }
}

// Hàm cập nhật dữ liệu vào bảng
function updateTableData(data) {
    // Duyệt qua tất cả các key trong JSON
    Object.keys(data).forEach((key) => {
        const element = document.getElementById(key);
        if (element) {
            const oldValue = element.textContent;
            const newValue = data[key];

            // Kiểm tra nếu giá trị thay đổi
            if (oldValue !== newValue) {
                // Tạo hiệu ứng khi cập nhật
                element.style.background = "rgba(255, 215, 0, 0.5)";
                element.style.transform = "scale(1.05)";
                element.style.transition = "all 0.3s ease";

                // Cập nhật giá trị
                element.textContent = newValue;

                // Trả về trạng thái bình thường sau 500ms
                setTimeout(() => {
                    element.style.background = "";
                    element.style.transform = "scale(1)";
                }, 500);
            } else {
                // Chỉ cập nhật giá trị nếu không thay đổi
                element.textContent = newValue;
            }
        }
    });
}

// Hàm hiển thị thông báo load dữ liệu
function showDataLoadNotification(message, type) {
    const notification = document.createElement("div");
    notification.textContent = message;

    const backgroundColor =
        type === "success" ? "linear-gradient(135deg, #4CAF50, #45a049)" : "linear-gradient(135deg, #f44336, #d32f2f)";

    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: ${backgroundColor};
        color: white;
        padding: 12px 24px;
        border-radius: 25px;
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
        z-index: 1000;
        font-weight: bold;
        font-size: 14px;
        opacity: 0;
        transform: translateX(100px);
        transition: all 0.4s ease;
        max-width: 300px;
    `;

    document.body.appendChild(notification);

    // Hiển thị
    setTimeout(() => {
        notification.style.opacity = "1";
        notification.style.transform = "translateX(0)";
    }, 100);

    // Ẩn sau 3 giây
    setTimeout(() => {
        notification.style.opacity = "0";
        notification.style.transform = "translateX(100px)";
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 400);
    }, 3000);
}

// Hàm refresh dữ liệu
function refreshGoldPrices() {
    showDataLoadNotification("🔄 Đang cập nhật dữ liệu...", "info");
    loadGoldPriceData();
}
function updateCurrentTime() {
    const now = new Date();

    // Lấy giờ, phút, giây
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const seconds = now.getSeconds().toString().padStart(2, "0");

    // Lấy ngày, tháng, năm
    const day = now.getDate().toString().padStart(2, "0");
    const month = (now.getMonth() + 1).toString().padStart(2, "0");
    const year = now.getFullYear();

    // Lấy thứ trong tuần
    const weekdays = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
    const weekday = weekdays[now.getDay()];

    // Tạo icon động theo giờ
    const timeIcon = getTimeIcon(parseInt(hours));

    // Tạo chuỗi ngày và giờ riêng biệt (định dạng 24 giờ)
    const dateString = `📅 ${weekday}, ${day}/${month}/${year}`;
    const timeString = `${timeIcon} ${hours}:${minutes}:${seconds}`;

    // Cập nhật nội dung cho cả hai elements
    const dateElement = document.getElementById("currentDate");
    const timeElement = document.getElementById("currentTime");

    if (dateElement) {
        dateElement.textContent = dateString;
    }

    if (timeElement) {
        timeElement.textContent = timeString;
    }
}

// Hàm lấy icon theo giờ
function getTimeIcon(hour) {
    if (hour >= 6 && hour < 12) return "🌅"; // Sáng
    if (hour >= 12 && hour < 18) return "☀️"; // Chiều
    if (hour >= 18 && hour < 22) return "🌆"; // Tối
    return "🌙"; // Đêm
}

// Khởi tạo khi trang web load
document.addEventListener("DOMContentLoaded", function () {
    // Load dữ liệu giá vàng ngay lập tức
    loadGoldPriceData();

    // Cập nhật thời gian ngay lập tức
    updateCurrentTime();

    // Cập nhật mỗi giây
    setInterval(() => {
        updateCurrentTime();
    }, 1000);

    console.log("⏰ Real-time clock đã được khởi tạo!");
    console.log("📊 Hệ thống cập nhật giá đã sẵn sàng!");
});

// Hàm format số với dấu phẩy (có thể dùng cho giá vàng sau này)
function formatPrice(price) {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// Hàm hiển thị thông báo cập nhật
function showUpdateNotification() {
    const notification = document.createElement("div");
    notification.textContent = "✅ Đã cập nhật thời gian!";
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #4CAF50, #45a049);
        color: white;
        padding: 10px 20px;
        border-radius: 20px;
        box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
        z-index: 1000;
        font-weight: bold;
        opacity: 0;
        transform: translateX(100px);
        transition: all 0.3s ease;
    `;

    document.body.appendChild(notification);

    // Hiển thị
    setTimeout(() => {
        notification.style.opacity = "1";
        notification.style.transform = "translateX(0)";
    }, 100);

    // Ẩn sau 2 giây
    setTimeout(() => {
        notification.style.opacity = "0";
        notification.style.transform = "translateX(100px)";
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 2000);
}

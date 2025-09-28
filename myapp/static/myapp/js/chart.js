// ======================= Chart 1: Doanh số theo Mặt hàng =======================
document.addEventListener("DOMContentLoaded", function () {
    const raw = JSON.parse(document.getElementById("chart12-data").textContent);

    // Map dữ liệu
    const doanhso = raw.map(d => ({
        label: `[${d.code}] ${d.name}`,
        group: d.group_name,  // lấy group_name cho dễ đọc
        group_code: d.group_code,
        sales: +d.total_sales,
        qty: +d.total_qty
    })).sort((a,b) => b.sales - a.sales);

    // Tạo bảng màu theo group_code
    const colorsByGroup = {};
    const colorPalette = ["#f94144","#f3722c","#f8961e","#f9844a","#90be6d","#43aa8b","#577590"];
    doanhso.forEach(item => {
        if (!colorsByGroup[item.group_code]) {
            colorsByGroup[item.group_code] = colorPalette[Object.keys(colorsByGroup).length % colorPalette.length];
        }
    });

    const ctx = document.getElementById("chart1").getContext("2d");
    new Chart(ctx, {
        type: "bar",
        data: {
            labels: doanhso.map(d => d.label),
            datasets: [{
                label: "Doanh số (triệu VND)",
                data: doanhso.map(d => (d.sales/1e6).toFixed(1)),
                backgroundColor: doanhso.map(d => colorsByGroup[d.group_code])
            }]
        },
        options: {
            indexAxis: "y",
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: "DOANH SỐ BÁN HÀNG THEO MẶT HÀNG",
                    font: { size: 18, weight: "bold" }
                },
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: ctx => {
                            const item = doanhso[ctx.dataIndex];
                            return [
                                `Doanh số: ${ctx.parsed.x} triệu VND`,
                                `SL: ${item.qty.toLocaleString()} SKUs`,
                                `Nhóm: ${item.group}`
                            ];
                        }
                    }
                }
            },
            scales: {
                x: { ticks: { callback:v => v + " triệu VND" }, beginAtZero:true },
                y: { ticks: { autoSkip:false } }
            }
        }
    });
});

// ======================= Chart 2: Doanh số bán hàng theo Nhóm hàng =======================
document.addEventListener("DOMContentLoaded", function () {
    const raw = JSON.parse(document.getElementById("chart12-data").textContent);

    // Gom theo group_code
    const grouped = {};
    raw.forEach(d => {
        const key = `[${d.group_code}] ${d.group_name||""}`;
        if(!grouped[key]) grouped[key] = {sum:0, qty:0, code:d.group_code};
        grouped[key].sum += +d.total_sales;
        grouped[key].qty += +d.total_qty;
    });

    const arr = Object.entries(grouped)
        .map(([g,v]) => ({group:g, code:v.code, sum:v.sum, qty:v.qty}))
        .sort((a,b)=>b.sum - a.sum);

    // Bảng màu 
    const colorsByGroup = {};
    const colorPalette = ["#f94144","#f3722c","#f8961e","#f9844a","#90be6d","#43aa8b","#577590"];
    arr.forEach(item => {
        if (!colorsByGroup[item.code]) {
            colorsByGroup[item.code] = colorPalette[Object.keys(colorsByGroup).length % colorPalette.length];
        }
    });

    const ctx = document.getElementById("chart2").getContext("2d");
    new Chart(ctx, {
        type: "bar",
        data: {
            labels: arr.map(d => d.group),
            datasets: [{
                label: "Doanh số (triệu VND)",
                data: arr.map(d => (d.sum/1e6).toFixed(1)),
                backgroundColor: arr.map(d => colorsByGroup[d.code])
            }]
        },
        options: {
            indexAxis: "y",
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display:false },
                tooltip: {
                    callbacks: {
                        label: (ctx) => {
                            const item = arr[ctx.dataIndex];
                            return [
                                `Doanh số: ${ctx.parsed.x} triệu VND`,
                                `SL: ${item.qty.toLocaleString()} SKUs`
                            ];
                        }
                    }
                },
                title:{
                    display:true,
                    text:"DOANH SỐ BÁN HÀNG THEO NHÓM HÀNG",
                    font:{ size:18, weight:"bold" }
                }
            },
            scales: {
                x: { ticks: { callback:v => v + " triệu VND" }, beginAtZero:true },
                y: { ticks:{ autoSkip:false } }
            }
        }
    });
});

////////////////////chart3//////////////////////////////////////////////////////////////////
document.addEventListener("DOMContentLoaded", function () {
    const raw = JSON.parse(document.getElementById("chart3-data").textContent);

    // Gom nhóm theo tháng (nếu QuerySet đã group sẵn thì không cần d3.rollups)
    const grouped = raw.map(d => [d.month, {
        sum: d.total_sales,
        qty: d.total_qty
    }]).sort((a,b) => d3.ascending(+a[0], +b[0]));

    const labels = grouped.map(d => `Tháng ${String(d[0]).padStart(2,'0')}`);
    const dataSales = grouped.map(d => +(d[1].sum / 1e6).toFixed(1));
    const dataQty   = grouped.map(d => d[1].qty);

    const ctx = document.getElementById("chart3").getContext("2d");
    new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: "Doanh số (triệu VND)",
                data: dataSales,
                backgroundColor: [
                    "#4dc9f6","#f67019","#f53794","#537bc4",
                    "#acc236","#166a8f","#00a950","#58595b",
                    "#8549ba","#e6194b","#3cb44b","#ffe119"
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: (ctx) => {
                            const qty = dataQty[ctx.dataIndex].toLocaleString();
                            return [
                                `Doanh số: ${ctx.parsed.y} triệu VND`,
                                `SL: ${qty} SKUs`];
                        }
                    }
                },
                legend: { display: false },
                title: {
                    display: true,
                    text: "DOANH SỐ BÁN HÀNG THEO THÁNG",
                    padding: { top: 10, bottom: 30 },
                    font: { size: 18, weight: "bold" }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { callback: v => v + " triệu VND" },
                    title: { display: true, text: "Doanh số" }
                },
                x: { title: { display: true, text: "Tháng" } }
            }
        }
    });
});

//////////////////// chart4 ////////////////////////////////////////////////////////////////
document.addEventListener("DOMContentLoaded", function () {
    const raw = JSON.parse(document.getElementById("chart4-data").textContent);

    const labels = raw.map(d => d.day);
    const dataSales = raw.map(d => +d.avgValue.toFixed(1));
    const dataQty   = raw.map(d => d.avgQty);

    const ctx = document.getElementById("chart4").getContext("2d");
    new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: "Doanh số TB (triệu VND)",
                data: dataSales,
                backgroundColor: [
                    "#4dc9f6","#f67019","#f53794","#537bc4",
                    "#acc236","#166a8f","#00a950"
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: (ctx) => {
                            const qty = dataQty[ctx.dataIndex].toLocaleString();
                            return [
                                `Doanh số TB: ${ctx.parsed.y} triệu VND`,
                                `SL TB: ${qty} SKUs`
                            ];
                        }
                    }
                },
                legend: { display: false },
                title: {
                    display: true,
                    text: "DOANH SỐ TRUNG BÌNH THEO NGÀY TRONG TUẦN",
                    padding: { top: 10, bottom: 30 },
                    font: { size: 18, weight: "bold" }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { callback: v => v + " triệu VND" },
                    title: { display: true, text: "Doanh số TB" }
                },
            }
        }
    });
});
//////////////////// chart5 ////////////////////////////////////////////////////////////////
document.addEventListener("DOMContentLoaded", function () {
    const raw = JSON.parse(document.getElementById("chart5-data").textContent);

    const labels = raw.map(d => d.day);  // Ngày 01, Ngày 02, ...
    const dataSales = raw.map(d => +d.avgValue.toFixed(1));
    const dataQty   = raw.map(d => d.avgQty);

    const ctx = document.getElementById("chart5").getContext("2d");
    new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: "Doanh số TB (triệu VND)",
                data: dataSales,
                backgroundColor: labels.map((_, i) =>
                    `hsl(${(i * 360 / labels.length)}, 70%, 55%)`
                )
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: (ctx) => {
                            const qty = dataQty[ctx.dataIndex].toLocaleString();
                            return [
                                `Doanh số TB: ${ctx.parsed.y} triệu VND`,
                                `SL TB: ${qty} SKUs`
                            ];
                        }
                    }
                },
                legend: { display: false },
                title: {
                    display: true,
                    text: "DOANH SỐ BÁN HÀNG TRUNG BÌNH THEO NGÀY TRONG THÁNG",
                    padding: { top: 10, bottom: 30 },
                    font: { size: 18, weight: "bold" }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { callback: v => v + " triệu VND" },
                    title: { display: true, text: "Doanh số TB" }
                },
                x: {
                    ticks: { maxRotation: 0, minRotation: 0 }, // giữ ngang
                }
            }
        }
    });
});
//////////////////// chart6 ////////////////////////////////////////////////////////////////
document.addEventListener("DOMContentLoaded", function () {
    const raw = JSON.parse(document.getElementById("chart6-data").textContent);

    const labels = raw.map(d => d.range);  
    const dataSales = raw.map(d => +(d.avgValue / 1000).toFixed(0));  // nghìn VND (K)
    const dataQty   = raw.map(d => d.avgQty);

    const ctx = document.getElementById("chart6").getContext("2d");
    new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: "Doanh thu TB",
                data: dataSales,
                backgroundColor: labels.map((_, i) =>
                    `hsl(${(i * 360 / labels.length)}, 70%, 55%)`
                )
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: (ctx) => {
                            const qty = dataQty[ctx.dataIndex].toLocaleString();
                            return [
                                `Doanh thu TB: ${ctx.parsed.y} VND`,
                                `SL TB: ${qty} SKUs`
                            ];
                        }
                    }
                },
                legend: { display: false },
                title: {
                    display: true,
                    text: "DOANH SỐ BÁN HÀNG TRUNG BÌNH THEO KHUNG GIỜ",
                    padding: { top: 10, bottom: 30 },
                    font: { size: 18, weight: "bold" }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { callback: v => v + " K" },
                    title: { display: true, text: "Doanh thu TB" }
                },
                x: {
                    ticks: { maxRotation: 0, minRotation: 0 }, // giữ ngang 
                }
            }
        }
    });
});
//////////////////// chart7 ////////////////////////////////////////////////////////////////
document.addEventListener("DOMContentLoaded", function () {
    const raw = JSON.parse(document.getElementById("chart7-data").textContent);

    const labels = raw.map(d => d.group);
    const dataProb = raw.map(d => +(d.prob * 100).toFixed(1));  // %
    const dataOrders = raw.map(d => d.orders);

    const ctx = document.getElementById("chart7").getContext("2d");
    new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: "Xác suất bán hàng",
                data: dataProb,
                backgroundColor: labels.map((_, i) =>
                    `hsl(${(i * 360 / labels.length)}, 70%, 55%)`
                )
            }]
        },
        options: {
            indexAxis: "y", // nằm ngang
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: (ctx) => {
                            const orders = dataOrders[ctx.dataIndex].toLocaleString();
                            return [
                                `SL đơn bán: ${orders} SKUs`,
                                `Xác suất bán: ${ctx.parsed.x.toFixed(1)}%`
                            ];
                        }
                    }
                },
                legend: { display: false },
                title: {
                    display: true,
                    text: "XÁC SUẤT BÁN HÀNG THEO NHÓM HÀNG",
                    padding: { top: 10, bottom: 30 },
                    font: { size: 18, weight: "bold" }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: { callback: v => v + "%" },
                    title: { display: true, text: "Xác suất bán hàng" }
                },
                y: {
                    title: { display: false }
                }
            }
        }
    });
});
/////////////////// chart8 ////////////////////////////////////////////////////////////////
document.addEventListener("DOMContentLoaded", function () {
    const raw = JSON.parse(document.getElementById("chart8-data").textContent);

    const groups = [...new Set(raw.map(d => d.group))];
    const months = [...new Set(raw.map(d => d.month_label))];

    // Gom dữ liệu thành nhiều series
    const series = groups.map(g => ({
        label: g,
        data: months.map(m => {
            const found = raw.find(d => d.group === g && d.month_label === m);
            return found ? +(found.prob * 100).toFixed(1) : null;
        }),
    }));

    const ctx = document.getElementById("chart8").getContext("2d");
    new Chart(ctx, {
        type: "line",
        data: {
            labels: months,
            datasets: series
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: (ctx) => {
                            const d = raw.find(r =>
                                r.group === ctx.dataset.label &&
                                r.month_label === ctx.label
                            );
                            return d
                                ? [
                                    `SL đơn bán: ${d.orders.toLocaleString()}`,
                                    `Xác suất: ${(d.prob*100).toFixed(1)}%`
                                  ]
                                : null;
                        }
                    }
                },
                title: {
                    display: true,
                    text: "XÁC SUẤT BÁN HÀNG CỦA NHÓM HÀNG THEO THÁNG",
                    padding: { top: 10, bottom: 30 },
                    font: { size: 18, weight: "bold" }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: { callback: v => v + "%" },
                    title: { display: true, text: "Xác suất bán hàng" }
                },
            }
        }
    });
});
/////////////////// chart9 ////////////////////////////////////////////////////////////////
document.addEventListener("DOMContentLoaded", function () {
    const rawEl = document.getElementById("chart9-data");
    if (!rawEl) return;

    let raw = [];
    try {
        raw = JSON.parse(rawEl.textContent);
    } catch (e) {
        console.error("Lỗi parse JSON chart9-data:", e);
        return;
    }
    if (!raw || raw.length === 0) return;

    const groups = [...new Set(raw.map(d => d.group))];
    const container = document.getElementById("chart9");

    container.innerHTML = "";
    container.style.display = "grid";
    container.style.gridTemplateColumns = "repeat(2, 1fr)"; // 2 cột
    container.style.gap = "30px";

    // Thêm tiêu đề lớn trong grid (chiếm full width)
    const titleDiv = document.createElement("div");
    titleDiv.style.gridColumn = "1 / -1"; // span full 2 cột
    titleDiv.style.textAlign = "center";
    titleDiv.style.fontSize = "20px";
    titleDiv.style.fontWeight = "bold";
    titleDiv.style.color = "#555555ff";
    titleDiv.style.marginBottom = "10px";
    titleDiv.textContent = "XÁC SUẤT BÁN HÀNG CỦA MẶT HÀNG THEO NHÓM HÀNG";
    container.appendChild(titleDiv);

    groups.forEach(group => {
        const dataGroup = raw
            .filter(d => d.group === group)
            .sort((a, b) => b.prob - a.prob);

        if (dataGroup.length === 0) return;
    // 👉 Tính max cho trục X
        const maxProb = Math.max(...dataGroup.map(d => d.prob)) * 100;
        const axisMax = Math.ceil(maxProb * 1.01 / 5) * 5; // làm tròn lên bội số 5, thêm 1%
        const wrapper = document.createElement("div");
        wrapper.style.minWidth = "400px";
        wrapper.style.height = "400px";
        wrapper.style.margin = "0 auto";

        const canvas = document.createElement("canvas");
        wrapper.appendChild(canvas);
        container.appendChild(wrapper);

        new Chart(canvas.getContext("2d"), {
            type: "bar",
            data: {
                labels: dataGroup.map(d => d.item),
                datasets: [{
                    label: "Xác suất bán hàng (%)",
                    data: dataGroup.map(d => (d.prob * 100).toFixed(2)),
                    backgroundColor: dataGroup.map((_, i) =>
                        `hsl(${(i * 360 / dataGroup.length)},70%,65%)`
                    ),
                    hoverBackgroundColor: dataGroup.map((_, i) =>
                        `hsl(${(i * 360 / dataGroup.length)},90%,50%)`
                    )
                }]
            },
            options: {
                indexAxis: "y",
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: group,
                        font: { size: 15, weight: "bold" },
                        color: "#007777",
                        padding: { bottom: 10 }
                    },
                    tooltip: {
                        mode: "nearest",
                        intersect: true,
                        callbacks: {
                            label: (ctx) => {
                                const d = dataGroup[ctx.dataIndex];
                                return `Số đơn: ${d.count.toLocaleString()} | Xác suất: ${(d.prob*100).toFixed(2)}%`;
                            }
                        }
                    },
                    legend: { display: false }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        max: axisMax,
                        ticks: { callback: v => v + "%" }
                    },
                    y: {
                        ticks: { font: { size: 11 } }
                    }
                }
            }
        });
    });
});
/////////////////// chart10 ////////////////////////////////////////////////////////////////
/////////////////// chart10 ////////////////////////////////////////////////////////////////
document.addEventListener("DOMContentLoaded", function () {
    const rawEl = document.getElementById("chart10-data");
    if (!rawEl) return;

    let raw = [];
    try {
        raw = JSON.parse(rawEl.textContent);
    } catch (e) {
        console.error("Lỗi parse JSON chart10-data:", e);
        return;
    }
    if (!raw || raw.length === 0) return;

    const groups = [...new Set(raw.map(d => d.group))];
    const months = [...new Set(raw.map(d => d.month))].sort((a, b) => a - b);

    const container = document.getElementById("chart10");
    container.innerHTML = "";
    container.style.display = "grid";
    container.style.gridTemplateColumns = "repeat(2, 1fr)";
    container.style.gap = "15px";   // 👉 tăng khoảng cách giữa các chart
    container.style.alignItems = "start";

    // Title chung
    const titleDiv = document.createElement("div");
    titleDiv.style.gridColumn = "1 / -1";
    titleDiv.style.textAlign = "center";
    titleDiv.style.fontSize = "20px";
    titleDiv.style.fontWeight = "bold";
    titleDiv.style.color = "#555";
    titleDiv.style.marginBottom = "15px";
    titleDiv.textContent = "XÁC SUẤT BÁN HÀNG CỦA MẶT HÀNG THEO NHÓM HÀNG TRONG TỪNG THÁNG";
    container.appendChild(titleDiv);

    groups.forEach(group => {
        const dataGroup = raw.filter(d => d.group === group);

        const items = [...new Set(dataGroup.map(d => d.item))];
        const datasets = items.map((item, idx) => {
            const values = months.map(m => {
                const row = dataGroup.find(r => r.month === m && r.item === item);
                return row ? +(row.prob * 100).toFixed(2) : 0;
            });
            return {
                label: item,
                data: values,
                fill: false,
                borderColor: `hsl(${(idx * 360 / items.length)}, 70%, 60%)`,   // đường viền đậm
                backgroundColor: `hsl(${(idx * 360 / items.length)}, 70%, 80%)`, // màu fill nhạt hơn
                tension: 0,       // 👉 gấp khúc (không bo tròn)
                pointRadius: 3
            };
        });

        const wrapper = document.createElement("div");
        wrapper.style.minWidth = "600px";
        wrapper.style.height = "420px";  // 👉 tăng chiều cao để tiêu đề không chồng
        wrapper.style.margin = "0 auto";

        const canvas = document.createElement("canvas");
        wrapper.appendChild(canvas);
        container.appendChild(wrapper);

        new Chart(canvas.getContext("2d"), {
            type: "line",
            data: {
                labels: months.map(m => "T" + String(m).padStart(2, "0")),
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: group,
                        font: { size: 15, weight: "bold" },
                        color: "#007777",
                        padding: { bottom: 12 }   
                    },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => {
                                const m = months[ctx.dataIndex];
                                const item = ctx.dataset.label;
                                const row = dataGroup.find(r => r.month === m && r.item === item);
                                if (!row) return "";
                                return `Đơn: ${row.count} / ${row.denom} | Xác suất: ${(row.prob*100).toFixed(1)}%`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { callback: v => v + "%" }
                    }
                }
            }
        });
    });
});

////////////////////////chart11///////////////////
document.addEventListener("DOMContentLoaded", function () {
    const raw = JSON.parse(document.getElementById("chart11-data").textContent);

    const ctx = document.getElementById("chart11").getContext("2d");
    new Chart(ctx, {
        type: "bar",
        data: {
            labels: raw.map(d => d.times),
            datasets: [{
                label: "Số KH",
                data: raw.map(d => d.customers),
                backgroundColor: "#3f78b5",
                borderColor: "#2a5d9f",
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: "PHÂN PHỐI LƯỢT MUA HÀNG",
                    font: { size: 18, weight: "bold" },
                    padding: { top: 10, bottom: 20 }
                },
                tooltip: {
                    callbacks: {
                        label: (ctx) => {
                            const d = raw[ctx.dataIndex];
                            return `Đã mua ${d.times} lần: ${d.customers} KH`;
                        }
                    }
                }
            },
            scales: {
                y: { beginAtZero: true, title: { display: true, text: "Số KH" } }
            }
        }
    });
});
//////////////////////// chart11 /////////////////////////
document.addEventListener("DOMContentLoaded", function () {
    const rawEl = document.getElementById("chart11-data");
    if (!rawEl) return;

    let raw = [];
    try {
        raw = JSON.parse(rawEl.textContent || "[]");
    } catch (err) {
        console.error("chart11 JSON parse error", err);
        return;
    }
    if (!raw || raw.length === 0) return;

    const canvas = document.getElementById("chart11");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    if (canvas._chartInstance) {
        canvas._chartInstance.destroy();
    }

    const chart11 = new Chart(ctx, {
        type: "bar",
        data: {
            labels: raw.map(d => d.times),
            datasets: [{
                label: "Số KH",
                data: raw.map(d => d.customers),
                backgroundColor: "rgba(63,120,181,0.6)", // pastel xanh
                borderColor: "rgba(42,93,159,1)",        // xanh đậm
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: { top: 20, bottom: 10, left: 10, right: 10 }
            },
            plugins: {
                legend: { display: false },
                title: {
                    display: true,
                    text: "PHÂN PHỐI LƯỢT MUA HÀNG",
                    font: { size: 18, weight: "bold" },
                    color: "#2a4d69",
                    padding: { top: 10, bottom: 20 }
                },
                tooltip: {
                    callbacks: {
                        label: (ctx) => {
                            const d = raw[ctx.dataIndex];
                            return `Đã mua ${d.times} lần: ${d.customers} KH`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: { display: true, text: "Số lần mua" }
                },
                y: {
                    beginAtZero: true,
                    title: { display: true, text: "Số KH" },
                    ticks: { precision: 0 }
                }
            }
        }
    });

    canvas._chartInstance = chart11;
});
// ---- chart12 ----
document.addEventListener("DOMContentLoaded", function () {
  const rawEl = document.getElementById("chart122-data");
  if (!rawEl) return;

  let raw = [];
  try {
    raw = JSON.parse(rawEl.textContent || "[]");
  } catch (err) {
    console.error("chart12 JSON parse error", err);
    return;
  }
  if (!raw || raw.length === 0) return;

  const canvas = document.getElementById("chart122");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  // Hủy chart cũ nếu có
  if (canvas._chartInstance) {
    canvas._chartInstance.destroy();
  }

  // Labels: lấy lower bound dạng K
  const labels = raw.map(d => `${Math.round((Number(d.lower) || 0) / 1000)}K`);
  const values = raw.map(d => Number(d.customers) || 0);

  const chart122 = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: "Số KH",
        data: values,
        backgroundColor: "rgba(63,120,181,0.6)", // giống chart11 pastel xanh
        borderColor: "rgba(42,93,159,1)",        // xanh đậm
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: { top: 20, bottom: 10, left: 10, right: 10 }
      },
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: "PHÂN PHỐI MỨC CHI TRẢ",
          font: { size: 18, weight: "bold" },
          color: "#2a4d69",
          padding: { top: 10, bottom: 20 }
        },
        tooltip: {
          callbacks: {
            label: function (ctx) {
              const d = raw[ctx.dataIndex] || {};
              const lower = Number(d.lower || 0).toLocaleString();
              const upper = Number(d.upper || 0).toLocaleString();
              const customers = Number(d.customers || 0).toLocaleString();
              return [
                `Đã chi tiêu từ ${lower} đến ${upper} VND`,
                `Số KH: ${customers}`
              ];
            }
          }
        }
      },
      scales: {
        x: {
          title: { display: true, text: "Mức chi trả KH" },
          ticks: {
            autoSkip: true,
            maxRotation: 45,
            minRotation: 30
          }
        },
        y: {
          beginAtZero: true,
          title: { display: true, text: "Số KH chi trả" },
          ticks: { precision: 0 }
        }
      }
    }
  });

  canvas._chartInstance = chart122;
});

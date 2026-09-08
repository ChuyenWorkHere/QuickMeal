// src/lib/mockData.ts

export const HOURS = ['06:00','08:00','10:00','12:00','14:00','16:00','18:00','20:00','22:00'];

const fluctuate = (base: number, percent = 0.2) => {
    const delta = base * percent;
    return Math.max(0, Math.round(base + (Math.random() * delta * 2 - delta)));
};

// 1. Đơn hàng theo giờ (Logic cao điểm)
export const ordersByHour = HOURS.map((hour, idx) => {
    let base = 8;
    if (idx === 3 || idx === 6) base = 45; // 12h và 18h là đỉnh
    else if (idx === 2 || idx === 5) base = 25;
    return { hour, orders: fluctuate(base, 0.3) };
});

// 2. Doanh thu theo giờ (Tỉ lệ nghịch nhẹ với số đơn để tạo sự biến thiên AOV)
export const revenueByHour = ordersByHour.map(o => ({
    hour: o.hour,
    revenue: o.orders * fluctuate(85000, 0.15) // Trung bình 85k/đơn nhưng có dao động
}));

// 3. Dữ liệu tuần
export const weeklyRevenue = ['T2','T3','T4','T5','T6','T7','CN'].map((day, idx) => {
    const isWeekend = idx >= 5;
    const baseRev = isWeekend ? 32000000 : 18000000;
    const baseOrders = isWeekend ? 350 : 210;
    return {
        day,
        revenue: fluctuate(baseRev, 0.2),
        orders: fluctuate(baseOrders, 0.15)
    };
});

// 4. Danh sách đơn hàng mô phỏng vận hành
export const recentOrders = Array.from({ length: 10 }).map((_, i) => ({
    id: `ORD-${9500 + i}`,
    customer: ["Anh Tuấn", "Chị Lan", "Minh Tú", "Hoàng Nam", "Khánh Vy"][i % 5],
    status: ['completed', 'completed', 'completed', 'shipping', 'processing', 'pending'][i % 6],
    total: fluctuate(155000, 0.5),
    minutesAgo: i * 8 + fluctuate(5, 0.5),
    items: i % 2 === 0 ? "Pizza & Coca" : "Mì Ý & Trà đào"
}));

export const kpiStats = {
    fulfillmentRate: 96.4,
    cancelRate: 3.6,
    avgOrderValue: 165000,
    newCustomers: 24
};
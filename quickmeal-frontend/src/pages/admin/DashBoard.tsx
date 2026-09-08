import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Chart } from 'react-chartjs-2';
import { 
    TrendingUp, ShoppingCart, Package, 
    Clock, ChevronRight, ArrowUpRight, Target, Zap, MousePointer2
} from 'lucide-react';
import { useProducts } from "@/context/ProductContext";
import * as mock from '@/lib/mockData';
import { Chart as ChartJS, registerables } from 'chart.js';

ChartJS.register(...registerables);

export default function Dashboard() {
    const { products } = useProducts();
    const [view, setView] = useState<'today' | 'weekly'>('today');
    const [liveDrift, setLiveDrift] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setLiveDrift(prev => prev + (Math.random() * 2000));
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const stats = useMemo(() => {
        const totalRevenue = mock.revenueByHour.reduce((sum, r) => sum + r.revenue, 0) + liveDrift;
        const totalOrders = mock.ordersByHour.reduce((sum, o) => sum + o.orders, 0);
        const peak = mock.ordersByHour.reduce((max, cur) => cur.orders > max.orders ? cur : max);
        
        const topSelling = [...products]
            .map(p => ({
                ...p,
                soldCount: Math.floor(totalOrders / (products.length || 1)) + Math.floor(Math.random() * 20)
            }))
            .sort((a, b) => b.soldCount - a.soldCount)
            .slice(0, 5);

        return { totalRevenue, totalOrders, peakHour: peak.hour, topSelling };
    }, [products, liveDrift]);

    // 📊 1. COMBO CHART (NHÂN VẬT CHÍNH): REVENUE & ORDERS
    const mainChartData = {
        labels: view === 'today' ? mock.HOURS : mock.weeklyRevenue.map(d => d.day),
        datasets: [
            {
                type: 'line' as const,
                label: 'Doanh thu (đ)',
                data: view === 'today' ? mock.revenueByHour.map(r => r.revenue) : mock.weeklyRevenue.map(d => d.revenue),
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.05)',
                fill: true,
                tension: 0.4,
                yAxisID: 'y',
                pointRadius: (ctx: any) => {
                    // 🔹 ANNOTATION: Highlight điểm cao nhất
                    const data = ctx.dataset.data;
                    return data[ctx.dataIndex] === Math.max(...data) ? 8 : 4;
                },
                pointBackgroundColor: (ctx: any) => {
                    const data = ctx.dataset.data;
                    return data[ctx.dataIndex] === Math.max(...data) ? '#ef4444' : '#fff';
                }
            },
            {
                type: 'bar' as const,
                label: 'Lượng đơn',
                data: view === 'today' ? mock.ordersByHour.map(o => o.orders) : mock.weeklyRevenue.map(d => d.orders),
                backgroundColor: 'rgba(226, 232, 240, 0.6)',
                borderRadius: 4,
                yAxisID: 'y1',
            }
        ]
    };

    // 📊 2. DISTRIBUTION CHART (NHÂN VẬT PHỤ): ORDERS BY HOUR
    const distChartData = {
        labels: mock.HOURS,
        datasets: [{
            data: mock.ordersByHour.map(o => o.orders),
            backgroundColor: (ctx: any) => {
                const val = ctx.raw;
                return val > 30 ? '#f59e0b' : '#e2e8f0'; // Highlight giờ cao điểm bằng màu Amber
            },
            borderRadius: 20,
            barThickness: 12,
        }]
    };

    return (
        <div className="p-4 md:p-6 space-y-6 bg-[#f8fafc] min-h-screen pb-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Live Operations</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-black text-slate-900">Dashboard Quản Trị</h1>
                </div>
                
                <div className="flex bg-white border p-1 rounded-xl shadow-sm w-full sm:w-auto">
                    {(['today', 'weekly'] as const).map((t) => (
                        <button key={t} onClick={() => setView(t)} className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all ${view === t ? 'bg-red-500 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>
                            {t === 'today' ? 'Hôm nay' : 'Tuần này'}
                        </button>
                    ))}
                </div>
            </div>

            {/* KPI Section */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Doanh thu" value={`${stats.totalRevenue.toLocaleString(undefined, {maximumFractionDigits:0})}đ`} trend="+12%" icon={TrendingUp} color="text-red-500" />
                <StatCard title="Đơn hàng" value={stats.totalOrders} trend="+5%" icon={ShoppingCart} color="text-amber-500" />
                <StatCard title="AOV (TB đơn)" value="165k" sub="Giá trị đơn ổn định" icon={Target} color="text-blue-500" />
                <StatCard title="Món đang bán" value={products.length} sub="Trên tổng Menu" icon={Package} color="text-emerald-500" />
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                
                {/* 75% Width: Hero Analytics */}
                <div className="lg:col-span-3 space-y-6">
                    <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 p-6">
                            <div>
                                <CardTitle className="text-lg font-bold">Biến thiên Doanh thu & Tần suất đơn</CardTitle>
                                <p className="text-xs text-slate-400 font-medium mt-1 uppercase tracking-tighter">Phân tích tương quan đại lượng</p>
                            </div>
                            <div className="flex gap-2">
                                <span className="px-2 py-1 rounded bg-red-50 text-red-600 text-[10px] font-bold">REVENUE (LINE)</span>
                                <span className="px-2 py-1 rounded bg-slate-100 text-slate-500 text-[10px] font-bold">ORDERS (BAR)</span>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 h-[350px]">
                            <Chart type="bar" data={mainChartData} options={mainChartOptions} />
                        </CardContent>
                    </Card>

                    {/* 📊 THIẾU SỐ 1: DISTRIBUTION CHART - Orders by Hour */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="border-none shadow-sm rounded-2xl bg-white p-6">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="font-bold text-slate-800 text-sm">Phân bổ đơn hàng theo giờ</h3>
                                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest mt-1">Hành vi khách đặt món</p>
                                </div>
                                <MousePointer2 className="w-4 h-4 text-slate-300" />
                            </div>
                            <div className="h-[120px]">
                                <Chart type="bar" data={distChartData} options={distChartOptions} />
                            </div>
                            <div className="mt-4 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                                <span className="text-[11px] font-bold text-slate-600">Khung giờ Peak: 12:00 & 18:00</span>
                            </div>
                        </Card>

                        {/* Operational Funnel */}
                        <Card className="border-none shadow-sm rounded-2xl bg-white p-6">
                            <h3 className="font-bold text-slate-800 text-sm mb-4">Sức khỏe Vận hành</h3>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[11px] font-black uppercase text-slate-400">
                                        <span>Tỉ lệ hoàn tất đơn</span>
                                        <span className="text-emerald-500">{mock.kpiStats.fulfillmentRate}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-100 rounded-full flex overflow-hidden">
                                        <div className="bg-emerald-500 h-full" style={{ width: '96%' }} />
                                        <div className="bg-red-400 h-full" style={{ width: '4%' }} />
                                    </div>
                                </div>
                                <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                                    <div className="flex items-center gap-2 mb-1 text-blue-700">
                                        <Zap className="w-3 h-3 fill-current" />
                                        <span className="text-[10px] font-black uppercase">Vận hành Insight</span>
                                    </div>
                                    <p className="text-[11px] text-blue-800 leading-relaxed font-medium">
                                        Đơn hàng hoàn tất cao kỷ lục. Đề xuất mở rộng vùng giao hàng thêm 2km.
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>

                {/* 25% Width: Right Sidebar (Top Products) */}
                <Card className="border-none shadow-sm rounded-2xl bg-white h-fit">
                    <CardHeader className="p-6 border-b border-slate-50">
                        <CardTitle className="text-base font-bold flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-red-500" />
                            Hot Menu
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        {stats.topSelling.map((p, idx) => (
                            <div key={p.id} className="group">
                                <div className="flex justify-between items-center mb-1.5">
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-lg ${idx < 3 ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-400'}`}>
                                            {idx + 1}
                                        </span>
                                        <span className="text-sm font-bold text-slate-700 truncate max-w-[120px]">{p.name}</span>
                                    </div>
                                    <span className="text-[10px] font-black text-slate-400">{p.soldCount} đơn</span>
                                </div>
                                <div className="h-1 w-full bg-slate-50 rounded-full overflow-hidden">
                                    <div className="h-full bg-red-500" style={{ width: `${(p.soldCount / (stats.topSelling[0].soldCount * 1.1)) * 100}%` }} />
                                </div>
                            </div>
                        ))}
                        <button className="w-full mt-4 py-3 bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                            Chi tiết thực đơn <ChevronRight className="w-4 h-4" />
                        </button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

// --- SUB COMPONENTS & OPTIONS ---

function StatCard({ title, value, icon: Icon, trend, sub, color }: any) {
    return (
        <Card className="border-none shadow-sm rounded-2xl bg-white hover:ring-2 hover:ring-red-50 transition-all">
            <CardContent className="p-4 md:p-6 flex flex-col justify-between h-full">
                <div className="flex justify-between items-start">
                    <div className={`p-2 rounded-xl bg-slate-50 ${color}`}><Icon className="w-5 h-5" /></div>
                    {trend && <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded-lg">{trend}</span>}
                </div>
                <div className="mt-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
                    <p className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">{value}</p>
                    {sub && <p className="text-[10px] text-slate-400 font-bold mt-1 italic uppercase">{sub}</p>}
                </div>
            </CardContent>
        </Card>
    );
}

const mainChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
        y: { 
            position: 'left' as const,
            ticks: { font: { size: 10, weight: '700' as any }, color: '#94a3b8', callback: (v: any) => v >= 1000000 ? (v/1000000)+'M' : (v/1000)+'k' },
            grid: { color: '#f1f5f9' },
            border: { display: false }
        },
        y1: { 
            position: 'right' as const,
            grid: { drawOnChartArea: false },
            ticks: { font: { size: 10 }, color: '#cbd5e1' },
            border: { display: false }
        },
        x: { ticks: { font: { size: 10, weight: '700' as any }, color: '#94a3b8' }, grid: { display: false } }
    }
};

const distChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { 
        x: { grid: { display: false }, ticks: { font: { size: 9 } } },
        y: { display: false }
    }
};
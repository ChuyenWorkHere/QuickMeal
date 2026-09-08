import React, { useEffect, useState } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { orderService, type PageResponse } from '@/services/orderService';
import type { OrderResponseDTO } from '@/types';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    ChevronLeft, ChevronRight, Clock, CheckCircle2,
    XCircle, Truck, Utensils, PackageSearch, Loader2, Info
} from 'lucide-react';
import { format } from 'date-fns';
import OrderDetailSheet from '../admin/order/OrderDetailSheet';

const OrderHistory: React.FC = () => {
    const { userName } = useAuthContext();
    const [data, setData] = useState<PageResponse<OrderResponseDTO> | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<OrderResponseDTO | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [activeTab, setActiveTab] = useState("ALL");

    const fetchOrders = async () => {
        if (!userName) return;
        setLoading(true);
        try {
            // Gọi service với tham số status (activeTab) và phân trang
            const res = await orderService.getMyOrders(userName, currentPage, 8, activeTab);
            setData(res);
        } catch (error) {
            console.error("Lỗi tải đơn hàng:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [userName, currentPage, activeTab]);

    // Hàm ánh xạ Enum từ Backend sang UI
    const getStatusConfig = (status: string) => {
        const configs: Record<string, { label: string, color: string, icon: any }> = {
            'PENDING_ACCEPTANCE': { label: 'Chờ xác nhận', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock },
            'PREPARING': { label: 'Đang chuẩn bị', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Utensils },
            'READY': { label: 'Sẵn sàng', color: 'bg-indigo-100 text-indigo-700 border-indigo-200', icon: PackageSearch },
            'SHIPPING': { label: 'Đang giao', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: Truck },
            'COMPLETED': { label: 'Hoàn thành', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle2 },
            'CANCELLED': { label: 'Đã hủy', color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
            'REJECTED': { label: 'Từ chối', color: 'bg-slate-200 text-slate-700 border-slate-300', icon: XCircle },
        };
        return configs[status] || { label: status, color: 'bg-slate-100', icon: Info };
    };

    return (
        <div className="container mx-auto p-4 max-w-5xl antialiased">
            <header className="mb-8">
                <h1 className="text-3xl font-black italic uppercase tracking-tighter">
                    Lịch sử <span className="text-primary">Đơn hàng</span>
                </h1>
                <p className="text-slate-500 font-medium">Theo dõi hành trình món ăn của bạn</p>
            </header>

            {/* Bộ lọc Tabs - Đã cập nhật đầy đủ các trạng thái từ Backend */}
            <div className="mb-6 overflow-x-auto pb-2 scrollbar-hide">
                <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setCurrentPage(0); }}>
                    <TabsList className="bg-slate-100 p-1 inline-flex w-auto whitespace-nowrap">
                        <TabsTrigger value="ALL" className="font-bold px-4 text-xs uppercase">Tất cả</TabsTrigger>

                        <TabsTrigger value="PENDING_ACCEPTANCE" className="font-bold px-4 text-xs uppercase">Chờ duyệt</TabsTrigger>

                        <TabsTrigger value="PREPARING" className="font-bold px-4 text-xs uppercase">Đang chế biến</TabsTrigger>

                        {/* Bổ sung trạng thái READY */}
                        <TabsTrigger value="READY" className="font-bold px-4 text-xs uppercase">Chờ lấy hàng</TabsTrigger>

                        <TabsTrigger value="SHIPPING" className="font-bold px-4 text-xs uppercase">Đang giao</TabsTrigger>

                        <TabsTrigger value="COMPLETED" className="font-bold px-4 text-xs uppercase">Đã xong</TabsTrigger>

                        {/* Gộp hoặc tách CANCELLED và REJECTED tùy theo nhu cầu UI, ở đây tôi tách ra cho rõ ràng */}
                        <TabsTrigger value="CANCELLED" className="font-bold px-4 text-xs uppercase">Đã hủy</TabsTrigger>

                        <TabsTrigger value="REJECTED" className="font-bold px-4 text-xs uppercase">Bị từ chối</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {/* List Header (Desktop) */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-slate-900 text-white rounded-t-xl text-[10px] font-black uppercase tracking-widest">
                <div className="col-span-2">Mã đơn</div>
                <div className="col-span-3">Thời gian</div>
                <div className="col-span-3">Trạng thái</div>
                <div className="col-span-2 text-right">Tổng tiền</div>
                <div className="col-span-2"></div>
            </div>

            {/* Danh sách đơn hàng */}
            <div className="bg-white border shadow-sm rounded-b-xl overflow-hidden min-h-[400px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-3">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-slate-400 font-bold text-sm uppercase italic">Đang tải dữ liệu...</p>
                    </div>
                ) : data?.content.length === 0 ? (
                    <div className="py-24 text-center">
                        <PackageSearch className="mx-auto h-12 w-12 text-slate-200 mb-4" />
                        <p className="text-slate-500 font-bold italic">Không tìm thấy đơn hàng nào.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {data?.content.map((order) => {
                            const config = getStatusConfig(order.status);
                            const Icon = config.icon;
                            return (
                                <div
                                    key={order.id}
                                    onClick={() => setSelectedOrder(order)}
                                    className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 p-4 md:px-6 items-center hover:bg-slate-50/80 transition-all cursor-pointer group"
                                >
                                    <div className="col-span-2 font-black text-sm">#{order.id}</div>
                                    <div className="col-span-3 text-xs text-slate-500 font-bold">
                                        {format(new Date(order.createdAt), 'dd/MM/yyyy • HH:mm')}
                                    </div>
                                    <div className="col-span-3">
                                        <Badge variant="outline" className={`${config.color} px-2 py-0.5 rounded flex w-fit gap-1.5 items-center border shadow-none text-[10px] font-black uppercase`}>
                                            <Icon className="w-3 h-3" />
                                            {config.label}
                                        </Badge>
                                    </div>
                                    <div className="col-span-2 md:text-right font-black text-primary text-lg tracking-tighter">
                                        {order.totalPrice.toLocaleString()}đ
                                    </div>
                                    <div className="col-span-2 text-right">
                                        <Button size="sm" variant="ghost" className="text-[10px] font-black uppercase hover:bg-primary hover:text-white rounded-full px-4">
                                            Chi tiết
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Phân trang */}
            {data && data.totalPages > 1 && (
                <div className="flex items-center justify-between mt-8 border-t pt-4">
                    <p className="text-[11px] font-black text-slate-400 uppercase">
                        Trang {data.number + 1} / {data.totalPages}
                    </p>
                    <div className="flex gap-1">
                        <Button
                            variant="outline"
                            size="icon"
                            disabled={data.number === 0}
                            onClick={() => setCurrentPage(prev => prev - 1)}
                            className="h-8 w-8 rounded-full"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>

                        {/* Hiển thị số trang */}
                        {[...Array(data.totalPages)].map((_, i) => (
                            <Button
                                key={i}
                                variant={data.number === i ? "default" : "outline"}
                                size="sm"
                                onClick={() => setCurrentPage(i)}
                                className={`h-8 w-8 text-xs font-black rounded-full ${data.number === i ? 'bg-primary' : ''}`}
                            >
                                {i + 1}
                            </Button>
                        ))}

                        <Button
                            variant="outline"
                            size="icon"
                            disabled={data.number + 1 >= data.totalPages}
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            className="h-8 w-8 rounded-full"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}

            <OrderDetailSheet
                order={selectedOrder}
                isOpen={!!selectedOrder}
                onClose={() => setSelectedOrder(null)}
            />
        </div>
    );
};

export default OrderHistory;
// src/pages/admin/order/Orders.tsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Search,
    Eye,
    ChevronLeft,
    ChevronRight,
    Loader2,
    RefreshCcw,
    Package,
    Inbox,
} from "lucide-react";
import { orderService } from "@/services/orderService";
import type { OrderResponseDTO, OrderStatus } from "@/types";
import OrderDetailSheet from "./OrderDetailSheet";
import { toast } from "sonner";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
    ALL: { label: "Tất cả", color: "bg-slate-100 text-slate-700 border-slate-200" },
    PENDING_ACCEPTANCE: { label: "Chờ xác nhận", color: "bg-amber-50 text-amber-700 border-amber-200" },
    PREPARING: { label: "Đang chế biến", color: "bg-blue-50 text-blue-700 border-blue-200" },
    READY: { label: "Sẵn sàng", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
    SHIPPING: { label: "Đang giao", color: "bg-purple-50 text-purple-700 border-purple-200" },
    COMPLETED: { label: "Hoàn tất", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    CANCELLED: { label: "Đã hủy", color: "bg-rose-50 text-rose-700 border-rose-200" },
    REJECTED: { label: "Từ chối", color: "bg-slate-50 text-slate-600 border-slate-200" },
};

export default function Orders() {
    const [orders, setOrders] = useState<OrderResponseDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("ALL");
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [selectedOrder, setSelectedOrder] = useState<OrderResponseDTO | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    
    const [updatingIds, setUpdatingIds] = useState<Record<number, boolean>>({});
    const abortControllerRef = useRef<AbortController | null>(null);

    const fetchOrders = useCallback(async (p: number, k: string, s: string) => {
        if (abortControllerRef.current) abortControllerRef.current.abort();
        const controller = new AbortController();
        abortControllerRef.current = controller;

        try {
            setLoading(true);
            const data = await orderService.getOrders(p, 10, k, s);
            if (!controller.signal.aborted) {
                setOrders(data.content);
                setTotalPages(data.totalPages);
            }
        } catch (error: any) {
            if (error.name !== 'AbortError') toast.error("Lỗi kết nối");
        } finally {
            if (!controller.signal.aborted) setLoading(false);
        }
    }, []);

    useEffect(() => {
        const delay = setTimeout(() => fetchOrders(page, searchTerm, activeTab), 400);
        return () => {
            clearTimeout(delay);
            if (abortControllerRef.current) abortControllerRef.current.abort();
        };
    }, [page, searchTerm, activeTab, fetchOrders]);

    const handleStatusUpdate = async (id: number, newStatus: string) => {
        setUpdatingIds(prev => ({ ...prev, [id]: true }));
        try {
            await orderService.updateStatus(id, newStatus);
            setOrders(prev => prev.map(o => 
                o.id === id ? { ...o, status: newStatus as OrderStatus } : o
            ));
            toast.success(`Đã cập nhật đơn #${id}`);
        } catch (error) {
            toast.error("Lỗi cập nhật");
        } finally {
            setUpdatingIds(prev => ({ ...prev, [id]: false }));
        }
    };

    return (
        <div className="flex flex-col gap-4 p-3 md:p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
            {/* Header: Chuyển sang cột trên Mobile cực hẹp */}
            <header className="space-y-4">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Package className="h-5 w-5 text-indigo-600" /> Đơn hàng
                    </h1>
                </div>

                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Tìm kiếm..."
                            className="pl-9 h-11 bg-white border-slate-200 rounded-xl"
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
                        />
                    </div>
                    <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-11 w-11 shrink-0 bg-white rounded-xl border-slate-200"
                        onClick={() => fetchOrders(page, searchTerm, activeTab)}
                    >
                        <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
            </header>

            {/* Tabs: Cuộn ngang mượt mà trên Mobile */}
            <div className="overflow-x-auto no-scrollbar -mx-3 px-3">
                <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setPage(0); }}>
                    <TabsList className="bg-slate-100/80 p-1 h-auto flex border-none w-max">
                        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                            <TabsTrigger 
                                key={key} 
                                value={key}
                                className="px-4 py-2 text-xs font-semibold rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
                            >
                                {cfg.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
            </div>

            <Card className="border-none md:border md:border-slate-200 shadow-none md:shadow-sm bg-transparent md:bg-white overflow-hidden relative">
                {loading && (
                    <div className="absolute inset-0 z-20 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                    </div>
                )}

                <CardContent className="p-0">
                    {/* PC View (Bảng - chỉ hiện từ màn hình Laptop trở lên) */}
                    <div className="hidden lg:block overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-slate-50">
                                <TableRow>
                                    <TableHead className="w-[100px] font-semibold">Mã đơn</TableHead>
                                    <TableHead className="font-semibold">Khách hàng</TableHead>
                                    <TableHead className="font-semibold text-right">Tổng tiền</TableHead>
                                    <TableHead className="font-semibold text-center">Trạng thái</TableHead>
                                    <TableHead className="w-[80px] text-right font-semibold">Chi tiết</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orders.length === 0 && !loading ? (
                                    <EmptyStateView isTable={true} />
                                ) : (
                                    orders.map((order) => (
                                        <TableRow key={order.id} className="hover:bg-slate-50/50">
                                            <TableCell className="font-medium text-indigo-600">#{order.id}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-slate-900">{order.customerName}</span>
                                                    <span className="text-xs text-slate-500">{order.phone}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right font-bold text-slate-900">
                                                {order.totalPrice.toLocaleString()}đ
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex justify-center">
                                                    <StatusDropdown 
                                                        currentStatus={order.status} 
                                                        onUpdate={(s) => handleStatusUpdate(order.id, s)} 
                                                        isLoading={updatingIds[order.id]}
                                                    />
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" onClick={() => { setSelectedOrder(order); setIsSheetOpen(true); }}>
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Smartphone View (Card Stack - Tối ưu cho màn hình dọc) */}
                    <div className="lg:hidden space-y-3 pb-20 md:pb-0">
                        {orders.length === 0 && !loading ? (
                            <EmptyStateView isTable={false} />
                        ) : (
                            orders.map((order) => (
                                <div key={order.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm active:scale-[0.98] transition-transform">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="space-y-1" onClick={() => { setSelectedOrder(order); setIsSheetOpen(true); }}>
                                            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full uppercase">Đơn #{order.id}</span>
                                            <h3 className="font-bold text-slate-900 text-base">{order.customerName}</h3>
                                            <p className="text-xs text-slate-500 font-medium">{order.phone}</p>
                                        </div>
                                        <p className="font-bold text-indigo-600 text-lg">{order.totalPrice.toLocaleString()}đ</p>
                                    </div>

                                    {/* Action Area: Chia làm 2 cột hoặc hàng tùy độ rộng */}
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <div className="flex-1">
                                            <StatusDropdown 
                                                currentStatus={order.status} 
                                                onUpdate={(s) => handleStatusUpdate(order.id, s)}
                                                isLoading={updatingIds[order.id]}
                                            />
                                        </div>
                                        <Button 
                                            variant="secondary" 
                                            className="w-full sm:w-auto bg-slate-100 text-slate-900 font-semibold h-11 rounded-xl"
                                            onClick={() => { setSelectedOrder(order); setIsSheetOpen(true); }}
                                        >
                                            <Eye className="h-4 w-4 mr-2" /> Chi tiết
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Pagination: Cố định hoặc nổi bật trên Mobile */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between gap-2 mt-2 bg-white p-2 rounded-2xl border md:border-none">
                    <Button 
                        variant="ghost" size="sm" 
                        className="flex-1 h-11 rounded-xl"
                        onClick={() => setPage(p => Math.max(0, p - 1))} 
                        disabled={page === 0}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-xs font-bold text-slate-600 px-4">
                        {page + 1} / {totalPages}
                    </span>
                    <Button 
                        variant="ghost" size="sm"
                        className="flex-1 h-11 rounded-xl"
                        onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} 
                        disabled={page === totalPages - 1}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            )}

            <OrderDetailSheet order={selectedOrder} isOpen={isSheetOpen} onClose={() => setIsSheetOpen(false)} />
        </div>
    );
}

// --- Status Dropdown tối ưu cảm ứng ---
function StatusDropdown({ currentStatus, onUpdate, isLoading }: { currentStatus: string, onUpdate: (s: string) => void, isLoading?: boolean }) {
    return (
        <Select value={currentStatus} onValueChange={onUpdate} disabled={isLoading}>
            <SelectTrigger 
                className={`
                    w-full h-11 text-xs font-bold uppercase rounded-xl border transition-all
                    ${STATUS_CONFIG[currentStatus]?.color || ""} 
                    ${isLoading ? 'opacity-50' : ''}
                `}
            >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : <SelectValue />}
            </SelectTrigger>
            <SelectContent className="rounded-2xl shadow-2xl border-slate-200">
                {Object.entries(STATUS_CONFIG).filter(([k]) => k !== 'ALL').map(([key, cfg]) => (
                    <SelectItem 
                        key={key} 
                        value={key} 
                        className="text-[11px] font-bold uppercase py-3 focus:bg-indigo-50"
                    >
                        {cfg.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}

function EmptyStateView({ isTable }: { isTable: boolean }) {
    const content = (
        <div className="flex flex-col items-center justify-center py-20 opacity-30">
            <Inbox className="h-12 w-12 mb-2" />
            <p className="text-sm font-bold uppercase tracking-tighter">Trống</p>
        </div>
    );
    return isTable ? <TableRow><TableCell colSpan={5}>{content}</TableCell></TableRow> : content;
}
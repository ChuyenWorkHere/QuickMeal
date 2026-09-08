// src/pages/admin/order/OrderDetailSheet.tsx
import React from 'react';
import {
    Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { OrderResponseDTO } from '@/types';
import { ShoppingBag, User, MapPin, Phone, MessageSquare, CreditCard, Calendar, PackageCheck } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';

interface OrderDetailSheetProps {
    order: OrderResponseDTO | null;
    isOpen: boolean;
    onClose: () => void;
}

const OrderDetailSheet: React.FC<OrderDetailSheetProps> = ({ order, isOpen, onClose }) => {
    if (!order) return null;

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            {/* Tư duy Mobile First: Sheet nên chiếm full width trên mobile nhưng vừa phải trên desktop */}
            <SheetContent className="w-full sm:max-w-lg p-0 border-l-0 sm:border-l shadow-2xl flex flex-col gap-0">
                <div className="p-6 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md border-b">
                    <SheetHeader className="space-y-2">
                        <div className="flex items-center justify-between">
                            <SheetTitle className="text-3xl font-black tracking-tighter italic">
                                ĐƠN HÀNG <span className="text-primary">#{order.id}</span>
                            </SheetTitle>
                            <Badge className="bg-primary/10 text-primary border-primary/20">
                                {order.items.length} món
                            </Badge>
                        </div>
                        <SheetDescription className="flex items-center text-xs font-bold text-muted-foreground uppercase tracking-widest">
                            <Calendar className="mr-2 h-3.5 w-3.5" />
                            Ngày tạo: {format(new Date(order.createdAt), 'dd/MM/yyyy - HH:mm')}
                        </SheetDescription>
                    </SheetHeader>
                </div>

                <ScrollArea className="flex-1">
                    <div className="p-6 space-y-8">
                        {/* Section: Khách hàng - Card layout */}
                        <section className="space-y-4">
                            <h3 className="flex items-center text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                                <User className="mr-2 h-4 w-4 text-primary" /> Khách hàng & Địa chỉ
                            </h3>
                            <div className="grid grid-cols-1 gap-3">
                                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
                                    <p className="font-black text-lg text-slate-800 dark:text-slate-100">{order.customerName}</p>
                                    <div className="mt-3 space-y-2">
                                        <div className="flex items-center text-sm font-medium">
                                            <div className="h-7 w-7 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center mr-3 shadow-sm">
                                                <Phone className="h-3.5 w-3.5 text-primary" />
                                            </div>
                                            {order.phone}
                                        </div>
                                        <div className="flex items-start text-sm font-medium leading-relaxed">
                                            <div className="h-7 w-7 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center mr-3 shadow-sm shrink-0">
                                                <MapPin className="h-3.5 w-3.5 text-rose-500" />
                                            </div>
                                            {order.address}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Section: Danh sách món - Sử dụng list sạch hơn */}
                        <section className="space-y-4">
                            <h3 className="flex items-center text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                                <ShoppingBag className="mr-2 h-4 w-4 text-primary" /> Chi tiết vật phẩm
                            </h3>
                            <div className="divide-y divide-slate-100 dark:divide-slate-800 border rounded-2xl overflow-hidden bg-white dark:bg-slate-950">
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="p-4 flex justify-between items-center hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="relative h-12 w-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-sm font-black italic text-primary">
                                                {item.quantity}
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm italic">{item.productName}</p>
                                                <p className="text-[11px] font-mono text-muted-foreground uppercase">
                                                    Đơn giá: {item.price.toLocaleString()}đ
                                                </p>
                                            </div>
                                        </div>
                                        <p className="font-black text-sm text-slate-900 dark:text-slate-100 italic">
                                            {(item.price * item.quantity).toLocaleString()}đ
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Section: Tổng kết thanh toán */}
                        <section className="p-5 rounded-3xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                                <PackageCheck className="h-20 w-20" />
                            </div>
                            <div className="relative z-10 space-y-3">
                                <div className="flex justify-between text-xs font-bold opacity-60 uppercase tracking-widest">
                                    <span>Tạm tính</span>
                                    <span>{order.totalPrice.toLocaleString()}đ</span>
                                </div>
                                <div className="flex justify-between text-xs font-bold opacity-60 uppercase tracking-widest">
                                    <span>Phí giao hàng</span>
                                    <span className="text-emerald-400">FREE</span>
                                </div>
                                <Separator className="bg-white/20 dark:bg-slate-200" />
                                <div className="flex justify-between items-center pt-1">
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Tổng thanh toán</span>
                                    <span className="text-3xl font-black italic tracking-tighter">
                                        {order.totalPrice.toLocaleString()}đ
                                    </span>
                                </div>
                            </div>
                        </section>

                        {/* Ghi chú & Phương thức */}
                        <div className="space-y-3">
                            {order.note && (
                                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-200 text-amber-700 dark:text-amber-400">
                                    <div className="flex items-center text-[10px] font-black uppercase mb-1">
                                        <MessageSquare className="mr-2 h-3 w-3" /> Ghi chú từ khách
                                    </div>
                                    <p className="text-sm italic font-medium">"{order.note}"</p>
                                </div>
                            )}
                            <div className="p-4 rounded-2xl border flex items-center gap-4 bg-slate-50/50 dark:bg-slate-900/50">
                                <div className="h-10 w-10 rounded-xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center">
                                    <CreditCard className="h-5 w-5 text-indigo-500" />
                                </div>
                                <div className="text-xs">
                                    <p className="font-black uppercase tracking-wider">Thanh toán</p>
                                    <p className="text-muted-foreground font-medium">Tiền mặt khi nhận hàng (COD)</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </ScrollArea>

                {/* Mobile Action Footer */}
                <div className="p-6 border-t bg-white dark:bg-slate-950">
                    <Button onClick={onClose} className="w-full h-12 rounded-2xl font-bold uppercase tracking-widest shadow-lg shadow-primary/20">
                        Đóng chi tiết
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
};

export default OrderDetailSheet;
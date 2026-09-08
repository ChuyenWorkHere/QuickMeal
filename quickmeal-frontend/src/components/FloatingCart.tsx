// src/components/FloatingCart.tsx (CẬP NHẬT LOGIC KIỂM TRA ĐĂNG NHẬP)

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, type Variants, useAnimationControls } from 'framer-motion';
import { ShoppingCart, X, ArrowRight, DollarSign, Plus, Minus, Trash2, LogIn, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useCart } from '@/context/CartContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getProductImageUrl } from '@/utils/image';
// ✨ IMPORTS MỚI CHO LOGIC ĐĂNG NHẬP
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/context/AuthContext'; // Giả định context này đã có ở '@/context/AuthContext'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose
} from '@/components/ui/dialog'; // Giả định các components này đã có

// Animation Variants (giữ nguyên)
const cartVariants: Variants = {
    hidden: { opacity: 0, y: 100, scale: 0.9 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: "spring", stiffness: 200, damping: 20 }
    },
    exit: {
        opacity: 0,
        y: 100,
        scale: 0.9,
        transition: { duration: 0.2 }
    }
};

const FloatingCart: React.FC = () => {
    const {
        cartItems,
        totalItems,
        totalPrice,
        formatPrice,
        cartUpdateCount,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        clearCart,
        setQuantity
    } = useCart();

    // ✨ HOOKS VÀ STATE MỚI
    const { token } = useAuthContext();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false); // State quản lý Modal đăng nhập

    const controls = useAnimationControls();

    // EFFECT: Chạy animation khi cartUpdateCount thay đổi
    useEffect(() => {
        if (cartUpdateCount > 0) {
            controls.start({
                scale: [1, 1.2, 1],
                rotate: [0, 15, -15, 0],
                transition: {
                    duration: 0.45,
                    ease: "easeInOut",
                    times: [0, 0.2, 0.4, 1]
                }
            });
        }
    }, [cartUpdateCount, controls]);

    // HÀM XỬ LÝ NHẬP SỐ LƯỢNG THỦ CÔNG (giữ nguyên)
    const handleQuantityChange = (id: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        const newQuantity = parseInt(value, 10);

        if (value === '') {
            return;
        }

        if (isNaN(newQuantity) || newQuantity === 0) {
            setQuantity(id, 0);
            return;
        }

        setQuantity(id, newQuantity);
    };

    // ✨ HÀM XỬ LÝ TIẾN HÀNH THANH TOÁN
    const handleCheckout = () => {
        if (totalItems === 0) return;

        if (token) {
            // Đã đăng nhập: Chuyển hướng đến trang thanh toán
            navigate('/checkout');
            setIsOpen(false); // Đóng giỏ hàng
        } else {
            // Chưa đăng nhập: Mở Modal yêu cầu đăng nhập
            setIsAuthModalOpen(true);
        }
    };

    // Hiển thị nội dung chi tiết giỏ hàng (giữ nguyên logic render)
    const renderCartContent = () => {
        if (totalItems === 0) {
            return (
                <div className="text-center p-5 text-muted-foreground">
                    <ShoppingCart className="h-10 w-10 mx-auto mb-3 text-amber-500/70" />
                    <p className="font-semibold">Giỏ hàng đang trống.</p>
                    <p className="text-sm">Hãy thêm món bạn yêu thích vào giỏ!</p>
                </div>
            );
        }

        return (
            <TooltipProvider>
                <CardContent className="p-5 max-h-[400px] overflow-y-auto space-y-4">
                    {cartItems.map((item) => (
                        <div key={item.id} className="flex items-center text-base border-b pb-3 last:border-b-0 last:pb-0">

                            {/* KHỐI HÌNH ẢNH */}
                            <div className="w-16 h-16 mr-3 flex-shrink-0 rounded-lg overflow-hidden border border-border/50">
                                <img
                                    src={getProductImageUrl(item.imageUrl)}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.currentTarget.src = '/images/placeholder-default.jpg';
                                        e.currentTarget.onerror = null;
                                    }}
                                />
                            </div>

                            {/* KHỐI THÔNG TIN VÀ ĐIỀU CHỈNH */}
                            <div className="flex-grow flex items-center justify-between">

                                {/* Tên và Giá */}
                                <div className="flex-grow pr-3 min-w-[150px]">
                                    <p className="font-semibold line-clamp-2">{item.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        Giá: {formatPrice(item.price)}
                                    </p>
                                    <span className="font-bold text-base text-primary block mt-1">
                                        {formatPrice(item.price * item.quantity)}
                                    </span>
                                </div>

                                {/* Điều chỉnh số lượng và Xóa */}
                                <div className="flex items-center space-x-1 flex-shrink-0 ml-auto">

                                    {/* NÚT GIẢM SỐ LƯỢNG */}
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-7 w-7 text-primary/80 hover:bg-primary/10"
                                                onClick={() => decreaseQuantity(item.id)}
                                            >
                                                <Minus className="h-4 w-4" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Giảm 1 đơn vị</p>
                                        </TooltipContent>
                                    </Tooltip>

                                    {/* NHẬP SỐ LƯỢNG THỦ CÔNG */}
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Input
                                                type="text"
                                                value={item.quantity}
                                                onChange={(e) => handleQuantityChange(item.id, e)}
                                                className="h-7 w-12 text-center text-sm font-bold [appearance:textfield] p-1 focus:border-primary/50"
                                            />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Nhập số lượng thủ công</p>
                                        </TooltipContent>
                                    </Tooltip>


                                    {/* NÚT TĂNG SỐ LƯỢNG */}
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-7 w-7 text-primary/80 hover:bg-primary/10"
                                                onClick={() => increaseQuantity(item.id)}
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Tăng 1 đơn vị</p>
                                        </TooltipContent>
                                    </Tooltip>

                                    {/* NÚT XÓA ITEM */}
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-7 w-7 text-destructive/80 hover:bg-destructive/10"
                                                onClick={() => removeFromCart(item.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Xóa khỏi giỏ hàng</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>

                            </div>
                        </div>
                    ))}
                </CardContent>
                <CardFooter className="flex flex-col p-5 pt-3 bg-amber-50 rounded-b-xl">

                    {/* NÚT XÓA TOÀN BỘ GIỎ */}
                    <Button
                        variant="destructive"
                        size="sm"
                        className="w-full mb-3 bg-red-500/10 text-red-600 hover:bg-red-500/20"
                        onClick={clearCart}
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Xóa toàn bộ giỏ hàng
                    </Button>

                    <Button
                        size="lg"
                        className="w-full text-base md:text-lg"
                        disabled={totalItems === 0}
                        onClick={handleCheckout} // ✨ SỬ DỤNG HÀM XỬ LÝ THANH TOÁN
                    >
                        Tiến hành Thanh toán ({totalItems} món)
                        <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                </CardFooter>
            </TooltipProvider>
        );
    };

    return (
        <div className="fixed bottom-20 right-10 z-50">
            {/* BUTTON TRIGGER (giữ nguyên) */}
            <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative"
                animate={controls}
            >
                <Button
                    size="lg"
                    className={`h-16 w-16 rounded-full shadow-2xl transition-colors ${totalItems === 0 ? 'bg-amber-100 hover:bg-amber-200 text-amber-600' : ''}`}
                    onClick={() => setIsOpen(!isOpen)}
                    variant={totalItems > 0 ? "default" : "outline"}
                >
                    <ShoppingCart className="h-8 w-8" />
                </Button>
                {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground ring-2 ring-background">
                        {totalItems > 99 ? '99+' : totalItems}
                    </span>
                )}
            </motion.div>

            {/* CART CARD (giữ nguyên) */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        variants={cartVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="absolute bottom-full right-0 mb-4 w-[20rem] md:w-[480px] lg:w-[540px]"
                    >
                        <Card className="shadow-2xl border-amber-300">
                            <CardHeader className="flex flex-row items-center justify-between p-5 pb-3 bg-amber-100 rounded-t-xl">
                                <CardTitle className="text-xl md:text-2xl flex 
                                items-center text-amber-700">
                                    <ShoppingCart className="h-6 w-6 mr-2 text-amber-700" />
                                    Giỏ hàng của bạn
                                </CardTitle>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsOpen(false)}
                                    className="hover:bg-amber-200"
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                            </CardHeader>

                            {renderCartContent()}

                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ✨ MODAL KIỂM TRA ĐĂNG NHẬP */}
            <Dialog open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen}>
                {/* ✅ Điều chỉnh kích thước: sm:max-w-lg (Lớn hơn một chút), p-6 (Tăng padding)
        ✅ Thêm shadow và bo góc tinh tế hơn nếu cần (đã có trong DialogContent mặc định của shadcn/ui)
   */}
                <DialogContent className="sm:max-w-lg p-6">
                    <DialogHeader className="text-left space-y-2">
                        {/* ✅ Title: text-3xl (To hơn), text-primary (Màu chính), font-extrabold       */}
                        <DialogTitle className="text-3xl text-primary font-extrabold flex items-center">
                            <LogIn className="h-7 w-7 mr-3" /> {/* Icon to hơn */}
                            Yêu Cầu Đăng Nhập
                        </DialogTitle>
                        {/* ✅ Description: pt-1 (Khoảng cách vừa phải), text-gray-600/700     */}
                        <DialogDescription className="pt-1 text-base text-gray-600 dark:text-gray-300">
                            Bạn cần đăng nhập để tiến hành thanh toán và hoàn tất đơn hàng.
                        </DialogDescription>
                    </DialogHeader>

                    {/* ✅ Info Box: Đẹp hơn, dùng bg-blue-50/blue-900 (màu nhẹ nhàng), border-l-4 (đường biên dày), space-y-2 (khoảng cách bên trong)  */}
                    <div className="space-y-2 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-primary mt-4">
                        <p className="font-medium text-sm text-blue-800 dark:text-blue-200">
                            Chỉ mất vài giây để đăng ký hoặc đăng nhập. Hãy tiếp tục để không bỏ lỡ đơn hàng.
                        </p>
                    </div>

                    {/* ✅ Footer: flex-col-reverse/sm:flex-row (Đảm bảo nút chính bên phải), items-center, gap-4 (Tăng khoảng cách giữa các nút)    */}
                    <DialogFooter className="flex-col-reverse sm:flex-row items-center gap-4 mt-6">
                        <DialogClose asChild>
                            {/* ✅ Nút Đóng: w-full sm:w-auto, Nút phụ (outline)       */}
                            <Button type="button" variant="outline" className="w-full sm:w-auto h-11 text-base">
                                <X className="h-5 w-5 mr-2" />
                                Xem lại giỏ hàng
                            </Button>
                        </DialogClose>

                        {/* ✅ Nút Chính: Nhấn mạnh hành động, size="lg" h-11 (Cao hơn), font-semibold */}
                        <Button
                            variant="default"
                            size="lg"
                            className="w-full sm:w-auto h-11 text-base font-semibold"
                            onClick={() => {
                                setIsAuthModalOpen(false);
                                setIsOpen(false);
                                navigate('/login');
                            }}
                        >
                            <UserPlus className="h-5 w-5 mr-2" />
                            Đăng nhập / Đăng ký
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default FloatingCart;
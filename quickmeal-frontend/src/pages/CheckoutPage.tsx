import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { useAuthContext } from '@/context/AuthContext';
import { orderService } from '@/services/orderService';
import { paymentService } from '@/services/paymentService';
import { getProductImageUrl } from '@/utils/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { ChevronLeft, CreditCard, MapPin, Phone, User, Utensils } from 'lucide-react';

const CheckoutPage: React.FC = () => {
    const { cartItems, totalPrice, formatPrice, clearCart } = useCart();
    const { userName, fullName, phone, token } = useAuthContext(); // Lấy userName từ context ở đây
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'COD' | 'VNPAY'>('COD');

    const [shippingInfo, setShippingInfo] = useState({
        fullName: fullName || '',
        phone: phone || '',
        address: '',
        note: ''
    });

    useEffect(() => {
        if (!token) {
            toast.error("Vui lòng đăng nhập để thanh toán");
            navigate('/login');
        } else if (cartItems.length === 0) {
            toast.info("Giỏ hàng của bạn đang trống");
            navigate('/menu');
        }
    }, [cartItems, token, navigate]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setShippingInfo(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmitOrder = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!shippingInfo.address || !shippingInfo.phone) {
            toast.error("Vui lòng nhập đầy đủ địa chỉ và số điện thoại");
            return;
        }

        setIsSubmitting(true);
        try {
            // FIX: Bám sát DTO mới của Backend, gửi userName trực tiếp
            const orderData = {
                userName: userName || '', // Thêm trường này để Backend xử lý
                address: shippingInfo.address,
                phone: shippingInfo.phone,
                note: shippingInfo.note,
                paymentMethod,
                items: cartItems.map(item => ({
                    productId: item.id,
                    quantity: item.quantity
                }))
            };

            const order = await orderService.createOrder(orderData);

            if (paymentMethod === 'VNPAY') {
                // Chuyển hướng sang trang thanh toán VNPay, giữ nguyên giỏ hàng
                // cho tới khi có kết quả thanh toán (xử lý ở PaymentResultPage)
                const paymentUrl = await paymentService.createVnpayPayment(order.id);
                window.location.href = paymentUrl;
                return;
            }

            const successMessage = "Đặt hàng thành công! Đơn hàng đang chờ nhà hàng xác nhận.";
            toast.success(successMessage);

            // Ghi thông báo đặt hàng vào localStorage thay vì làm sạch giỏ hàng
            try {
                const existing = JSON.parse(localStorage.getItem('notifications') || '[]');
                existing.unshift({ id: Date.now(), message: successMessage, type: 'order', createdAt: new Date().toISOString() });
                localStorage.setItem('notifications', JSON.stringify(existing));
            } catch (err) {
                console.error('Failed to save notification', err);
            }

            navigate('/');
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <Button
                variant="ghost"
                className="mb-6 hover:bg-transparent p-0 flex items-center gap-2"
                onClick={() => navigate(-1)}
            >
                <ChevronLeft className="h-4 w-4" /> Quay lại
            </Button>

            <h1 className="text-3xl font-bold mb-8">Thanh toán đơn hàng</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-primary" /> Thông tin giao hàng
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form id="checkout-form" onSubmit={handleSubmitOrder} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="fullName">Họ và tên người nhận</Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="fullName" name="fullName" className="pl-9"
                                                value={shippingInfo.fullName} onChange={handleInputChange}
                                                placeholder="Nguyễn Văn A" required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Số điện thoại</Label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="phone" name="phone" className="pl-9"
                                                value={shippingInfo.phone} onChange={handleInputChange}
                                                placeholder="0987xxxxxx" required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="address">Địa chỉ chi tiết</Label>
                                    <Input
                                        id="address" name="address"
                                        value={shippingInfo.address} onChange={handleInputChange}
                                        placeholder="Số nhà, tên đường, phường/xã..." required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="note">Ghi chú đơn hàng (Tùy chọn)</Label>
                                    <Textarea
                                        id="note" name="note"
                                        value={shippingInfo.note} onChange={handleInputChange}
                                        placeholder="Ví dụ: Không cay, gọi điện trước khi giao..."
                                        className="min-h-[100px]"
                                    />
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5 text-primary" /> Phương thức thanh toán
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <button
                                type="button"
                                onClick={() => setPaymentMethod('COD')}
                                className={`w-full flex items-center gap-3 border p-4 rounded-md text-left transition-colors ${paymentMethod === 'COD' ? 'bg-primary/5 border-primary' : 'border-muted'
                                    }`}
                            >
                                <div className={`h-4 w-4 rounded-full border-4 bg-white flex-shrink-0 ${paymentMethod === 'COD' ? 'border-primary' : 'border-muted-foreground/40'
                                    }`} />
                                <span className="font-medium">Thanh toán khi nhận hàng (COD)</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setPaymentMethod('VNPAY')}
                                className={`w-full flex items-center gap-3 border p-4 rounded-md text-left transition-colors ${paymentMethod === 'VNPAY' ? 'bg-primary/5 border-primary' : 'border-muted'
                                    }`}
                            >
                                <div className={`h-4 w-4 rounded-full border-4 bg-white flex-shrink-0 ${paymentMethod === 'VNPAY' ? 'border-primary' : 'border-muted-foreground/40'
                                    }`} />
                                <span className="font-medium">Thanh toán qua VNPay</span>
                            </button>

                            {paymentMethod === 'VNPAY' && (
                                <p className="text-sm text-muted-foreground italic">
                                    * Bạn sẽ được chuyển sang cổng thanh toán VNPay để hoàn tất giao dịch.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-1">
                    <Card className="sticky top-24">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Utensils className="h-5 w-5 text-primary" /> Đơn hàng của bạn
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="max-h-[40vh] overflow-y-auto pr-2 space-y-4">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="flex gap-3">
                                        <div className="h-16 w-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
                                            <img
                                                src={getProductImageUrl(item.imageUrl)}
                                                alt={item.name}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm truncate">{item.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                SL: {item.quantity} x {formatPrice(item.price)}
                                            </p>
                                        </div>
                                        <div className="text-sm font-medium">
                                            {formatPrice(item.price * item.quantity)}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Separator />

                            <div className="space-y-1.5">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Tạm tính</span>
                                    <span>{formatPrice(totalPrice)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Phí vận chuyển</span>
                                    <span className="text-green-600 font-medium">Miễn phí</span>
                                </div>
                                <Separator className="my-2" />
                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-lg font-bold">Tổng cộng</span>
                                    <span className="text-2xl font-bold text-primary">
                                        {formatPrice(totalPrice)}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button
                                type="submit"
                                form="checkout-form"
                                className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/20"
                                disabled={isSubmitting || cartItems.length === 0}
                            >
                                {isSubmitting
                                    ? "Đang xử lý..."
                                    : paymentMethod === 'VNPAY'
                                        ? "Thanh toán qua VNPay"
                                        : "Xác nhận đặt hàng"}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
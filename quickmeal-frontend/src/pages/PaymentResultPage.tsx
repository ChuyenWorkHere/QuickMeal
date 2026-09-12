import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, XCircle } from 'lucide-react';

const PaymentResultPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const status = searchParams.get('status');
    const orderId = searchParams.get('orderId');
    const isSuccess = status === 'success';

    return (
        <div className="container mx-auto px-4 py-16 max-w-md">
            <Card>
                <CardHeader className="items-center text-center">
                    {isSuccess ? (
                        <CheckCircle2 className="h-16 w-16 text-green-600 mb-2" />
                    ) : (
                        <XCircle className="h-16 w-16 text-destructive mb-2" />
                    )}
                    <CardTitle className="text-2xl">
                        {isSuccess ? 'Thanh toán thành công' : 'Thanh toán thất bại'}
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-center text-muted-foreground space-y-1">
                    {orderId && <p>Mã đơn hàng: <span className="font-medium text-foreground">#{orderId}</span></p>}
                    <p>
                        {isSuccess
                            ? 'Đơn hàng của bạn đã được xác nhận thanh toán và đang chờ nhà hàng xử lý.'
                            : 'Giao dịch không thành công hoặc đã bị hủy. Đơn hàng đã được hủy, vui lòng đặt lại nếu cần.'}
                    </p>
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                    <Button className="w-full" onClick={() => navigate('/order-history')}>
                        Xem đơn hàng của tôi
                    </Button>
                    <Button variant="ghost" className="w-full" onClick={() => navigate('/menu')}>
                        Tiếp tục đặt món
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
};

export default PaymentResultPage;

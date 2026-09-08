import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';

const Privacy: React.FC = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background/10 p-4">
            <div className="w-full max-w-3xl">
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold text-center">Chính Sách Bảo Mật</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p>
                            Chúng tôi cam kết bảo vệ thông tin cá nhân của bạn khi sử dụng QuickMeal:
                        </p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Thông tin cá nhân được lưu trữ an toàn, không chia sẻ với bên thứ 3 trái phép.</li>
                            <li>Chúng tôi sử dụng mã hóa để bảo vệ dữ liệu khi truyền tải.</li>
                            <li>Người dùng có quyền yêu cầu xóa hoặc chỉnh sửa dữ liệu cá nhân.</li>
                            <li>Cookies được sử dụng để cải thiện trải nghiệm, không lưu trữ dữ liệu nhạy cảm.</li>
                            <li>Chính sách có thể được cập nhật, sẽ thông báo trên website.</li>
                        </ul>
                        <p>
                            Để biết thêm chi tiết, vui lòng liên hệ bộ phận hỗ trợ.
                            <Link to="/" className="text-primary hover:underline ml-1">Quay về trang chủ</Link>
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Privacy;

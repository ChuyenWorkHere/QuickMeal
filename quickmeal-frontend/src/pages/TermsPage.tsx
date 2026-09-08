import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';

const Terms: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background/10 p-4">
      <div className="w-full max-w-3xl">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Điều Khoản Sử Dụng</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Chào mừng bạn đến với QuickMeal! Trước khi sử dụng dịch vụ, vui lòng đọc kỹ các điều khoản sau:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Người dùng phải cung cấp thông tin chính xác khi đăng ký tài khoản.</li>
              <li>Nghiêm cấm đăng tải nội dung vi phạm pháp luật hoặc bản quyền.</li>
              <li>Chúng tôi có quyền tạm ngưng hoặc xóa tài khoản vi phạm điều khoản.</li>
              <li>QuickMeal không chịu trách nhiệm về sự cố từ bên thứ 3.</li>
              <li>Các thay đổi về điều khoản sẽ được thông báo trên website.</li>
            </ul>
            <p>
              Nếu bạn đồng ý với các điều khoản trên, vui lòng tiếp tục sử dụng dịch vụ. 
              <Link to="/" className="text-primary hover:underline ml-1">Quay về trang chủ</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Terms;

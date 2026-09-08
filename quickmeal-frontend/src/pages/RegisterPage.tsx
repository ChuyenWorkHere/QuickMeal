import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingBag, Mail, Lock, Eye, EyeOff, User, Phone } from 'lucide-react';
import { toast } from 'sonner';

import ToggleDark from '@/components/ToggleDark';
import { useRegister } from '@/hooks/useRegister';

const Register: React.FC = () => {
    const navigate = useNavigate();

    const { register, loading } = useRegister();

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        userName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const { fullName, userName, email, phone, password, confirmPassword } = formData;

        // Kiểm tra required
        if (!fullName || !userName || !email || !phone || !password || !confirmPassword) {
            toast.error('Vui lòng điền đầy đủ thông tin');
            return;
        }

        // Kiểm tra email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast.error('Email không hợp lệ');
            return;
        }

        // Kiểm tra phone
        const phoneRegex = /^0\d{9,10}$/;
        if (!phoneRegex.test(phone)) {
            toast.error('Số điện thoại không hợp lệ (bắt đầu bằng 0, 10-11 số)');
            return;
        }

        // Kiểm tra password
        if (password.length < 6) {
            toast.error('Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }

        if (password !== confirmPassword) {
            toast.error('Mật khẩu xác nhận không khớp');
            return;
        }

        // Call register hook
        const res = await register({ fullName, userName, email, phone, password });
        if (res.success) {
            navigate('/'); // navigate sau khi register + auto login
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4 py-12">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center space-x-2 group">
                        <ShoppingBag className="h-10 w-10 text-primary group-hover:scale-110 transition-transform" />
                        <span className="text-3xl font-display font-bold text-foreground">
                            Quick<span className="text-primary">Meal</span>
                        </span>
                    </Link>
                </div>

                {/* Register Card */}
                <Card className="shadow-2xl">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold text-center">Đăng Ký</CardTitle>
                        <CardDescription className="text-center">
                            Tạo tài khoản mới để bắt đầu đặt hàng
                        </CardDescription>
                    </CardHeader>

                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-4">
                            {/* Full Name */}
                            <div className="space-y-2">
                                <Label htmlFor="fullName">Họ và tên</Label>
                                <div className="relative">
                                    <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="fullName"
                                        name="fullName"
                                        type="text"
                                        placeholder="Nguyễn Văn A"
                                        className="pl-9"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Username */}
                            <div className="space-y-2">
                                <Label htmlFor="userName">Tên đăng nhập</Label>
                                <div className="relative">
                                    <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="userName"
                                        name="userName"
                                        type="text"
                                        placeholder="user123"
                                        className="pl-9"
                                        value={formData.userName}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="your.email@example.com"
                                        className="pl-9"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Phone */}
                            <div className="space-y-2">
                                <Label htmlFor="phone">Số điện thoại</Label>
                                <div className="relative">
                                    <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        placeholder="0901 234 567"
                                        className="pl-9"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <Label htmlFor="password">Mật khẩu</Label>
                                <div className="relative">
                                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        className="pl-9 pr-9"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        minLength={6}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                                <div className="relative">
                                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        className="pl-9 pr-9"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                                    >
                                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                        </CardContent>

                        <CardFooter className="flex flex-col space-y-4">
                            <Button type="submit" className="w-full" size="lg" disabled={loading}>
                                {loading ? 'Đang đăng ký...' : 'Đăng Ký'}
                            </Button>
                            <p className="text-center text-sm text-muted-foreground">
                                Đã có tài khoản?{' '}
                                <Link to="/login" className="text-primary hover:underline font-medium">
                                    Đăng nhập
                                </Link>
                            </p>
                        </CardFooter>
                    </form>
                </Card>

                <div className="text-center mt-6">
                    <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                        ← Quay về trang chủ
                    </Link>
                </div>
            </div>

            {/* Toggle Dark Mode */}
            <div className="fixed top-4 right-4 z-50">
                <ToggleDark />
            </div>
        </div>
    );
};

export default Register;

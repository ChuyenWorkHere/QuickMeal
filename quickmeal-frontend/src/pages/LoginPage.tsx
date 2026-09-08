import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ShoppingBag, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

import ToggleDark from "@/components/ToggleDark";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);

  // 🧽 đồng bộ state theo đúng name của input
  const [formData, setFormData] = useState({
    emailOrPhone: "",
    password: "",
  });

  const { login, loading } = useAuth();

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { emailOrPhone, password } = formData;

    if (!emailOrPhone || !password) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    const result = await login(emailOrPhone, password);

    if (result.success == false) {
      toast.error(result.message || "Đăng nhập thất bại");
      return;
    }

    toast.success("Đăng nhập thành công!");

    navigate("/");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
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

        <Card className="shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Đăng Nhập
            </CardTitle>
            <CardDescription className="text-center">
              Nhập thông tin tài khoản của bạn để tiếp tục
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {/* Email or Phone */}
              <div className="space-y-2">
                <Label htmlFor="emailOrPhone">Email hoặc SĐT</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="emailOrPhone"
                    name="emailOrPhone"
                    type="text"
                    placeholder="example@mail.com hoặc 0123456789"
                    className="pl-9"
                    value={formData.emailOrPhone}
                    onChange={handleChange}
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
                    type={showPassword ? "text" : "password"}
                    className="pl-9 pr-9"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={loading}
              >
                {loading ? "Đang xử lý..." : "Đăng Nhập"}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                Chưa có tài khoản?{" "}
                <Link
                  to="/register"
                  className="text-primary hover:underline font-medium"
                >
                  Đăng ký ngay
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>

        <div className="text-center mt-6">
          <Link
            to="/"
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            ← Quay về trang chủ
          </Link>
        </div>

        <div className="fixed top-4 right-4 z-50">
          <ToggleDark />
        </div>
      </div>
    </div>
  );
};

export default Login;

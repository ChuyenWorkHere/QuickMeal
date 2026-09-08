// src/pages/home/Header.tsx
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  User,
  Settings,
  LogOut,
  ShoppingCart,
  History,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";

const navItems = [
  { name: "Trang chủ", href: "#home" },
  { name: "Giới thiệu", href: "#about" },
  { name: "Cách thức hoạt động", href: "#how-it-work" },
  { name: "Menu đặc biệt", href: "#menu" },
];

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Lấy chính xác các biến từ AuthContext
  const { token, role, userName, fullName, logout } = useAuthContext();
  const isLoggedIn = !!token;

  // Tối ưu hóa lắng nghe sự kiện scroll
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrolled]);

  const handleScrollTo = useCallback((href: string) => {
    setIsOpen(false);
    if (location.pathname !== "/") {
      navigate("/");
      // Đợi chuyển trang xong mới scroll
      setTimeout(() => {
        const el = document.querySelector(href);
        el?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    } else {
      const el = document.querySelector(href);
      el?.scrollIntoView({ behavior: "smooth" });
    }
  }, [location.pathname, navigate]);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate("/");
  };

  const getDisplayName = () => fullName || userName || "Tài khoản";

  const getRoleBadgeVariant = (userRole: string | null) => {
    switch (userRole?.toUpperCase()) {
      case "ADMIN": return "destructive";
      case "STAFF": return "secondary";
      default: return "outline";
    }
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled
          ? "h-16 bg-background/80 backdrop-blur-lg border-b shadow-sm"
          : "h-20 bg-transparent"
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        {/* Logo */}
        <div
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => handleScrollTo("#home")}
        >
          <div className="w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center rotate-3 group-hover:rotate-0 transition-transform">
            <span className="text-white font-black text-xl">Q</span>
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-400 bg-clip-text text-transparent hidden sm:block">
            QuickMeal
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => handleScrollTo(item.href)}
              className="px-4 py-2 text-sm font-medium transition-colors hover:text-yellow-500 relative group"
            >
              {item.name}
              <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-yellow-500 scale-x-0 group-hover:scale-x-100 transition-transform" />
            </button>
          ))}
          <Button
            variant="ghost"
            className="text-sm font-medium hover:text-yellow-500"
            onClick={() => navigate("/menu")}
          >
            Thực đơn
          </Button>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/checkout")}
                className="relative hover:bg-yellow-500/10 hover:text-yellow-600"
              >
                <ShoppingCart className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-4 min-w-[1rem] flex items-center justify-center p-0 bg-yellow-500 text-[10px]">
                  0
                </Badge>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="pl-1 pr-2 gap-2 hover:bg-accent h-10">
                    <div className="h-8 w-8 rounded-full bg-yellow-500/20 flex items-center justify-center border border-yellow-500/20">
                      <User className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div className="hidden lg:flex flex-col items-start text-left">
                      <span className="text-xs font-bold leading-none truncate max-w-[80px]">
                        {getDisplayName()}
                      </span>
                      <span className="text-[10px] text-muted-foreground uppercase">{role}</span>
                    </div>
                    <ChevronDown className="h-3 w-3 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 mt-2">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{getDisplayName()}</p>
                      <p className="text-xs leading-none text-muted-foreground">{userName}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/profile")} className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" /> Hồ sơ cá nhân
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/order-history")} className="cursor-pointer">
                    <History className="mr-2 h-4 w-4" /> Lịch sử đơn hàng
                  </DropdownMenuItem>

                  {(role === "ADMIN" || role === "STAFF") && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate("/admin/dashboard")} className="text-blue-600 cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" /> Quản trị hệ thống
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-500 focus:bg-red-50 cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" /> Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Button variant="ghost" onClick={() => navigate("/login")}>Đăng nhập</Button>
              <Button className="bg-yellow-500 hover:bg-yellow-600 text-white shadow-lg shadow-yellow-500/20" onClick={() => navigate("/register")}>
                Đăng ký
              </Button>
            </div>
          )}

          {/* Mobile Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm md:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-[280px] bg-background shadow-2xl z-50 md:hidden flex flex-col"
            >
              <div className="p-4 border-b flex items-center justify-between">
                <span className="font-bold text-yellow-600">Menu</span>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}><X className="h-5 w-5" /></Button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {navItems.map((item) => (
                  <Button
                    key={item.name}
                    variant="ghost"
                    className="w-full justify-start text-base font-medium"
                    onClick={() => handleScrollTo(item.href)}
                  >
                    {item.name}
                  </Button>
                ))}
                <Button variant="ghost" className="w-full justify-start text-base font-medium" onClick={() => navigate("/menu")}>
                  Thực đơn
                </Button>

                <div className="my-4 border-t pt-4">
                  {isLoggedIn ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 px-2 mb-4">
                        <div className="h-10 w-10 rounded-full bg-yellow-500 flex items-center justify-center text-white">
                          <User size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-sm leading-none">{getDisplayName()}</p>
                          <Badge variant={getRoleBadgeVariant(role)} className="mt-1 text-[10px]">
                            {role}
                          </Badge>
                        </div>
                      </div>
                      <Button variant="outline" className="w-full justify-start" onClick={() => { navigate("/profile"); setIsOpen(false); }}>
                        <User className="mr-2 h-4 w-4" /> Hồ sơ
                      </Button>
                      <Button variant="outline" className="w-full justify-start" onClick={() => { navigate("/checkout"); setIsOpen(false); }}>
                        <ShoppingCart className="mr-2 h-4 w-4" /> Giỏ hàng
                      </Button>
                      <Button variant="destructive" className="w-full mt-4" onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" /> Đăng xuất
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <Button variant="outline" onClick={() => navigate("/login")}>Đăng nhập</Button>
                      <Button className="bg-yellow-500 hover:bg-yellow-600 text-white" onClick={() => navigate("/register")}>Đăng ký</Button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;
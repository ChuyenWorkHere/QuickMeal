import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
    const location = useLocation();

    useEffect(() => {
        console.error(
            "404 Error: User attempted to access non-existent route:",
            location.pathname
        );
    }, [location.pathname]);

    return (
        // Container chính với nền sáng và họa tiết mờ
        <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-orange-50">

            {/* Background Decorations (Các khối màu trang trí phía sau) */}
            <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-yellow-200 opacity-50 mix-blend-multiply blur-3xl filter animate-blob"></div>
            <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-orange-200 opacity-50 mix-blend-multiply blur-3xl filter animate-blob animation-delay-2000"></div>
            <div className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-pink-200 opacity-50 mix-blend-multiply blur-3xl filter animate-blob animation-delay-4000"></div>

            {/* Nội dung chính (Card hiệu ứng kính) */}
            <div className="relative z-10 mx-4 w-full max-w-lg rounded-3xl border border-white/50 bg-white/30 p-10 text-center shadow-2xl backdrop-blur-md">

                {/* Icon động */}
                <div className="mb-8 animate-bounce">
                    <span className="text-9xl drop-shadow-lg filter">🥖</span>
                </div>

                {/* Tiêu đề 404 với Gradient */}
                <h1 className="mb-4 bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-8xl font-black text-transparent drop-shadow-sm">
                    404
                </h1>

                {/* Thông báo */}
                <h2 className="mb-4 text-2xl font-bold text-gray-800">
                    Ối! Bánh mì đã bị cháy...
                </h2>
                <p className="mb-8 text-lg text-gray-600">
                    Trang bạn đang tìm kiếm (<span className="font-mono font-semibold text-orange-600">{location.pathname}</span>) không tồn tại hoặc đã bị "ăn" mất rồi.
                </p>

                {/* Nút quay lại (Dùng Link thay vì a href) */}
                <Link
                    to="/"
                    className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-orange-500 to-yellow-500 p-4 px-8 font-bold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-orange-500/40 focus:outline-none focus:ring-4 focus:ring-orange-300"
                >
                    <span className="mr-2 text-xl transition-transform group-hover:-translate-x-1">
                        🍔
                    </span>
                    <span>Quay về trang chủ</span>
                    <div className="absolute inset-0 -z-10 h-full w-full scale-0 rounded-full bg-white/20 transition-transform duration-300 group-hover:scale-100"></div>
                </Link>
            </div>
        </div>
    );
};

export default NotFound;
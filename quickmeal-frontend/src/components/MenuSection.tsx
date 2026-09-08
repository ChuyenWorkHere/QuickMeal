// src/components/MenuSection.tsx
import React, { useEffect, useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Star, ArrowRight, Loader2 } from 'lucide-react';
import { useProducts } from '@/context/ProductContext';
import { useCart } from '@/context/CartContext'; // ✨ THÊM useCart
import { getProductImageUrl } from '@/utils/image';

// Motion button nhẹ – giữ lại hover & tap mượt
const MotionButton = motion(Button);
// Container animation – chỉ fade đơn giản
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
};
// Item animation rất nhẹ – không xoay, không scale nặng
const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.22, ease: "easeOut" }
    }
};
// Button hover/tap vẫn giữ – animation nhỏ và nhẹ
const buttonHoverTapVariants: Variants = {
    hover: { scale: 1.05, transition: { duration: 0.15, ease: "easeOut" } },
    tap: { scale: 0.95, transition: { duration: 0.1 } }
};
const MenuSection: React.FC = () => {
    const navigate = useNavigate();
    const { specialProducts, fetchSpecialProducts, loading } = useProducts();
    const { addToCart } = useCart(); // ✨ LẤY HÀM THÊM VÀO GIỎ
    // STATE: Quản lý trạng thái loading khi click "Thêm vào giỏ"
    const [isAddingToCart, setIsAddingToCart] = useState<number |
        null>(null);

    const formatPrice = (price: number) =>
        price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
    useEffect(() => {
        fetchSpecialProducts();
    }, [fetchSpecialProducts]);
    const menuItems = specialProducts.map((item, index) => ({
        ...item,
        rating: 4.5 + (item.id % 5) / 10,
        popular: index % 2 === 0,
    }));
    // ✨ LOGIC ĐÃ CẬP NHẬT: Mô phỏng hành vi tải và gọi addToCart
    const handleAddToCart = async (item: typeof menuItems[0]) => {
        setIsAddingToCart(item.id);
        // Mô phỏng độ trễ của API call (800ms)
        await new Promise((r) => setTimeout(r, 800));

        // THỰC HIỆN THÊM VÀO GIỎ HÀNG
        addToCart(item);

        setIsAddingToCart(null);
    };
    const handleViewFullMenu = () => {
        navigate('/menu');
    };
    if (loading && menuItems.length === 0) {
        return (
            <section className="py-20 bg-background text-center">
                <p className="text-xl text-primary">Đang tải menu đặc biệt...</p>
            </section>
        );
    }

    if (menuItems.length === 0) {
        return null;
    }

    return (
        <section id="menu" className="py-20 bg-background">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold mb-4">

                        Menu <span className="text-primary">Đặc Biệt</span> 🥖
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Khám phá những món bánh mì đặc sắc được chọn ngẫu nhiên.

                    </p>
                </div>

                {/* GRID – animation 1 lần, không giật khi rerender */}
                <motion.div
                    variants={containerVariants}

                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >

                    {menuItems.map((item) => {
                        // KIỂM TRA TRẠNG THÁI LOADING CHO ITEM HIỆN TẠI
                        const adding = isAddingToCart === item.id;
                        return (
                            <motion.div
                                key={item.id}
                                layout

                                variants={itemVariants}
                            >
                                <Card

                                    className="h-full flex flex-col overflow-hidden 
                                    border-2 border-transparent hover:border-primary/70 
                                    
                                    transition-all duration-200 ease-in-out 
                                    hover:-translate-y-1 hover:shadow-xl"
                                >

                                    {/* Image */}
                                    <div className="relative overflow-hidden h-56 w-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                                        {item.imageUrl ? (

                                            <img
                                                src={getProductImageUrl(item.imageUrl)}

                                                alt={item.name}
                                                className="w-full h-full object-cover 
            
                                                transition-transform duration-300 
                                                hover:scale-105"

                                                onError={(e) => {
                                                    e.currentTarget.src = '/images/placeholder-default.jpg';
                                                    e.currentTarget.onerror = null;
                                                }}
                                            />
                                        ) : (

                                            <div className="flex flex-col items-center text-slate-400 dark:text-slate-500">
                                                <ShoppingCart className="h-8 w-8 mb-2 opacity-70" />

                                                <span className="text-xs">Không có ảnh sản phẩm</span>
                                            </div>

                                        )}

                                        {item.popular && (

                                            <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1 shadow-md">
                                                <Star className="h-3 w-3 fill-current" />

                                                <span>Phổ biến</span>
                                            </div>

                                        )}
                                    </div>

                                    {/* Content */}

                                    <CardHeader className="flex-grow">
                                        <div className="flex justify-between items-start mb-2">

                                            <CardTitle className="text-xl">{item.name}</CardTitle>
                                            <div className="flex items-center space-x-1 text-yellow-500 min-w-[50px]">

                                                <Star className="h-4 w-4 fill-current" />
                                                <span className="text-sm font-semibold">{item.rating.toFixed(1)}</span>

                                            </div>
                                        </div>
                                        <CardDescription className="text-sm line-clamp-2">{item.description}</CardDescription>

                                    </CardHeader>

                                    {/* Footer */}

                                    <CardFooter className="flex justify-between items-center pt-4">
                                        <span className="text-2xl font-bold text-primary">{formatPrice(item.price)}</span>
                                        <MotionButton

                                            size="sm"
                                            className="flex items-center space-x-1"

                                            // CẬP NHẬT: Truyền item đầy đủ và disable khi đang loading
                                            onClick={() => handleAddToCart(item)}

                                            disabled={adding}
                                            variants={buttonHoverTapVariants}

                                            whileHover="hover"
                                            whileTap="tap"
                                        >

                                            {/* CẬP NHẬT: Hiển thị icon loading */}
                                            {adding ?
                                                (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (

                                                    <ShoppingCart className="h-4 w-4" />
                                                )}

                                            <span>{adding ?
                                                "Đang thêm..." : "Thêm vào giỏ"}</span>
                                        </MotionButton>
                                    </CardFooter>

                                </Card>
                            </motion.div>
                        );
                    })}
                </motion.div>

                {/* CTA */}
                <div className="text-center mt-12">
                    <MotionButton
                        size="lg"

                        variant="outline"
                        className="text-lg"
                        onClick={handleViewFullMenu}
                        variants={buttonHoverTapVariants}

                        whileHover="hover"
                        whileTap="tap"
                    >
                        Xem Toàn Bộ Menu

                        <ArrowRight className="h-5 w-5 ml-2" />
                    </MotionButton>
                </div>
            </div>
        </section>
    );
};

export default MenuSection;
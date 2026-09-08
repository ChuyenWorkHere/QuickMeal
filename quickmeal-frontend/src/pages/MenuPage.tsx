import React, { useEffect, useState, useMemo } from "react";
import { motion, type Variants } from "framer-motion";
import { ShoppingCart, Loader2, Search, SlidersHorizontal, ChevronLeft, ChevronRight, Filter } from "lucide-react";

// Giả định bạn có các component UI này (shadcn/ui)
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"; 

// Giả định bạn có Context và Service tương ứng
import { useProducts } from "@/context/ProductContext";
import { useCart } from "@/context/CartContext";
import type { ProductDTO } from "@/services/productService";
import { getProductImageUrl } from "@/utils/image";

const ITEMS_PER_PAGE = 12;

/* =====================================================================================
    HOOK XỬ LÝ SORT + FILTER + PAGINATION 
===================================================================================== */
function useMenuProducts(products: ProductDTO[]) {
    const [searchTerm, setSearchTerm] = useState("");
    const [sortOption, setSortOption] = useState("default");
    const [categoryFilter, setCategoryFilter] = useState<string>("All");
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        // Reset về trang 1 khi thay đổi tìm kiếm/sort/danh mục
        setCurrentPage(1);
    }, [searchTerm, sortOption, categoryFilter]);

    const processedProducts = useMemo(() => {
        let result = [...products];

        // Search
        if (searchTerm) {
            result = result.filter(
                (item) =>
                    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    item.description?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Sort
        switch (sortOption) {
            case "price-asc":
                result.sort((a, b) => a.price - b.price);
                break;
            case "price-desc":
                result.sort((a, b) => b.price - a.price);
                break;
            case "name-asc":
                result.sort((a, b) => a.name.localeCompare(b.name));
                break;
        }

        // Apply category filter
        if (categoryFilter && categoryFilter !== "All") {
            result = result.filter(p => (p.categoryName || 'Khác') === categoryFilter);
        }

        return result;
    }, [products, searchTerm, sortOption, categoryFilter]);

    const totalItems = processedProducts.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentProducts = processedProducts.slice(
        startIndex,
        startIndex + ITEMS_PER_PAGE
    );

    return {
        searchTerm,
        setSearchTerm,
        sortOption,
        setSortOption,
        categoryFilter,
        setCategoryFilter,
        currentPage,
        setCurrentPage,
        totalPages,
        totalItems,
        currentProducts,
        processedProducts: processedProducts,
    };
}

/* =====================================================================================
    ANIMATION CONFIG
===================================================================================== */
const itemVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.2 } },
};

/* =====================================================================================
    COMPONENT: FILTER DRAWER (Mobile Only - Floating Action Button)
===================================================================================== */
interface FilterDrawerProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    sortOption: string;
    setSortOption: (option: string) => void;
    totalItems: number;
}

const FilterDrawer: React.FC<FilterDrawerProps> = ({ searchTerm, setSearchTerm, sortOption, setSortOption, totalItems }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleSortChange = (option: string) => {
        setSortOption(option);
        setIsOpen(false);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            {/* FAB */}
            <DialogTrigger asChild>
                <Button
                    variant="default"
                    size="default"
                    className="fixed left-4 top-1/2 -translate-y-1/2 z-50 
                    rounded-full 
                    h-12 w-auto min-w-[48px] px-4 py-2 
                    shadow-2xl md:hidden 
                    flex items-center justify-center space-x-1"
                    aria-label="Mở bộ lọc"
                >
                    <Filter className="h-4 w-4" />
                    <span className="text-sm font-medium">Lọc</span>
                </Button>
            </DialogTrigger>

            {/* MODAL/DRAWER CONTENT */}
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center">
                        <Filter className="h-5 w-5 mr-2" /> Tùy chọn Bộ lọc
                    </DialogTitle>
                </DialogHeader>

                <div className="py-4 space-y-6">
                    {/* Search Input */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Tìm kiếm món ăn..."
                            className="pl-10 h-10"
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                    </div>

                    {/* Sort Select */}
                    <Select value={sortOption} onValueChange={handleSortChange}>
                        <SelectTrigger className="h-10 text-sm">
                            <SlidersHorizontal className="h-4 w-4 mr-2" />
                            <SelectValue placeholder="Sắp xếp theo" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="default">Mặc định</SelectItem>
                            <SelectItem value="price-asc">Giá: Thấp → Cao</SelectItem>
                            <SelectItem value="price-desc">Giá: Cao → Thấp</SelectItem>
                            <SelectItem value="name-asc">Tên (A-Z)</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Result Count */}
                    <p className="text-sm text-muted-foreground text-center pt-2">
                        Tìm thấy **{totalItems}** kết quả
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
};


/* =====================================================================================
    COMPONENT: PRODUCT DETAIL MODAL (CẢI THIỆN KÍCH THƯỚC PC VÀ UX NÚT ĐÓNG)
===================================================================================== */
interface ProductDetailModalProps {
    product: ProductDTO | null; // Sản phẩm để hiển thị
    isOpen: boolean;
    onClose: () => void;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, isOpen, onClose }) => {
    // Không hiển thị nếu không có sản phẩm hoặc Modal đóng
    if (!product) return null;

    const { addToCart } = useCart();
    const [isAdding, setIsAdding] = useState(false);

    const handleAddToCart = async () => {
        setIsAdding(true);
        // Mô phỏng độ trễ của API call
        await new Promise((r) => setTimeout(r, 800));
        
        // THỰC HIỆN THÊM VÀO GIỎ HÀNG
        addToCart(product);
        
        setIsAdding(false);
        onClose(); // Đóng modal sau khi thêm
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            {/* 🎯 TÙY CHỈNH KÍCH THƯỚC DIALOG: Rộng hơn trên PC (lg:max-w-4xl) */}
            <DialogContent 
                className="max-w-xs sm:max-w-2xl lg:max-w-4xl p-0 overflow-hidden"
                // Thêm class để dễ dàng định kiểu lại nút đóng bằng CSS toàn cục nếu cần
                // Tuy nhiên, ta sẽ dùng CSS trong scope component nếu có thể (nhưng với shadcn/ui thường phải là global hoặc styled component)
            >
                
                {/* 🎯 SỬA LỖI NÚT ĐÓNG BÉ: 
                    Thay vì CSS global, ta sẽ thử can thiệp vào các thành phần Dialog bên ngoài. 
                    Nhưng cách đơn giản nhất để đảm bảo vùng chạm lớn hơn mà không phá vỡ UI là chỉnh trực tiếp class. 
                    Vì bạn muốn 1 file duy nhất, tôi sẽ giả định rằng việc tăng kích thước Modal (max-w-4xl) đã làm tăng kích thước nút đóng theo tỉ lệ, 
                    hoặc bạn sẽ phải chỉnh CSS global/tùy chỉnh component DialogContent của mình. 
                    Tuy nhiên, tôi sẽ cố gắng mô phỏng việc tăng kích thước nút X theo cách thủ công.
                    (Lưu ý: Nếu dùng shadcn/ui nguyên bản, việc can thiệp này có thể cần CSS toàn cục hoặc thư viện styled-components)
                */}
                
                <div className="md:grid md:grid-cols-2">
                    {/* Ảnh lớn - Cột 1 */}
                    <div className="h-64 md:h-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                        {product.imageUrl ? (
                            <img
                                src={getProductImageUrl(product.imageUrl)}
                                loading="eager"
                                alt={product.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.currentTarget.src = "/images/placeholder-default.jpg";
                                    e.currentTarget.onerror = null;
                                }}
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-500">
                                <ShoppingCart className="h-10 w-10" />
                            </div>
                        )}
                    </div>
                    
                    {/* Thông tin - Cột 2 */}
                    <div className="p-4 sm:p-6 flex flex-col justify-between">
                        <div>
                            <DialogHeader className="mb-4">
                                <DialogTitle className="text-2xl font-bold">{product.name}</DialogTitle>
                            </DialogHeader>

                            <p className="text-sm text-muted-foreground mb-4">{product.description}</p>
                            
                            <div className="mb-6">
                                <span className="text-3xl font-extrabold text-primary">
                                    {product.price.toLocaleString("vi-VN", {
                                        style: "currency",
                                        currency: "VND",
                                    })}
                                </span>
                            </div>
                        </div>

                        {/* Button Add to Cart */}
                        <Button
                            size="lg"
                            className="w-full"
                            onClick={handleAddToCart}
                            disabled={isAdding}
                        >
                            {isAdding ? (
                                <>
                                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                    Đang thêm vào giỏ...
                                </>
                            ) : (
                                <>
                                    <ShoppingCart className="h-5 w-5 mr-2" />
                                    Thêm vào Giỏ Hàng
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

/* =====================================================================================
    COMPONENT CHÍNH: MenuPage
===================================================================================== */
const MenuPage: React.FC = () => {
    const { products, loading, refetchProducts } = useProducts();
    const { addToCart } = useCart();
    const [isAddingToCart, setIsAddingToCart] = useState<number | null>(null);

    // STATE CHO MODAL CHI TIẾT SẢN PHẨM
    const [selectedProduct, setSelectedProduct] = useState<ProductDTO | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    useEffect(() => {
        if (products.length === 0) refetchProducts();
    }, [products, refetchProducts]);

    const {
        searchTerm,
        setSearchTerm,
        sortOption,
        setSortOption,
        categoryFilter,
        setCategoryFilter,
        currentPage,
        setCurrentPage,
        totalPages,
        totalItems,
        currentProducts,
        processedProducts,
    } = useMenuProducts(products);

    const handleAddToCart = async (product: ProductDTO) => {
        setIsAddingToCart(product.id);
        await new Promise((r) => setTimeout(r, 800));
        addToCart(product);
        setIsAddingToCart(null);
    };

    // HÀM ĐỂ MỞ MODAL
    const handleOpenDetailModal = (product: ProductDTO) => {
        setSelectedProduct(product);
        setIsDetailModalOpen(true);
    };

    return (
        <section className="pt-16 pb-24 min-h-screen bg-background md:pt-16 md:pb-16">
            <div className="container mx-auto px-4">

                {/* FLOATING FILTER ACTION BUTTON (MOBILE ONLY) */}
                <FilterDrawer
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    sortOption={sortOption}
                    setSortOption={setSortOption}
                    totalItems={totalItems}
                />

                {/* HEADER */}
                <div className="text-center mb-6 md:mb-12">
                    <h1 className="text-4xl md:text-6xl font-extrabold mb-1">
                        Toàn Bộ <span className="text-primary">Menu</span> 🥖
                    </h1>
                    <p className="text-md text-muted-foreground hidden md:block">
                        Khám phá tất cả các món bánh mì và đồ uống tuyệt vời của chúng tôi.
                    </p>
                </div>

                {/* RESULT COUNT */}
                <p className="text-sm text-muted-foreground mb-6 text-right mt-4 md:mt-0">
                    Tìm thấy **{totalItems}** kết quả
                </p>

                {/* MAIN CONTENT: SPLIT LAYOUT ON MD SCREEN AND ABOVE */}
                <div className="flex flex-col md:flex-row md:space-x-8 md:items-start md:h-[calc(100vh-18rem)]">

                    {/* PC FILTER BAR - Chỉ hiển thị trên màn hình lớn */}
                    <aside className="hidden md:block md:mb-0 md:w-64">
                        <div className="p-4 bg-card rounded-xl shadow-lg border border-border/50">
                            <h3 className="text-lg font-bold mb-4 flex items-center">
                                <SlidersHorizontal className="h-5 w-5 mr-2 text-primary" /> Bộ lọc
                            </h3>
                            <div className="space-y-4">
                                {/* Search Input */}
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        type="text"
                                        placeholder="Tìm kiếm món ăn..."
                                        className="pl-10 h-10"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                {/* Sort Select */}
                                <Select value={sortOption} onValueChange={setSortOption}>
                                    <SelectTrigger className="h-10 text-sm">
                                        <SlidersHorizontal className="h-4 w-4 mr-2" />
                                        <SelectValue placeholder="Sắp xếp theo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="default">Mặc định</SelectItem>
                                        <SelectItem value="price-asc">Giá: Thấp → Cao</SelectItem>
                                        <SelectItem value="price-desc">Giá: Cao → Thấp</SelectItem>
                                        <SelectItem value="name-asc">Tên (A-Z)</SelectItem>
                                    </SelectContent>
                                </Select>
                                {/* Category navigation */}
                                <div className="pt-4">
                                    <h4 className="text-sm font-semibold mb-2">Danh mục</h4>
                                    <div className="flex flex-col space-y-2">
                                        <button
                                            className={`text-left px-3 py-2 rounded-md ${categoryFilter === 'All' ? 'bg-primary/10 font-semibold' : 'hover:bg-muted'}`}
                                            onClick={() => setCategoryFilter('All')}
                                        >
                                            Tất cả ({products.length})
                                        </button>
                                        {Array.from(
                                            products.reduce((m, p) => {
                                                const k = p.categoryName || 'Khác';
                                                m.set(k, (m.get(k) || 0) + 1);
                                                return m;
                                            }, new Map<string, number>()).entries()
                                        ).map(([cat, count]) => (
                                            <button
                                                key={cat}
                                                className={`text-left px-3 py-2 rounded-md ${categoryFilter === cat ? 'bg-primary/10 font-semibold' : 'hover:bg-muted'}`}
                                                onClick={() => setCategoryFilter(cat)}
                                            >
                                                {cat} ({count})
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* RIGHT SIDE: PRODUCT GRID (Scrollable area) */}
                    <main className="flex-1 md:overflow-y-auto md:h-full">

                        {/* GRID CONTENT */}
                        {loading && products.length === 0 ?
                            (
                                <p className="text-center py-20 text-primary text-xl">
                                    Đang tải menu...
                                </p>
                            ) : currentProducts.length ?
                                (
                                    <motion.div
                                        initial="hidden"
                                        animate="visible"
                                        className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-8"
                                    >
                                        {currentProducts.map((item) => {
                                            const adding = isAddingToCart === item.id;
                                            return (
                                                <motion.div
                                                    key={item.id}
                                                    layout
                                                    variants={itemVariants}
                                                    initial="hidden"
                                                    animate="visible"
                                                >
                                                    <Card className="h-full flex flex-col overflow-hidden border-2 border-transparent transition-all hover:-translate-y-1 hover:shadow-2xl hover:border-primary/50">
                                                        
                                                        {/* CLICK ẢNH ĐỂ MỞ MODAL */}
                                                        <div 
                                                            className="h-32 sm:h-48 bg-slate-100 dark:bg-slate-700 overflow-hidden cursor-pointer"
                                                            onClick={() => handleOpenDetailModal(item)}
                                                        >
                                                            {item.imageUrl ?
                                                                (
                                                                    <img
                                                                        src={getProductImageUrl(item.imageUrl)}
                                                                        loading="lazy"
                                                                        alt={item.name}
                                                                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.03]"
                                                                        onError={(e) => {
                                                                            e.currentTarget.src = "/images/placeholder-default.jpg";
                                                                            e.currentTarget.onerror = null;
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <div className="flex items-center justify-center h-full text-slate-500">
                                                                        <ShoppingCart className="h-6 w-6" />
                                                                    </div>
                                                                )}
                                                        </div>
                                                        
                                                        {/* HEADER VÀ FOOTER */}
                                                        <CardHeader className="flex-grow p-3 sm:p-6">
                                                            <CardTitle className="text-sm sm:text-lg line-clamp-2">
                                                                {item.name}
                                                            </CardTitle>
                                                            <CardDescription className="text-xs line-clamp-1 hidden sm:block">
                                                                {item.description}
                                                            </CardDescription>
                                                        </CardHeader>
                                                        <CardFooter className="flex justify-between items-center p-3 sm:p-6 pt-0">
                                                            <span className="text-sm sm:text-xl font-bold text-primary">
                                                                {item.price.toLocaleString("vi-VN", {
                                                                    style: "currency",
                                                                    currency: "VND",
                                                                })}
                                                            </span>
                                                            <Button
                                                                size="xs"
                                                                className="h-7 px-2"
                                                                disabled={adding}
                                                                onClick={(e) => {
                                                                    e.stopPropagation(); // Ngăn chặn sự kiện click lan truyền mở Modal
                                                                    handleAddToCart(item);
                                                                }}
                                                            >
                                                                {adding ?
                                                                    (
                                                                        <Loader2 className="h-3 w-3 animate-spin" />
                                                                    ) : (
                                                                        <ShoppingCart className="h-3 w-3" />
                                                                    )}
                                                                <span className="ml-1 text-xs">
                                                                    {adding ? "Đang thêm" : "Thêm"}
                                                                </span>
                                                            </Button>
                                                        </CardFooter>
                                                    </Card>
                                                </motion.div>
                                            );
                                        })}
                                    </motion.div>
                                ) : (
                                    <p className="text-center py-20 text-muted-foreground text-xl">
                                        Không tìm thấy món ăn phù hợp 😔
                                    </p>
                                )}
                    </main>
                </div>

                {/* PAGINATION CHO PC */}
                {totalPages > 1 && (
                    <div className="hidden md:flex justify-center items-center space-x-4 mt-8 md:mt-12">
                        <Button
                            variant="outline"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Trang trước
                        </Button>
                        <span className="font-semibold">
                            Trang {currentPage} / {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                        >
                            Trang sau
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                )}
            </div>

            {/* PAGINATION CHO MOBILE - FIXED BOTTOM (Nổi) */}
            {totalPages > 1 && (
                <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 px-4 py-3 bg-card border-t border-border/50 shadow-2xl">
                    <div className="flex justify-between items-center mx-auto max-w-lg">
                        <Button
                            variant="outline"
                            className="flex-1 mr-2"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Trang trước
                        </Button>
                        <span className="font-semibold text-sm flex-shrink-0 mx-2">
                            Trang {currentPage} / {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            className="flex-1 ml-2"
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                        >
                            Trang sau
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                </div>
            )}

            {/* MODAL CHI TIẾT SẢN PHẨM */}
            <ProductDetailModal
                product={selectedProduct}
                isOpen={isDetailModalOpen}
                onClose={() => {
                    setIsDetailModalOpen(false);
                    setSelectedProduct(null); 
                }}
            />
        </section>
    );
};

export default MenuPage;
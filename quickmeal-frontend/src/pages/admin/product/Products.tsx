import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Search, Plus, Edit, Trash2, Grid3X3,
    ChevronLeft, ChevronRight, Package, Tag,
    ArrowUpDown, ArrowUp, ArrowDown, AlertTriangle,
    Crown, XOctagon, MoreVertical
} from "lucide-react";
import { useProducts } from "@/context/ProductContext";
import ProductDialog from "@/pages/admin/product/ProductDialog";
import { toast } from "sonner";
import { getProductImageUrl } from "@/utils/image";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

export default function Products() {
    const { products, categories, loading, create, update, remove } = useProducts();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<number | "all">("all");

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState<any>(null);
    
    // UX Cải tiến: State cho lỗi phân quyền nghiêm trọng
    const [accessError, setAccessError] = useState<string | null>(null);

    const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' }>({
        key: null,
        direction: 'asc',
    });

    // ---- Filter & Sort Logic ----
    const filteredProducts = useMemo(() => products.filter((p) => {
        const matchesSearch =
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory =
            selectedCategory === "all" || p.categoryId === selectedCategory;
        return matchesSearch && matchesCategory;
    }), [products, searchTerm, selectedCategory]);

    const sortedProducts = useMemo(() => {
        let sortableItems = [...filteredProducts];
        if (sortConfig.key !== null) {
            sortableItems.sort((a: any, b: any) => {
                if (a[sortConfig.key!] < b[sortConfig.key!]) return sortConfig.direction === 'asc' ? -1 : 1;
                if (a[sortConfig.key!] > b[sortConfig.key!]) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        } else {
            sortableItems.reverse(); // Mặc định mới nhất lên đầu
        }
        return sortableItems;
    }, [filteredProducts, sortConfig]);

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // ---- Pagination ----
    const [page, setPage] = useState(1);
    const pageSize = 10;
    const totalPages = Math.ceil(sortedProducts.length / pageSize);
    const paginatedProducts = sortedProducts.slice((page - 1) * pageSize, page * pageSize);

    React.useEffect(() => { setPage(1); }, [searchTerm, selectedCategory]);

    // ---- Stats Logic ----
    const stats = useMemo(() => {
        if (!products.length) return null;
        const totalValue = products.reduce((sum, p) => sum + p.price, 0);
        const avgPrice = totalValue / products.length;
        const maxPriceProduct = products.reduce((max, p) => p.price > max.price ? p : max, products[0]);

        return { avgPrice, maxPriceProduct };
    }, [products]);

    // ---- Handlers ----
    const handleSave = async (formData: FormData) => {
        try {
            if (editingProduct) {
                await update(editingProduct.id, formData);
                toast.success("Cập nhật sản phẩm thành công!");
            } else {
                await create(formData);
                toast.success("Thêm sản phẩm thành công!");
            }
            setDialogOpen(false);
            setEditingProduct(null);
        } catch (error: any) {
            setDialogOpen(false);
            // Cải thiện UX: Xử lý lỗi phân quyền (403 Forbidden)
            if (error.response && error.response.status === 403) {
                setAccessError(`Bạn không có quyền để ${editingProduct ? 'cập nhật' : 'tạo mới'} sản phẩm này. Vui lòng kiểm tra lại vai trò của bạn.`);
            } else {
                // Lỗi chung (Dùng toast)
                toast.error("Lỗi lưu sản phẩm: " + (error.response?.data?.message || error.message || "Đã xảy ra lỗi."));
            }
        }
    };

    const handleDelete = async () => {
        if (!productToDelete) return;
        try {
            await remove(productToDelete.id);
            toast.success(`Đã xóa "${productToDelete.name}" thành công!`);
        } catch (error: any) {
            setDeleteAlertOpen(false);
            // Cải thiện UX: Xử lý lỗi phân quyền (403 Forbidden)
            if (error.response && error.response.status === 403) {
                setAccessError(`Bạn không có quyền để xóa sản phẩm "${productToDelete.name}". Vui lòng liên hệ quản trị viên.`);
            } else {
                // Lỗi chung (Dùng toast)
                toast.error("Lỗi xóa: " + (error.response?.data?.message || error.message || "Đã xảy ra lỗi."));
            }
        } finally {
            setDeleteAlertOpen(false);
            setProductToDelete(null);
        }
    };

    const getCategoryName = (categoryId: number) => categories.find(c => c.id === categoryId)?.name || "N/A";

    // ---- Render Components ----
    const renderSortIcon = (columnKey: string) => {
        if (sortConfig.key !== columnKey) return <ArrowUpDown className="h-3 w-3 ml-1 text-slate-300" />;
        return sortConfig.direction === 'asc' ? <ArrowUp className="h-3 w-3 ml-1 text-indigo-600" /> : <ArrowDown className="h-3 w-3 ml-1 text-indigo-600" />;
    };

    const PaginationControls = () => {
        if (totalPages <= 1) return null;
        return (
            <div className="flex items-center gap-1">
                <span className="text-xs text-slate-500 font-medium mr-2 hidden sm:inline-block">
                    Trang {page}/{totalPages}
                </span>
                <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="h-8 w-8 p-0">
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="h-8 w-8 p-0">
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        );
    };

    return (
        <div className="space-y-6 pb-20 md:pb-0 animate-in fade-in duration-500">
            {/* Header & Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2"><Package className="h-6 w-6 text-indigo-600"/> Sản Phẩm</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Quản lý danh mục và kho hàng</p>
                </div>
                <Button
                    onClick={() => { setEditingProduct(null); setDialogOpen(true); }}
                    className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200 shadow-md transition-all"
                >
                    <Plus className="mr-2 h-4 w-4" /> Thêm mới
                </Button>
            </div>

            {/* Stats Cards - Responsive Grid */}
            {stats && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-slate-500 uppercase">Tổng sản phẩm</p>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{products.length}</h3>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                                <Package className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-slate-500 uppercase">Giá trung bình</p>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{formatCurrency(stats.avgPrice)}</h3>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                                <Tag className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white border-none shadow-md sm:col-span-2">
                        <CardContent className="p-4 flex items-center justify-between relative overflow-hidden">
                            <div className="z-10">
                                <div className="flex items-center gap-2 mb-1 text-indigo-100">
                                    <Crown className="h-4 w-4 text-yellow-400" />
                                    <span className="text-xs font-medium uppercase">Sản phẩm cao cấp nhất</span>
                                </div>
                                <h3 className="text-lg font-bold truncate max-w-[200px]">{stats.maxPriceProduct.name}</h3>
                                <p className="text-xl font-extrabold mt-1">{formatCurrency(stats.maxPriceProduct.price)}</p>
                            </div>
                            <Grid3X3 className="h-24 w-24 absolute -right-4 -bottom-6 text-white/10 rotate-12" />
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Search & Filter Bar */}
            <div className="sticky top-0 z-20 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-sm py-2">
                <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-white dark:bg-slate-900 p-3 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800">
                    <div className="flex w-full md:w-auto gap-2">
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Tìm kiếm..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                            />
                        </div>
                        <Select value={String(selectedCategory)} onValueChange={(v) => setSelectedCategory(v === "all" ? "all" : Number(v))}>
                            <SelectTrigger className="w-[140px] bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                <SelectValue placeholder="Danh mục" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả</SelectItem>
                                {categories.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="w-full md:w-auto flex justify-between md:justify-end items-center border-t md:border-t-0 border-slate-100 pt-2 md:pt-0 mt-2 md:mt-0">
                        <span className="text-xs text-slate-500 mr-4">
                            <b>{filteredProducts.length}</b> kết quả
                        </span>
                        <PaginationControls />
                    </div>
                </div>
            </div>

            {/* CONTENT AREA */}
            <Card className="border-none shadow-none bg-transparent">
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-64 gap-3">
                            <div className="h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                            <p className="text-slate-400 text-sm">Đang tải dữ liệu...</p>
                        </div>
                    ) : paginatedProducts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300">
                            <Package className="h-12 w-12 mb-2 opacity-50" />
                            <p>Không tìm thấy sản phẩm nào.</p>
                        </div>
                    ) : (
                        <>
                            {/* --- MOBILE VIEW: PRODUCT CARDS (< md) --- */}
                            <div className="grid grid-cols-1 gap-3 md:hidden">
                                {paginatedProducts.map((p) => (
                                    <div key={p.id} className="bg-white dark:bg-slate-900 p-3 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex gap-3">
                                        {/* Left: Image */}
                                        <div className="h-20 w-20 flex-shrink-0 rounded-lg bg-slate-100 overflow-hidden">
                                            {p.imageUrl ? (
                                                <img src={getProductImageUrl(p.imageUrl)} alt="" className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="flex h-full items-center justify-center text-slate-300"><Package /></div>
                                            )}
                                        </div>

                                        {/* Center: Info */}
                                        <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                                            <div>
                                                <h4 className="font-semibold text-slate-800 dark:text-slate-100 truncate">{p.name}</h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Badge variant="secondary" className="text-[10px] h-5 px-1">{getCategoryName(p.categoryId)}</Badge>
                                                    <span className="text-xs text-indigo-600 font-bold">{formatCurrency(p.price)}</span>
                                                    {typeof p.stock === 'number' && (
                                                        <span className="ml-2 inline-block px-2 py-0.5 text-xs rounded-md bg-green-100 text-green-800">Còn: {p.stock}</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex justify-end gap-2 mt-2">
                                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-slate-500" onClick={() => { setEditingProduct(p); setDialogOpen(true); }}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => { setProductToDelete(p); setDeleteAlertOpen(true); }}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* --- DESKTOP VIEW: DATA TABLE (>= md) --- */}
                            <div className="hidden md:block bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 border-b border-slate-200 dark:border-slate-700">
                                        <tr>
                                            <th className="p-4 w-[80px]">Ảnh</th>
                                            <th className="p-4 cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => handleSort('name')}>
                                                <div className="flex items-center">Tên {renderSortIcon('name')}</div>
                                            </th>
                                            <th className="p-4">Danh mục</th>
                                            <th className="p-4 cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => handleSort('price')}>
                                                <div className="flex items-center">Giá {renderSortIcon('price')}</div>
                                            </th>
                                            <th className="p-4 w-24 text-center">Tồn kho</th>
                                            <th className="p-4 w-1/4 hidden lg:table-cell">Mô tả</th>
                                            <th className="p-4 text-right">Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {paginatedProducts.map((p) => (
                                            <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                                <td className="p-4">
                                                    <div className="h-10 w-10 rounded-md bg-slate-100 overflow-hidden border border-slate-200">
                                                        <img src={getProductImageUrl(p.imageUrl) || ''} alt="" className="h-full w-full object-cover" />
                                                    </div>
                                                </td>
                                                <td className="p-4 font-medium text-slate-700 dark:text-slate-200">{p.name}</td>
                                                <td className="p-4">
                                                    <Badge variant="outline" className="font-normal text-slate-600 bg-slate-50 border-slate-200">
                                                        {getCategoryName(p.categoryId)}
                                                    </Badge>
                                                </td>
                                                <td className="p-4 font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(p.price)}</td>
                                                <td className="p-4 text-center">
                                                    {typeof p.stock === 'number' ? (
                                                        p.stock > 0 ? <span className="inline-block px-2 py-1 text-xs rounded-md bg-green-100 text-green-800">{p.stock}</span>
                                                        : <span className="inline-block px-2 py-1 text-xs rounded-md bg-rose-100 text-rose-800">0</span>
                                                    ) : (
                                                        <span className="text-xs text-slate-400">—</span>
                                                    )}
                                                </td>
                                                <td className="p-4 text-slate-500 truncate max-w-[200px] hidden lg:table-cell">{p.description}</td>
                                                <td className="p-4 text-right">
                                                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50" onClick={() => { setEditingProduct(p); setDialogOpen(true); }}>
                                                                        <Edit className="h-4 w-4" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>Sửa</TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50" onClick={() => { setProductToDelete(p); setDeleteAlertOpen(true); }}>
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>Xóa</TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    </div>
                                                    <div className="md:hidden">
                                                        <Button size="sm" variant="ghost"><MoreVertical className="h-4 w-4" /></Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </CardContent>

                {/* Footer Pagination (Desktop Only, Mobile has it in header/sticky) */}
                {totalPages > 1 && (
                    <div className="hidden md:flex justify-between items-center p-4 text-sm text-slate-500">
                        <span>Hiển thị {paginatedProducts.length} sản phẩm</span>
                        <PaginationControls />
                    </div>
                )}
            </Card>

            {/* Modals */}
            <ProductDialog
                open={dialogOpen}
                product={editingProduct}
                onOpenChange={(v: any) => { setDialogOpen(v); if (!v) setEditingProduct(null); }}
                onSave={handleSave}
            />

            {/* Delete Confirmation Alert */}
            <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-red-600 flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5" /> Xác nhận xóa
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc muốn xóa sản phẩm <span className="font-bold text-slate-900">"{productToDelete?.name}"</span>?<br />
                            Hành động này không thể hoàn tác.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">Xóa ngay</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            
            {/* UX Cải tiến: Access Denied Alert - Hiển thị lỗi nghiêm trọng (403) */}
            <AlertDialog open={!!accessError} onOpenChange={() => setAccessError(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-amber-600 flex items-center gap-2">
                            <XOctagon className="h-5 w-5" /> Lỗi Phân quyền
                        </AlertDialogTitle>
                        <AlertDialogDescription className="pt-2">
                            {accessError}
                            <p className="mt-2 text-slate-500 font-medium">Mã lỗi: 403 Forbidden.</p>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction onClick={() => setAccessError(null)} className="bg-slate-700 hover:bg-slate-800 text-white">Đã hiểu</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
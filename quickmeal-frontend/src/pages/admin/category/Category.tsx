// src/pages/admin/Categories.tsx
import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Search, Plus, Edit, Trash2, Tag, AlertTriangle,
    LayoutGrid, ChevronLeft, ChevronRight, XOctagon
} from "lucide-react";
import type { CategoryDTO } from "@/services/categoryService";
import { toast } from "sonner";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useProducts } from "@/context/ProductContext";
import { Badge } from "@/components/ui/badge";

// --- Cấu hình Phân trang ---
const ITEMS_PER_PAGE = 10;
// ----------------------------

// Component CategoryDialog dùng chung cho Add/Edit
interface CategoryDialogProps {
    open: boolean;
    category: CategoryDTO | null;
    onOpenChange: (open: boolean) => void;
    onSave: (name: string) => void;
}

const CategoryDialog: React.FC<CategoryDialogProps> = ({ open, category, onOpenChange, onSave }) => {
    const [name, setName] = useState(category?.name || "");
    const [error, setError] = useState<string | null>(null); // Thêm state lỗi cho dialog
    const isEdit = !!category;

    React.useEffect(() => {
        if (open) {
            setName(category?.name || "");
            setError(null);
        }
    }, [open, category]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            setError("Tên danh mục không được để trống."); // Dùng Inline Error
            return;
        }
        setError(null);
        onSave(name.trim());
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{isEdit ? "Sửa Danh mục" : "Thêm Danh mục mới"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid items-center gap-2">
                            <Label htmlFor="name">Tên danh mục</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => {
                                    setName(e.target.value);
                                    if (error) setError(null); // Xóa lỗi khi người dùng bắt đầu nhập
                                }}
                                className={`col-span-3 ${error ? 'border-red-500' : 'border-slate-200'}`}
                                placeholder="Ví dụ: Bánh mì, Đồ uống..."
                                autoFocus
                            />
                            {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>Hủy</Button>
                        <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                            {isEdit ? "Cập nhật" : "Tạo mới"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default function Categories() {
    const {
        categories,
        products,
        loading,
        createCategory,
        updateCategory,
        removeCategory
    } = useProducts();

    const [searchTerm, setSearchTerm] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<CategoryDTO | null>(null);
    const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<CategoryDTO | null>(null);

    // THAY ĐỔI: State cho lỗi phân quyền nghiêm trọng
    const [accessError, setAccessError] = useState<string | null>(null);

    // --- State Phân trang ---
    const [currentPage, setCurrentPage] = useState(1);
    // -------------------------

    // 1. Tính toán Số lượng sản phẩm liên quan
    const productCountMap = useMemo(() => {
        return products.reduce((acc, product) => {
            const catId = product.categoryId;
            acc[catId] = (acc[catId] || 0) + 1;
            return acc;
        }, {} as Record<number, number>);
    }, [products]);

    // 2. Lọc dữ liệu
    const filteredCategories = useMemo(() => {
        if (currentPage !== 1) setCurrentPage(1);
        return categories.filter(c =>
            c.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [categories, searchTerm]);

    // 3. Phân trang dữ liệu hiển thị
    const paginatedCategories = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return filteredCategories.slice(startIndex, endIndex);
    }, [filteredCategories, currentPage]);

    const totalPages = Math.ceil(filteredCategories.length / ITEMS_PER_PAGE);

    // --- CRUD Handlers (Dùng Context) ---
    const handleSave = async (name: string) => {
        // Check trùng danh mục (không phân biệt chữ hoa/thường)
        const duplicate = categories.find(c => c.name.toLowerCase() === name.toLowerCase());

        // Nếu đang edit, bỏ qua chính danh mục đó
        if (duplicate && (!editingCategory || duplicate.id !== editingCategory.id)) {
            toast.error(`Tên danh mục "${name}" đã tồn tại! (ID: ${duplicate.id})`);
            return;
        }

        try {
            if (editingCategory) {
                await updateCategory(editingCategory.id, { name });
                toast.success(`Cập nhật "${name}" thành công!`);
            } else {
                await createCategory({ name });
                toast.success(`Thêm danh mục "${name}" thành công!`);
            }
            setDialogOpen(false);
            setEditingCategory(null);
        } catch (error: any) {
            setDialogOpen(false);
            if (error.response && error.response.status === 403) {
                setAccessError("Bạn không có quyền để tạo/cập nhật danh mục này. Vui lòng kiểm tra lại vai trò của bạn.");
            } else {
                toast.error("Lỗi lưu danh mục: " + (error.response?.data?.message || error.message));
            }
        }
    };


    const confirmDeleteRequest = (category: CategoryDTO) => {
        const count = productCountMap[category.id] || 0;
        if (count > 0) {
            toast.error(`Không thể xóa danh mục "${category.name}" vì có ${count} sản phẩm đang sử dụng.`);
            return;
        }
        setCategoryToDelete(category);
        setDeleteAlertOpen(true);
    };

    const executeDelete = async () => {
        if (!categoryToDelete) return;
        try {
            await removeCategory(categoryToDelete.id);
            toast.success(`Đã xóa "${categoryToDelete.name}" thành công!`);
            if (paginatedCategories.length === 1 && currentPage > 1) {
                setCurrentPage(currentPage - 1);
            }
        } catch (error: any) {
            setDeleteAlertOpen(false);
            // Xử lý lỗi phân quyền (403 Forbidden)
            if (error.response && error.response.status === 403) {
                setAccessError(`Bạn không có quyền để xóa danh mục "${categoryToDelete.name}". Vui lòng liên hệ quản trị viên.`);
            } else {
                // Lỗi chung (Dùng toast)
                toast.error("Lỗi xóa: " + (error.response?.data?.message || error.message));
            }
        } finally {
            setCategoryToDelete(null);
        }
    };

    // --- Navigation Handlers ---
    const goToPrevPage = () => setCurrentPage((prev) => Math.max(1, prev - 1));
    const goToNextPage = () => setCurrentPage((prev) => Math.min(totalPages, prev + 1));

    return (
        <div className="space-y-6 p-4 md:p-8 bg-slate-50 min-h-screen animate-in fade-in duration-500">
            {/* Header & Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                        <Tag className="h-6 w-6 text-indigo-600" /> Quản lý Danh mục
                    </h1>
                    <p className="text-slate-500 mt-1">Thêm, sửa và xóa các nhóm sản phẩm.</p>
                </div>
                <Button
                    className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all"
                    onClick={() => { setEditingCategory(null); setDialogOpen(true); }}
                    disabled={loading}
                >
                    <Plus className="mr-2 h-4 w-4" /> Thêm Danh mục
                </Button>
            </div>

            {/* Thẻ thống kê */}
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                <Card className="shadow-sm border-l-4 border-indigo-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tổng số Danh mục</CardTitle>
                        <Tag className="h-4 w-4 text-slate-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {loading ? '...' : categories.length.toLocaleString('vi-VN')}
                        </div>
                        <p className="text-xs text-slate-500">Danh mục trong hệ thống</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Card: Search and Table */}
            <Card className="shadow-lg border-none overflow-hidden">
                <CardHeader className="bg-white border-b border-slate-100 flex-row items-center justify-between">
                    <CardTitle className="text-xl font-semibold text-slate-800">
                        Danh sách Danh mục
                    </CardTitle>
                    <div className="relative max-w-xs w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Tìm danh mục..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 border-slate-200 focus:border-indigo-500"
                            disabled={loading}
                        />
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    {loading ? (
                        <div className="p-12 text-center text-slate-400">Đang tải dữ liệu...</div>
                    ) : filteredCategories.length === 0 ? (
                        <div className="p-16 text-center flex flex-col items-center text-slate-500">
                            <LayoutGrid className="h-12 w-12 text-slate-300 mb-3" />
                            <p>Không tìm thấy danh mục nào.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 border-b border-slate-100 text-slate-600">
                                    <tr>
                                        <th className="p-4 w-[60px]">ID</th>
                                        <th className="p-4">Tên Danh mục</th>
                                        <th className="p-4 hidden md:table-cell w-1/4">Số lượng SP</th>
                                        <th className="p-4 text-center w-[150px]">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {paginatedCategories.map((c) => (
                                        <tr key={c.id} className="hover:bg-indigo-50/50 transition-colors group">
                                            <td className="p-4 font-mono text-xs text-slate-500">{c.id}</td>
                                            <td className="p-4 font-medium text-slate-800">{c.name}</td>
                                            <td className="p-4 hidden md:table-cell">
                                                <Badge variant="secondary" className="font-semibold text-indigo-700 bg-indigo-100 hover:bg-indigo-100">
                                                    {productCountMap[c.id] || 0} sản phẩm
                                                </Badge>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-600 bg-blue-50 hover:bg-blue-100"
                                                                    onClick={() => { setEditingCategory(c); setDialogOpen(true); }}>
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>Sửa</TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    size="icon"
                                                                    variant="ghost"
                                                                    className="h-8 w-8 text-red-600 bg-red-50 hover:bg-red-100 disabled:opacity-50"
                                                                    onClick={() => confirmDeleteRequest(c)}
                                                                    disabled={(productCountMap[c.id] || 0) > 0}
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                {(productCountMap[c.id] || 0) > 0 ?
                                                                    "Không thể xóa, có sản phẩm đang thuộc danh mục này." : "Xóa"
                                                                }
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>

                {/* Footer Phân trang */}
                {filteredCategories.length > ITEMS_PER_PAGE && (
                    <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-white">
                        <div className="text-sm text-slate-600">
                            Hiển thị {((currentPage - 1) * ITEMS_PER_PAGE) + 1} đến {Math.min(currentPage * ITEMS_PER_PAGE, filteredCategories.length)} trong tổng số {filteredCategories.length} danh mục đã lọc.
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={goToPrevPage}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Trang trước
                            </Button>
                            <span className="text-sm font-medium text-slate-700">
                                Trang {currentPage} / {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={goToNextPage}
                                disabled={currentPage === totalPages}
                            >
                                Trang sau
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </Card>

            {/* Add/Edit Dialog */}
            <CategoryDialog
                open={dialogOpen}
                category={editingCategory}
                onOpenChange={(v) => { setDialogOpen(v); if (!v) setEditingCategory(null); }}
                onSave={handleSave}
            />

            {/* Delete Confirmation Alert */}
            <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-red-600 flex items-center gap-2"><AlertTriangle className="h-5 w-5" /> Xác nhận xóa</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc muốn xóa danh mục <span className="font-bold text-slate-900">"{categoryToDelete?.name}"</span>?
                            Hành động này không thể hoàn tác.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction onClick={executeDelete} className="bg-red-600 hover:bg-red-700 text-white">Xóa ngay</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* THAY ĐỔI: Access Denied Alert - Hiển thị lỗi nghiêm trọng */}
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
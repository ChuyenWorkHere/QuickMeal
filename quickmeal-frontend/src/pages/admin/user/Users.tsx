// src/pages/admin/user/Users.tsx
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Plus, Edit, Trash2, Users as UsersIcon, AlertTriangle, Loader2, Mail, Phone, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription,
    AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import type { UserDTO, UserCreateDTO, UserUpdateDTO } from "@/services/userService";
import { userService } from "@/services/userService";
import { UserDialog } from "./UserDialog";
import { useAuthContext } from "@/context/AuthContext";

const ITEMS_PER_PAGE = 10;

export default function Users() {
    const { userName: currentUserName } = useAuthContext();

    const [users, setUsers] = useState<UserDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserDTO | null>(null);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<UserDTO | null>(null);

    const loadUsers = async (pageIndex = page, search = searchTerm) => {
        setLoading(true);
        try {
            const res = await userService.getPage(pageIndex, ITEMS_PER_PAGE, search);
            setUsers(res.content);
            setPage(res.number);
            setTotalPages(res.totalPages);

            if (res.content.length === 0 && res.number > 0) {
                loadUsers(res.number - 1, search);
            }
        } catch (e) {
            toast.error("Không thể tải danh sách người dùng");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers(0);
    }, []);

    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            loadUsers(0, searchTerm);
        }, 400);
        return () => clearTimeout(debounceTimer);
    }, [searchTerm]);

    const handleSave = async (data: UserCreateDTO | UserUpdateDTO) => {
        if (editingUser && editingUser.userName === currentUserName) {
            const updateData = data as UserUpdateDTO;
            if (updateData.role !== editingUser.role) {
                toast.error("Bạn không được phép tự thay đổi vai trò của chính mình.");
                return;
            }
        }
        
        try {
            if (editingUser) {
                await userService.update(editingUser.id, data as UserUpdateDTO);
                toast.success(`Đã cập nhật user ${editingUser.userName}`);
            } else {
                await userService.create(data as UserCreateDTO);
                toast.success("Tạo user mới thành công");
            }
            setDialogOpen(false);
            setEditingUser(null);
            loadUsers(page);
        } catch (e: any) {
            toast.error(e.response?.data?.message || e.message || "Lỗi xử lý user");
        }
    };
    
    const handleEdit = (user: UserDTO) => {
        setEditingUser(user);
        setDialogOpen(true);
    };

    const handleCreate = () => {
        setEditingUser(null);
        setDialogOpen(true);
    };

    const confirmDelete = (user: UserDTO) => {
        if (user.userName === currentUserName) {
            toast.warning("Bạn không thể xóa tài khoản đang đăng nhập.");
            return;
        }
        setUserToDelete(user);
        setDeleteOpen(true);
    };

    const executeDelete = async () => {
        if (!userToDelete) return;
        try {
            await userService.remove(userToDelete.id);
            toast.success(`Đã xóa user ${userToDelete.userName}`);
            loadUsers(page);
        } catch (e: any) {
            toast.error("Không thể xóa user. Vui lòng thử lại.");
        } finally {
            setDeleteOpen(false);
            setUserToDelete(null);
        }
    };
    
    const goToPage = (pageIndex: number) => {
        if (pageIndex >= 0 && pageIndex < totalPages) {
            loadUsers(pageIndex);
        }
    };

    // Hàm render Badge Role
    const renderRoleBadge = (role: string) => {
        const styles = {
            ADMIN: "bg-purple-50 text-purple-700 border-purple-200",
            STAFF: "bg-blue-50 text-blue-700 border-blue-200",
            USER: "bg-slate-100 text-slate-700 border-slate-200"
        };
        return (
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${styles[role as keyof typeof styles] || styles.USER}`}>
                {role}
            </span>
        );
    };

    return (
        <div className="space-y-6 p-3 md:p-8 bg-slate-50 min-h-screen">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2 text-slate-800">
                        <UsersIcon className="text-indigo-600 h-7 w-7 md:h-8 md:w-8" /> Quản lý User
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Quản lý thành viên và phân quyền hệ thống</p>
                </div>
                <Button
                    className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 shadow-md transition-all"
                    onClick={handleCreate}
                >
                    <Plus className="mr-2 h-4 w-4" /> Thêm User
                </Button>
            </div>

            <Card className="shadow-sm border-slate-200 overflow-hidden">
                <CardHeader className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white border-b border-slate-100">
                    <CardTitle className="text-lg font-semibold text-slate-700">
                        Danh sách User <span className="text-sm font-normal text-slate-400 ml-2">(Trang {page + 1}/{totalPages})</span>
                    </CardTitle>
                    
                    <div className="relative w-full lg:max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Tìm tên, email, username..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="pl-9 bg-slate-50 border-slate-200 focus:bg-white transition-all w-full"
                        />
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    {/* PC View: Table (Ẩn trên mobile) */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-sm text-left border-collapse">
                            <thead className="bg-slate-50/50 text-slate-500 font-medium border-b border-slate-100">
                                <tr>
                                    <th className="p-4">Người dùng</th>
                                    <th className="p-4">Liên hệ</th>
                                    <th className="p-4">Vai trò</th>
                                    <th className="p-4">Trạng thái</th>
                                    <th className="p-4 text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="p-12 text-center text-slate-500">
                                            <div className="flex flex-col items-center gap-2">
                                                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                                                <p>Đang tải dữ liệu...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : users.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-12 text-center text-slate-500">Không tìm thấy user nào.</td>
                                    </tr>
                                ) : (
                                    users.map(u => (
                                        <tr key={u.id} className="hover:bg-indigo-50/30 transition-colors">
                                            <td className="p-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-900 flex items-center gap-1">
                                                        {u.userName}
                                                        {u.userName === currentUserName && <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full">Bạn</span>}
                                                    </span>
                                                    <span className="text-slate-500 text-xs">{u.fullName}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-col gap-1 text-xs text-slate-600">
                                                    <div className="flex items-center gap-1"><Mail className="h-3 w-3" /> {u.email}</div>
                                                    <div className="flex items-center gap-1"><Phone className="h-3 w-3" /> {u.phone || 'N/A'}</div>
                                                </div>
                                            </td>
                                            <td className="p-4">{renderRoleBadge(u.role)}</td>
                                            <td className="p-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-medium
                                                    ${u.enabled ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-700 border border-red-100"}`}>
                                                    <span className={`h-1.5 w-1.5 rounded-full ${u.enabled ? "bg-emerald-500" : "bg-red-500"}`} />
                                                    {u.enabled ? "Active" : "Locked"}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <ActionButtons 
                                                    user={u} 
                                                    isCurrentUser={u.userName === currentUserName} 
                                                    onEdit={handleEdit} 
                                                    onDelete={confirmDelete} 
                                                />
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile View: Cards (Ẩn trên PC) */}
                    <div className="md:hidden divide-y divide-slate-100">
                        {loading ? (
                            <div className="p-8 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-indigo-600" /></div>
                        ) : users.map(u => (
                            <div key={u.id} className="p-4 space-y-3">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <div className="font-bold text-slate-900 flex items-center gap-2">
                                            {u.userName}
                                            {u.userName === currentUserName && <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full">Bạn</span>}
                                        </div>
                                        <p className="text-sm text-slate-500">{u.fullName}</p>
                                    </div>
                                    {renderRoleBadge(u.role)}
                                </div>
                                <div className="grid grid-cols-1 gap-2 text-sm text-slate-600 bg-slate-50 p-2 rounded">
                                    <div className="flex items-center gap-2 truncate"><Mail className="h-3.5 w-3.5" /> {u.email}</div>
                                    <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" /> {u.phone || 'N/A'}</div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium
                                        ${u.enabled ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                                        <span className={`h-1.5 w-1.5 rounded-full ${u.enabled ? "bg-emerald-500" : "bg-red-500"}`} />
                                        {u.enabled ? "Active" : "Locked"}
                                    </span>
                                    <ActionButtons 
                                        user={u} 
                                        isCurrentUser={u.userName === currentUserName} 
                                        onEdit={handleEdit} 
                                        onDelete={confirmDelete} 
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {!loading && totalPages > 0 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-slate-100 gap-4 bg-slate-50/30">
                            <span className="text-xs md:text-sm text-slate-500 order-2 sm:order-1">
                                Hiển thị trang {page + 1} trên tổng số {totalPages} trang
                            </span>
                            <div className="flex gap-2 w-full sm:w-auto order-1 sm:order-2">
                                <Button
                                    variant="outline" size="sm" className="flex-1 sm:flex-none"
                                    disabled={page === 0}
                                    onClick={() => goToPage(page - 1)}
                                >
                                    Trước
                                </Button>
                                <Button
                                    variant="outline" size="sm" className="flex-1 sm:flex-none"
                                    disabled={page + 1 >= totalPages}
                                    onClick={() => goToPage(page + 1)}
                                >
                                    Sau
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <UserDialog
                open={dialogOpen}
                user={editingUser}
                onOpenChange={setDialogOpen}
                onSave={handleSave}
                currentUserName={currentUserName}
            />

            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent className="max-w-[90vw] sm:max-w-lg rounded-lg">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-red-600 text-lg md:text-xl">
                            <AlertTriangle className="h-5 w-5" /> Xác nhận xóa
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-sm md:text-base">
                            Bạn có chắc chắn muốn xóa user <b>{userToDelete?.userName}</b>?<br />
                            Hành động này sẽ ẩn user khỏi hệ thống (Soft Delete).
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-4">
                        <AlertDialogCancel className="w-full sm:w-auto">Hủy bỏ</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={executeDelete}
                            className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto"
                        >
                            Xóa ngay
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

// Component phụ cho các nút hành động để tái sử dụng
function ActionButtons({ user, isCurrentUser, onEdit, onDelete }: { 
    user: UserDTO, isCurrentUser: boolean, onEdit: (u: UserDTO) => void, onDelete: (u: UserDTO) => void 
}) {
    return (
        <TooltipProvider delayDuration={200}>
            <div className="flex justify-end gap-1">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost" size="icon"
                            className="h-9 w-9 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full"
                            onClick={() => onEdit(user)}
                        >
                            <Edit className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    {isCurrentUser && <TooltipContent><p>Bạn không thể tự sửa vai trò.</p></TooltipContent>}
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost" size="icon"
                            className={`h-9 w-9 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-full ${isCurrentUser ? "opacity-30 cursor-not-allowed" : ""}`}
                            onClick={() => onDelete(user)}
                            disabled={isCurrentUser}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    {isCurrentUser && <TooltipContent><p>Không thể xóa tài khoản của bạn.</p></TooltipContent>}
                </Tooltip>
            </div>
        </TooltipProvider>
    );
}
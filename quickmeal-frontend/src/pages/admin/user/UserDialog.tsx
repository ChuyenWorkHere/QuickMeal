// src/pages/admin/user/UserDialog.tsx
import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, Eye, EyeOff, User, Mail, Phone, Lock } from "lucide-react";
import { toast } from "sonner"; // Import toast để hiển thị lỗi validation

import type { UserDTO, UserCreateDTO, UserUpdateDTO } from "@/services/userService";
import type { RoleType } from "@/types";

const ROLE_OPTIONS: { value: RoleType; label: string }[] = [
    { value: "ADMIN", label: "Quản trị viên (Admin)" },
    { value: "STAFF", label: "Nhân viên (Staff)" },
    { value: "CUSTOMER", label: "Khách hàng (Customer)" }
];

interface UserDialogProps {
    open: boolean;
    user: UserDTO | null; // Nếu null => Create Mode, ngược lại Update Mode
    onOpenChange: (open: boolean) => void;
    onSave: (data: UserCreateDTO | UserUpdateDTO) => Promise<void> | void; // Support async
    currentUserName: string | null;
}

// Hàm kiểm tra định dạng
const validateForm = (data: typeof initialFormState, isEdit: boolean): boolean => {
    const { fullName, userName, email, phone, password, confirmPassword } = data;

    if (!fullName || !userName || !email || !phone) {
        toast.error('Vui lòng điền đầy đủ thông tin (Họ tên, Username, Email, SĐT)');
        return false;
    }

    // Kiểm tra email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        toast.error('Email không hợp lệ');
        return false;
    }

    // Kiểm tra phone (bắt đầu bằng 0, 10-11 số)
    const phoneRegex = /^0\d{9,10}$/;
    if (!phoneRegex.test(phone)) {
        toast.error('Số điện thoại không hợp lệ (bắt đầu bằng 0, 10-11 số)');
        return false;
    }

    // Kiểm tra Password chỉ khi ở chế độ tạo mới (Create)
    if (!isEdit) {
        if (!password || !confirmPassword) {
            toast.error('Vui lòng nhập mật khẩu và xác nhận mật khẩu');
            return false;
        }

        if (password.length < 6) {
            toast.error('Mật khẩu phải có ít nhất 6 ký tự');
            return false;
        }

        if (password !== confirmPassword) {
            toast.error('Mật khẩu xác nhận không khớp');
            return false;
        }
    }

    return true;
};

// Initial State cho form
const initialFormState = {
    fullName: "",
    userName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "", // Thêm trường confirmPassword cho validation
    role: "CUSTOMER" as RoleType,
    enabled: true
};

export const UserDialog: React.FC<UserDialogProps> = ({
    open,
    user,
    onOpenChange,
    onSave,
    currentUserName
}) => {
    const isEdit = !!user;
    const isCurrentUser = isEdit && user.userName === currentUserName;

    const [form, setForm] = useState(initialFormState);
    const [submitting, setSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);


    // Reset form khi Dialog mở/đóng hoặc user thay đổi
    useEffect(() => {
        if (open) {
            if (user) {
                // Update mode: Fill data
                setForm({
                    ...initialFormState, // Giữ password/confirmPassword rỗng
                    userName: user.userName || "",
                    fullName: user.fullName || "",
                    email: user.email || "",
                    phone: user.phone || "",
                    role: user.role || "CUSTOMER",
                    enabled: user.enabled ?? true
                });
            } else {
                // Create mode: Reset về trắng
                setForm(initialFormState);
            }
            // Đảm bảo ẩn password khi mở dialog
            setShowPassword(false);
            setShowConfirmPassword(false);
        }
    }, [open, user]);

    const handleChange = (field: string, value: any) => {
        if (isCurrentUser && (field === "role" || field === "enabled")) {
            // Ngăn không cho set state nếu cố gắng thay đổi Role hoặc Enabled của chính mình
            return;
        }
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 💡 Bước 1: VALIDATION
        if (!validateForm(form, isEdit)) {
            return; // Dừng lại nếu validation thất bại
        }

        setSubmitting(true);
        try {
            if (isEdit) {
                // 💡 Bước 2: TẠO PAYLOAD CHO UPDATE
                const payload: UserUpdateDTO = {
                    fullName: form.fullName,
                    email: form.email,
                    phone: form.phone,
                    role: form.role,
                    enabled: form.enabled
                };

                // Thêm password vào payload nếu người dùng đã nhập
                if (form.password.length > 0) {
                    // Cần kiểm tra lại password match nếu người dùng nhập password mới
                    if (form.password !== form.confirmPassword) {
                        toast.error('Mật khẩu xác nhận không khớp khi cập nhật.');
                        return;
                    }
                    if (form.password.length < 6) {
                        toast.error('Mật khẩu mới phải có ít nhất 6 ký tự.');
                        return;
                    }
                    // Thêm password vào payload (API server cần hỗ trợ nhận trường password)
                    (payload as any).password = form.password;
                }

                await onSave(payload);
            } else {
                // 💡 Bước 2: TẠO PAYLOAD CHO CREATE
                const payload: UserCreateDTO = {
                    userName: form.userName,
                    password: form.password,
                    fullName: form.fullName,
                    email: form.email,
                    phone: form.phone,
                    role: form.role
                };
                await onSave(payload);
            }
        } catch (error) {
            // Lỗi xử lý bởi onSave trong Users.tsx
        } finally {
            setSubmitting(false);
        }
    };

    const isRoleDisabled = isCurrentUser || submitting;
    const isEnabledDisabled = isCurrentUser || submitting;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{isEdit ? "Cập nhật thông tin" : "Thêm người dùng mới"}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? "Chỉnh sửa thông tin chi tiết và quyền hạn." : "Điền thông tin để tạo tài khoản mới."}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    {/* Full Name */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="fullName" className="text-right">Họ tên <span className="text-red-500">*</span></Label>
                        <div className="relative col-span-3">
                            <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                id="fullName"
                                name="fullName"
                                value={form.fullName}
                                onChange={e => handleChange(e.target.name, e.target.value)}
                                className="pl-9"
                                placeholder="Nguyễn Văn A"
                                disabled={submitting}
                            />
                        </div>
                    </div>

                    {/* Username - Disable khi edit */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="userName" className="text-right">Username <span className="text-red-500">*</span></Label>
                        <div className="relative col-span-3">
                            <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                id="userName"
                                name="userName"
                                value={form.userName}
                                onChange={e => handleChange(e.target.name, e.target.value)}
                                disabled={isEdit || submitting}
                                className="pl-9 bg-slate-50 disabled:cursor-not-allowed"
                                placeholder="VD: nguyenvan_a"
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email" className="text-right">Email <span className="text-red-500">*</span></Label>
                        <div className="relative col-span-3">
                            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={e => handleChange(e.target.name, e.target.value)}
                                className="pl-9"
                                placeholder="example@gmail.com"
                                disabled={submitting}
                            />
                        </div>
                    </div>

                    {/* Phone */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="phone" className="text-right">Số ĐT <span className="text-red-500">*</span></Label>
                        <div className="relative col-span-3">
                            <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                id="phone"
                                name="phone"
                                type="tel"
                                value={form.phone}
                                onChange={e => handleChange(e.target.name, e.target.value)}
                                className="pl-9"
                                placeholder="0901 234 567"
                                disabled={submitting}
                            />
                        </div>
                    </div>

                    {/* Password - Chỉ hiện khi tạo mới HOẶC khi edit và người dùng muốn thay đổi */}
                    {/* Khi edit, password là optional */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="password" className="text-right">Mật khẩu {isEdit ? '' : <span className="text-red-500">*</span>}</Label>
                        <div className="relative col-span-3">
                            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                id="password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder={isEdit ? 'Để trống nếu không đổi' : '••••••••'}
                                className="pl-9 pr-9"
                                value={form.password}
                                onChange={e => handleChange(e.target.name, e.target.value)}
                                required={!isEdit} // Bắt buộc khi tạo mới
                                disabled={submitting}
                                minLength={isEdit ? undefined : 6}
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
                    {(!isEdit || form.password.length > 0) && ( // Hiện khi tạo mới HOẶC khi đã nhập password mới
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="confirmPassword" className="text-right">Xác nhận MK {isEdit ? '' : <span className="text-red-500">*</span>}</Label>
                            <div className="relative col-span-3">
                                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    className="pl-9 pr-9"
                                    value={form.confirmPassword}
                                    onChange={e => handleChange(e.target.name, e.target.value)}
                                    required={!isEdit || form.password.length > 0} // Bắt buộc khi tạo mới HOẶC khi nhập password
                                    disabled={submitting}
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
                    )}


                    {/* Vai trò (Role) - Disable khi là người dùng hiện tại */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Vai trò</Label>
                        <div className="col-span-3">
                            <Select
                                value={form.role}
                                onValueChange={(v) => handleChange("role", v)}
                                disabled={isRoleDisabled}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn vai trò" />
                                </SelectTrigger>
                                <SelectContent>
                                    {ROLE_OPTIONS.map(r => (
                                        <SelectItem key={r.value} value={r.value}>
                                            {r.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {isCurrentUser && (
                                <p className="mt-1 text-xs text-red-500">Bạn không thể tự sửa vai trò của chính mình.</p>
                            )}
                        </div>
                    </div>

                    {isEdit && (
                        /* Trạng thái (Enabled) - Disable khi là người dùng hiện tại */
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Trạng thái</Label>
                            <div className="col-span-3 flex items-center space-x-2">
                                <Switch
                                    checked={form.enabled}
                                    onCheckedChange={(v) => handleChange("enabled", v)}
                                    disabled={isEnabledDisabled}
                                />
                                <span className="text-sm text-slate-500">
                                    {form.enabled ? "Đang hoạt động" : "Đã bị khóa"}
                                </span>
                            </div>
                            {isCurrentUser && (
                                <div className="col-span-4 col-start-2 -mt-2">
                                    <p className="mt-1 text-xs text-red-500">Bạn không thể tự khóa/mở khóa tài khoản đang đăng nhập.</p>
                                </div>
                            )}
                        </div>
                    )}

                    <DialogFooter className="mt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
                            Hủy
                        </Button>
                        <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700" disabled={submitting}>
                            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isEdit ? "Lưu thay đổi" : "Tạo mới"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
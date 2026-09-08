// src/pages/user/ProfilePage.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/context/AuthContext';
import { 
    User, Mail, Phone, Lock, Eye, EyeOff, 
    Save, RefreshCcw, ShieldCheck, UserCircle, CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';

const api = {
    put: async (url: string, data: any) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:8080${url}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        
        let responseData;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            responseData = await response.json();
        } else {
            responseData = { code: 1, data: await response.text() };
        }
        return { data: responseData };
    }
};

export default function ProfilePage() {
    const navigate = useNavigate();
    const { token, userName, fullName, email, phone, role, updateUser } = useAuthContext();
    
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
    });
    
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (token) {
            setFormData(prev => ({
                ...prev,
                fullName: fullName || '',
                email: email || '',
                phone: phone || '',
            }));
        } else {
            navigate('/login');
        }
    }, [token, fullName, email, phone, navigate]);

    const isDirty = useMemo(() => {
        return formData.fullName !== (fullName || '') ||
               formData.email !== (email || '') ||
               formData.phone !== (phone || '') ||
               (formData.currentPassword || formData.newPassword || formData.confirmNewPassword);
    }, [formData, fullName, email, phone]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.fullName.trim()) newErrors.fullName = 'Họ tên không được để trống';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) newErrors.email = 'Email không hợp lệ';
        const phoneRegex = /^0\d{9,10}$/;
        if (!phoneRegex.test(formData.phone)) newErrors.phone = 'SĐT không hợp lệ';

        if (formData.currentPassword || formData.newPassword || formData.confirmNewPassword) {
            if (!formData.currentPassword) newErrors.currentPassword = 'Cần mật khẩu hiện tại';
            if (!formData.newPassword) newErrors.newPassword = 'Vui lòng nhập mật khẩu mới';
            else if (formData.newPassword.length < 6) newErrors.newPassword = 'Tối thiểu 6 ký tự';
            if (formData.newPassword !== formData.confirmNewPassword) newErrors.confirmNewPassword = 'Mật khẩu không khớp';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;
        setIsLoading(true);
        try {
            const dataToSend: any = { fullName: formData.fullName, email: formData.email, phone: formData.phone };
            if (formData.newPassword) {
                dataToSend.currentPassword = formData.currentPassword;
                dataToSend.newPassword = formData.newPassword;
            }
            const response = await api.put('/api/auth/profile', dataToSend);
            if (response.data.code === 0) {
                if (response.data.data) updateUser(response.data.data);
                toast.success("Cập nhật thành công!");
                setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmNewPassword: '' }));
            } else {
                toast.error(response.data.data || "Cập nhật thất bại");
            }
        } catch (error) {
            toast.error("Mất kết nối server");
        } finally {
            setIsLoading(false);
        }
    };

    if (!token) return null;

    return (
        <div className="min-h-screen bg-[#F8FAFC] py-6 sm:py-12 px-4 md:px-8 lg:px-12 font-inter">
            <div className="max-w-5xl mx-auto">
                {/* Header Title Mobile Only */}
                <div className="mb-8 md:hidden text-center">
                    <h1 className="text-2xl font-black text-slate-800">Tài khoản</h1>
                    <p className="text-slate-400 text-sm">Quản lý hồ sơ cá nhân</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
                    
                    {/* Left Sidebar: Profile Summary - Cố định hoặc trôi theo trên Desktop */}
                    <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-8">
                        <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/80 text-center relative overflow-hidden">
                            {/* Decorative Background */}
                            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-10"></div>
                            
                            <div className="relative mt-4">
                                <div className="w-20 h-20 sm:w-28 sm:h-28 bg-white p-1 rounded-full mx-auto shadow-xl">
                                    <div className="w-full h-full bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 border border-indigo-100">
                                        <UserCircle size={50} className="sm:size-[70px]" strokeWidth={1} />
                                    </div>
                                </div>
                                <div className="absolute bottom-1 right-1/2 translate-x-10 sm:translate-x-14 w-6 h-6 bg-green-500 border-4 border-white rounded-full"></div>
                            </div>

                            <div className="mt-6">
                                <h2 className="text-xl font-bold text-slate-800 break-words leading-tight">{fullName || userName}</h2>
                                <p className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-tighter">@{userName}</p>
                            </div>
                            
                            <div className="mt-6 pt-6 border-t border-slate-50 grid grid-cols-1 gap-3">
                                <div className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-bold">
                                    <ShieldCheck size={14} /> {role} Account
                                </div>
                                <div className="text-[11px] text-slate-400 font-medium italic">
                                    Hoạt động lần cuối: {new Date().toLocaleDateString('vi-VN')}
                                </div>
                            </div>
                        </div>

                        {/* Tip Card - Hidden on Mobile to save space */}
                        <div className="hidden lg:block bg-slate-900 rounded-[2rem] p-6 text-white shadow-2xl">
                            <h3 className="font-bold text-sm mb-2 flex items-center gap-2">
                                <CheckCircle2 size={16} className="text-indigo-400" /> Mẹo bảo mật
                            </h3>
                            <p className="text-slate-400 text-[11px] leading-relaxed">
                                Đừng chia sẻ mật khẩu của bạn cho bất kỳ ai, kể cả Admin hệ thống. Hãy đổi mật khẩu định kỳ 3 tháng một lần.
                            </p>
                        </div>
                    </div>

                    {/* Right: Main Form */}
                    <div className="lg:col-span-8">
                        <div className="bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
                            <div className="hidden md:block px-10 py-8 border-b border-slate-50 bg-slate-50/30">
                                <h1 className="text-2xl font-black text-slate-800 tracking-tight">Cấu hình hồ sơ</h1>
                                <p className="text-slate-400 text-sm mt-1">Thông tin công khai và tùy chọn bảo mật</p>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-10">
                                {/* Basic Info Section */}
                                <div className="space-y-6">
                                    <h3 className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <div className="w-6 h-[2px] bg-indigo-600 rounded-full"></div>
                                        Thông tin cơ bản
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                                        <FormInput label="Họ tên" name="fullName" value={formData.fullName} onChange={handleInputChange} icon={<User size={16}/>} error={errors.fullName} />
                                        <FormInput label="Email" name="email" value={formData.email} onChange={handleInputChange} icon={<Mail size={16}/>} error={errors.email} />
                                        <FormInput label="Số điện thoại" name="phone" value={formData.phone} onChange={handleInputChange} icon={<Phone size={16}/>} error={errors.phone} />
                                        <FormInput label="Tên đăng nhập" value={userName || ''} disabled icon={<User size={16}/>} helpText="Không thể chỉnh sửa" />
                                    </div>
                                </div>

                                {/* Security Section */}
                                <div className="space-y-6 pt-4">
                                    <h3 className="text-[11px] font-black text-red-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <div className="w-6 h-[2px] bg-red-500 rounded-full"></div>
                                        Bảo mật & Mật khẩu
                                    </h3>
                                    
                                    <div className="grid grid-cols-1 gap-5">
                                        <div className="relative group">
                                            <FormInput 
                                                label="Mật khẩu hiện tại" 
                                                name="currentPassword" 
                                                type={showPassword ? "text" : "password"} 
                                                value={formData.currentPassword} 
                                                onChange={handleInputChange} 
                                                icon={<Lock size={16}/>} 
                                                error={errors.currentPassword}
                                                placeholder="Xác nhận danh tính"
                                            />
                                            <button 
                                                type="button" 
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-[38px] text-slate-300 hover:text-indigo-600 p-1"
                                            >
                                                {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                            <FormInput 
                                                label="Mật khẩu mới" 
                                                name="newPassword" 
                                                type="password" 
                                                value={formData.newPassword} 
                                                onChange={handleInputChange} 
                                                icon={<Lock size={16}/>} 
                                                error={errors.newPassword}
                                                placeholder="Tối thiểu 6 ký tự"
                                            />
                                            <FormInput 
                                                label="Xác nhận lại" 
                                                name="confirmNewPassword" 
                                                type="password" 
                                                value={formData.confirmNewPassword} 
                                                onChange={handleInputChange} 
                                                icon={<ShieldCheck size={16}/>} 
                                                error={errors.confirmNewPassword}
                                                placeholder="Nhập lại mật khẩu mới"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Actions - Responsive Buttons */}
                                <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-6 border-t border-slate-50">
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmNewPassword: '' }))}
                                        className="w-full sm:w-auto px-6 py-3 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <RefreshCcw size={16} /> Làm mới form
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isLoading || !isDirty}
                                        className="w-full sm:w-auto bg-slate-900 text-white px-10 py-4 rounded-2xl font-bold shadow-xl shadow-slate-200 hover:bg-black active:scale-[0.97] transition-all disabled:opacity-30 disabled:grayscale flex items-center justify-center gap-3"
                                    >
                                        {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={20} />}
                                        Lưu thay đổi
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function FormInput({ label, icon, error, helpText, ...props }: any) {
    return (
        <div className="space-y-2 w-full">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                <span className="p-1 bg-slate-100 rounded-md text-slate-500">{icon}</span> {label}
            </label>
            <input
                {...props}
                className={`w-full px-5 py-3.5 bg-slate-50/50 border rounded-2xl transition-all duration-300 outline-none font-medium text-slate-700 placeholder:text-slate-300 text-sm
                    ${error ? 'border-red-300 bg-red-50/30 focus:ring-4 focus:ring-red-100' : 'border-slate-100 focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50'}
                    ${props.disabled ? 'opacity-60 cursor-not-allowed bg-slate-100' : ''}
                `}
            />
            {error && <p className="text-[10px] font-bold text-red-500 mt-1 ml-1 leading-tight">{error}</p>}
            {helpText && !error && <p className="text-[10px] text-slate-400 font-medium ml-1">{helpText}</p>}
        </div>
    );
}
// src/pages/ProfilePage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/context/AuthContext';

const useToast = () => {
    const toast = (options: { title: string; description: string; variant?: string }) => {
        alert(`${options.title}: ${options.description}`);
    };
    
    return { toast };
};

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
    const { toast } = useToast();
    
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        currentPassword: '',
        newPassword: ''
    });
    
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    
    // Load user data
    useEffect(() => {
        if (token && userName) {
            setFormData({
                fullName: fullName || '',
                email: email || '',
                phone: phone || '',
                currentPassword: '',
                newPassword: ''
            });
        }
    }, [token, userName, fullName, email, phone]);
    
    // Validation
    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        
        // Full name validation
        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Họ tên không được để trống';
        } else if (formData.fullName.length < 2) {
            newErrors.fullName = 'Họ tên phải có ít nhất 2 ký tự';
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim()) {
            newErrors.email = 'Email không được để trống';
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = 'Email không hợp lệ';
        }
        
        // Phone validation
        const phoneRegex = /^(0[0-9]{9,10})$/;
        if (!formData.phone.trim()) {
            newErrors.phone = 'Số điện thoại không được để trống';
        } else if (!phoneRegex.test(formData.phone)) {
            newErrors.phone = 'Số điện thoại không hợp lệ';
        }
        
        // Password validation
        if (formData.currentPassword || formData.newPassword) {
            if (!formData.currentPassword) {
                newErrors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại';
            }
            if (!formData.newPassword) {
                newErrors.newPassword = 'Vui lòng nhập mật khẩu mới';
            } else if (formData.newPassword.length < 6) {
                newErrors.newPassword = 'Mật khẩu mới phải có ít nhất 6 ký tự';
            }
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear error when typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        setIsLoading(true);
        try {
            // Chỉ gửi password nếu có thay đổi
            const dataToSend: any = {
                fullName: formData.fullName,
                email: formData.email,
                phone: formData.phone
            };
            
            if (formData.currentPassword && formData.newPassword) {
                dataToSend.currentPassword = formData.currentPassword;
                dataToSend.newPassword = formData.newPassword;
            }
            
            const response = await api.put('/api/auth/profile', dataToSend);
            
            if (response.data.code === 0) {
                // Update user in AuthContext
                if (response.data.data) {
                    updateUser(response.data.data);
                }
                
                // Show success message
                toast({
                    title: "Thành công",
                    description: "Cập nhật thông tin thành công"
                });
                
                // Clear password fields
                setFormData(prev => ({
                    ...prev,
                    currentPassword: '',
                    newPassword: ''
                }));
            } else {
                // Handle specific error messages
                // If user entered current password but got error, it's likely wrong password
                if (formData.currentPassword && formData.currentPassword.trim() !== '') {
                    setErrors(prev => ({ ...prev, currentPassword: "Sai mật khẩu hiện tại" }));
                } else {
                    toast({
                        title: "Lỗi",
                        description: "Có lỗi xảy ra khi cập nhật thông tin",
                        variant: "destructive"
                    });
                }
            }
        } catch (error: any) {
            toast({
                title: "Lỗi",
                description: error.message || "Có lỗi xảy ra"
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleReset = () => {
        if (token) {
            setFormData({
                fullName: fullName || '',
                email: email || '',
                phone: phone || '',
                currentPassword: '',
                newPassword: ''
            });
        }
        setErrors({});
    };
    
    // Nếu chưa đăng nhập, redirect
    useEffect(() => {
        if (!token) {
            navigate('/login');
        }
    }, [token, navigate]);
    
    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Vui lòng đăng nhập</h2>
                    <button 
                        onClick={() => navigate('/login')}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Đăng nhập
                    </button>
                </div>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-2xl mx-auto px-4">
                <div className="bg-white rounded-lg shadow-md p-6">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-gray-900">Thông tin cá nhân</h1>
                        <p className="text-gray-600 mt-2">
                            Cập nhật thông tin tài khoản của bạn
                        </p>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Username (readonly) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tên đăng nhập
                            </label>
                            <input
                                type="text"
                                value={userName || ''}
                                disabled
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                Tên đăng nhập không thể thay đổi
                            </p>
                        </div>
                        
                        {/* Full Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Họ và tên *
                            </label>
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleInputChange}
                                placeholder="Nhập họ và tên"
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    errors.fullName ? 'border-red-500' : 'border-gray-300'
                                }`}
                            />
                            {errors.fullName && (
                                <p className="text-sm text-red-500 mt-1">{errors.fullName}</p>
                            )}
                        </div>
                        
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email *
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="Nhập email"
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    errors.email ? 'border-red-500' : 'border-gray-300'
                                }`}
                            />
                            {errors.email && (
                                <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                            )}
                        </div>
                        
                        {/* Phone */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Số điện thoại *
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                placeholder="Nhập số điện thoại"
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    errors.phone ? 'border-red-500' : 'border-gray-300'
                                }`}
                            />
                            {errors.phone && (
                                <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
                            )}
                        </div>
                        
                        {/* Password Section */}
                        <div className="border-t pt-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                Đổi mật khẩu
                            </h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Chỉ điền vào đây nếu bạn muốn đổi mật khẩu
                            </p>
                            
                            {/* Current Password */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Mật khẩu hiện tại
                                </label>
                                <input
                                    type="password"
                                    name="currentPassword"
                                    value={formData.currentPassword}
                                    onChange={handleInputChange}
                                    placeholder="Nhập mật khẩu hiện tại"
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        errors.currentPassword ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                {errors.currentPassword && (
                                    <p className="text-sm text-red-500 mt-1">{errors.currentPassword}</p>
                                )}
                            </div>
                            
                            {/* New Password */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Mật khẩu mới
                                </label>
                                <input
                                    type="password"
                                    name="newPassword"
                                    value={formData.newPassword}
                                    onChange={handleInputChange}
                                    placeholder="Nhập mật khẩu mới"
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        errors.newPassword ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                {errors.newPassword && (
                                    <p className="text-sm text-red-500 mt-1">{errors.newPassword}</p>
                                )}
                            </div>
                        </div>
                        
                        {/* Role Display */}
                        <div className="bg-gray-50 p-4 rounded-md">
                            <h4 className="font-medium text-gray-900 mb-2">Vai trò tài khoản</h4>
                            <div className="flex items-center space-x-2">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                    role === 'ADMIN' 
                                        ? 'bg-red-100 text-red-800'
                                        : role === 'STAFF'
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-green-100 text-green-800'
                                }`}>
                                    {role}
                                </span>
                                <span className="text-sm text-gray-600">
                                    {role === 'ADMIN' ? 'Quản trị viên' :
                                     role === 'STAFF' ? 'Nhân viên' : 'Khách hàng'}
                                </span>
                            </div>
                        </div>
                        
                        {/* Buttons */}
                        <div className="flex justify-end space-x-3 pt-6 border-t">
                            <button
                                type="button"
                                onClick={handleReset}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                                disabled={isLoading}
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Đang lưu...
                                    </span>
                                ) : 'Lưu thay đổi'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
// src/layouts/admin/partial/NavUser.tsx
import { FaSignOutAlt, FaUserCircle, FaCog } from "react-icons/fa";
import { useState, useRef, useEffect } from "react";
import { useAuthContext } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

export function NavUser({ collapsed }: { collapsed: boolean }) {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const menuRef = useRef<HTMLDivElement>(null);

    const { token, fullName, userName, email, logout } = useAuthContext();

    // Click outside to close
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (!token) return null;

    const displayName = fullName || userName || "Admin";
    const displayEmail = email || "admin@quickmeal.vn";
    const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${displayName.replace(" ", "")}`;

    return (
        <div className="relative" ref={menuRef}>
            {/* Popup Menu (Bottom Up) */}
            {open && (
                <div className={`absolute bottom-full left-0 mb-2 w-full min-w-[220px] bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden transform transition-all duration-200 origin-bottom-left z-50
                    ${collapsed ? 'left-10' : ''}
                `}>
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                        <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{displayName}</p>
                        <p className="text-xs text-slate-500 truncate">{displayEmail}</p>
                    </div>
                    <div className="p-1">
                        <button 
                            onClick={() => {
                                navigate("/profile");
                                setOpen(false);
                            }}
                            className="flex w-full items-center gap-3 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        >
                            <FaUserCircle className="text-slate-400" /> Hồ sơ
                        </button>
                        <button className="flex w-full items-center gap-3 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                            <FaCog className="text-slate-400" /> Cài đặt
                        </button>
                        <div className="h-px bg-slate-100 dark:bg-slate-700 my-1" />
                        <button
                            onClick={() => {
                                logout();
                                navigate("/");
                            }}
                            className="flex w-full items-center gap-3 px-3 py-2 text-sm text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                            <FaSignOutAlt /> Đăng xuất
                        </button>
                    </div>
                </div>
            )}

            {/* User Button */}
            <button
                onClick={() => setOpen(!open)}
                className={`flex items-center gap-3 w-full p-2 rounded-xl transition-all duration-200
                    ${open ? 'bg-indigo-50 dark:bg-slate-800' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}
                    ${collapsed ? 'justify-center' : ''}
                `}
            >
                <img
                    src={avatar}
                    alt={displayName}
                    className="h-9 w-9 rounded-full border-2 border-white dark:border-slate-700 shadow-sm bg-white"
                />
                {!collapsed && (
                    <div className="flex-1 text-left overflow-hidden">
                        <div className="font-semibold text-sm text-slate-700 dark:text-slate-200 truncate">{displayName}</div>
                        <div className="text-xs text-slate-500 truncate">Admin</div>
                    </div>
                )}
                {!collapsed && (
                    <FaCog className={`text-slate-400 transition-transform duration-300 ${open ? 'rotate-90 text-indigo-500' : ''}`} />
                )}
            </button>
        </div>
    );
}
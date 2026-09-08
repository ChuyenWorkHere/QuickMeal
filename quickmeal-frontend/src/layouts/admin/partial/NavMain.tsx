// src/layouts/admin/partial/NavMain.tsx
import { FaChevronRight, FaCircle } from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import type { NavItem } from './AppSideBar'; // Import type từ AppSidebar đã sửa

// Sử dụng type NavItem đã được định nghĩa trong AppSidebar.tsx
export function NavMain({ items, collapsed }: { items: NavItem[]; collapsed: boolean }) {
    const location = useLocation();
    const pathname = location.pathname;
    const [openMenus, setOpenMenus] = useState<string[]>([]);

    // Tự động mở menu cha nếu đang ở trang con
    useEffect(() => {
        items.forEach(item => {
            // item.subItems là NavSubItem[] (không có icon)
            if (item.subItems?.some(sub => sub.url === pathname)) {
                setOpenMenus(prev => [...new Set([...prev, item.title])]);
            }
        });
    }, [pathname, items]);

    const toggleMenu = (title: string) => {
        if (collapsed) return; // Không toggle khi đang đóng sidebar
        setOpenMenus((prev) =>
            prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
        );
    };

    return (
        <nav className="space-y-1 px-3">
            {items.map((item) => {
                const isActive = pathname === item.url || item.subItems?.some((s) => s.url === pathname);
                const isOpen = openMenus.includes(item.title);
                const Icon = item.icon;

                return (
                    <div key={item.title} className="group relative">
                        {/* Main Menu Item */}
                        {item.subItems ? (
                            <button
                                onClick={() => toggleMenu(item.title)}
                                className={`flex items-center w-full gap-3 px-3 py-3 rounded-xl transition-all duration-200 group
                                    ${isActive
                                        ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-semibold'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                                    }
                                    ${collapsed ? 'justify-center' : ''}
                                `}
                            >
                                <div className="relative flex items-center justify-center">
                                    {Icon && <Icon size={20} className={`transition-colors ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 group-hover:text-slate-800'}`} />}
                                    {/* Dot báo hiệu active khi collapsed */}
                                    {collapsed && isActive && (
                                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-600 rounded-full ring-2 ring-white dark:ring-slate-900" />
                                    )}
                                </div>

                                {!collapsed && (
                                    <>
                                        <span className="flex-1 text-left text-sm">{item.title}</span>
                                        <FaChevronRight
                                            size={12}
                                            className={`transition-transform duration-200 opacity-50 ${isOpen ? 'rotate-90' : ''}`}
                                        />
                                    </>
                                )}
                            </button>
                        ) : (
                            <Link
                                to={item.url}
                                className={`flex items-center w-full gap-3 px-3 py-3 rounded-xl transition-all duration-200
                                    ${isActive
                                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                                    }
                                    ${collapsed ? 'justify-center' : ''}
                                `}
                            >
                                {Icon && <Icon size={20} className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-800'} />}
                                {!collapsed && <span className="text-sm font-medium">{item.title}</span>}
                            </Link>
                        )}

                        {/* Tooltip for Collapsed State (Floating to the right) */}
                        {collapsed && (
                            <div className="absolute left-full top-2 ml-2 z-50 hidden group-hover:block whitespace-nowrap">
                                <div className="bg-slate-800 text-white text-xs px-3 py-2 rounded-md shadow-lg relative">
                                    {item.title}
                                    {/* Mũi tên tooltip */}
                                    <div className="absolute top-1/2 -left-1 -mt-1 border-4 border-transparent border-r-slate-800" />
                                </div>
                            </div>
                        )}

                        {/* Submenu with smooth transition */}
                        {!collapsed && item.subItems && (
                            <div
                                className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}
                            >
                                <div className="ml-4 pl-4 border-l-2 border-slate-100 dark:border-slate-800 space-y-1">
                                    {item.subItems.map((sub) => {
                                        const isSubActive = pathname === sub.url;
                                        return (
                                            <Link
                                                key={sub.title}
                                                to={sub.url}
                                                className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors
                                                    ${isSubActive
                                                        ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/10 font-medium'
                                                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                                                    }
                                                `}
                                            >
                                                <FaCircle size={6} className={`${isSubActive ? 'scale-100' : 'scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-50'} transition-all duration-200`} />
                                                <span>{sub.title}</span>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </nav>
    );
}
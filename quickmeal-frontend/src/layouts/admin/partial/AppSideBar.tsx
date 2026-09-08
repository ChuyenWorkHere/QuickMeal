// src/layouts/admin/partial/AppSideBar.tsx
import { FaHome, FaBoxOpen, FaShoppingCart, FaUsers, FaCogs, FaChartBar, FaIndent, FaOutdent, FaTimes, FaConciergeBell } from 'react-icons/fa';
import { NavMain } from './NavMain';
import { NavUser } from './NavUser';
// 1. Import Auth Context và RoleType
import { useAuthContext } from '@/context/AuthContext';
import type { RoleType } from "@/types";


// Định nghĩa type cho Menu Item để thêm roles
interface NavSubItem {
  title: string;
  url: string;
  roles?: RoleType[];
}

export interface NavItem {
  title: string;
  icon: any; // React Icon component
  url: string;
  roles?: RoleType[]; // Thêm trường roles, chỉ những role này mới được thấy
  subItems?: NavSubItem[];
}

interface AppSidebarProps {
  collapsed: boolean;
  toggle: () => void;
  isMobile?: boolean;
  mobileOpen?: boolean;
}

export function AppSidebar({ collapsed, toggle, isMobile = false, mobileOpen = false }: AppSidebarProps) {
  // 2. Lấy role của user
  const { role } = useAuthContext();

  // Danh sách menu gốc - Thêm roles vào các mục cần bảo vệ
  const rawMenuItems: NavItem[] = [
    // Các mục không cần quyền: ai cũng thấy
    { title: 'Tổng quan', icon: FaHome, url: '/admin/dashboard' },
    {
      title: 'Sản Phẩm', icon: FaBoxOpen, url: '',
      subItems: [
        { title: 'Danh sách', url: '/admin/products' },
        { title: 'Danh mục', url: '/admin/categories' },
      ]
    },
    {
      title: 'Đơn Hàng', icon: FaShoppingCart, url: '', subItems: [
        { title: 'Tất cả đơn', url: '/admin/orders/all' },
      ]
    },
    // Các mục chỉ dành cho ADMIN
    { title: 'Người dùng', icon: FaUsers, url: '/admin/users', roles: ['ADMIN'] },
    { title: 'Cài Đặt', icon: FaCogs, url: '/admin/settings', roles: ['ADMIN'] },
  ];

  /**
   * Hàm đệ quy lọc menu dựa trên vai trò của người dùng.
   * @param items Danh sách menu
   * @param currentRole Role hiện tại của user
   */
  const filterMenuItemsByRole = (items: NavItem[] | NavSubItem[], currentRole: RoleType | null): NavItem[] | NavSubItem[] => {
    return items.flatMap(item => {
      // Lọc subItems nếu có (Dùng type assertion để đảm bảo subItems là mảng NavSubItem[])
      const filteredSubItems = 'subItems' in item && item.subItems
        ? filterMenuItemsByRole(item.subItems as NavSubItem[], currentRole) as NavSubItem[]
        : undefined;

      // Kiểm tra quyền:
      // - Nếu không có yêu cầu roles (item.roles là undefined): Luôn hiển thị.
      // - Nếu có yêu cầu roles: Chỉ hiển thị nếu role hiện tại của user nằm trong mảng roles đó.
      const isAuthorized = !item.roles || (currentRole && item.roles.includes(currentRole));

      if (isAuthorized) {
        // Nếu item có quyền, trả về item đó (cùng với subItems đã được lọc)
        return [{ ...item, subItems: filteredSubItems }];
      }

      // Trường hợp: item cha không có quyền nhưng subItems có thể có quyền
      if (filteredSubItems && filteredSubItems.length > 0) {
        // Nếu đây là item cha và nó không có quyền, nhưng có subItems được phép hiển thị
        // thì ta vẫn trả về item cha, nhưng chỉ với subItems đã lọc (thường không áp dụng 
        // cho menu cha, nhưng cần thiết cho sub-menu)
        return [{ ...item as NavItem, subItems: filteredSubItems }];
      }

      // Không có quyền và không có subItems hợp lệ, loại bỏ item
      return [];
    });
  };

  // 3. Áp dụng filter
  const menuItems = filterMenuItemsByRole(rawMenuItems, role) as NavItem[];

  // Chiều rộng sidebar: mở rộng 72 (288px) nhìn cho thoáng
  const widthClass = collapsed ? 'w-[80px]' : 'w-72';

  return (
    <>
      {/* Mobile Overlay with blur */}
      {isMobile && mobileOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 transition-opacity" onClick={toggle} />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-xl 
                flex flex-col transition-all duration-300 ease-out
                ${isMobile ? (mobileOpen ? 'translate-x-0 w-72' : '-translate-x-full w-72') : widthClass}`}
      >
        {/* Header Logo */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-100 dark:border-slate-800">
          <div className={`flex items-center gap-3 overflow-hidden transition-all duration-300 ${collapsed && !isMobile ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
            <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-lg shadow-indigo-500/30">
              <FaConciergeBell size={20} />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-800 dark:text-white whitespace-nowrap">
              Quick<span className="text-indigo-600">Meal</span>
            </span>
          </div>

          {/* Toggle Button (Desktop Only) */}
          {!isMobile && (
            <button
              onClick={toggle}
              className={`p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-all
                                ${collapsed ? 'mx-auto' : ''}`}
            >
              {collapsed ? <FaIndent size={20} /> : <FaOutdent size={20} />}
            </button>
          )}

          {/* Close Button (Mobile Only) */}
          {isMobile && (
            <button onClick={toggle} className="p-2 text-slate-500 hover:bg-slate-100 rounded-md">
              <FaTimes size={20} />
            </button>
          )}
        </div>

        {/* Scrollable Menu Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 custom-scrollbar">
          {/* 4. Truyền items đã lọc vào NavMain */}
          <NavMain items={menuItems} collapsed={collapsed && !isMobile} />
        </div>

        {/* Footer User Profile */}
        <div className="border-t border-slate-100 dark:border-slate-800 p-3">
          <NavUser collapsed={collapsed && !isMobile} />
        </div>
      </aside>
    </>
  );
}
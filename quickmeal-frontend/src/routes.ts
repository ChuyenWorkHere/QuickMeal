// routes.ts
import PublicLayout from "@/layouts/PublicLayout";
import AdminLayout from "./layouts/admin/AdminLayout";

import Index from "@/pages/Index";
import Login from "@/pages/LoginPage";
import Register from "@/pages/RegisterPage";
import Terms from "@/pages/TermsPage";
import Privacy from "@/pages/PrivacyPage";

import DashBoard from "@/pages/admin/DashBoard";
import Products from "@/pages/admin/product/Products";
import Category from "@/pages/admin/category/Category";
import Users from "./pages/admin/user/Users";
import type { RoleType } from "@/types";
import MenuPage from "@/pages/MenuPage";
import CheckoutPage from "@/pages/CheckoutPage";
import ComingSoon from "@/pages/admin/ComingSoon";
import ProfilePage from "@/pages/user/ProfilePage";
import OrdersPage from "@/pages/admin/order/Orders";
import OrderHistory from "@/pages/user/OrderHistory";

export interface AppRoute {
    path: string;
    element: React.FC;
    layout?: React.FC<{ children: React.ReactNode }>;
    role?: "public" | RoleType | RoleType[]; // public hoặc 1 role, hoặc nhiều role
}

export const routes: AppRoute[] = [
    // public routes
    { path: "/", element: Index, layout: PublicLayout, role: "public" },
    { path: "/login", element: Login, layout: PublicLayout, role: "public" },
    { path: "/register", element: Register, layout: PublicLayout, role: "public" },
    { path: "/terms", element: Terms, layout: PublicLayout, role: "public" },
    { path: "/privacy", element: Privacy, layout: PublicLayout, role: "public" },
    { path: "/menu", element: MenuPage, layout: PublicLayout, role: "public" },

    // Customer routes
    { path: "/checkout", element: CheckoutPage, layout: PublicLayout, role: ["CUSTOMER"] },
    { path: "/profile", element: ProfilePage, layout: PublicLayout, role: ["CUSTOMER"] },
    { path: "/order-history", element: OrderHistory, layout: PublicLayout, role: ["CUSTOMER"] },



    // Admin routes
    { path: "/admin/dashboard", element: DashBoard, layout: AdminLayout, role: ["ADMIN", "STAFF"] },
    { path: "/admin/products", element: Products, layout: AdminLayout, role: ["ADMIN", "STAFF"] },
    { path: "/admin/categories", element: Category, layout: AdminLayout, role: ["ADMIN", "STAFF"] },
    { path: "/admin/users", element: Users, layout: AdminLayout, role: ["ADMIN"] },

    { path: "/admin/orders/all", element: OrdersPage, layout: AdminLayout, role: ["ADMIN", "STAFF"] },

    { path: "/admin/settings", element: ComingSoon, layout: AdminLayout, role: ["ADMIN"] },

];

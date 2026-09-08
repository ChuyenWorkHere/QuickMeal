import { useState, useEffect, type ReactNode } from 'react';
import { AppSidebar } from '@/layouts/admin/partial/AppSideBar';

interface AdminLayoutProps {
    children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 1024); // Tăng điểm break point lên tablet
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
            <div className="flex h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 overflow-hidden">
                {/* Sidebar */}
                <AppSidebar
                    collapsed={collapsed}
                    toggle={() => isMobile ? setMobileOpen(!mobileOpen) : setCollapsed(!collapsed)}
                    isMobile={isMobile}
                    mobileOpen={mobileOpen}
                />

                {/* Main Content Area */}
                <div className={`flex-1 flex flex-col h-full transition-all duration-300 ease-in-out relative ${!isMobile ? (collapsed ? 'ml-[80px]' : 'ml-72') : ''}`}>

                    {/* Mobile Header / Toggle */}
                    {isMobile && (
                        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center px-4 sticky top-0 z-30">
                            <button
                                onClick={() => setMobileOpen(true)}
                                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                <span className="text-xl">☰</span>
                            </button>
                            <span className="ml-4 font-semibold text-lg">QuickMeal Admin</span>
                        </header>
                    )}

                    {/* Scrollable Content */}
                    <main className="flex-1 p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
                        <div className="max-w-7xl mx-auto">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
    );
}
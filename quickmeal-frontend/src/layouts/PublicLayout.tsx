import type { ReactNode } from "react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import FloatingCart from '@/components/FloatingCart';
import { CartProvider } from "@/context/CartContext";

export default function PublicLayout({ children }: { children: ReactNode }) {
    return (
        <div  >
            <CartProvider>

                <Header />
                <div className="pt-20">
                    <main>{children}</main>
                </div>
                <Footer />
                <FloatingCart />

            </CartProvider>
        </div>
    );
}

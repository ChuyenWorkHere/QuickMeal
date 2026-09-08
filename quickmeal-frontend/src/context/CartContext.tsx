// src/context/CartContext.tsx
import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { toast } from 'sonner';

// ✨ CẬP NHẬT: Thêm imageUrl
interface CartItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
    imageUrl: string; 
}

// ✨ CẬP NHẬT: Thêm imageUrl
interface ProductToAdd {
    id: number;
    name: string;
    price: number;
    imageUrl: string; 
}

// Định nghĩa Cart Context Type (giữ nguyên các hàm)
interface CartContextType {
    cartItems: CartItem[];
    totalItems: number;
    totalPrice: number;
    formatPrice: (price: number) => string;
    addToCart: (product: ProductToAdd, quantity?: number) => void;
    cartUpdateCount: number;
    increaseQuantity: (id: number) => void;
    decreaseQuantity: (id: number) => void;
    removeFromCart: (id: number) => void;
    clearCart: () => void;
    setQuantity: (id: number, quantity: number) => void;
}

const CartContext = createContext<CartContextType | null>(null);
export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [cartUpdateCount, setCartUpdateCount] = useState(0); 
    
    const addToCart = useCallback((product: ProductToAdd, quantity: number = 1) => {
        setCartItems(prevItems => {
            const existingItemIndex = prevItems.findIndex(item => item.id === product.id);
            let newItems;
            let message = '';

            if (existingItemIndex > -1) {
                newItems = [...prevItems];
                const existingItem = newItems[existingItemIndex];
                newItems[existingItemIndex] = {
                    ...existingItem,
                    quantity: existingItem.quantity + quantity
                };
                message = `Đã cập nhật ${product.name} (SL: ${newItems[existingItemIndex].quantity})`;
            } else {
                // ✨ SỬ DỤNG imageUrl từ product
                const newItem: CartItem = { ...product, quantity, imageUrl: product.imageUrl };
                newItems = [...prevItems, newItem];
                message = `Đã thêm ${product.name} vào giỏ hàng!`;
            }
            
            setCartUpdateCount(prev => prev + 1); 
            toast.success(message);
            return newItems;
        });
    }, []);

    const increaseQuantity = useCallback((id: number) => {
        setCartItems(prevItems => {
            const itemToUpdate = prevItems.find(item => item.id === id);
            if (!itemToUpdate) return prevItems;
            
            const updatedItems = prevItems.map(item => 
                item.id === id ? { ...item, quantity: item.quantity + 1 } : item
            );
            
            const newQuantity = itemToUpdate.quantity + 1;
            
            setCartUpdateCount(prev => prev + 1);
            toast.success(`Đã tăng ${itemToUpdate.name} lên ${newQuantity}`);
            
            return updatedItems;
        });
    }, []);

    const decreaseQuantity = useCallback((id: number) => {
        setCartItems(prevItems => {
            const itemToUpdate = prevItems.find(item => item.id === id);
            if (!itemToUpdate) return prevItems;

            if (itemToUpdate.quantity > 1) {
                const updatedItems = prevItems.map(item => 
                    item.id === id ? { ...item, quantity: item.quantity - 1 } : item
                );
                
                const newQuantity = itemToUpdate.quantity - 1;

                setCartUpdateCount(prev => prev + 1);
                toast.success(`Đã giảm ${itemToUpdate.name} xuống ${newQuantity}`);

                return updatedItems;
            } else {
                const newItems = prevItems.filter(item => item.id !== id);
                
                setCartUpdateCount(prev => prev + 1);
                toast.success(`Đã xóa ${itemToUpdate.name} khỏi giỏ hàng.`);
                
                return newItems;
            }
        });
    }, []);

    const removeFromCart = useCallback((id: number) => {
        setCartItems(prevItems => {
            const itemToDelete = prevItems.find(item => item.id === id);
            const newItems = prevItems.filter(item => item.id !== id);

            setCartUpdateCount(prev => prev + 1);
            toast.success(`Đã xóa ${itemToDelete?.name} khỏi giỏ hàng.`);
            
            return newItems;
        });
    }, []);

    const clearCart = useCallback(() => {
        setCartItems([]);
        setCartUpdateCount(prev => prev + 1); 
        toast.info("Giỏ hàng đã được làm sạch!");
    }, []);
    
    const setQuantity = useCallback((id: number, quantity: number) => {
        const validatedQuantity = Math.max(0, quantity); 

        setCartItems(prevItems => {
            const itemIndex = prevItems.findIndex(item => item.id === id);
            if (itemIndex === -1) return prevItems;
            
            const itemToUpdate = prevItems[itemIndex];

            if (validatedQuantity === 0) {
                const newItems = prevItems.filter(item => item.id !== id);
                setCartUpdateCount(prev => prev + 1);
                toast.success(`Đã xóa ${itemToUpdate.name} khỏi giỏ hàng.`);
                return newItems;
            } else {
                const newItems = [...prevItems];
                newItems[itemIndex] = { ...itemToUpdate, quantity: validatedQuantity };
                
                setCartUpdateCount(prev => prev + 1);
                toast.success(`Đã cập nhật ${itemToUpdate.name} (SL: ${validatedQuantity})`);
                
                return newItems;
            }
        });
    }, []);
    
    const totalItems = useMemo(() => 
        cartItems.reduce((sum, item) => sum + item.quantity, 0), 
        [cartItems]
    );
    const totalPrice = useMemo(() =>
        cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
        [cartItems]
    );
    const formatPrice = useCallback((price: number) =>
        price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }),
        []
    );
    
    const contextValue = useMemo(() => ({
        cartItems,
        totalItems,
        totalPrice,
        formatPrice,
        addToCart,
        cartUpdateCount, 
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        clearCart,
        setQuantity,
    }), [cartItems, totalItems, totalPrice, formatPrice, addToCart, cartUpdateCount, increaseQuantity, decreaseQuantity, removeFromCart, clearCart, setQuantity]);
    
    return (
        <CartContext.Provider value={contextValue}>
            {children}
        </CartContext.Provider>
    );
};
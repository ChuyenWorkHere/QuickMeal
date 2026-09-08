// src/context/ProductContext.tsx (ĐÃ SỬA)

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { productService } from "@/services/productService";
import type { ProductDTO } from "@/services/productService";
import { categoryService } from "@/services/categoryService";
import type { CategoryDTO, CategoryCreateUpdateDTO } from "@/services/categoryService";

interface ProductContextType {
    products: ProductDTO[];
    specialProducts: ProductDTO[]; 
    categories: CategoryDTO[];
    loading: boolean;

    // Product CRUD
    create: (data: FormData) => Promise<void>;
    update: (id: number, data: FormData) => Promise<void>;
    remove: (id: number) => Promise<void>;
    
    // 👈 THÊM: Hàm này cho phép component MenuPage tải lại toàn bộ danh sách
    refetchProducts: () => Promise<void>; 

    // Fetch món special từ backend
    fetchSpecialProducts: () => Promise<void>;

    // Category CRUD
    createCategory: (data: CategoryCreateUpdateDTO) => Promise<CategoryDTO>;
    updateCategory: (id: number, data: CategoryCreateUpdateDTO) => Promise<CategoryDTO>;
    removeCategory: (id: number) => Promise<void>;
}

const ProductContext = createContext<ProductContextType>({
    products: [],
    specialProducts: [],
    categories: [],
    loading: true,
    create: async () => { },
    update: async () => { },
    remove: async () => { },
    refetchProducts: async () => { }, // 👈 GIÁ TRỊ MẶC ĐỊNH
    fetchSpecialProducts: async () => { },
    createCategory: async () => ({} as CategoryDTO), 
    updateCategory: async () => ({} as CategoryDTO),
    removeCategory: async () => { },
});

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [products, setProducts] = useState<ProductDTO[]>([]);
    const [specialProducts, setSpecialProducts] = useState<ProductDTO[]>([]); 
    const [categories, setCategories] = useState<CategoryDTO[]>([]);
    const [loading, setLoading] = useState(true);

    // --- Data Initialization / Refetch Function ---
    // Đổi tên thành refetchProducts (hoặc giữ tên fetchData)
    const refetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const [cats, prods] = await Promise.all([categoryService.getAll(), productService.getAll()]);
            setCategories(cats);
            setProducts(prods);
        } catch (error) {
            console.error("Error fetching initial data:", error);
        } finally {
            setLoading(false);
        }
    }, []); 

    useEffect(() => {
        // Fetch ban đầu khi Provider mount
        refetchProducts();
    }, [refetchProducts]);

    // --- Fetch món special ---
    const fetchSpecialProducts = useCallback(async () => {
        try {
            const specials = await productService.getSpecial();
            setSpecialProducts(specials);
        } catch (error) {
            console.error("Error fetching special products:", error);
        }
    }, []); 

    // ... (Giữ nguyên logic CRUD PRODUCT và CATEGORY) ...
    const create = useCallback(async (formData: FormData) => {
        const newProd = await productService.create(formData);
        setProducts((prev) => [...prev, newProd]);
    }, []);

    const update = useCallback(async (id: number, formData: FormData) => {
        const updated = await productService.update(id, formData);
        setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
    }, []);

    const remove = useCallback(async (id: number) => {
        await productService.delete(id);
        setProducts((prev) => prev.filter((p) => p.id !== id));
    }, []);

    const createCategory = useCallback(async (data: CategoryCreateUpdateDTO): Promise<CategoryDTO> => {
        const newCat = await categoryService.create(data);
        setCategories((prev) => [...prev, newCat]);
        return newCat;
    }, []);

    const updateCategory = useCallback(async (id: number, data: CategoryCreateUpdateDTO): Promise<CategoryDTO> => {
        const updatedCat = await categoryService.update(id, data);
        setCategories((prev) => prev.map((c) => (c.id === id ? updatedCat : c)));
        return updatedCat;
    }, []);

    const removeCategory = useCallback(async (id: number) => {
        await categoryService.remove(id);
        setCategories((prev) => prev.filter((c) => c.id !== id));
        setProducts((prev) => prev.filter((p) => p.categoryId !== id));
    }, []);

    const contextValue: ProductContextType = {
        products,
        specialProducts, 
        categories,
        loading,
        create,
        update,
        remove,
        refetchProducts, // 👈 EXPORT HÀM FETCH
        fetchSpecialProducts, 
        createCategory,
        updateCategory,
        removeCategory,
    };

    return (
        <ProductContext.Provider value={contextValue}>
            {children}
        </ProductContext.Provider>
    );
};

export const useProducts = () => useContext(ProductContext);
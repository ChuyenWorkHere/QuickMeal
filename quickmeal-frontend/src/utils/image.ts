// src/utils/image.ts
export const getProductImageUrl = (imagePath?: string) => {
    if (!imagePath) return ""; // hoặc 1 placeholder
    // nếu imagePath là "abc.jpg" thì trả về full URL
    return `http://localhost:8080${imagePath}`;
};

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useProducts } from "@/context/ProductContext";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ImagePlus, X, UploadCloud, DollarSign } from "lucide-react";
import { getProductImageUrl } from "@/utils/image";

interface Props {
    open: boolean;
    product?: any;
    onOpenChange: (open: boolean) => void;
    onSave: (data: FormData) => void;
}

export default function ProductDialog({ open, product, onOpenChange, onSave }: Props) {
    const { categories } = useProducts();

    // Form State
    const [name, setName] = React.useState("");
    const [price, setPrice] = React.useState<number | string>("");
    const [stock, setStock] = React.useState<number | string>("");
    const [categoryId, setCategoryId] = React.useState<string>("");
    const [description, setDescription] = React.useState("");

    // Image State
    const [imageFile, setImageFile] = React.useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

    // UX Cải tiến: Inline Error State
    const [errors, setErrors] = React.useState<{ [key: string]: string }>({});

    // Reset form when dialog opens/closes or product changes
    React.useEffect(() => {
        if (product) {
            setName(product.name);
            setPrice(product.price);
            setStock(product.stock ?? "");
            setCategoryId(String(product.categoryId || ""));
            setDescription(product.description || "");
            setImageFile(null);
            setPreviewUrl(product.imageUrl ? getProductImageUrl(product.imageUrl) : null);
        } else {
            resetForm();
        }
        setErrors({}); // Reset lỗi mỗi lần mở/đóng
    }, [product, open]);

    const resetForm = () => {
        setName("");
        setPrice("");
        setStock("");
        setCategoryId("");
        setDescription("");
        setImageFile(null);
        setPreviewUrl(null);
        setErrors({});
    };

    // Xử lý chọn ảnh và tạo Preview
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const objectUrl = URL.createObjectURL(file);
            setPreviewUrl(objectUrl);
        }
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setPreviewUrl(null);
    };

    // Validation (Dùng cho Inline Error)
    const validate = () => {
        const newErrors: { [key: string]: string } = {};
        if (!name.trim()) newErrors.name = "Tên sản phẩm không được để trống";
        if (!price || Number(price) <= 0) newErrors.price = "Giá phải lớn hơn 0";
        if (!categoryId) newErrors.categoryId = "Vui lòng chọn danh mục";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = () => {
        if (!validate()) return;

        const formData = new FormData();
        formData.append("name", name);
        formData.append("price", String(price));
        if (stock !== "") formData.append("stock", String(stock));
        formData.append("categoryId", categoryId);
        formData.append("description", description);
        if (imageFile) formData.append("image", imageFile);

        onSave(formData);
    };

    // Helper component để hiển thị lỗi Inline
    const ErrorMessage: React.FC<{ field: string }> = ({ field }) => {
        if (!errors[field]) return null;
        return <p className="text-sm text-red-500 mt-1">{errors[field]}</p>;
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-indigo-700">
                        {product ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
                    </DialogTitle>
                    <DialogDescription>
                        Điền đầy đủ thông tin sản phẩm bên dưới. Nhấn lưu để hoàn tất.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    {/* Khu vực upload ảnh */}
                    <div className="flex flex-col items-center justify-center gap-4">
                        <div className={`relative w-full h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center transition-colors ${previewUrl ? 'border-indigo-300 bg-gray-50' : 'border-gray-300 hover:border-indigo-400 hover:bg-indigo-50'}`}>
                            {previewUrl ? (
                                <>
                                    <img
                                        src={previewUrl}
                                        alt="Preview"
                                        className="w-full h-full object-contain rounded-lg p-1"
                                    />
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        className="absolute top-2 right-2 h-8 w-8 rounded-full opacity-90 hover:opacity-100"
                                        onClick={handleRemoveImage}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </>
                            ) : (
                                <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
                                    <div className="p-4 bg-indigo-100 rounded-full mb-2">
                                        <ImagePlus className="h-8 w-8 text-indigo-600" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-600">Nhấn để tải ảnh lên</span>
                                    <span className="text-xs text-gray-400 mt-1">PNG, JPG (Tối đa 5MB)</span>
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                    />
                                </label>
                            )}
                        </div>
                    </div>

                    {/* Tên sản phẩm */}
                    <div className="grid gap-2">
                        <Label htmlFor="name">Tên sản phẩm</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                setErrors(prev => ({ ...prev, name: '' })); // Xóa lỗi khi nhập
                            }}
                            className={errors.name ? 'border-red-500' : ''}
                            placeholder="Ví dụ: Bánh mì Pate, Cà phê đen"
                        />
                        <ErrorMessage field="name" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Giá */}
                        <div className="grid gap-2">
                            <Label htmlFor="price">Giá</Label>
                            <div className="relative">
                                <Input
                                    id="price"
                                    type="number"
                                    value={price}
                                    onChange={(e) => {
                                        setPrice(e.target.value);
                                        setErrors(prev => ({ ...prev, price: '' }));
                                    }}
                                    className={`pl-10 ${errors.price ? 'border-red-500' : ''}`}
                                    placeholder="0"
                                    min="0"
                                />
                                <div className="absolute left-3 top-2.5 flex items-center justify-center h-4 w-4">
                                    <span className="text-gray-500 font-bold text-sm">₫</span>
                                </div>
                            </div>
                            <ErrorMessage field="price" />
                        </div>
                        {/* Stock */}
                        <div className="grid gap-2">
                            <Label htmlFor="stock">Số lượng tồn</Label>
                            <Input
                                id="stock"
                                type="number"
                                value={stock}
                                onChange={(e) => setStock(e.target.value)}
                                placeholder="Ví dụ: 50"
                                min={0}
                            />
                        </div>
                        {/* Danh mục */}
                        <div className="grid gap-2">
                            <Label htmlFor="category">Danh mục</Label>
                            <Select
                                value={categoryId}
                                onValueChange={(v) => {
                                    setCategoryId(v);
                                    setErrors(prev => ({ ...prev, categoryId: '' }));
                                }}
                            >
                                <SelectTrigger className={errors.categoryId ? 'border-red-500' : ''}>
                                    <SelectValue placeholder="Chọn danh mục" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((c) => (
                                        <SelectItem key={c.id} value={String(c.id)}>
                                            {c.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <ErrorMessage field="categoryId" />
                        </div>
                    </div>

                    {/* Mô tả */}
                    <div className="grid gap-2">
                        <Label htmlFor="description">Mô tả (Không bắt buộc)</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Mô tả chi tiết về sản phẩm..."
                            rows={3}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
                    <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700">
                        <UploadCloud className="mr-2 h-4 w-4" /> {product ? "Cập nhật" : "Tạo mới"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
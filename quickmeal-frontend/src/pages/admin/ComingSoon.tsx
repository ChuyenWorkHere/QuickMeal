import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Construction } from 'lucide-react';
 
export default function ComingSoon() {
    return (
        <div className="space-y-6">
            <Card className="border-dashed border-2">
                <CardHeader>
                    <div className="flex items-center justify-center mb-4">
                        <div className="bg-primary/10 p-4 rounded-full">
                            <Construction className="h-12 w-12 text-primary" />
                        </div>
                    </div>
                    <CardTitle className="text-center">Trang Đang Phát Triển</CardTitle>
                    <CardDescription className="text-center">
                        Chức năng này đang được phát triển và sẽ sớm ra mắt
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center space-y-2">
                        <p className="text-sm text-muted-foreground">
                            Vui lòng quay lại sau hoặc liên hệ với đội ngũ phát triển để biết thêm chi tiết
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

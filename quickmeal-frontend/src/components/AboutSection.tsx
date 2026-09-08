// src/pages/home/AboutSection.tsx
import React, { useRef } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Award, Heart, Users, Clock } from 'lucide-react';
import banhMiHero from '@/assets/banh-mi-hero.jpg';
import type { Variants } from 'framer-motion';

const features = [
    {
        icon: Award,
        title: 'Chất Lượng Đảm Bảo',
        description: 'Nguyên liệu tươi ngon được tuyển chọn kỹ càng'
    },
    {
        icon: Heart,
        title: 'Công Thức Truyền Thống',
        description: 'Giữ gìn hương vị bánh mì Việt Nam chính gốc'
    },
    {
        icon: Users,
        title: '10,000+ Khách Hàng',
        description: 'Tin tưởng và yêu thích sản phẩm của chúng tôi'
    },
    {
        icon: Clock,
        title: 'Giao Hàng Nhanh',
        description: 'Cam kết giao hàng trong vòng 30 phút'
    }
];

const AboutSection: React.FC = () => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"]
    });

    const imageY = useTransform(scrollYProgress, [0, 1], [100, -100]);
    const imageScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.8]);

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.2
            }
        }
    };

    const leftVariants: Variants = {
        hidden: { x: -100, opacity: 0 },
        visible: {
            x: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 20
            }
        }
    };

    const rightVariants: Variants = {
        hidden: { x: 100, opacity: 0 },
        visible: {
            x: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 20
            }
        }
    };

    const itemVariants: Variants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100
            }
        }
    };

    return (
        <section id="about" className="py-20 bg-background overflow-hidden" ref={ref}>
            <div className="container mx-auto px-4">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
                >
                    {/* Left: Image */}
                    <motion.div
                        variants={leftVariants}
                        className="relative"
                    >
                        <motion.div
                            style={{ y: imageY, scale: imageScale }}
                            className="relative rounded-2xl overflow-hidden shadow-2xl"
                        >
                            <motion.img
                                whileHover={{ scale: 1.1 }}
                                transition={{ duration: 0.6 }}
                                src={banhMiHero}
                                alt="Về QuickMeal"
                                className="w-full h-[500px] object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                        </motion.div>

                        {/* Floating Card */}
                        <motion.div
                            initial={{ scale: 0, rotate: -45 }}
                            animate={isInView ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -45 }}
                            transition={{
                                delay: 0.8,
                                type: "spring",
                                stiffness: 200
                            }}
                            whileHover={{
                                scale: 1.1,
                                rotate: [0, -5, 5, 0],
                                transition: { duration: 0.5 }
                            }}
                            className="absolute -bottom-8 -right-8 bg-primary text-primary-foreground p-6 rounded-lg shadow-xl"
                        >
                            <motion.div
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="text-4xl font-bold mb-1"
                            >
                                5+
                            </motion.div>
                            <div className="text-sm">Năm Kinh Nghiệm</div>
                        </motion.div>
                    </motion.div>

                    {/* Right: Content */}
                    <motion.div variants={rightVariants}>
                        <motion.h2
                            variants={itemVariants}
                            whileHover={{ scale: 1.02 }}
                            className="text-4xl md:text-5xl font-display font-bold text-foreground mb-6"
                        >
                            Về <span className="text-primary">QuickMeal</span>
                        </motion.h2>

                        <motion.p
                            variants={itemVariants}
                            className="text-lg text-muted-foreground mb-6 leading-relaxed"
                        >
                            QuickMeal được thành lập với sứ mệnh mang đến những ổ bánh mì Việt Nam chính gốc,
                            tươi ngon và chất lượng cao nhất đến tận tay khách hàng. Chúng tôi tự hào về việc
                            giữ gìn hương vị truyền thống trong từng sản phẩm.
                        </motion.p>

                        <motion.p
                            variants={itemVariants}
                            className="text-lg text-muted-foreground mb-8 leading-relaxed"
                        >
                            Với đội ngũ đầu bếp giàu kinh nghiệm và quy trình sản xuất khép kín, chúng tôi
                            đảm bảo mỗi ổ bánh mì đều đạt tiêu chuẩn vàng về vệ sinh an toàn thực phẩm và
                            hương vị tuyệt vời.
                        </motion.p>

                        {/* Features Grid */}
                        <motion.div
                            variants={itemVariants}
                            className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8"
                        >
                            {features.map((feature, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={isInView ? { x: 0, opacity: 1 } : { x: -20, opacity: 0 }}
                                    transition={{ delay: 0.6 + index * 0.1 }}
                                    whileHover={{ x: 10, scale: 1.05 }}
                                    className="flex items-start space-x-3"
                                >
                                    <motion.div
                                        whileHover={{ rotate: 360, scale: 1.2 }}
                                        transition={{ duration: 0.6 }}
                                        className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center"
                                    >
                                        <feature.icon className="h-6 w-6 text-primary" />
                                    </motion.div>
                                    <div>
                                        <h3 className="font-semibold text-foreground mb-1">
                                            {feature.title}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            {feature.description}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* CTA */}
                        <motion.div
                            variants={itemVariants}
                            whileHover={{ scale: 1.05, y: -5 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Button size="lg">
                                Tìm Hiểu Thêm
                            </Button>
                        </motion.div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
};

export default AboutSection;
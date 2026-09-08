// src/pages/home/HowItWorks.tsx
import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ShoppingBag, CreditCard, Truck, CheckCircle } from 'lucide-react';
import type { Variants } from 'framer-motion';

const steps = [
    {
        icon: ShoppingBag,
        title: 'Chọn Món',
        description: 'Duyệt menu và chọn những món bánh mì yêu thích của bạn',
        color: 'bg-blue-500/10 text-blue-500'
    },
    {
        icon: CreditCard,
        title: 'Đặt Hàng',
        description: 'Điền thông tin giao hàng và chọn phương thức thanh toán',
        color: 'bg-green-500/10 text-green-500'
    },
    {
        icon: Truck,
        title: 'Giao Hàng',
        description: 'Đơn hàng được chuẩn bị và giao đến tận tay bạn',
        color: 'bg-orange-500/10 text-orange-500'
    },
    {
        icon: CheckCircle,
        title: 'Thưởng Thức',
        description: 'Tận hưởng hương vị bánh mì nóng hổi, tươi ngon',
        color: 'bg-purple-500/10 text-purple-500'
    }
];

const HowItWorks: React.FC = () => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants: Variants = {
        hidden: {
            y: 60,
            opacity: 0,
            scale: 0.8
        },
        visible: {
            y: 0,
            opacity: 1,
            scale: 1,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 15
            }
        }
    };

    const headerVariants: Variants = {
        hidden: { y: -50, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100
            }
        }
    };

    const lineVariants: Variants = {
        hidden: { scaleX: 0, opacity: 0 },
        visible: {
            scaleX: 1,
            opacity: 1,
            transition: {
                duration: 0.8,
                delay: 0.5
            }
        }
    };

    return (
        <section id='how-it-work' className="py-20 bg-muted" ref={ref}>
            <div className="container mx-auto px-4">
                {/* Section Header */}
                <motion.div
                    variants={headerVariants}
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                    className="text-center mb-16"
                >
                    <motion.h2
                        className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4"
                        whileHover={{ scale: 1.05 }}
                    >
                        Cách Thức <span className="text-primary">Hoạt Động</span>
                    </motion.h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Đặt hàng bánh mì chỉ với 4 bước đơn giản và nhanh chóng
                    </p>
                </motion.div>

                {/* Steps Grid */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
                >
                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            variants={itemVariants}
                            className="relative"
                        >
                            {/* Connector Line (hidden on mobile) */}
                            {index < steps.length - 1 && (
                                <motion.div
                                    variants={lineVariants}
                                    className="hidden lg:block absolute top-16 left-1/2 w-full h-0.5 bg-border -z-10 origin-left"
                                >
                                    <motion.div
                                        animate={{ x: [0, 10, 0] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-l-8 border-l-border"
                                    ></motion.div>
                                </motion.div>
                            )}

                            {/* Step Card */}
                            <motion.div
                                whileHover={{ y: -10, scale: 1.05 }}
                                transition={{ type: "spring", stiffness: 300 }}
                                className="relative bg-background rounded-lg p-6 text-center hover:shadow-2xl transition-all duration-300 group"
                            >
                                {/* Step Number */}
                                <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={isInView ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -180 }}
                                    transition={{
                                        delay: index * 0.2 + 0.5,
                                        type: "spring",
                                        stiffness: 200
                                    }}
                                    whileHover={{ rotate: 360, scale: 1.2 }}
                                    className="absolute -top-4 -right-4 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg shadow-md"
                                >
                                    {index + 1}
                                </motion.div>

                                {/* Icon */}
                                <motion.div
                                    whileHover={{ rotate: 360, scale: 1.2 }}
                                    transition={{ duration: 0.6 }}
                                    className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${step.color} mb-6`}
                                >
                                    <motion.div
                                        animate={{
                                            y: [0, -10, 0],
                                            rotate: [0, 5, -5, 0]
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            delay: index * 0.3
                                        }}
                                    >
                                        <step.icon className="h-10 w-10" />
                                    </motion.div>
                                </motion.div>

                                {/* Title */}
                                <h3 className="text-xl font-semibold text-foreground mb-3">
                                    {step.title}
                                </h3>

                                {/* Description */}
                                <p className="text-muted-foreground text-sm">
                                    {step.description}
                                </p>
                            </motion.div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default HowItWorks;
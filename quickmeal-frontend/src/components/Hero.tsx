
// src/pages/home/Hero.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Clock, Truck, Star } from 'lucide-react';
import heroImage from '@/assets/banh-mi-hero.jpg';
import type { Variants } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Hero: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  const badgeVariants: Variants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20
      }
    }
  };

  const statsVariants: Variants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  const navigate = useNavigate();

  const handleOrderNow = () => {
    navigate("/menu");
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Parallax */}
      <motion.div
        initial={{ scale: 1.2, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/70 to-background/50" />
      </motion.div>

      {/* Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 container mx-auto px-4 text-center md:text-left"
      >
        <div className="max-w-4xl mx-auto md:mx-0">
          {/* Badge */}
          <motion.div
            variants={badgeVariants}
            whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
            className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Star className="h-4 w-4 fill-current" />
            </motion.div>
            <span className="text-sm font-medium">#1 Bánh Mì Hà Nội</span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-foreground leading-tight mb-6"
          >
            Bánh Mì{' '}
            <motion.span
              className="text-accent inline-block"
              animate={{
                textShadow: [
                  "0 0 20px rgba(var(--primary), 0.5)",
                  "0 0 40px rgba(var(--primary), 0.3)",
                  "0 0 20px rgba(var(--primary), 0.5)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Nóng Hổi
            </motion.span>
            <br />
            Giao Tận Tay Bạn!
          </motion.h1>

          {/* Description */}
          <motion.p
            variants={itemVariants}
            className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl"
          >
            Thưởng thức bánh mì Việt Nam chính gốc với nguyên liệu tươi ngon nhất.
            Đặt hàng online và nhận trong 30 phút tại Hà Nội.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 mb-12"
          >
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button variant="default" size="lg" className="min-w-48" onClick={handleOrderNow}>
                Đặt hàng ngay
              </Button>
            </motion.div>
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8"
          >
            {[
              { icon: Clock, value: "15-30 phút", label: "Giao hàng nhanh", color: "primary" },
              { icon: Truck, value: "Miễn phí", label: "Ship đơn từ 50k", color: "secondary" },
              { icon: Star, value: "4.9/5", label: "Đánh giá từ khách", color: "accent" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                variants={statsVariants}
                whileHover={{ scale: 1.1, y: -5 }}
                className="flex items-center justify-center md:justify-start space-x-3 text-center md:text-left"
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className={`flex items-center justify-center w-12 h-12 bg-${stat.color}/10 rounded-full`}
                >
                  <stat.icon className={`h-6 w-6 text-${stat.color}`} />
                </motion.div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;
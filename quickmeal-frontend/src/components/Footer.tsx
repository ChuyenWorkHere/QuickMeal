// src/pages/home/Footer.tsx
import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Facebook,
  Instagram,
  MessageCircle,
  ShoppingBag
} from 'lucide-react';

import type { Variants } from 'framer-motion';

const Footer: React.FC = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook', color: 'hover:text-blue-500' },
    { icon: Instagram, href: '#', label: 'Instagram', color: 'hover:text-pink-500' },
    { icon: MessageCircle, href: '#', label: 'Zalo', color: 'hover:text-blue-600' }
  ];

  const quickLinks = [
    { name: 'Trang chủ', href: '#' },
    { name: 'Giới thiệu', href: '#about' },
    { name: "Cách thức hoạt động", href: "#how-it-work" },
    { name: "Menu đặc biệt", href: "#menu" },
  ];

  const policies = [
    { name: 'Chính sách giao hàng', href: '#' },
    { name: 'Chính sách đổi trả', href: '#' },
    { name: 'Chính sách bảo mật', href: '#' },
    { name: 'Điều khoản sử dụng', href: '#' }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
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
        stiffness: 100
      }
    }
  };

  return (
    <footer id="contact" className="bg-muted pt-16 pb-8 relative overflow-hidden" ref={ref}>
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12"
        >
          {/* Company Info */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2 mb-6"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <ShoppingBag className="h-8 w-8 text-primary" />
              </motion.div>
              <h3 className="text-2xl font-display font-bold text-foreground">
                Quick<span className="text-primary">Meal</span>
              </h3>
            </motion.div>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Bánh mì nóng hổi, tươi ngon, giao hàng nhanh chóng.
              Trải nghiệm hương vị Việt Nam chính gốc cùng QuickMeal.
            </p>

            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <motion.div
                  key={social.label}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                  transition={{ delay: index * 0.1 + 0.5 }}
                  whileHover={{ scale: 1.2, rotate: 360 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`transition-colors duration-200 ${social.color}`}
                    asChild
                  >
                    <a href={social.href} aria-label={social.label}>
                      <social.icon className="h-5 w-5" />
                    </a>
                  </Button>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={itemVariants}>
            <h4 className="font-semibold text-foreground mb-4">Liên Kết Nhanh</h4>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <motion.li
                  key={link.name}
                  initial={{ x: -20, opacity: 0 }}
                  animate={isInView ? { x: 0, opacity: 1 } : { x: -20, opacity: 0 }}
                  transition={{ delay: index * 0.1 + 0.6 }}
                  whileHover={{ x: 5 }}
                >
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors duration-200"
                  >
                    {link.name}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Policies */}
          <motion.div variants={itemVariants}>
            <h4 className="font-semibold text-foreground mb-4">Chính Sách</h4>
            <ul className="space-y-3">
              {policies.map((policy, index) => (
                <motion.li
                  key={policy.name}
                  initial={{ x: -20, opacity: 0 }}
                  animate={isInView ? { x: 0, opacity: 1 } : { x: -20, opacity: 0 }}
                  transition={{ delay: index * 0.1 + 0.7 }}
                  whileHover={{ x: 5 }}
                >
                  <a
                    href={policy.href}
                    className="text-muted-foreground hover:text-primary transition-colors duration-200"
                  >
                    {policy.name}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div variants={itemVariants}>
            <h4 className="font-semibold text-foreground mb-4">Liên Hệ</h4>
            <div className="space-y-4">
              {[
                { icon: MapPin, content: '123 Nguyễn Huệ, Quận Hoàn Kiếm\nHà Nội, Việt Nam', isMultiline: true },
                { icon: Phone, content: '0901 234 567', href: 'tel:0901234567' },
                { icon: Mail, content: 'info@quickmeal.vn', href: 'mailto:info@quickmeal.vn' },
                { icon: Clock, content: 'Thứ 2 - CN: 6:00 - 22:00\nGiao hàng: 7:00 - 21:30', isMultiline: true }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ y: 20, opacity: 0 }}
                  animate={isInView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
                  transition={{ delay: index * 0.1 + 0.8 }}
                  whileHover={{ x: 5 }}
                  className="flex items-start space-x-3"
                >
                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.2 }}
                    transition={{ duration: 0.6 }}
                  >
                    <item.icon className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  </motion.div>
                  <div>
                    <p className="text-muted-foreground text-sm">
                      {item.href ? (
                        <a href={item.href} className="hover:text-primary transition-colors">
                          {item.content}
                        </a>
                      ) : (
                        item.content.split('\n').map((line, i) => (
                          <React.Fragment key={i}>
                            {line}
                            {i < item.content.split('\n').length - 1 && <br />}
                          </React.Fragment>
                        ))
                      )}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
        >
          <Separator className="mb-8" />
        </motion.div>

        {/* Bottom Footer */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
          transition={{ delay: 1.2 }}
          className="flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground"
        >
          <p>
            © 2024 QuickMeal. Tất cả quyền được bảo lưu.
          </p>
          <p className="mt-2 md:mt-0">
            Thiết kế bởi <span className="text-primary font-medium">QuickMeal Team</span>
          </p>
        </motion.div>
      </div>

      {/* Background decorations */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ duration: 5, repeat: Infinity }}
        className="absolute top-0 left-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl"
      ></motion.div>
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ duration: 6, repeat: Infinity, delay: 1 }}
        className="absolute bottom-0 right-0 w-40 h-40 bg-secondary/5 rounded-full blur-3xl"
      ></motion.div>
    </footer>
  );
};

export default Footer;
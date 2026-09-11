"use client";

import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

export function FloatingWhatsApp({ phoneNumber }: { phoneNumber?: string }) {
  if (!phoneNumber) return null;

  const handleWhatsAppClick = () => {
    const text = encodeURIComponent("مرحباً، أحتاج إلى مساعدة بخصوص المتجر.");
    let phone = (phoneNumber || "").replace(/[^0-9]/g, '');
    if (phone.startsWith('0')) {
      phone = '20' + phone.substring(1);
    } else if (phone.length > 0 && !phone.startsWith('20')) {
      phone = '20' + phone;
    }
    window.open(`https://wa.me/${phone}?text=${text}`, "_blank");
  };

  return (
    <motion.button
      onClick={handleWhatsAppClick}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-lg shadow-green-500/30 transition-shadow hover:shadow-green-500/50"
      aria-label="Contact support on WhatsApp"
    >
      <MessageCircle className="h-7 w-7" />
    </motion.button>
  );
}

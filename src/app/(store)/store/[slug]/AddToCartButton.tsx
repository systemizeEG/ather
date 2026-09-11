"use client";


import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useCartStore } from "@/store/useCartStore";

export function AddToCartButton({ product }: { product: any }) {
  const [isAdded, setIsAdded] = useState(false);
  const addToCart = useCartStore((state: any) => state.addItem);

  const handleAddToCart = () => {
    addToCart(product);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <Button 
      size="lg" 
      variant={isAdded ? "outline" : "glow"} 
      className="w-full sm:w-auto min-w-[200px]"
      onClick={handleAddToCart}
    >
      <ShoppingCart className="w-5 h-5 ml-2" />
      {isAdded ? "تمت الإضافة للسلة ✔" : "أضف للسلة الآن"}
    </Button>
  );
}

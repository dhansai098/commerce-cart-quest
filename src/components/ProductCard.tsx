import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Import product images
import headphonesImg from "@/assets/headphones.jpg";
import smartwatchImg from "@/assets/smartwatch.jpg";
import laptopStandImg from "@/assets/laptop-stand.jpg";
import usbHubImg from "@/assets/usb-hub.jpg";
import keyboardImg from "@/assets/keyboard.jpg";
import mouseImg from "@/assets/mouse.jpg";
import phoneCaseImg from "@/assets/phone-case.jpg";
import powerBankImg from "@/assets/power-bank.jpg";

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  stock: number;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (productId: string) => void;
  isAdding?: boolean;
}

// Map product names to images
const productImages: Record<string, string> = {
  "Wireless Headphones": headphonesImg,
  "Smart Watch": smartwatchImg,
  "Laptop Stand": laptopStandImg,
  "USB-C Hub": usbHubImg,
  "Mechanical Keyboard": keyboardImg,
  "Wireless Mouse": mouseImg,
  "Phone Case": phoneCaseImg,
  "Portable Charger": powerBankImg,
};

export const ProductCard = ({ product, onAddToCart, isAdding }: ProductCardProps) => {
  const productImage = productImages[product.name];

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <div className="aspect-square bg-secondary/20 overflow-hidden">
        {productImage ? (
          <img 
            src={productImage} 
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingCart className="w-16 h-16 text-muted-foreground" />
          </div>
        )}
      </div>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg">{product.name}</CardTitle>
          <Badge variant={product.stock > 10 ? "secondary" : "destructive"}>
            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
          </Badge>
        </div>
        <CardDescription className="line-clamp-2">{product.description}</CardDescription>
      </CardHeader>
      <CardFooter className="flex items-center justify-between">
        <span className="text-2xl font-bold text-primary">₹{(product.price * 83).toFixed(2)}</span>
        <Button
          onClick={() => onAddToCart(product.id)}
          disabled={product.stock === 0 || isAdding}
          size="sm"
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
};

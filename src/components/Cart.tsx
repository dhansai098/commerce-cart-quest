import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";

interface CartItem {
  id: string;
  quantity: number;
  products: {
    id: string;
    name: string;
    price: number;
  };
}

interface CartProps {
  items: CartItem[];
  total: string;
  onRemoveItem: (itemId: string) => void;
  onUpdateQuantity: (itemId: string, newQuantity: number) => void;
  onCheckout: () => void;
  isUpdating?: boolean;
}

export const Cart = ({ items, total, onRemoveItem, onUpdateQuantity, onCheckout, isUpdating }: CartProps) => {
  if (items.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <ShoppingBag className="w-16 h-16 text-muted-foreground mb-4" />
          <p className="text-xl font-medium text-muted-foreground">Your cart is empty</p>
          <p className="text-sm text-muted-foreground">Add some products to get started</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5" />
          Shopping Cart ({items.length} {items.length === 1 ? 'item' : 'items'})
        </CardTitle>
        <CardDescription>Review your items before checkout</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-4 pb-4 border-b last:border-0">
            <div className="flex-1">
              <h4 className="font-medium">{item.products.name}</h4>
              <p className="text-sm text-muted-foreground">${item.products.price.toFixed(2)} each</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                disabled={item.quantity <= 1 || isUpdating}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="w-8 text-center font-medium">{item.quantity}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                disabled={isUpdating}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="text-right min-w-[80px]">
              <p className="font-semibold">${(item.products.price * item.quantity).toFixed(2)}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onRemoveItem(item.id)}
              disabled={isUpdating}
            >
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </div>
        ))}
      </CardContent>
      <Separator />
      <CardFooter className="flex flex-col gap-4 pt-6">
        <div className="flex items-center justify-between w-full">
          <span className="text-lg font-medium">Total:</span>
          <span className="text-3xl font-bold text-primary">${total}</span>
        </div>
        <Button 
          className="w-full" 
          size="lg"
          onClick={onCheckout}
          disabled={isUpdating}
        >
          Proceed to Checkout
        </Button>
      </CardFooter>
    </Card>
  );
};

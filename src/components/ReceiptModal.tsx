import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface Receipt {
  orderId: string;
  customerName: string;
  customerEmail: string;
  items: Array<{
    products: {
      name: string;
      price: number;
    };
    quantity: number;
  }>;
  total: string;
  timestamp: string;
}

interface ReceiptModalProps {
  receipt: Receipt | null;
  open: boolean;
  onClose: () => void;
}

export const ReceiptModal = ({ receipt, open, onClose }: ReceiptModalProps) => {
  if (!receipt) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-accent" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">Order Confirmed!</DialogTitle>
          <DialogDescription className="text-center">
            Thank you for your purchase, {receipt.customerName}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Order ID:</span>
              <span className="font-mono">{receipt.orderId.slice(0, 8)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Email:</span>
              <span>{receipt.customerEmail}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Date:</span>
              <span>{new Date(receipt.timestamp).toLocaleDateString()}</span>
            </div>
          </div>
          <Separator />
          <div className="space-y-3">
            <h4 className="font-semibold">Order Items:</h4>
            {receipt.items.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span>
                  {item.quantity}x {item.products.name}
                </span>
                <span>₹{(item.products.price * item.quantity * 83).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <Separator />
          <div className="flex justify-between items-center pt-2">
            <span className="text-lg font-semibold">Total:</span>
            <span className="text-2xl font-bold text-primary">₹{(parseFloat(receipt.total) * 83).toFixed(2)}</span>
          </div>
        </div>
        <Button onClick={onClose} className="w-full" size="lg">
          Continue Shopping
        </Button>
      </DialogContent>
    </Dialog>
  );
};

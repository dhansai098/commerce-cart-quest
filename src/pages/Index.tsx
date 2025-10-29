import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "@/components/ProductCard";
import { Cart } from "@/components/Cart";
import { CheckoutForm } from "@/components/CheckoutForm";
import { ReceiptModal } from "@/components/ReceiptModal";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingBag, ShoppingCart, Store } from "lucide-react";

// Generate a session ID for cart persistence
const getSessionId = () => {
  let sessionId = localStorage.getItem("cart_session_id");
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem("cart_session_id", sessionId);
  }
  return sessionId;
};

const Index = () => {
  const [sessionId] = useState(getSessionId);
  const [receipt, setReceipt] = useState<any>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const queryClient = useQueryClient();

  // Fetch products
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("products");
      if (error) throw error;
      return data.products || [];
    },
  });

  // Fetch cart
  const { data: cartData, isLoading: cartLoading } = useQuery({
    queryKey: ["cart", sessionId],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("cart", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (error) throw error;
      return data;
    },
    refetchInterval: 2000, // Auto-refresh cart
  });

  // Add to cart mutation
  const addToCart = useMutation({
    mutationFn: async (productId: string) => {
      const { data, error } = await supabase.functions.invoke("cart", {
        body: { productId, quantity: 1, sessionId },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart", sessionId] });
      toast.success("Added to cart!");
    },
    onError: () => {
      toast.error("Failed to add to cart");
    },
  });

  // Remove from cart mutation
  const removeFromCart = useMutation({
    mutationFn: async (cartItemId: string) => {
      const { error } = await supabase.functions.invoke(`cart/${cartItemId}`, {
        method: "DELETE",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart", sessionId] });
      toast.success("Item removed from cart");
    },
    onError: () => {
      toast.error("Failed to remove item");
    },
  });

  // Update cart quantity
  const updateQuantity = useMutation({
    mutationFn: async ({ itemId, newQuantity }: { itemId: string; newQuantity: number }) => {
      // Find the item in cart
      const item = cartData?.cartItems?.find((i: any) => i.id === itemId);
      if (!item) return;

      // Remove the item first
      await supabase.functions.invoke(`cart/${itemId}`, {
        method: "DELETE",
      });

      // Add it back with new quantity
      const { data, error } = await supabase.functions.invoke("cart", {
        body: { productId: item.products.id, quantity: newQuantity, sessionId },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart", sessionId] });
    },
    onError: () => {
      toast.error("Failed to update quantity");
    },
  });

  // Checkout mutation
  const checkout = useMutation({
    mutationFn: async (customerData: { name: string; email: string }) => {
      const { data, error } = await supabase.functions.invoke("checkout", {
        body: {
          cartItems: cartData.cartItems,
          customerName: customerData.name,
          customerEmail: customerData.email,
          sessionId,
        },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setReceipt(data.receipt);
      setShowReceipt(true);
      queryClient.invalidateQueries({ queryKey: ["cart", sessionId] });
      toast.success("Order placed successfully!");
    },
    onError: () => {
      toast.error("Failed to process checkout");
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Store className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Vibe Commerce</h1>
                <p className="text-sm text-muted-foreground">Your Modern Shopping Experience</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-lg">
              <ShoppingCart className="w-5 h-5 text-primary" />
              <span className="font-semibold text-foreground">
                {cartData?.cartItems?.length || 0} items
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="products" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="products" className="gap-2">
              <ShoppingBag className="w-4 h-4" />
              Products
            </TabsTrigger>
            <TabsTrigger value="cart" className="gap-2">
              <ShoppingCart className="w-4 h-4" />
              Cart ({cartData?.cartItems?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Featured Products</h2>
              <p className="text-muted-foreground">Discover our curated collection</p>
            </div>
            {productsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-96 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product: any) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={(id) => addToCart.mutate(id)}
                    isAdding={addToCart.isPending}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="cart" className="space-y-8">
            <div className="max-w-4xl mx-auto space-y-8">
              {cartLoading ? (
                <div className="h-96 bg-muted animate-pulse rounded-lg" />
              ) : (
                <>
                  <Cart
                    items={cartData?.cartItems || []}
                    total={cartData?.total || "0.00"}
                    onRemoveItem={(id) => removeFromCart.mutate(id)}
                    onUpdateQuantity={(id, qty) => updateQuantity.mutate({ itemId: id, newQuantity: qty })}
                    onCheckout={() => {
                      const checkoutTab = document.querySelector('[value="checkout"]') as HTMLElement;
                      checkoutTab?.click();
                    }}
                    isUpdating={removeFromCart.isPending || updateQuantity.isPending}
                  />
                  {cartData?.cartItems?.length > 0 && (
                    <CheckoutForm
                      total={cartData?.total || "0.00"}
                      onSubmit={(data) => checkout.mutate(data)}
                      isProcessing={checkout.isPending}
                    />
                  )}
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Receipt Modal */}
      <ReceiptModal
        receipt={receipt}
        open={showReceipt}
        onClose={() => setShowReceipt(false)}
      />
    </div>
  );
};

export default Index;

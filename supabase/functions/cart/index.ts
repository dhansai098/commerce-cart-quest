import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const cartId = url.pathname.split('/').pop();

    // GET /api/cart - Get cart items with total
    if (req.method === 'GET') {
      const sessionId = url.searchParams.get('session_id') || 'default';
      console.log(`Fetching cart for session: ${sessionId}`);

      const { data: cartItems, error } = await supabase
        .from('cart')
        .select('*, products(*)')
        .eq('session_id', sessionId);

      if (error) {
        console.error('Error fetching cart:', error);
        throw error;
      }

      const total = cartItems?.reduce((sum, item) => {
        return sum + (Number(item.products.price) * item.quantity);
      }, 0) || 0;

      console.log(`Cart fetched: ${cartItems?.length || 0} items, total: $${total.toFixed(2)}`);

      return new Response(
        JSON.stringify({ cartItems, total: total.toFixed(2) }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // POST /api/cart - Add item to cart
    if (req.method === 'POST') {
      const { productId, quantity, sessionId } = await req.json();
      console.log(`Adding to cart: product ${productId}, qty ${quantity}, session ${sessionId}`);

      // Check if item already exists in cart
      const { data: existing, error: fetchError } = await supabase
        .from('cart')
        .select('*')
        .eq('product_id', productId)
        .eq('session_id', sessionId)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error checking existing cart item:', fetchError);
        throw fetchError;
      }

      if (existing) {
        // Update quantity
        const { data, error } = await supabase
          .from('cart')
          .update({ quantity: existing.quantity + quantity })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) {
          console.error('Error updating cart item:', error);
          throw error;
        }

        console.log('Cart item updated successfully');
        return new Response(
          JSON.stringify({ message: 'Item updated in cart', cartItem: data }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        );
      } else {
        // Insert new item
        const { data, error } = await supabase
          .from('cart')
          .insert([
            {
              product_id: productId,
              quantity,
              session_id: sessionId,
            },
          ])
          .select()
          .single();

        if (error) {
          console.error('Error adding cart item:', error);
          throw error;
        }

        console.log('Cart item added successfully');
        return new Response(
          JSON.stringify({ message: 'Item added to cart', cartItem: data }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 201,
          }
        );
      }
    }

    // DELETE /api/cart/:id - Remove item from cart
    if (req.method === 'DELETE' && cartId) {
      console.log(`Removing cart item: ${cartId}`);

      const { error } = await supabase
        .from('cart')
        .delete()
        .eq('id', cartId);

      if (error) {
        console.error('Error removing cart item:', error);
        throw error;
      }

      console.log('Cart item removed successfully');
      return new Response(
        JSON.stringify({ message: 'Item removed from cart' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 405,
      }
    );
  } catch (error) {
    console.error('Error in cart function:', error);
    const message = error instanceof Error ? error.message : 'An error occurred';
    return new Response(
      JSON.stringify({ error: message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

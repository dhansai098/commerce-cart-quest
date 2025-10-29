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

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 405,
      }
    );
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { cartItems, customerName, customerEmail, sessionId } = await req.json();
    console.log(`Processing checkout for ${customerEmail}`);

    // Calculate total
    const total = cartItems.reduce((sum: number, item: any) => {
      return sum + (Number(item.products.price) * item.quantity);
    }, 0);

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          customer_name: customerName,
          customer_email: customerEmail,
          total: total.toFixed(2),
          items: cartItems,
        },
      ])
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      throw orderError;
    }

    // Clear cart
    const { error: clearError } = await supabase
      .from('cart')
      .delete()
      .eq('session_id', sessionId);

    if (clearError) {
      console.error('Error clearing cart:', clearError);
      // Don't throw - order was created successfully
    }

    console.log(`Order created successfully: ${order.id}, Total: $${total.toFixed(2)}`);

    // Return receipt
    return new Response(
      JSON.stringify({
        message: 'Order placed successfully',
        receipt: {
          orderId: order.id,
          customerName,
          customerEmail,
          items: cartItems,
          total: total.toFixed(2),
          timestamp: order.created_at,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in checkout function:', error);
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

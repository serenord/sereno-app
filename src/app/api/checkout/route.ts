import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
  apiVersion: '2026-04-22.dahlia',
});

export async function POST(request: Request) {
  try {
    const { items } = await request.json();
    
    // In a real app, you would create a checkout session
    // const session = await stripe.checkout.sessions.create({ ... });
    
    // Mocking response for demo
    return NextResponse.json({ 
      success: true, 
      url: 'https://checkout.stripe.com/pay/mock_session',
      message: 'Redirigiendo a Stripe (Modo Demo)'
    });
    
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: 'Error al procesar el pago' 
    }, { status: 500 });
  }
}

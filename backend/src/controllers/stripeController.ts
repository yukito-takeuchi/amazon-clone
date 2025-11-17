import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { stripe, FRONTEND_URL, STRIPE_WEBHOOK_SECRET } from '../config/stripe';
import { CartModel } from '../models/Cart';
import { ProductModel } from '../models/Product';
import { OrderModel } from '../models/Order';
import Stripe from 'stripe';

/**
 * Create Stripe Checkout Session
 */
export const createCheckoutSession = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { addressId } = req.body;

    if (!addressId) {
      res.status(400).json({ error: 'Address ID is required' });
      return;
    }

    // Get cart with items
    const cart = await CartModel.getCartWithItems(req.user.id);

    if (!cart || cart.items.length === 0) {
      res.status(400).json({ error: 'Cart is empty' });
      return;
    }

    // Validate stock and prepare line items
    const lineItems = [];

    for (const item of cart.items) {
      const product = await ProductModel.findById(item.product_id);

      if (!product) {
        res.status(400).json({ error: `Product not found: ${item.product_name}` });
        return;
      }

      if (!product.is_active) {
        res.status(400).json({ error: `Product is not available: ${product.name}` });
        return;
      }

      if (product.stock < item.quantity) {
        res.status(400).json({
          error: `Insufficient stock for ${product.name}. Available: ${product.stock}`,
        });
        return;
      }

      // Stripe requires amount in cents (smallest currency unit)
      const priceInCents = Math.round(product.price * 100);

      lineItems.push({
        price_data: {
          currency: 'jpy',
          product_data: {
            name: product.name,
            description: product.description,
            images: product.image_url ? [product.image_url] : [],
          },
          unit_amount: priceInCents,
        },
        quantity: item.quantity,
      });
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${FRONTEND_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${FRONTEND_URL}/checkout/cancel`,
      metadata: {
        userId: req.user.id,
        addressId: addressId.toString(),
      },
    });

    res.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error: any) {
    console.error('Create checkout session error:', {
      message: error.message,
      type: error.type,
      statusCode: error.statusCode,
      requestId: error.requestId,
      param: error.param,
      raw: error.raw,
    });
    res.status(500).json({
      error: error.message || 'Failed to create checkout session',
      requestId: error.requestId,
    });
  }
};

/**
 * Handle Stripe Webhook
 */
export const handleWebhook = async (req: Request, res: Response): Promise<void> => {
  const sig = req.headers['stripe-signature'];

  if (!sig) {
    res.status(400).json({ error: 'Missing stripe-signature header' });
    return;
  }

  let event: Stripe.Event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    res.status(400).json({ error: `Webhook Error: ${err.message}` });
    return;
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionCompleted(session);
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('PaymentIntent succeeded:', paymentIntent.id);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('PaymentIntent failed:', paymentIntent.id);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
};

/**
 * Handle successful checkout session
 */
async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
): Promise<void> {
  console.log('Checkout session completed:', session.id);

  const userId = session.metadata?.userId;
  const addressId = session.metadata?.addressId;

  if (!userId || !addressId) {
    console.error('Missing metadata in session:', session.id);
    return;
  }

  // Get cart with items
  const cart = await CartModel.getCartWithItems(userId);

  if (!cart || cart.items.length === 0) {
    console.error('Cart is empty for user:', userId);
    return;
  }

  // Calculate total and prepare order items
  let totalAmount = 0;
  const orderItems = [];

  for (const item of cart.items) {
    const product = await ProductModel.findById(item.product_id);

    if (!product) {
      console.error('Product not found:', item.product_id);
      continue;
    }

    const itemTotal = product.price * item.quantity;
    totalAmount += itemTotal;

    orderItems.push({
      productId: product.id,
      quantity: item.quantity,
      price: product.price,
    });
  }

  // Create order
  const order = await OrderModel.create({
    userId,
    addressId: parseInt(addressId),
    items: orderItems,
    totalAmount,
    paymentMethod: 'stripe',
  });

  // Update order with Stripe information
  await OrderModel.updateStripeInfo(order.id, {
    stripeSessionId: session.id,
    stripePaymentIntentId: session.payment_intent as string,
  });

  // Update order status to confirmed
  await OrderModel.updateStatus(order.id, 'confirmed');

  // Clear cart
  await CartModel.clearCart(userId);

  console.log('Order created successfully:', order.id);
}

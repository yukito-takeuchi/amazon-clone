import { SendEmailCommand } from '@aws-sdk/client-ses';
import { sesClient } from '../config/ses';
import { OrderWithItems } from '../models/Order';
import { generateOrderConfirmationEmail } from '../templates/orderConfirmation';

const FROM_EMAIL = process.env.SES_FROM_EMAIL || 'noreply@example.com';
const IS_ENABLED = process.env.EMAIL_ENABLED === 'true';

export class EmailService {
  /**
   * Send order confirmation email
   */
  static async sendOrderConfirmation(
    order: OrderWithItems,
    userEmail: string,
    userName: string
  ): Promise<void> {
    if (!IS_ENABLED) {
      console.log('📧 Email disabled - skipping order confirmation email');
      return;
    }

    try {
      const { subject, html, text } = generateOrderConfirmationEmail(order, userName);

      const command = new SendEmailCommand({
        Source: FROM_EMAIL,
        Destination: {
          ToAddresses: [userEmail],
        },
        Message: {
          Subject: {
            Data: subject,
            Charset: 'UTF-8',
          },
          Body: {
            Html: {
              Data: html,
              Charset: 'UTF-8',
            },
            Text: {
              Data: text,
              Charset: 'UTF-8',
            },
          },
        },
      });

      await sesClient.send(command);

      console.log(`✅ Order confirmation email sent to ${userEmail} for order #${order.id}`);
    } catch (error) {
      console.error('❌ Failed to send order confirmation email:', error);
      // Don't throw error - email failure shouldn't break the order flow
    }
  }

  /**
   * Send shipping notification email (Phase 2)
   */
  static async sendShippingNotification(
    order: OrderWithItems,
    userEmail: string,
    trackingNumber: string
  ): Promise<void> {
    if (!IS_ENABLED) {
      console.log('📧 Email disabled - skipping shipping notification email');
      return;
    }

    // TODO: Implement in Phase 2
    console.log(`📧 Shipping notification for order #${order.id} (not implemented yet)`);
  }

  /**
   * Send delivery confirmation email (Phase 2)
   */
  static async sendDeliveryConfirmation(
    order: OrderWithItems,
    userEmail: string
  ): Promise<void> {
    if (!IS_ENABLED) {
      console.log('📧 Email disabled - skipping delivery confirmation email');
      return;
    }

    // TODO: Implement in Phase 2
    console.log(`📧 Delivery confirmation for order #${order.id} (not implemented yet)`);
  }
}

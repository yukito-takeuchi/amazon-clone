import { OrderWithItems } from '../models/Order';

export const generateOrderConfirmationEmail = (
  order: OrderWithItems,
  userName: string
): { subject: string; html: string; text: string } => {
  const orderDate = new Date(order.created_at).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Generate items HTML
  const itemsHtml = order.items
    .map(
      (item) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
            ${item.product_name || '商品名不明'}
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">
            ${item.quantity}
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
            ¥${item.price.toLocaleString()}
          </td>
        </tr>
      `
    )
    .join('');

  // Generate items text
  const itemsText = order.items
    .map(
      (item) =>
        `・${item.product_name || '商品名不明'} × ${item.quantity}個    ¥${item.price.toLocaleString()}`
    )
    .join('\n');

  const subject = `[Amazon Clone] ご注文ありがとうございます（注文番号: #${order.id}）`;

  const html = `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ご注文確認</title>
</head>
<body style="font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #232F3E 0%, #131921 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: #FF9900; margin: 0; font-size: 28px;">amazon<span style="color: white;">.clone</span></h1>
  </div>

  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <h2 style="color: #232F3E; margin-top: 0;">ご注文ありがとうございます</h2>
    <p style="color: #666; font-size: 16px;">
      ${userName} 様
    </p>
    <p style="color: #666; font-size: 14px;">
      ご注文を承りました。以下の内容でご注文を確定いたしました。
    </p>

    <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="color: #232F3E; margin-top: 0; font-size: 18px;">📦 ご注文内容</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr style="background: #e5e7eb;">
          <td style="padding: 12px; font-weight: bold;">注文番号</td>
          <td style="padding: 12px;">#${order.id}</td>
        </tr>
        <tr>
          <td style="padding: 12px; font-weight: bold; border-bottom: 1px solid #e5e7eb;">注文日時</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${orderDate}</td>
        </tr>
      </table>
    </div>

    <div style="margin: 20px 0;">
      <h3 style="color: #232F3E; font-size: 18px;">🛍️ 商品</h3>
      <table style="width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb;">
        <thead>
          <tr style="background: #f9fafb;">
            <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb;">商品名</th>
            <th style="padding: 12px; text-align: center; border-bottom: 2px solid #e5e7eb;">数量</th>
            <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb;">金額</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
        <tfoot>
          <tr style="background: #f9fafb; font-weight: bold;">
            <td colspan="2" style="padding: 16px; text-align: right; border-top: 2px solid #e5e7eb;">合計金額</td>
            <td style="padding: 16px; text-align: right; color: #B12704; font-size: 20px; border-top: 2px solid #e5e7eb;">¥${order.total_amount.toLocaleString()}</td>
          </tr>
        </tfoot>
      </table>
    </div>

    ${
      order.address_full_name
        ? `
    <div style="margin: 20px 0;">
      <h3 style="color: #232F3E; font-size: 18px;">📍 配送先</h3>
      <div style="background: #f9fafb; padding: 16px; border-radius: 8px; border: 1px solid #e5e7eb;">
        <p style="margin: 0; line-height: 1.8;">
          <strong>${order.address_full_name} 様</strong><br>
          〒${order.address_postal_code}<br>
          ${order.address_prefecture}${order.address_city}${order.address_address_line}${
            order.address_building ? '<br>' + order.address_building : ''
          }<br>
          TEL: ${order.address_phone_number}
        </p>
      </div>
    </div>
    `
        : ''
    }

    <div style="background: #FFF8DC; border-left: 4px solid #FF9900; padding: 16px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0; font-size: 14px; color: #666;">
        ✨ 商品の発送準備が整い次第、発送通知メールをお送りいたします。
      </p>
    </div>

    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
      <p style="color: #666; font-size: 12px; margin: 5px 0;">
        このメールは自動送信されています。<br>
        ご返信いただいてもお答えできませんので、ご了承ください。
      </p>
      <p style="color: #666; font-size: 12px; margin: 5px 0;">
        © 2025 Amazon Clone. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ご注文ありがとうございます
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${userName} 様

ご注文を承りました。以下の内容でご注文を確定いたしました。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 ご注文内容
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
注文番号: #${order.id}
注文日時: ${orderDate}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🛍️ 商品
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${itemsText}

合計金額: ¥${order.total_amount.toLocaleString()}

${
  order.address_full_name
    ? `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 配送先
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${order.address_full_name} 様
〒${order.address_postal_code}
${order.address_prefecture}${order.address_city}${order.address_address_line}
${order.address_building ? order.address_building + '\n' : ''}TEL: ${order.address_phone_number}

`
    : ''
}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ 商品の発送準備が整い次第、発送通知メールをお送りいたします。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
このメールは自動送信されています。
ご返信いただいてもお答えできませんので、ご了承ください。

© 2025 Amazon Clone. All rights reserved.
  `;

  return { subject, html, text: text.trim() };
};

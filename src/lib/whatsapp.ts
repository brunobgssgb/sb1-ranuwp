import { Sale, Customer, App } from '../types';
import { formatCurrency, formatDateTime } from './format';
import { getWhatsAppConfig } from '../services/whatsapp.service';

async function sendWhatsAppMessage(phone: string, message: string, userId: string): Promise<boolean> {
  try {
    const config = await getWhatsAppConfig(userId);
    
    if (!config.whatsappSecret || !config.whatsappAccount) {
      console.log('WhatsApp config missing');
      return false;
    }

    const data = {
      secret: config.whatsappSecret,
      account: config.whatsappAccount,
      priority: 1,
      recipient: phone.replace(/\D/g, ''),
      type: 'text',
      message
    };

    const response = await fetch('https://envia.recargasmax.com.br/api/send/whatsapp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(data)
    });

    // Always try to parse response, even if not ok
    let result;
    try {
      result = await response.json();
    } catch (e) {
      console.log('Failed to parse WhatsApp response:', e);
      return false;
    }

    // Log response for debugging
    console.log('WhatsApp API Response:', {
      status: response.status,
      ok: response.ok,
      result
    });

    // Consider the message sent if either response is ok or result indicates success
    return response.ok || (result && result.success);
  } catch (error) {
    console.log('WhatsApp Send Error:', error);
    return false;
  }
}

export async function sendOrderConfirmationMessage(
  sale: Sale,
  customer: Customer,
  apps: App[]
): Promise<boolean> {
  if (!sale.userId) {
    console.log('User ID missing in sale');
    return false;
  }

  const items = sale.items.map(item => {
    const app = apps.find(a => a.id === item.appId);
    return `${app?.name || 'Aplicativo'} x${item.quantity} - ${formatCurrency(item.price * item.quantity)}`;
  }).join('\n');

  const message = `Olá ${customer.name}! 🎉

Seu pedido foi confirmado com sucesso!

*Detalhes do Pedido:*
Data: ${formatDateTime(sale.date)}
${items}

*Total: ${formatCurrency(sale.totalPrice)}*

Os códigos serão enviados em breve.

Agradecemos a preferência! 🙏`;

  return sendWhatsAppMessage(customer.phone, message, sale.userId);
}

export async function sendOrderCodesMessage(
  sale: Sale,
  customer: Customer,
  apps: App[]
): Promise<boolean> {
  if (!sale.userId) {
    console.log('User ID missing in sale');
    return false;
  }

  const itemsWithCodes = sale.items.map(item => {
    const app = apps.find(a => a.id === item.appId);
    const codes = item.codes?.length 
      ? `\nCódigos:\n${item.codes.join('\n')}`
      : '';
    
    return `${app?.name || 'Aplicativo'} x${item.quantity}${codes}`;
  }).join('\n\n');

  const message = `Olá ${customer.name}! 🎉

Aqui estão os códigos do seu pedido:

${itemsWithCodes}

Aproveite! 🎮

Em caso de dúvidas, estamos à disposição.
Obrigado pela preferência! 🙏`;

  return sendWhatsAppMessage(customer.phone, message, sale.userId);
}

export async function resendOrderCodes(
  sale: Sale,
  customer: Customer,
  apps: App[]
): Promise<boolean> {
  if (!sale.items?.some(item => item.codes?.length > 0)) {
    throw new Error('Esta venda não possui códigos para reenviar');
  }

  if (!sale.userId) {
    console.log('User ID missing in sale');
    return false;
  }

  return sendOrderCodesMessage(sale, customer, apps);
}
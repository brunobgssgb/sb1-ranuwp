import { supabase } from '../lib/supabase';
import { logger } from '../lib/logger';

interface MercadoPagoConfig {
  accessToken: string | null;
}

export async function getMercadoPagoConfig(userId: string): Promise<MercadoPagoConfig> {
  const { data, error } = await supabase
    .from('users')
    .select('mercadopago_token')
    .eq('id', userId)
    .single();

  if (error) {
    logger.error('Failed to get Mercado Pago config', { userId, error });
    throw new Error('Falha ao obter configurações do Mercado Pago');
  }

  return {
    accessToken: data?.mercadopago_token || null
  };
}

export async function updateMercadoPagoConfig(
  userId: string, 
  token: string
): Promise<void> {
  const { error } = await supabase
    .from('users')
    .update({
      mercadopago_token: token
    })
    .eq('id', userId);

  if (error) {
    logger.error('Failed to update Mercado Pago config', { userId, error });
    throw new Error('Falha ao atualizar configurações do Mercado Pago');
  }
}

export async function createPixPayment(
  userId: string,
  amount: number,
  description: string,
  customer: {
    name: string;
    email: string;
  }
): Promise<{
  pixCode: string;
  paymentId: string;
}> {
  try {
    const { accessToken } = await getMercadoPagoConfig(userId);

    if (!accessToken) {
      throw new Error('Token do Mercado Pago não configurado');
    }

    logger.info('Creating PIX payment', { 
      userId, 
      amount, 
      description,
      customerEmail: customer.email 
    });

    const response = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': crypto.randomUUID()
      },
      body: JSON.stringify({
        transaction_amount: amount,
        description: description,
        payment_method_id: 'pix',
        payer: {
          email: customer.email,
          first_name: customer.name,
          last_name: ''
        }
      })
    });

    const responseData = await response.json();

    if (!response.ok) {
      logger.error('Mercado Pago payment error', {
        userId,
        statusCode: response.status,
        error: responseData,
        request: {
          amount,
          description,
          customerEmail: customer.email
        }
      });
      throw new Error(responseData.message || 'Erro ao gerar pagamento PIX');
    }

    const pixCode = responseData.point_of_interaction.transaction_data.qr_code_base64;
    const paymentId = responseData.id.toString();

    logger.info('PIX payment created successfully', {
      userId,
      paymentId,
      status: responseData.status
    });
    
    return {
      pixCode,
      paymentId
    };
  } catch (error) {
    logger.error('Failed to create PIX payment', {
      userId,
      error: error instanceof Error ? error.message : 'Unknown error',
      context: {
        amount,
        description,
        customerEmail: customer.email
      }
    });
    throw error;
  }
}

export async function handleWebhook(
  userId: string,
  data: any
): Promise<void> {
  try {
    logger.info('Received Mercado Pago webhook', { userId, data });

    const paymentId = data.data.id;
    const status = data.action === 'payment.updated' ? data.data.status : null;

    if (!paymentId || !status) {
      logger.warn('Invalid webhook data', { userId, data });
      return;
    }

    const { error } = await supabase
      .from('sales')
      .update({ 
        payment_status: status,
        status: status === 'approved' ? 'confirmed' : 'pending'
      })
      .eq('payment_id', paymentId)
      .eq('user_id', userId);

    if (error) {
      logger.error('Failed to update payment status', { userId, paymentId, status, error });
      throw error;
    }

    logger.info('Payment status updated', { userId, paymentId, status });
  } catch (error) {
    logger.error('Error processing webhook', {
      userId,
      error: error instanceof Error ? error.message : 'Unknown error',
      data
    });
    throw error;
  }
}
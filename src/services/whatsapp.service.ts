import { supabase } from '../lib/supabase';

export async function getWhatsAppConfig(userId: string): Promise<{
  whatsappSecret: string | null;
  whatsappAccount: string | null;
}> {
  const { data, error } = await supabase
    .from('users')
    .select('whatsapp_secret, whatsapp_account')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Failed to get WhatsApp config:', error);
    throw new Error('Falha ao obter configurações do WhatsApp');
  }

  return {
    whatsappSecret: data?.whatsapp_secret || null,
    whatsappAccount: data?.whatsapp_account || null
  };
}

export async function updateWhatsAppConfig(
  userId: string, 
  secret: string, 
  account: string
): Promise<void> {
  const { error } = await supabase
    .from('users')
    .update({
      whatsapp_secret: secret,
      whatsapp_account: account
    })
    .eq('id', userId);

  if (error) {
    console.error('Failed to update WhatsApp config:', error);
    throw new Error('Falha ao atualizar configurações do WhatsApp');
  }
}
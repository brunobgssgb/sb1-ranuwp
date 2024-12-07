import { supabase } from '../lib/supabase';
import { Sale, SaleItem } from '../types';
import { useAuthStore } from '../store/authStore';
import { sendOrderConfirmationMessage, sendOrderCodesMessage } from '../lib/whatsapp';

export async function createSale(sale: Omit<Sale, 'id'>): Promise<Sale> {
  const currentUser = useAuthStore.getState().currentUser;
  if (!currentUser) {
    throw new Error('Usuário não autenticado');
  }

  const { data: saleData, error: saleError } = await supabase
    .from('sales')
    .insert({
      customer_id: sale.customerId,
      total_price: sale.totalPrice,
      status: sale.status || 'pending',
      user_id: currentUser.id
    })
    .select()
    .single();

  if (saleError) {
    console.error('Failed to create sale:', saleError);
    throw new Error('Falha ao criar venda');
  }

  const saleItems = [];
  for (const item of sale.items) {
    const { data: saleItem, error: saleItemError } = await supabase
      .from('sale_items')
      .insert({
        sale_id: saleData.id,
        app_id: item.appId,
        quantity: item.quantity,
        price: item.price
      })
      .select()
      .single();

    if (saleItemError) {
      console.error('Failed to create sale item:', saleItemError);
      throw new Error('Falha ao criar item da venda');
    }
    
    saleItems.push({
      ...item,
      codes: []
    });
  }

  const newSale = {
    id: saleData.id,
    userId: currentUser.id,
    customerId: saleData.customer_id,
    totalPrice: saleData.total_price,
    date: saleData.date,
    status: saleData.status,
    items: saleItems
  };

  try {
    const { data: customer } = await supabase
      .from('customers')
      .select('*')
      .eq('id', newSale.customerId)
      .single();

    const { data: apps } = await supabase
      .from('apps')
      .select('*');

    if (customer && apps) {
      await sendOrderConfirmationMessage(newSale, customer, apps);
    }
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
  }

  return newSale;
}

export async function confirmSale(saleId: string): Promise<Sale> {
  const currentUser = useAuthStore.getState().currentUser;
  if (!currentUser) {
    throw new Error('Usuário não autenticado');
  }

  const { data: sale, error: saleError } = await supabase
    .from('sales')
    .select(`
      *,
      sale_items (*)
    `)
    .eq('id', saleId)
    .eq('user_id', currentUser.id)
    .single();

  if (saleError) throw saleError;
  if (sale.status === 'confirmed') {
    throw new Error('Venda já confirmada');
  }

  for (const item of sale.sale_items) {
    const { data: codes, error: codesError } = await supabase
      .from('codes')
      .select('id, code')
      .eq('app_id', item.app_id)
      .eq('used', false)
      .limit(item.quantity);

    if (codesError) throw codesError;
    if (!codes || codes.length < item.quantity) {
      throw new Error(`Códigos insuficientes para o app ${item.app_id}`);
    }

    const { error: updateCodesError } = await supabase
      .from('codes')
      .update({ used: true })
      .in('id', codes.map(c => c.id));

    if (updateCodesError) throw updateCodesError;

    const { error: saleCodesError } = await supabase
      .from('sale_codes')
      .insert(
        codes.map(code => ({
          sale_item_id: item.id,
          code_id: code.id
        }))
      );

    if (saleCodesError) throw saleCodesError;
  }

  const { data: updatedSale, error: updateError } = await supabase
    .from('sales')
    .update({ status: 'confirmed' })
    .eq('id', saleId)
    .eq('user_id', currentUser.id)
    .select(`
      *,
      sale_items (
        *,
        sale_codes (
          codes (*)
        )
      )
    `)
    .single();

  if (updateError) throw updateError;

  const formattedSale = {
    id: updatedSale.id,
    userId: currentUser.id,
    customerId: updatedSale.customer_id,
    totalPrice: updatedSale.total_price,
    date: updatedSale.date,
    status: updatedSale.status,
    items: updatedSale.sale_items.map((item: any) => ({
      appId: item.app_id,
      quantity: item.quantity,
      price: item.price,
      codes: item.sale_codes?.map((sc: any) => sc.codes.code) || []
    }))
  };

  try {
    const { data: customer } = await supabase
      .from('customers')
      .select('*')
      .eq('id', formattedSale.customerId)
      .single();

    const { data: apps } = await supabase
      .from('apps')
      .select('*');

    if (customer && apps) {
      await sendOrderCodesMessage(formattedSale, customer, apps);
    }
  } catch (error) {
    console.error('Error sending WhatsApp messages:', error);
  }

  return formattedSale;
}

export async function updateSale(id: string, updates: Partial<Sale>): Promise<Sale> {
  const currentUser = useAuthStore.getState().currentUser;
  if (!currentUser) {
    throw new Error('Usuário não autenticado');
  }

  const { data, error } = await supabase
    .from('sales')
    .update({
      customer_id: updates.customerId,
      total_price: updates.totalPrice,
      status: updates.status
    })
    .eq('id', id)
    .eq('user_id', currentUser.id)
    .select(`
      *,
      sale_items (
        *,
        sale_codes (
          codes (*)
        )
      )
    `)
    .single();

  if (error) throw error;

  return {
    id: data.id,
    userId: currentUser.id,
    customerId: data.customer_id,
    totalPrice: data.total_price,
    date: data.date,
    status: data.status,
    items: data.sale_items.map((item: any) => ({
      appId: item.app_id,
      quantity: item.quantity,
      price: item.price,
      codes: item.sale_codes?.map((sc: any) => sc.codes.code) || []
    }))
  };
}

export async function deleteSale(id: string): Promise<void> {
  const currentUser = useAuthStore.getState().currentUser;
  if (!currentUser) {
    throw new Error('Usuário não autenticado');
  }

  const { error } = await supabase
    .from('sales')
    .delete()
    .eq('id', id)
    .eq('user_id', currentUser.id);

  if (error) throw error;
}

export async function getSales(): Promise<Sale[]> {
  const currentUser = useAuthStore.getState().currentUser;
  if (!currentUser) {
    throw new Error('Usuário não autenticado');
  }

  const { data: salesData, error: salesError } = await supabase
    .from('sales')
    .select(`
      *,
      sale_items (
        *,
        sale_codes (
          codes (*)
        )
      )
    `)
    .eq('user_id', currentUser.id)
    .order('date', { ascending: false });

  if (salesError) throw salesError;

  return (salesData || []).map(sale => ({
    id: sale.id,
    userId: currentUser.id,
    customerId: sale.customer_id,
    totalPrice: sale.total_price,
    date: sale.date,
    status: sale.status || 'pending',
    items: (sale.sale_items || []).map((item: any) => ({
      appId: item.app_id,
      quantity: item.quantity,
      price: item.price,
      codes: item.sale_codes?.map((sc: any) => sc.codes.code) || []
    }))
  }));
}
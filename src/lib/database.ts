import { supabase } from './supabase';
import { Customer, App, Code, Sale, SaleItem } from '../types';
import { sendOrderConfirmationMessage, sendOrderCodesMessage } from './whatsapp';

export async function initializeDatabase() {
  try {
    await Promise.all([
      supabase.from('customers').select('id').limit(1),
      supabase.from('apps').select('id').limit(1),
      supabase.from('codes').select('id').limit(1),
      supabase.from('sales').select('id').limit(1),
      supabase.from('sale_items').select('id').limit(1),
      supabase.from('sale_codes').select('id').limit(1)
    ]);
    return true;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

export async function getCustomers(): Promise<Customer[]> {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('name');
  
  if (error) throw error;
  return data || [];
}

export async function getApps(): Promise<App[]> {
  const { data: appsData, error: appsError } = await supabase
    .from('apps')
    .select('*')
    .order('name');
  
  if (appsError) throw appsError;

  const apps = [];
  
  for (const app of appsData || []) {
    const { count, error: countError } = await supabase
      .from('codes')
      .select('*', { count: 'exact', head: true })
      .eq('app_id', app.id)
      .eq('used', false);
      
    if (countError) throw countError;
    
    apps.push({
      ...app,
      codesAvailable: count || 0
    });
  }

  return apps;
}

export async function getCodes(): Promise<Code[]> {
  const { data, error } = await supabase
    .from('codes')
    .select('*')
    .order('created_at');
  
  if (error) throw error;
  return (data || []).map(code => ({
    id: code.id,
    appId: code.app_id,
    code: code.code,
    used: code.used
  }));
}

export async function getSales(): Promise<Sale[]> {
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
    .order('date', { ascending: false });

  if (salesError) throw salesError;

  return (salesData || []).map(sale => ({
    id: sale.id,
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

export async function addSale(sale: Omit<Sale, 'id'>): Promise<Sale> {
  const { data: saleData, error: saleError } = await supabase
    .from('sales')
    .insert({
      customer_id: sale.customerId,
      total_price: sale.totalPrice,
      status: sale.status || 'pending'
    })
    .select()
    .single();

  if (saleError) throw saleError;

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

    if (saleItemError) throw saleItemError;
    saleItems.push({
      ...item,
      codes: []
    });
  }

  const newSale = {
    id: saleData.id,
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
  const { data: sale, error: saleError } = await supabase
    .from('sales')
    .select(`
      *,
      sale_items (*)
    `)
    .eq('id', saleId)
    .single();

  if (saleError) throw saleError;
  if (sale.status === 'confirmed') {
    throw new Error('Sale is already confirmed');
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
      throw new Error(`Insufficient codes available for app ${item.app_id}`);
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
  const { data, error } = await supabase
    .from('sales')
    .update({
      customer_id: updates.customerId,
      total_price: updates.totalPrice,
      status: updates.status
    })
    .eq('id', id)
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
  const { error } = await supabase
    .from('sales')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

export async function addCustomer(customer: Omit<Customer, 'id'>): Promise<Customer> {
  const { data, error } = await supabase
    .from('customers')
    .insert(customer)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateCustomer(id: string, customer: Partial<Customer>): Promise<Customer> {
  const { data, error } = await supabase
    .from('customers')
    .update(customer)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteCustomer(id: string): Promise<void> {
  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

export async function addApp(app: Omit<App, 'id' | 'codesAvailable'>): Promise<App> {
  const { data, error } = await supabase
    .from('apps')
    .insert(app)
    .select()
    .single();
  
  if (error) throw error;
  return {
    ...data,
    codesAvailable: 0
  };
}

export async function updateApp(id: string, app: Partial<App>): Promise<App> {
  const { data, error } = await supabase
    .from('apps')
    .update(app)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  
  const { count } = await supabase
    .from('codes')
    .select('*', { count: 'exact', head: true })
    .eq('app_id', id)
    .eq('used', false);
    
  return {
    ...data,
    codesAvailable: count || 0
  };
}

export async function deleteApp(id: string): Promise<void> {
  const { error } = await supabase
    .from('apps')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

export async function addCodes(codes: Array<{ app_id: string; code: string; used: boolean }>): Promise<Code[]> {
  const { data, error } = await supabase
    .from('codes')
    .insert(codes)
    .select();
  
  if (error) throw error;
  
  return (data || []).map(code => ({
    id: code.id,
    appId: code.app_id,
    code: code.code,
    used: code.used
  }));
}
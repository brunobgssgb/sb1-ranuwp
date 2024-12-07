import { supabase } from '../lib/supabase';
import { Customer } from '../types';
import { useAuthStore } from '../store/authStore';

export async function createCustomer(data: Omit<Customer, 'id'>): Promise<Customer> {
  const currentUser = useAuthStore.getState().currentUser;
  if (!currentUser) {
    throw new Error('Usuário não autenticado');
  }

  const { data: customer, error } = await supabase
    .from('customers')
    .insert({
      name: data.name,
      email: data.email,
      phone: data.phone,
      user_id: currentUser.id
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to create customer:', error);
    throw new Error('Falha ao criar cliente');
  }

  return customer;
}

export async function updateCustomer(id: string, data: Partial<Customer>): Promise<Customer> {
  const currentUser = useAuthStore.getState().currentUser;
  if (!currentUser) {
    throw new Error('Usuário não autenticado');
  }

  const { data: customer, error } = await supabase
    .from('customers')
    .update({
      name: data.name,
      email: data.email,
      phone: data.phone
    })
    .eq('id', id)
    .eq('user_id', currentUser.id)
    .select()
    .single();

  if (error) {
    console.error('Failed to update customer:', error);
    throw new Error('Falha ao atualizar cliente');
  }

  return customer;
}

export async function deleteCustomer(id: string): Promise<void> {
  const currentUser = useAuthStore.getState().currentUser;
  if (!currentUser) {
    throw new Error('Usuário não autenticado');
  }

  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', id)
    .eq('user_id', currentUser.id);

  if (error) {
    console.error('Failed to delete customer:', error);
    throw new Error('Falha ao excluir cliente');
  }
}

export async function getCustomers(): Promise<Customer[]> {
  const currentUser = useAuthStore.getState().currentUser;
  if (!currentUser) {
    throw new Error('Usuário não autenticado');
  }

  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('user_id', currentUser.id)
    .order('name');

  if (error) {
    console.error('Failed to fetch customers:', error);
    throw new Error('Falha ao buscar clientes');
  }

  return data || [];
}
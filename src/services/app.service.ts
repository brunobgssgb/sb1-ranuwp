import { supabase } from '../lib/supabase';
import { App } from '../types';
import { useAuthStore } from '../store/authStore';

export async function createApp(data: Omit<App, 'id' | 'codesAvailable'>): Promise<App> {
  const currentUser = useAuthStore.getState().currentUser;
  if (!currentUser) {
    throw new Error('Usuário não autenticado');
  }

  const { data: app, error } = await supabase
    .from('apps')
    .insert({
      name: data.name,
      price: data.price,
      user_id: currentUser.id
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to create app:', error);
    throw new Error('Falha ao criar aplicativo');
  }

  return {
    ...app,
    codesAvailable: 0
  };
}

export async function updateApp(id: string, data: Partial<App>): Promise<App> {
  const currentUser = useAuthStore.getState().currentUser;
  if (!currentUser) {
    throw new Error('Usuário não autenticado');
  }

  const { data: app, error } = await supabase
    .from('apps')
    .update({
      name: data.name,
      price: data.price
    })
    .eq('id', id)
    .eq('user_id', currentUser.id)
    .select()
    .single();

  if (error) {
    console.error('Failed to update app:', error);
    throw new Error('Falha ao atualizar aplicativo');
  }

  const { count } = await supabase
    .from('codes')
    .select('*', { count: 'exact', head: true })
    .eq('app_id', id)
    .eq('used', false);

  return {
    ...app,
    codesAvailable: count || 0
  };
}

export async function deleteApp(id: string): Promise<void> {
  const currentUser = useAuthStore.getState().currentUser;
  if (!currentUser) {
    throw new Error('Usuário não autenticado');
  }

  const { error } = await supabase
    .from('apps')
    .delete()
    .eq('id', id)
    .eq('user_id', currentUser.id);

  if (error) {
    console.error('Failed to delete app:', error);
    throw new Error('Falha ao excluir aplicativo');
  }
}

export async function getApps(): Promise<App[]> {
  const currentUser = useAuthStore.getState().currentUser;
  if (!currentUser) {
    throw new Error('Usuário não autenticado');
  }

  const { data: apps, error: appsError } = await supabase
    .from('apps')
    .select('*')
    .eq('user_id', currentUser.id)
    .order('name');

  if (appsError) {
    console.error('Failed to fetch apps:', appsError);
    throw new Error('Falha ao buscar aplicativos');
  }

  const appsWithCodes = [];
  
  for (const app of apps || []) {
    const { count } = await supabase
      .from('codes')
      .select('*', { count: 'exact', head: true })
      .eq('app_id', app.id)
      .eq('used', false);
      
    appsWithCodes.push({
      ...app,
      codesAvailable: count || 0
    });
  }

  return appsWithCodes;
}
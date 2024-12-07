import { supabase } from './supabase';
import { User, LoginCredentials, RegisterUserData } from '../types';
import bcrypt from 'bcryptjs';

export async function login({ email, password }: LoginCredentials): Promise<User> {
  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  const { data: users, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email.toLowerCase().trim());

  if (error) {
    console.error('Database error:', error);
    throw new Error('Authentication failed');
  }

  if (!users || users.length === 0) {
    throw new Error('Invalid email or password');
  }

  const user = users[0];
  const isValid = await bcrypt.compare(password, user.password_hash);
  
  if (!isValid) {
    throw new Error('Invalid email or password');
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    isAdmin: user.is_admin
  };
}

export async function register(data: RegisterUserData): Promise<User> {
  const passwordHash = await bcrypt.hash(data.password, 10);

  const { data: user, error } = await supabase
    .from('users')
    .insert({
      name: data.name,
      email: data.email.toLowerCase().trim(),
      phone: data.phone,
      password_hash: passwordHash,
      is_admin: false
    })
    .select()
    .single();

  if (error) {
    console.error('Registration error:', error);
    throw new Error('Failed to create account');
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    isAdmin: user.is_admin
  };
}

export async function updateUser(id: string, data: Partial<User>): Promise<User> {
  const { data: user, error } = await supabase
    .from('users')
    .update({
      name: data.name,
      email: data.email?.toLowerCase().trim(),
      phone: data.phone
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Update error:', error);
    throw new Error('Failed to update user');
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    isAdmin: user.is_admin
  };
}

export async function updatePassword(id: string, newPassword: string): Promise<void> {
  const passwordHash = await bcrypt.hash(newPassword, 10);

  const { error } = await supabase
    .from('users')
    .update({ password_hash: passwordHash })
    .eq('id', id);

  if (error) {
    console.error('Password update error:', error);
    throw new Error('Failed to update password');
  }
}

export async function deleteUser(id: string): Promise<void> {
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Delete error:', error);
    throw new Error('Failed to delete user');
  }
}

export async function getUsers(): Promise<User[]> {
  const { data: users, error } = await supabase
    .from('users')
    .select('*')
    .order('name');

  if (error) {
    console.error('Fetch users error:', error);
    throw new Error('Failed to fetch users');
  }

  return users.map(user => ({
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    isAdmin: user.is_admin
  }));
}
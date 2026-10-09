// lib/auth.ts
import { api } from '@/lib/axios';

export async function logout(): Promise<boolean> {
  try {
    await api.post('/auth/logout');
    return true;
  } catch (error) {
    console.error('Logout error:', error);
    return false;
  }
}

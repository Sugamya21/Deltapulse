import { supabase } from '@/lib/supabase';

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  // Directly grab session from the singleton client
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  let token = session?.access_token;

  // Fallback if session token is missing: try fetching user directly
  if (!token) {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('User not authenticated');
    }
  }

  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  return response;
}
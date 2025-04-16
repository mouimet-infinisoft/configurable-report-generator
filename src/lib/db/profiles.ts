import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/supabase';

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

/**
 * Get the current user's profile
 */
export async function getCurrentProfile() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return data;
}

/**
 * Update the current user's profile
 */
export async function updateProfile(profile: ProfileUpdate) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { error: new Error('Not authenticated') };

  const { data, error } = await supabase
    .from('profiles')
    .update(profile)
    .eq('id', session.user.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating profile:', error);
    return { error };
  }

  return { data };
}

/**
 * Get a user's profile by ID
 */
export async function getProfileById(id: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return data;
}

/**
 * Get all profiles (admin only)
 */
export async function getAllProfiles() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('username');

  if (error) {
    console.error('Error fetching profiles:', error);
    return [];
  }

  return data;
}

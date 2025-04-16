import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/supabase';

export type Template = Database['public']['Tables']['templates']['Row'];
export type TemplateInsert = Database['public']['Tables']['templates']['Insert'];
export type TemplateUpdate = Database['public']['Tables']['templates']['Update'];

export type TemplateSharing = Database['public']['Tables']['template_sharing']['Row'];
export type TemplateSharingInsert = Database['public']['Tables']['template_sharing']['Insert'];

/**
 * Get all templates for the current user
 */
export async function getUserTemplates() {
  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching templates:', error);
    return [];
  }

  return data;
}

/**
 * Get all public templates
 */
export async function getPublicTemplates() {
  const { data, error } = await supabase
    .from('templates')
    .select('*, profiles(username)')
    .eq('is_public', true)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching public templates:', error);
    return [];
  }

  return data;
}

/**
 * Get a template by ID
 */
export async function getTemplateById(id: string) {
  const { data, error } = await supabase
    .from('templates')
    .select('*, profiles(username)')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching template:', error);
    return null;
  }

  return data;
}

/**
 * Create a new template
 */
export async function createTemplate(template: TemplateInsert) {
  const { data, error } = await supabase
    .from('templates')
    .insert(template)
    .select()
    .single();

  if (error) {
    console.error('Error creating template:', error);
    return { error };
  }

  return { data };
}

/**
 * Update a template
 */
export async function updateTemplate(id: string, template: TemplateUpdate) {
  const { data, error } = await supabase
    .from('templates')
    .update(template)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating template:', error);
    return { error };
  }

  return { data };
}

/**
 * Delete a template
 */
export async function deleteTemplate(id: string) {
  const { error } = await supabase
    .from('templates')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting template:', error);
    return { error };
  }

  return { success: true };
}

/**
 * Share a template with another user
 */
export async function shareTemplate(templateId: string, userId: string) {
  const { data, error } = await supabase
    .from('template_sharing')
    .insert({
      template_id: templateId,
      shared_with: userId
    })
    .select()
    .single();

  if (error) {
    console.error('Error sharing template:', error);
    return { error };
  }

  return { data };
}

/**
 * Get users a template is shared with
 */
export async function getTemplateSharing(templateId: string) {
  const { data, error } = await supabase
    .from('template_sharing')
    .select('*, profiles:shared_with(username)')
    .eq('template_id', templateId);

  if (error) {
    console.error('Error fetching template sharing:', error);
    return [];
  }

  return data;
}

/**
 * Remove template sharing
 */
export async function removeTemplateSharing(templateId: string, userId: string) {
  const { error } = await supabase
    .from('template_sharing')
    .delete()
    .eq('template_id', templateId)
    .eq('shared_with', userId);

  if (error) {
    console.error('Error removing template sharing:', error);
    return { error };
  }

  return { success: true };
}

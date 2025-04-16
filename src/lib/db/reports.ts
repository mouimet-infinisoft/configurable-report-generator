import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/supabase';

export type Report = Database['public']['Tables']['reports']['Row'];
export type ReportInsert = Database['public']['Tables']['reports']['Insert'];
export type ReportUpdate = Database['public']['Tables']['reports']['Update'];

/**
 * Get all reports for the current user
 */
export async function getUserReports() {
  // Get the current user's session
  const { data: { session } } = await supabase.auth.getSession();

  // If no session, return empty array
  if (!session) {
    console.error('Error fetching reports: No authenticated user');
    return [];
  }

  // Get reports for the current user
  const { data, error } = await supabase
    .from('reports')
    .select('*, templates(name)')
    .eq('owner_id', session.user.id)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching reports:', error);
    return [];
  }

  return data;
}

/**
 * Get a report by ID
 */
export async function getReportById(id: string) {
  const { data, error } = await supabase
    .from('reports')
    .select('*, templates(name, structure, styling)')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching report:', error);
    return null;
  }

  return data;
}

/**
 * Create a new report
 */
export async function createReport(report: ReportInsert) {
  const { data, error } = await supabase
    .from('reports')
    .insert(report)
    .select()
    .single();

  if (error) {
    console.error('Error creating report:', error);
    return { error };
  }

  return { data };
}

/**
 * Update a report
 */
export async function updateReport(id: string, report: ReportUpdate) {
  const { data, error } = await supabase
    .from('reports')
    .update(report)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating report:', error);
    return { error };
  }

  return { data };
}

/**
 * Delete a report
 */
export async function deleteReport(id: string) {
  const { error } = await supabase
    .from('reports')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting report:', error);
    return { error };
  }

  return { success: true };
}

/**
 * Get reports by template ID
 */
export async function getReportsByTemplate(templateId: string) {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('template_id', templateId)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching reports by template:', error);
    return [];
  }

  return data;
}

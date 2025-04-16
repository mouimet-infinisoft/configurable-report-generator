-- Drop the problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all templates" ON public.templates;
DROP POLICY IF EXISTS "Admins can view all reports" ON public.reports;
DROP POLICY IF EXISTS "Admins can view all images" ON public.images;

-- Create a function to check if a user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  _role TEXT;
BEGIN
  -- Get the role directly from the profiles table without using RLS
  SELECT role INTO _role FROM public.profiles WHERE id = auth.uid();
  RETURN _role = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the admin policies using the new function
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can view all templates"
  ON public.templates FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can view all reports"
  ON public.reports FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can view all images"
  ON public.images FOR SELECT
  USING (public.is_admin());

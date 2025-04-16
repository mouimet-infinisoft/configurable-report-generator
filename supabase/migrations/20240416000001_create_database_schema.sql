-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create a profiles table that extends the auth.users table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  preferences JSONB DEFAULT '{}'::jsonb
);

-- Set up Row Level Security for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create a trigger to create a profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create templates table
CREATE TABLE public.templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  name TEXT NOT NULL,
  description TEXT,
  structure JSONB NOT NULL DEFAULT '{}'::jsonb,
  styling JSONB DEFAULT '{}'::jsonb,
  is_public BOOLEAN DEFAULT false,
  version INTEGER DEFAULT 1,
  owner_id UUID REFERENCES auth.users(id) NOT NULL,
  parent_id UUID REFERENCES public.templates(id)
);

-- Set up Row Level Security for templates
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

-- Create policies for templates
CREATE POLICY "Users can view their own templates"
  ON public.templates FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can view public templates"
  ON public.templates FOR SELECT
  USING (is_public = true);

CREATE POLICY "Users can insert their own templates"
  ON public.templates FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own templates"
  ON public.templates FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own templates"
  ON public.templates FOR DELETE
  USING (auth.uid() = owner_id);

CREATE POLICY "Admins can view all templates"
  ON public.templates FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create template_sharing table for shared templates
CREATE TABLE public.template_sharing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  template_id UUID REFERENCES public.templates(id) ON DELETE CASCADE NOT NULL,
  shared_with UUID REFERENCES auth.users(id) NOT NULL,
  UNIQUE(template_id, shared_with)
);

-- Set up Row Level Security for template_sharing
ALTER TABLE public.template_sharing ENABLE ROW LEVEL SECURITY;

-- Create policies for template_sharing
CREATE POLICY "Users can view templates shared with them"
  ON public.templates FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.template_sharing
    WHERE template_id = templates.id AND shared_with = auth.uid()
  ));

CREATE POLICY "Users can view their own template sharing"
  ON public.template_sharing FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.templates
    WHERE id = template_sharing.template_id AND owner_id = auth.uid()
  ) OR shared_with = auth.uid());

CREATE POLICY "Users can insert their own template sharing"
  ON public.template_sharing FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.templates
    WHERE id = template_sharing.template_id AND owner_id = auth.uid()
  ));

CREATE POLICY "Users can delete their own template sharing"
  ON public.template_sharing FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.templates
    WHERE id = template_sharing.template_id AND owner_id = auth.uid()
  ));

-- Create reports table
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  title TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'completed')),
  owner_id UUID REFERENCES auth.users(id) NOT NULL,
  template_id UUID REFERENCES public.templates(id),
  pdf_url TEXT
);

-- Set up Row Level Security for reports
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Create policies for reports
CREATE POLICY "Users can view their own reports"
  ON public.reports FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert their own reports"
  ON public.reports FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own reports"
  ON public.reports FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own reports"
  ON public.reports FOR DELETE
  USING (auth.uid() = owner_id);

CREATE POLICY "Admins can view all reports"
  ON public.reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create images table
CREATE TABLE public.images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  filename TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size INTEGER NOT NULL,
  width INTEGER,
  height INTEGER,
  ocr_text TEXT,
  ocr_language TEXT,
  owner_id UUID REFERENCES auth.users(id) NOT NULL,
  report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE
);

-- Set up Row Level Security for images
ALTER TABLE public.images ENABLE ROW LEVEL SECURITY;

-- Create policies for images
CREATE POLICY "Users can view their own images"
  ON public.images FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert their own images"
  ON public.images FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own images"
  ON public.images FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own images"
  ON public.images FOR DELETE
  USING (auth.uid() = owner_id);

CREATE POLICY "Admins can view all images"
  ON public.images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers to update updated_at timestamp
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER update_templates_updated_at
  BEFORE UPDATE ON public.templates
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER update_reports_updated_at
  BEFORE UPDATE ON public.reports
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER update_images_updated_at
  BEFORE UPDATE ON public.images
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

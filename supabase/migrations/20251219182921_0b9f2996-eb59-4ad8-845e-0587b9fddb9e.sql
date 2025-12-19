-- Create enum for career categories
CREATE TYPE public.career_category AS ENUM (
  'technology',
  'healthcare',
  'business',
  'creative',
  'science',
  'education',
  'trades'
);

-- Careers table to store all career options
CREATE TABLE public.careers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category career_category NOT NULL,
  skills TEXT[] NOT NULL DEFAULT '{}',
  courses TEXT[] NOT NULL DEFAULT '{}',
  roadmap TEXT[] NOT NULL DEFAULT '{}',
  icon TEXT NOT NULL DEFAULT 'Briefcase',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  education_level TEXT,
  interests TEXT[] DEFAULT '{}',
  preferred_subjects TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Assessment questions table
CREATE TABLE public.assessment_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  options TEXT[] DEFAULT '{}',
  related_careers TEXT[] NOT NULL DEFAULT '{}',
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User assessment answers
CREATE TABLE public.assessment_answers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL,
  question_id UUID REFERENCES public.assessment_questions(id) ON DELETE CASCADE,
  answer TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Career recommendations (stores ML results)
CREATE TABLE public.career_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL,
  career_id UUID REFERENCES public.careers(id) ON DELETE CASCADE,
  match_score DECIMAL(5,2) NOT NULL,
  algorithm_used TEXT NOT NULL DEFAULT 'knn',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Saved careers by users
CREATE TABLE public.saved_careers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  career_id UUID REFERENCES public.careers(id) ON DELETE CASCADE,
  saved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, career_id)
);

-- Enable RLS on all tables
ALTER TABLE public.careers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_careers ENABLE ROW LEVEL SECURITY;

-- Careers are publicly readable
CREATE POLICY "Careers are viewable by everyone" 
ON public.careers FOR SELECT 
USING (true);

-- Assessment questions are publicly readable
CREATE POLICY "Questions are viewable by everyone" 
ON public.assessment_questions FOR SELECT 
USING (true);

-- Profiles policies
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = user_id);

-- Assessment answers policies
CREATE POLICY "Users can view their own answers" 
ON public.assessment_answers FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own answers" 
ON public.assessment_answers FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Career recommendations policies
CREATE POLICY "Users can view their own recommendations" 
ON public.career_recommendations FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own recommendations" 
ON public.career_recommendations FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Saved careers policies
CREATE POLICY "Users can view their own saved careers" 
ON public.saved_careers FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can save careers" 
ON public.saved_careers FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove saved careers" 
ON public.saved_careers FOR DELETE 
USING (auth.uid() = user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add trigger for profiles
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name)
  VALUES (new.id, new.raw_user_meta_data ->> 'name');
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
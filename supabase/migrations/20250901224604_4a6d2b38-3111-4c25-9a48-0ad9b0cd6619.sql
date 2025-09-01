-- Create tenants table for multi-tenant support
CREATE TABLE public.tenants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  logo TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on tenants table
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- Create policies for tenants
CREATE POLICY "Users can view their own tenant" 
ON public.tenants 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.tenant_id = tenants.id 
  AND profiles.id = auth.uid()
));

CREATE POLICY "Admins can update their tenant" 
ON public.tenants 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.tenant_id = tenants.id 
  AND profiles.id = auth.uid() 
  AND profiles.role = 'admin'
));

-- Create trigger for automatic timestamp updates on tenants
CREATE TRIGGER update_tenants_updated_at
BEFORE UPDATE ON public.tenants
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update handle_new_user function to create tenant for new churches
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = 'public'
AS $$
DECLARE
  church_name TEXT;
  new_tenant_id UUID;
BEGIN
  -- Get church name from user metadata
  church_name := NEW.raw_user_meta_data ->> 'church_name';
  
  -- Create new tenant if church_name is provided
  IF church_name IS NOT NULL THEN
    INSERT INTO public.tenants (name, slug)
    VALUES (
      church_name,
      LOWER(REPLACE(REPLACE(church_name, ' ', '-'), '.', ''))
    )
    RETURNING id INTO new_tenant_id;
  ELSE
    -- Default tenant for existing users without church_name
    new_tenant_id := gen_random_uuid();
    INSERT INTO public.tenants (name) VALUES ('Igreja Padrão') RETURNING id INTO new_tenant_id;
  END IF;
  
  -- Create user profile with new tenant
  INSERT INTO public.profiles (id, name, email, role, tenant_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email),
    NEW.email,
    'admin', -- First user of a church is admin
    new_tenant_id
  );
  
  RETURN NEW;
END;
$$;
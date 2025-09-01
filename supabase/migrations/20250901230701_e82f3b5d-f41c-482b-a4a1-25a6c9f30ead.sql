-- Update the handle_new_user function to handle leader creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  church_name TEXT;
  user_role TEXT;
  user_tenant_id UUID;
  new_tenant_id UUID;
BEGIN
  -- Get metadata from user
  church_name := NEW.raw_user_meta_data ->> 'church_name';
  user_role := NEW.raw_user_meta_data ->> 'role';
  user_tenant_id := (NEW.raw_user_meta_data ->> 'tenant_id')::UUID;
  
  -- If this is a leader being created, use the existing tenant
  IF user_role = 'leader' AND user_tenant_id IS NOT NULL THEN
    new_tenant_id := user_tenant_id;
  -- Create new tenant if church_name is provided (new church registration)
  ELSIF church_name IS NOT NULL THEN
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
  
  -- Create user profile
  INSERT INTO public.profiles (id, name, email, role, tenant_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email),
    NEW.email,
    COALESCE(user_role, 'admin')::user_role, -- Default to admin for church creators, or use specified role
    new_tenant_id
  );
  
  RETURN NEW;
END;
$$;
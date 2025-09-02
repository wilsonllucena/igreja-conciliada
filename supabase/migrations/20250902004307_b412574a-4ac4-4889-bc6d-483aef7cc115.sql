-- Add policy to allow public viewing of available leaders
CREATE POLICY "Public can view available leaders" 
ON public.leaders 
FOR SELECT 
USING (is_available_for_appointments = true);

-- Add policy to allow public appointment creation
CREATE POLICY "Public can create appointments" 
ON public.appointments 
FOR INSERT 
WITH CHECK (true);
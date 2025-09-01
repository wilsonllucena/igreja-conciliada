-- Add user_id column to leaders table to link leaders to users
ALTER TABLE public.leaders ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create index for better performance
CREATE INDEX idx_leaders_user_id ON public.leaders(user_id);

-- Update RLS policies for appointments to allow leaders to view their own appointments
CREATE POLICY "Leaders can view their own appointments" 
ON public.appointments 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM leaders 
  WHERE leaders.id = appointments.leader_id 
  AND leaders.user_id = auth.uid()
));
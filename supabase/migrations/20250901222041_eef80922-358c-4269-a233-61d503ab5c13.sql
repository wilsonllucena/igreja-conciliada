-- Update user role to admin to allow member management
-- First, let's check current profiles and update the first user to admin
UPDATE profiles 
SET role = 'admin'
WHERE id IN (
  SELECT id FROM profiles 
  ORDER BY created_at ASC 
  LIMIT 1
);
-- SQL snippet to promote a user to administrator.
-- This script updates the user's subscription_tier to 'admin', granting them administrative privileges
-- as defined in the application's functions and RLS policies.

-- Replace '9ff5af8f-6959-4fe3-9974-4984de2f1c5f' with the actual user ID you want to promote.

UPDATE public.users
SET 
  subscription_tier = 'admin',
  subscription_status = 'active'
WHERE id = '9ff5af8f-6959-4fe3-9974-4984de2f1c5f';

-- After running this, the user will have 'admin' privileges.
-- You can verify the change by running the following query:
-- SELECT id, username, email, subscription_tier FROM public.users WHERE id = '9ff5af8f-6959-4fe3-9974-4984de2f1c5f';
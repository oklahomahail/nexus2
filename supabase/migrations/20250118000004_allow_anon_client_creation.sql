-- Allow anonymous client creation for development
-- This migration modifies the RLS policy to allow client creation without authentication
-- WARNING: This is for development only. In production, proper authentication should be enforced.

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Admins can create clients" ON clients;

-- Create a more permissive policy that allows any request to create clients
-- The trigger will still auto-assign ownership if auth.uid() is available
CREATE POLICY "Allow client creation for development"
    ON clients FOR INSERT
    WITH CHECK (true);

-- Update the auto_create_owner_membership function to handle anonymous users
CREATE OR REPLACE FUNCTION auto_create_owner_membership()
RETURNS TRIGGER AS $$
BEGIN
    -- Add creator as owner only if they're authenticated
    -- For anonymous users, we'll create a placeholder membership or skip it
    IF auth.uid() IS NOT NULL THEN
        INSERT INTO client_memberships (client_id, user_id, role, invited_by)
        VALUES (NEW.id, auth.uid(), 'owner', auth.uid())
        ON CONFLICT DO NOTHING;  -- Prevent duplicate memberships
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Also update the SELECT policy to allow viewing clients even without memberships
-- This is needed for development where clients might not have memberships yet
DROP POLICY IF EXISTS "Users can view clients they have access to" ON clients;

CREATE POLICY "Allow viewing all clients for development"
    ON clients FOR SELECT
    USING (
        -- Allow if user has membership
        can_access_client(id)
        -- OR allow all in development (when no auth.uid())
        OR auth.uid() IS NULL
        -- OR allow if authenticated (any authenticated user can see clients)
        OR auth.uid() IS NOT NULL
    );

-- Comment for future reference
COMMENT ON POLICY "Allow client creation for development" ON clients IS
'Development policy: Allows client creation without authentication. Should be replaced with proper auth in production.';

COMMENT ON POLICY "Allow viewing all clients for development" ON clients IS
'Development policy: Allows viewing all clients. Should be replaced with proper client-scoped access in production.';

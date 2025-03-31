INCLUDE _drop_policies.sql;

CREATE OR REPLACE FUNCTION auth.has_role(
  required_group_id uuid,
  required_role member_role
) RETURNS boolean AS $$
DECLARE
  auth_id uuid := auth.uid();
BEGIN
  -- Vérifier si l'utilisateur est super admin
  IF EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth_id 
    AND is_super_admin = true
  ) THEN
    RETURN true;
  END IF;
  
  -- Vérifier les paramètres
  IF required_group_id IS NULL OR auth_id IS NULL THEN
    RETURN false;
  END IF;

  -- Vérifier le rôle dans le groupe
  RETURN EXISTS (
    SELECT 1 FROM members m 
    WHERE m.group_id = required_group_id 
    AND user_id = auth_id
    AND role >= required_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- CREATE OR REPLACE FUNCTION is_action_allowed(device_id uuid, auth_id uuid, action_name text) 
-- RETURNS boolean AS $$
-- BEGIN
--   RETURN EXISTS (
--     SELECT 1 FROM devices WHERE id = device_id AND (
--       user_id = auth_id OR
--       CASE
--         WHEN action_name IN ('ping', 'reload', 'restart', 'capture') THEN 
--           check_permission(group_id, auth_id, 'viewer'::member_role)
--         WHEN action_name IN ('reboot', 'exit') THEN 
--           check_permission(group_id, auth_id, 'editor'::member_role)
--         ELSE
--           check_permission(group_id, auth_id, 'admin'::member_role)
--       END
--     )
--   );
-- END;
-- $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE POLICY "devices_select_policy" ON public.devices
AS PERMISSIVE FOR SELECT TO public
USING (
  (user_id = auth.uid()) OR auth.has_role(group_id, 'viewer'::member_role)
);

CREATE POLICY "devices_modify_policy" ON public.devices
AS PERMISSIVE FOR ALL TO public
USING (
  (user_id = auth.uid()) OR auth.has_role(group_id, 'editor'::member_role)
)
WITH CHECK (
  (user_id = auth.uid()) OR auth.has_role(group_id, 'editor'::member_role)
);

CREATE POLICY "members_select_policy" ON public.members
AS PERMISSIVE FOR SELECT TO public
USING (user_id = auth.uid());

CREATE POLICY "members_modify_policy" ON public.members
AS PERMISSIVE FOR ALL TO public
USING (
  auth.has_role(group_id, 'editor'::member_role)
  OR EXISTS (SELECT 1 FROM groups WHERE id = group_id AND owner_id = auth.uid())
)
WITH CHECK (
  auth.has_role(group_id, 'editor'::member_role)
  OR EXISTS (SELECT 1 FROM groups WHERE id = group_id AND owner_id = auth.uid())
);

CREATE POLICY "groups_select_policy" ON public.groups
AS PERMISSIVE FOR SELECT TO public
USING (
  owner_id = auth.uid() OR auth.has_role(id, 'viewer'::member_role)
);

CREATE POLICY "groups_modify_policy" ON public.groups
AS PERMISSIVE FOR ALL TO public
USING (
  owner_id = auth.uid() OR auth.has_role(id, 'editor'::member_role)
)
WITH CHECK (
  owner_id = auth.uid() OR auth.has_role(id, 'editor'::member_role)
);

CREATE POLICY "assets_select_policy" ON public.assets
AS PERMISSIVE FOR SELECT TO public
USING (
  public = true OR owner_id = auth.uid() OR auth.has_role(group_id, 'viewer'::member_role)
);

CREATE POLICY "assets_modify_policy" ON public.assets
AS PERMISSIVE FOR ALL TO public
USING (
  owner_id = auth.uid() OR auth.has_role(group_id, 'editor'::member_role)
)
WITH CHECK (
  owner_id = auth.uid() OR auth.has_role(group_id, 'editor'::member_role)
);

CREATE POLICY "objects_select_policy" ON storage.objects
FOR SELECT
USING (
  bucket_id = 'assets' AND auth.has_role(split_part(name, '/', 1)::uuid, 'viewer'::member_role)
);

CREATE POLICY "objects_modify_policy" ON storage.objects
FOR ALL
USING (
  bucket_id = 'assets' AND auth.has_role(split_part(name, '/', 1)::uuid, 'editor'::member_role)
)
WITH CHECK (
  bucket_id = 'assets' AND auth.has_role(split_part(name, '/', 1)::uuid, 'editor'::member_role)
);

ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;


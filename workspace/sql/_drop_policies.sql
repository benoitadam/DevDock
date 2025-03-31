DROP POLICY IF EXISTS objects_modify_policy ON storage.objects;
DROP POLICY IF EXISTS objects_select_policy ON storage.objects;
DROP POLICY IF EXISTS assets_modify_policy ON public.assets;
DROP POLICY IF EXISTS assets_select_policy ON public.assets;
DROP POLICY IF EXISTS groups_modify_policy ON public.groups;
DROP POLICY IF EXISTS groups_select_policy ON public.groups;
DROP POLICY IF EXISTS members_modify_policy ON public.members;
DROP POLICY IF EXISTS members_select_policy ON public.members;
DROP POLICY IF EXISTS devices_modify_policy ON public.devices;
DROP POLICY IF EXISTS devices_select_policy ON public.devices;

-- DROP FUNCTION IF EXISTS is_action_allowed;
DROP FUNCTION IF EXISTS auth.has_role;
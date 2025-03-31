-- updated

DROP TRIGGER IF EXISTS set_updated ON public.assets;
DROP TRIGGER IF EXISTS set_updated ON public.groups;
DROP TRIGGER IF EXISTS set_updated ON public.members;
DROP TRIGGER IF EXISTS set_updated ON public.devices;

DROP FUNCTION IF EXISTS public.handle_updated;


-- objects_to_assets

DROP TRIGGER IF EXISTS objects_asset_trigger ON storage.objects;

DROP FUNCTION IF EXISTS public.objects_to_assets;
DROP FUNCTION IF EXISTS public.objects_to_assets_trigger;
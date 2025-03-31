INCLUDE _drop_triggers.sql;


-- updated

CREATE OR REPLACE FUNCTION public.handle_updated ()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER set_updated BEFORE UPDATE ON public.assets
FOR EACH ROW EXECUTE FUNCTION public.handle_updated();

CREATE TRIGGER set_updated BEFORE UPDATE ON public.groups
FOR EACH ROW EXECUTE FUNCTION public.handle_updated();

CREATE TRIGGER set_updated BEFORE UPDATE ON public.members
FOR EACH ROW EXECUTE FUNCTION public.handle_updated();

CREATE TRIGGER set_updated BEFORE UPDATE ON public.devices
FOR EACH ROW EXECUTE FUNCTION public.handle_updated();


-- objects_to_assets

CREATE OR REPLACE FUNCTION public.objects_to_assets()
RETURNS void AS $$
BEGIN
    INSERT INTO public.assets (
        path,
        data,
        owner_id,
        object_id
    )
    SELECT
        o.name, -- path
        o.metadata, -- size
        o.owner, -- owner_id
        o.id -- object_id
    FROM storage.objects o
    LEFT JOIN public.assets a ON a.object_id = o.id
    WHERE o.bucket_id = 'assets'
    AND a.object_id IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

SELECT public.objects_to_assets();

CREATE OR REPLACE FUNCTION public.objects_to_assets_trigger()
RETURNS trigger AS $$
BEGIN
    IF NEW.bucket_id = 'assets' THEN
        INSERT INTO public.assets (
            path,
            data,
            owner_id,
            object_id
        ) VALUES (
            NEW.name, -- path
            NEW.metadata, -- data
            NEW.owner, -- owner_id
            NEW.id -- object_id
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER objects_asset_trigger AFTER INSERT ON storage.objects
FOR EACH ROW EXECUTE FUNCTION public.objects_to_assets_trigger();
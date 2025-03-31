
-- CREATE TABLE categories (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     created TIMESTAMPTZ DEFAULT now(),
--     updated TIMESTAMPTZ DEFAULT now(),
--     name TEXT DEFAULT NULL,
--     "desc" TEXT DEFAULT NULL,
--     icon TEXT DEFAULT NULL,
--     color TEXT DEFAULT NULL
-- );

ALTER TABLE categories 
ADD COLUMN category_id UUID REFERENCES categories(id) ON DELETE SET NULL;


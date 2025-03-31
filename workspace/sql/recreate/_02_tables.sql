CREATE TYPE member_role AS ENUM ('none', 'viewer', 'editor', 'admin');

CREATE TABLE groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created TIMESTAMPTZ DEFAULT now(),
    updated TIMESTAMPTZ DEFAULT now(),
    name TEXT DEFAULT NULL,
    "desc" TEXT DEFAULT NULL,
    owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE TABLE assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created TIMESTAMPTZ DEFAULT now(),
    updated TIMESTAMPTZ DEFAULT now(),
    status TEXT DEFAULT NULL,
    path TEXT DEFAULT NULL,
    title TEXT DEFAULT NULL,
    mime TEXT DEFAULT NULL,
    data JSONB DEFAULT NULL,
    public BOOLEAN DEFAULT false,
    owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    group_id UUID REFERENCES groups(id) ON DELETE SET NULL,
    parent_id UUID REFERENCES assets(id) ON DELETE SET NULL,
    object_id UUID REFERENCES storage.objects(id) ON DELETE SET NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL
);

CREATE TABLE devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created TIMESTAMPTZ DEFAULT now(),
    updated TIMESTAMPTZ DEFAULT now(),
    started TIMESTAMPTZ DEFAULT NULL,
    online TIMESTAMPTZ DEFAULT NULL,
    name TEXT DEFAULT NULL,
    type TEXT DEFAULT NULL,
    info TEXT DEFAULT NULL,
    width INTEGER DEFAULT 0,
    height INTEGER DEFAULT 0,
    action TEXT DEFAULT NULL,
    status TEXT DEFAULT NULL,
    input JSONB DEFAULT NULL,
    result JSONB DEFAULT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL UNIQUE,
    group_id UUID REFERENCES groups(id) ON DELETE SET NULL
);

CREATE TABLE members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created TIMESTAMPTZ DEFAULT now(),
    updated TIMESTAMPTZ DEFAULT now(),
    role member_role DEFAULT 'none'::member_role,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
    CONSTRAINT members_user_group_unique UNIQUE (user_id, group_id)
);
